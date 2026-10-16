#!/usr/bin/env node
// Checks the data files of the repository: JSON syntax, the board and plugin
// contracts, and the translations (msgfmt --check).
//   node scripts/checkData.js              every data file of the working tree
//   node scripts/checkData.js --staged     the staged ones, read from the index
//   node scripts/checkData.js --rev <sha>  every data file of that commit
//   node scripts/checkData.js <paths...>   those files
// Exits 1 when there is an error; warnings do not fail.
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const root = path.join(__dirname, '..');

const BOARDS = 'app/resources/boards/';
const PLUGINS = 'app/resources/plugins/';
const BOARD_FILES = ['info.json', 'pinout.json', 'rules.json'];
const PIN_TYPES = ['input', 'output', 'inout'];
const GUI_TYPES = ['window', 'embedded', 'service'];
// The embedded plugin loaders map these lists without checking them first
const EMBEDDED_LISTS = ['layout', 'style', 'scripts', 'views'];

const MSGFMT_HELP = [
  'msgfmt (GNU gettext) is required to check the translations. Install gettext:',
  '  macOS          brew install gettext',
  '                 (if msgfmt is still not found, run `brew link gettext` and',
  '                 make sure "$(brew --prefix)/bin" is in your PATH)',
  '  Debian/Ubuntu  sudo apt-get install gettext',
  '  Fedora         sudo dnf install gettext',
  '  Arch           sudo pacman -S gettext',
  '  Windows        winget install --id mlocati.GetText --exact',
  '                 or choco install gettext',
  '                 or the installer from',
  '                 https://github.com/mlocati/gettext-iconv-windows/releases',
  '                 then add its bin folder to the PATH that Git Bash sees.',
].join('\n');

function hasMsgfmt() {
  return !spawnSync('msgfmt', ['--version'], { stdio: 'ignore' }).error;
}

function isJson(file) {
  // VS Code reads its settings as JSONC (comments, trailing commas): a strict
  // parse would reject valid files, and they are not part of the product.
  return /\.(json|ice)$/.test(file) && !file.startsWith('.vscode/');
}

function isPo(file) {
  return /\.pot?$/.test(file);
}

function isDataFile(file) {
  // A loose file directly inside the plugins folder hangs the app at startup
  const loosePluginFile =
    file.startsWith(PLUGINS) && !file.slice(PLUGINS.length).includes('/');
  return isJson(file) || isPo(file) || loosePluginFile;
}

function git(args, input) {
  const result = spawnSync('git', args, {
    cwd: root,
    input,
    maxBuffer: 1 << 30,
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')}: ${result.stderr}`);
  }
  return result.stdout;
}

function gitList(args) {
  return git(args).toString().split('\0').filter(Boolean);
}

// Reads many blobs with one git process: `prefix` is ':' for the index or
// '<rev>:' for a commit
function readBlobs(prefix, files) {
  const contents = new Map();
  if (files.length === 0) {
    return contents;
  }
  const input = files.map((file) => prefix + file).join('\n') + '\n';
  const out = git(['cat-file', '--batch'], input);
  let at = 0;
  files.forEach((file) => {
    const eol = out.indexOf(0x0a, at);
    const header = out.toString('utf8', at, eol);
    at = eol + 1;
    if (header.endsWith(' missing')) {
      return;
    }
    const size = Number(header.split(' ')[2]);
    contents.set(file, out.toString('utf8', at, at + size));
    at += size + 1;
  });
  return contents;
}

// A source is the set of files the checks see and how to read them
function worktreeSource() {
  const files = gitList([
    'ls-files',
    '-z',
    '--cached',
    '--others',
    '--exclude-standard',
  ]).filter((file) => fs.existsSync(path.join(root, file)));
  return {
    files: new Set(files),
    read(list) {
      const contents = new Map();
      list.forEach((file) => {
        const full = path.join(root, file);
        if (fs.existsSync(full) && fs.statSync(full).isFile()) {
          contents.set(file, fs.readFileSync(full, 'utf8'));
        }
      });
      return contents;
    },
  };
}

function indexSource() {
  return {
    files: new Set(gitList(['ls-files', '-z'])),
    read: (list) => readBlobs(':', list),
  };
}

function revSource(rev) {
  return {
    files: new Set(gitList(['ls-tree', '-r', '-z', '--name-only', rev])),
    read: (list) => readBlobs(`${rev}:`, list),
  };
}

function lineColumn(text, position) {
  const before = text.slice(0, position).split('\n');
  return `${before.length}:${before[before.length - 1].length + 1}`;
}

// V8 gives the position of most syntax errors, but not of an unexpected token
// ("Unexpected token 'x', ... is not valid JSON"). Then the error is where the
// longest prefix that could still start a valid document ends.
function errorPosition(text, error) {
  const match = / at position (\d+)/.exec(error.message);
  if (match) {
    return Number(match[1]);
  }
  const viable = (end) => {
    try {
      JSON.parse(text.slice(0, end));
      return true;
    } catch (e) {
      const at = / at position (\d+)/.exec(e.message);
      return (
        e.message === 'Unexpected end of JSON input' ||
        (at !== null && Number(at[1]) >= end)
      );
    }
  };
  let low = 0;
  let high = text.length;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (viable(middle)) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }
  return low;
}

function syntaxMessage(error) {
  return error.message
    .replace(/ in JSON at position \d+.*$/, '')
    .replace(/, .*is not valid JSON$/s, '');
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function createReport() {
  const counts = {};
  ['json', 'boards', 'plugins', 'po'].forEach((kind) => {
    counts[kind] = { errors: 0, warnings: 0 };
  });
  const add = (level, kind, where, message) => {
    counts[kind][level === 'error' ? 'errors' : 'warnings']++;
    console.log(`${where}: ${level}: ${message}`);
  };
  return {
    counts,
    error: (kind, where, message) => add('error', kind, where, message),
    warning: (kind, where, message) => add('warning', kind, where, message),
  };
}

function checkJson(report, contents, targets, parsed) {
  targets.filter(isJson).forEach((file) => {
    const text = contents.get(file);
    if (text === undefined) {
      return;
    }
    try {
      parsed.set(file, JSON.parse(text));
    } catch (error) {
      const at = lineColumn(text, errorPosition(text, error));
      report.error('json', `${file}:${at}`, syntaxMessage(error));
    }
  });
}

function checkPinout(report, file, pinout) {
  if (!Array.isArray(pinout)) {
    report.error('boards', file, 'must be an array of pins');
    return;
  }
  pinout.forEach((pin, i) => {
    if (
      !isObject(pin) ||
      typeof pin.name !== 'string' ||
      typeof pin.value !== 'string'
    ) {
      report.error('boards', file, `pin ${i} needs a string name and value`);
    } else if (!PIN_TYPES.includes(pin.type)) {
      report.error(
        'boards',
        file,
        `pin ${i} (${pin.name}) has type ${JSON.stringify(pin.type)}, ` +
          `expected one of ${PIN_TYPES.join(', ')}`
      );
    }
  });
}

function checkRules(report, file, rules) {
  if (!isObject(rules)) {
    report.error('boards', file, 'must be an object');
    return;
  }
  // input and output are optional: the compiler and utils.hasInputRule skip
  // a missing list
  ['input', 'output'].forEach((key) => {
    if (key in rules && !Array.isArray(rules[key])) {
      report.error('boards', file, `"${key}" must be an array`);
    }
  });
}

function checkBoards(report, source, contents, targets, parsed, full) {
  const menuFile = `${BOARDS}menu.json`;
  const boardDirs = new Set();
  const boardTargets = targets.filter((file) => file.startsWith(BOARDS));
  const scan = full ? [...source.files] : boardTargets;
  scan.forEach((file) => {
    const rest = file.slice(BOARDS.length).split('/');
    if (file.startsWith(BOARDS) && rest.length === 2 && isJson(file)) {
      boardDirs.add(rest[0]);
    }
  });
  if (boardDirs.size === 0 && !boardTargets.includes(menuFile)) {
    return 0;
  }

  const hasBoardFiles = (id) =>
    BOARD_FILES.every((name) => source.files.has(`${BOARDS}${id}/${name}`));
  const menu = parsed.get(menuFile);
  const menuIds = new Set();
  if (contents.has(menuFile) && menu !== undefined) {
    if (!Array.isArray(menu)) {
      report.error('boards', menuFile, 'must be an array of families');
    } else {
      menu.forEach((family, i) => {
        if (
          !isObject(family) ||
          typeof family.type !== 'string' ||
          !Array.isArray(family.boards)
        ) {
          report.error(
            'boards',
            menuFile,
            `family ${i} needs a string "type" and a "boards" array`
          );
          return;
        }
        family.boards.forEach((id) => {
          menuIds.add(id);
          if (boardTargets.includes(menuFile) && !hasBoardFiles(id)) {
            report.error(
              'boards',
              menuFile,
              `board "${id}" (${family.type}) has no folder with ` +
                BOARD_FILES.join(', ')
            );
          }
        });
      });
    }
  }

  boardDirs.forEach((id) => {
    const dir = `${BOARDS}${id}/`;
    if (!hasBoardFiles(id)) {
      const missing = BOARD_FILES.filter(
        (name) => !source.files.has(dir + name)
      );
      report.warning(
        'boards',
        dir,
        `not a board, missing ${missing.join(', ')}; Icestudio ignores it`
      );
      return;
    }
    const info = parsed.get(`${dir}info.json`);
    if (
      info !== undefined &&
      (!isObject(info) || typeof info.label !== 'string')
    ) {
      report.error('boards', `${dir}info.json`, 'needs a string "label"');
    }
    const pinout = parsed.get(`${dir}pinout.json`);
    if (pinout !== undefined) {
      checkPinout(report, `${dir}pinout.json`, pinout);
    }
    const rules = parsed.get(`${dir}rules.json`);
    if (rules !== undefined) {
      checkRules(report, `${dir}rules.json`, rules);
    }
    if (Array.isArray(menu) && !menuIds.has(id)) {
      report.warning('boards', dir, 'valid board not listed in menu.json');
    }
  });
  return boardDirs.size;
}

function checkManifest(report, source, dir, manifest) {
  const file = `${PLUGINS}${dir}/manifest.json`;
  const fail = (message) => report.error('plugins', file, message);
  if (!isObject(manifest)) {
    fail('must be an object');
    return;
  }
  // WaflePlugin.baseUrl builds the plugin URL from the id, not the folder
  if (manifest.id !== dir) {
    fail(`"id" must be the folder name "${dir}"`);
  }
  if (typeof manifest.name !== 'string') {
    fail('needs a string "name"');
  }
  if (typeof manifest.launchAtStartup !== 'boolean') {
    fail('needs a boolean "launchAtStartup"');
  }
  const gui = manifest.gui;
  if (!isObject(gui) || !GUI_TYPES.includes(gui.type)) {
    fail(`needs "gui.type", one of ${GUI_TYPES.join(', ')}`);
    return;
  }

  const listed = [];
  const addList = (key, value, required) => {
    if (value === undefined && !required) {
      return;
    }
    if (!Array.isArray(value)) {
      fail(`"${key}" must be an array of files`);
      return;
    }
    value.forEach((entry) => listed.push([key, entry]));
  };
  if (gui.type === 'embedded') {
    EMBEDDED_LISTS.forEach((key) => addList(`gui.${key}`, gui[key], true));
    addList('gui.styleHost', gui.styleHost, false);
    if (gui.styleThemed !== undefined) {
      addList('gui.styleThemed.dark', (gui.styleThemed || {}).dark, false);
      addList('gui.styleThemed.light', (gui.styleThemed || {}).light, false);
    }
  } else if (gui.type === 'service') {
    if (typeof gui.provider !== 'string') {
      fail('a service needs a string "gui.provider"');
    } else {
      listed.push(['gui.provider', gui.provider]);
    }
    addList('gui.providerMainThread', gui.providerMainThread, false);
  }
  listed.forEach(([key, entry]) => {
    if (typeof entry !== 'string') {
      fail(`"${key}" lists ${JSON.stringify(entry)}, not a file name`);
    } else if (!source.files.has(`${PLUGINS}${dir}/${entry}`)) {
      fail(`"${key}" lists ${entry}, which does not exist`);
    }
  });
}

function checkPlugins(report, source, targets, parsed, full) {
  const dirs = new Set();
  const scan = full ? [...source.files] : targets;
  scan
    .filter((file) => file.startsWith(PLUGINS))
    .forEach((file) => {
      const rest = file.slice(PLUGINS.length).split('/');
      if (rest.length === 1) {
        report.error(
          'plugins',
          file,
          'only plugin folders may live in app/resources/plugins'
        );
      } else {
        dirs.add(rest[0]);
      }
    });
  dirs.forEach((dir) => {
    const file = `${PLUGINS}${dir}/manifest.json`;
    if (!source.files.has(file)) {
      report.error('plugins', `${PLUGINS}${dir}/`, 'has no manifest.json');
    } else if (parsed.has(file)) {
      checkManifest(report, source, dir, parsed.get(file));
    }
  });
  return dirs.size;
}

function msgfmtCheck(text) {
  return new Promise((resolve) => {
    const child = spawn('msgfmt', ['--check', '-o', '-', '-']);
    let stderr = '';
    child.stdout.resume();
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('close', (code) => resolve({ code, stderr }));
    child.stdin.end(text);
  });
}

async function checkPo(report, contents, targets) {
  const files = targets.filter((file) => isPo(file) && contents.has(file));
  if (files.length === 0) {
    return 0;
  }
  if (!hasMsgfmt()) {
    report.error('po', 'msgfmt', 'not found in the PATH');
    console.log(MSGFMT_HELP);
    return files.length;
  }
  const results = await Promise.all(
    files.map((file) => msgfmtCheck(contents.get(file)))
  );
  results.forEach(({ code, stderr }, i) => {
    if (code !== 0) {
      report.error('po', files[i], 'msgfmt --check failed:');
      stderr
        .trimEnd()
        .split('\n')
        .forEach((line) =>
          console.log(`  ${line.replace(/^(msgfmt: )?<stdin>/, files[i])}`)
        );
    }
  });
  return files.length;
}

async function main(args) {
  let source;
  let targets;
  let full = false;
  if (args[0] === '--staged') {
    source = indexSource();
    targets = gitList([
      'diff',
      '--cached',
      '--name-only',
      '-z',
      '--diff-filter=ACMR',
    ]).filter(isDataFile);
    if (targets.length === 0) {
      console.log('Data check: no data files staged.');
      return 0;
    }
  } else if (args[0] === '--rev') {
    source = revSource(args[1]);
    targets = [...source.files].filter(isDataFile);
    full = true;
  } else if (args.length > 0) {
    source = worktreeSource();
    targets = args.map((arg) =>
      path.relative(root, path.resolve(arg)).split(path.sep).join('/')
    );
  } else {
    source = worktreeSource();
    targets = [...source.files].filter(isDataFile);
    full = true;
  }

  // The board checks need the three files of every board they look at and
  // menu.json, and the plugin checks the manifest, even when only one of
  // them is a target
  const toRead = new Set(targets);
  targets.concat(full ? [...source.files] : []).forEach((file) => {
    const [dir, name] = file.split('/').slice(3);
    if (name === undefined) {
      return;
    }
    if (file.startsWith(BOARDS) && isJson(file)) {
      BOARD_FILES.forEach((board) => toRead.add(`${BOARDS}${dir}/${board}`));
      toRead.add(`${BOARDS}menu.json`);
    } else if (file.startsWith(PLUGINS)) {
      toRead.add(`${PLUGINS}${dir}/manifest.json`);
    }
  });
  const contents = source.read([...toRead].filter((f) => source.files.has(f)));
  targets
    .filter((file) => !contents.has(file) && !source.files.has(file))
    .forEach((file) => console.log(`${file}: warning: not found, skipped`));

  const report = createReport();
  const parsed = new Map();
  checkJson(report, contents, [...toRead], parsed);
  const boards = checkBoards(report, source, contents, targets, parsed, full);
  const plugins = checkPlugins(report, source, targets, parsed, full);
  const po = await checkPo(report, contents, targets);

  const jsonFiles = [...toRead].filter((f) => isJson(f) && contents.has(f));
  const sizes = {
    json: `${jsonFiles.length} files`,
    boards: `${boards} folders`,
    plugins: `${plugins} plugins`,
    po: `${po} catalogs`,
  };
  const summary = Object.keys(report.counts).map((kind) => {
    const { errors, warnings } = report.counts[kind];
    return `${kind} (${sizes[kind]}): ${errors} errors, ${warnings} warnings`;
  });
  console.log(`Data check: ${summary.join('; ')}`);
  const errors = Object.values(report.counts).reduce((n, c) => n + c.errors, 0);
  return errors > 0 ? 1 : 0;
}

module.exports = { MSGFMT_HELP, hasMsgfmt };

if (require.main === module) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(error.message);
      process.exit(1);
    }
  );
}
