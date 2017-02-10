'use strict';

angular.module('icestudio')
  .service('utils', function($rootScope,
                             gettextCatalog,
                             common,
                             _package,
                             window,
                             nodeFs,
                             nodeFse,
                             nodePath,
                             nodeChildProcess,
                             nodeTarball,
                             nodeZlib,
                             nodeSudo,
                             nodeOnline,
                             nodeGlob,
                             nodeSha1,
                             nodeCP,
                             SVGO) {

    const WIN32 = Boolean(process.platform.indexOf('win32') > -1);
    this.WIN32 = WIN32;
    const DARWIN = Boolean(process.platform.indexOf('darwin') > -1);
    this.DARWIN = DARWIN;

    const LOCALE_DIR = nodePath.join('resources', 'locale');
    const SAMPLE_DIR = nodePath.join('resources', 'sample');
    this.SAMPLE_DIR = SAMPLE_DIR;

    const BASE_DIR = process.env.HOME || process.env.USERPROFILE;
    const ICESTUDIO_DIR = safeDir(nodePath.join(BASE_DIR, '.icestudio'));
    this.ICESTUDIO_DIR = ICESTUDIO_DIR;
    const COLLECTIONS_DIR = nodePath.join(ICESTUDIO_DIR, 'collections');
    this.COLLECTIONS_DIR = COLLECTIONS_DIR;
    const APIO_HOME_DIR = nodePath.join(ICESTUDIO_DIR, 'apio');
    const PROFILE_PATH = nodePath.join(ICESTUDIO_DIR, 'profile.json');
    this.PROFILE_PATH = PROFILE_PATH;
    const CACHE_DIR = nodePath.join(ICESTUDIO_DIR, '.cache');
    const BUILD_DIR = nodePath.join(ICESTUDIO_DIR, '.build');
    this.BUILD_DIR = BUILD_DIR;

    const VENV = 'virtualenv-15.0.1';
    const VENV_DIR = nodePath.join(CACHE_DIR, VENV);
    const VENV_TARGZ = nodePath.join('resources', 'virtualenv', VENV + '.tar.gz');

    const APP_DIR = nodePath.dirname(process.execPath);
    const TOOLCHAIN_DIR = nodePath.join(APP_DIR, 'toolchain');
    this.TOOLCHAIN_DIR = TOOLCHAIN_DIR;

    const DEFAULT_APIO = 'default-apio';
    const DEFAULT_APIO_DIR = nodePath.join(CACHE_DIR, DEFAULT_APIO);
    const DEFAULT_APIO_TARGZ = nodePath.join(TOOLCHAIN_DIR, DEFAULT_APIO + '.tar.gz');

    const DEFAULT_APIO_PACKAGES = 'default-apio-packages';
    const DEFAULT_APIO_PACKAGES_TARGZ = nodePath.join(TOOLCHAIN_DIR, DEFAULT_APIO_PACKAGES + '.tar.gz');

    const ENV_DIR = nodePath.join(ICESTUDIO_DIR, 'venv');
    const ENV_BIN_DIR = nodePath.join(ENV_DIR, WIN32 ? 'Scripts' : 'bin');
    const ENV_PIP = nodePath.join(ENV_BIN_DIR, 'pip');
    const ENV_APIO = nodePath.join(ENV_BIN_DIR, WIN32 ? 'apio.exe' : 'apio');
    const APIO_CMD = (WIN32 ? 'set' : 'export') + ' APIO_HOME_DIR=' + APIO_HOME_DIR + (WIN32 ? '& ' : '; ') + coverPath(ENV_APIO);
    const SYSTEM_APIO = '/usr/bin/apio';

    function safeDir(_dir) {
      if (WIN32) {
        // Put the env directory to the root of the current local disk when
        // default path contains non-ASCII characters. Virtualenv will fail to
        for (var i in _dir) {
          if (_dir[i].charCodeAt(0) > 127) {
            const _dirFormat = nodePath.parse(_dir);
            return nodePath.format({
              root: _dirFormat.root,
              dir: _dirFormat.root,
              base: '.icestudio',
              name: '.icestudio',
            });
          }
        }
      }
      return _dir;
    }

    var _pythonExecutableCached = null;
    // Get the system executable
    this.getPythonExecutable = function() {
      if (!_pythonExecutableCached) {
        const possibleExecutables = [];

        if (WIN32) {
          possibleExecutables.push('python.exe');
          possibleExecutables.push('C:\\Python27\\python.exe');
        } else {
          possibleExecutables.push('python2.7');
          possibleExecutables.push('python');
        }

        for (var i in possibleExecutables) {
          var executable = possibleExecutables[i];
          if (isPython2(executable)) {
            _pythonExecutableCached = executable;
            break;
          }
        }
      }
      return _pythonExecutableCached;
    };

    function isPython2(executable) {
      const args = ['-c', 'import sys; print \'.\'.join(str(v) for v in sys.version_info[:2])'];
      try {
        const result = nodeChildProcess.spawnSync(executable, args);
        return 0 === result.status && result.stdout.toString().startsWith('2.7');
      } catch(e) {
        return false;
      }
    }

    this.extractTargz = function(source, destination, callback) {
      nodeTarball.extractTarball(source, destination, function(err) {
        if(err) {
          //console.log(err);
          callback(true);
        }
        else {
          callback();
        }
      });
    };

    this.extractVirtualEnv = function(callback) {
      this.extractTargz(VENV_TARGZ, CACHE_DIR, callback);
    };

    function disableClick(e) {
      e.stopPropagation();
      e.preventDefault();
    }

    function enableClickEvent() {
      document.removeEventListener('click', disableClick, true);
    }

    function disableClickEvent() {
      document.addEventListener('click', disableClick, true);
    }

    this.enableClickEvent = enableClickEvent;
    this.disableClickEvent = disableClickEvent;

    this.executeCommand = function(command, callback) {
      nodeChildProcess.exec(command.join(' '),
        function (error, stdout, stderr) {
          // console.log(error, stdout, stderr);
          if (error) {
            enableClickEvent();
            callback(true);
            angular.element('#progress-message')
              .text(stderr);
            angular.element('#progress-bar')
              .addClass('notransition progress-bar-danger')
              .removeClass('progress-bar-info progress-bar-striped active')
              .text('Error')
              .attr('aria-valuenow', 100)
              .css('width', '100%');
          }
          else {
            callback();
          }
        }
      );
    };

    this.makeVenvDirectory = function(callback) {
      if (!nodeFs.existsSync(ICESTUDIO_DIR)) {
        nodeFs.mkdirSync(ICESTUDIO_DIR);
      }
      if (!nodeFs.existsSync(ENV_DIR)) {
        nodeFs.mkdirSync(ENV_DIR);
        this.executeCommand(
          [this.getPythonExecutable(),
           coverPath(nodePath.join(VENV_DIR, 'virtualenv.py')),
           coverPath(ENV_DIR)], callback);
      }
      else {
        callback();
      }
    };

    this.checkDefaultToolchain = function() {
      try {
        // TODO: use tar.gz with sha1
        return nodeFs.statSync(TOOLCHAIN_DIR).isDirectory();
      }
      catch (err) {
        return false;
      }
    };

    this.extractDefaultApio = function(callback) {
      this.extractTargz(DEFAULT_APIO_TARGZ, DEFAULT_APIO_DIR, callback);
    };

    this.installDefaultApio = function(callback) {
      var self = this;
      nodeGlob(nodePath.join(DEFAULT_APIO_DIR, '*.*'), {}, function (error, files) {
        if (!error) {
          files = files.map(function(item) { return coverPath(item); });
          self.executeCommand([coverPath(ENV_PIP), 'install', '-U', '--no-deps'].concat(files), callback);
        }
      });
    };

    this.extractDefaultApioPackages = function(callback) {
      this.extractTargz(DEFAULT_APIO_PACKAGES_TARGZ, APIO_HOME_DIR, callback);
    };

    this.isOnline = function(callback, error) {
      nodeOnline({
        timeout: 5000
      }, function(err, online) {
        if (online) {
          callback();
        }
        else {
          error();
          callback(true);
        }
      });
    };

    this.installOnlineApio = function(callback) {
      this.executeCommand([coverPath(ENV_PIP), 'install', '-U', 'apio">=' + _package.apio.min + ',<' + _package.apio.max + '"'], callback);
    };

    this.apioInstall = function(_package, callback) {
      this.executeCommand([APIO_CMD, 'install', _package], callback);
    };

    this.toolchainDisabled = false;

    this.getApioExecutable = function() {
      var candidateApio = process.env.ICESTUDIO_APIO ? process.env.ICESTUDIO_APIO : SYSTEM_APIO;
      if (nodeFs.existsSync(candidateApio)) {
        if (!this.toolchainDisabled) {
          // Show message only on start
          alertify.message('Using system wide apio', 5);
        }
        this.toolchainDisabled = true;
        return coverPath(candidateApio);
      }
      this.toolchainDisabled = false;
      return APIO_CMD;
    };

    this.removeToolchain = function() {
      deleteFolderRecursive(ENV_DIR);
      deleteFolderRecursive(CACHE_DIR);
      deleteFolderRecursive(APIO_HOME_DIR);
    };

    this.removeCollections = function() {
      deleteFolderRecursive(COLLECTIONS_DIR);
    };

    this.deleteFolderRecursive = deleteFolderRecursive;

    function deleteFolderRecursive(path) {
      if (nodeFs.existsSync(path)) {
        nodeFs.readdirSync(path).forEach(function(file/*, index*/) {
          var curPath = nodePath.join(path, file);
          if (nodeFs.lstatSync(curPath).isDirectory()) { // recursive
            deleteFolderRecursive(curPath);
          }
          else { // delete file
            nodeFs.unlinkSync(curPath);
          }
        });
        nodeFs.rmdirSync(path);
      }
    }

    this.sep = nodePath.sep;

    this.basename = basename;
    function basename(filepath) {
      return nodePath.basename(filepath).split('.')[0];
    }

    this.dirname = function(filepath) {
      return nodePath.dirname(filepath);
    };

    this.readFile = function(filepath, callback) {
      nodeFs.readFile(filepath,
        function(err, data) {
          if (!err) {
            decompressJSON(data, callback);
          }
          else {
            if (callback) {
              callback();
            }
          }
      });
    };

    var saveBin = false;

    this.saveFile = function(filepath, content, callback, compress) {
      if (compress) {
        compressJSON(content, function(compressed) {
          nodeFs.writeFile(filepath, compressed, saveBin ? 'binary' : null,
          function(err) {
            if (!err && callback) {
              callback();
            }
          });
        });
      }
      else {
        nodeFs.writeFile(filepath, content, function(err) {
          if (!err && callback) {
            callback();
          }
        });
      }
    };

    function compressJSON(json, callback) {
      if (!saveBin) {
        if (callback) {
          callback(JSON.stringify(json, null, 2));
        }
      }
      else {
        var data = JSON.stringify(json);
        nodeZlib.gzip(data, function (_, result) {
          if (callback) {
            callback(result);
          }
        });
      }
    }

    function decompressJSON(json, callback) {
      var data = isJSON(json);
      if (data) {
        if (callback) {
          callback(data);
        }
      }
      else {
        nodeZlib.gunzip(json, function(_, uncompressed) {
          var result = JSON.parse(uncompressed);
          if (callback) {
            callback(result);
          }
        });
      }
    }

    function isJSON(str) {
      var result = false;
      try {
        result = JSON.parse(str);
      } catch (e) {
        return false;
      }
      return result;
    }

    this.getFilesRecursive = getFilesRecursive;

    function getFilesRecursive(folder) {
      var fileTree = [];
      var validator = /.*\.(ice|json)$/;

      if (nodeFs.existsSync(folder)) {
        var fileContents = nodeFs.readdirSync(folder);
        var stats;

        fileContents.forEach(function (name) {
          var path = nodePath.join(folder, name);
          stats = nodeFs.lstatSync(path);

          if (stats.isDirectory()) {
            fileTree.push({
              name: name,
              path: path,
              children: getFilesRecursive(path, validator)
            });
          } else if (validator.test(name)) {
            fileTree.push({
              name: basename(name),
              path: path
            });
          }
        });
      }
      return fileTree;
    }

    this.enableDrivers = function() {
      if (WIN32) {
        enableWindowsDrivers();
      }
      else if (DARWIN) {
        enableDarwinDrivers();
      }
      else {
        linuxDrivers(true);
      }
    };

    this.disableDrivers = function() {
      if (WIN32) {
        disableWindowsDrivers();
      }
      else if (DARWIN) {
        disableDarwinDrivers();
      }
      else {
        linuxDrivers(false);
      }
    };

    function linuxDrivers(enable) {
      var commands;
      if (enable) {
        commands = [
          'cp ' + nodePath.resolve('resources/config/80-icestick.rules') + ' /etc/udev/rules.d/80-icestick.rules',
          'service udev restart'
        ];
      }
      else {
        commands = [
          'rm /etc/udev/rules.d/80-icestick.rules',
          'service udev restart'
        ];
      }
      var command = 'sh -c "' + commands.join('; ') + '"';

      beginLazyProcess();
      nodeSudo.exec(command, {name: 'Icestudio'}, function(error/*, stdout, stderr*/) {
        // console.log(error, stdout, stderr);
        endLazyProcess();
        if (!error) {
          if (enable) {
            alertify.success(gettextCatalog.getString('Drivers enabled'));
          }
          else {
            alertify.warning(gettextCatalog.getString('Drivers disabled'));
          }
          setTimeout(function() {
             alertify.message(gettextCatalog.getString('<b>Unplug</b> and <b>reconnect</b> the board'), 5);
          }, 1000);
        }
      });
    }

    function enableDarwinDrivers() {
      var commands = [
        'kextunload -b com.FTDI.driver.FTDIUSBSerialDriver -q || true',
        'kextunload -b com.apple.driver.AppleUSBFTDI -q || true'
      ];
      var command = 'sh -c "' + commands.join('; ') + '"';

      beginLazyProcess();
      nodeSudo.exec(command, {name: 'Icestudio'}, function(error/*, stdout, stderr*/) {
        // console.log(error, stdout, stderr);
        if (error) {
          endLazyProcess();
        }
        else {
          var brewCommands = [
            '/usr/local/bin/brew update',
            '/usr/local/bin/brew install --force libftdi',
            '/usr/local/bin/brew unlink libftdi',
            '/usr/local/bin/brew link --force libftdi',
            '/usr/local/bin/brew install --force libffi',
            '/usr/local/bin/brew unlink libffi',
            '/usr/local/bin/brew link --force libffi'
          ];
          nodeChildProcess.exec(brewCommands.join('; '), function(error, stdout, stderr) {
            // console.log(error, stdout, stderr);
            endLazyProcess();
            if (error) {
              if ((stderr.indexOf('brew: command not found') !== -1) ||
                   (stderr.indexOf('brew: No such file or directory') !== -1)) {
                alertify.error(gettextCatalog.getString('Homebrew is required'), 30);
                // TODO: open web browser with Homebrew website on click
              }
              else if (stderr.indexOf('Error: Failed to download') !== -1) {
                alertify.error(gettextCatalog.getString('Internet connection required'), 30);
              }
              else {
                alertify.error(stderr, 30);
              }
            }
            else {
              alertify.success(gettextCatalog.getString('Drivers enabled'));
            }
          });
        }
      });
    }

    function disableDarwinDrivers() {
      var commands = [
        'kextload -b com.FTDI.driver.FTDIUSBSerialDriver -q || true',
        'kextload -b com.apple.driver.AppleUSBFTDI -q || true'
      ];
      var command = 'sh -c "' + commands.join('; ') + '"';

      beginLazyProcess();
      nodeSudo.exec(command, {name: 'Icestudio'}, function(error/*, stdout, stderr*/) {
        // console.log(error, stdout, stderr);
        endLazyProcess();
        if (!error) {
          alertify.warning(gettextCatalog.getString('Drivers disabled'));
        }
      });
    }

    function enableWindowsDrivers() {
      alertify.confirm(gettextCatalog.getString('<h4>FTDI driver installation instructions</h4><ol><li>Connect the FPGA board</li><li>Replace the <b>(Interface 0)</b> driver of the board by <b>libusbK</b></li><li>Unplug and reconnect the board</li></ol>'), function() {
        beginLazyProcess();
        nodeSudo.exec([APIO_CMD, 'drivers', '--enable'].join(' '),  {name: 'Icestudio'}, function(error, stdout, stderr) {
          // console.log(error, stdout, stderr);
          endLazyProcess();
          if (stderr) {
            alertify.error(gettextCatalog.getString('Toolchain not installed. Please, install the toolchain'), 30);
          }
          if (!error) {
            alertify.message(gettextCatalog.getString('<b>Unplug</b> and <b>reconnect</b> the board'), 5);
          }
        });
      });
    }

    function disableWindowsDrivers() {
      alertify.confirm(gettextCatalog.getString('<h4>FTDI driver uninstallation instructions</h4><ol><li>Find the FPGA USB Device</li><li>Select the board interface and uninstall the driver</li></ol>'), function() {
        beginLazyProcess();
        nodeChildProcess.exec([APIO_CMD, 'drivers', '--disable'].join(' '), function(error, stdout, stderr) {
          // console.log(error, stdout, stderr);
          endLazyProcess();
          if (stderr) {
            alertify.error(gettextCatalog.getString('Toolchain not installed. Please, install the toolchain'), 30);
          }
        });
      });
    }

    function beginLazyProcess() {
      $('body').addClass('waiting');
      angular.element('#menu').addClass('disable-menu');
    }

    function endLazyProcess() {
      $('body').removeClass('waiting');
      angular.element('#menu').removeClass('disable-menu');
    }

    this.setLocale = function(locale, collections) {
      // Update current locale format
      locale = splitLocale(locale);
      // Load supported languages
      var supported = getSupportedLanguages();
      // Set the best matching language
      var bestLang = bestLocale(locale, supported);
      gettextCatalog.setCurrentLanguage(bestLang);
      // Application strings
      gettextCatalog.loadRemote(nodePath.join(LOCALE_DIR, bestLang, bestLang + '.json'));
      // Collections strings
      for (var c in collections) {
        var collection = collections[c];
        var filepath = nodePath.join(collection.path, 'locale', bestLang, bestLang + '.json');
        if (nodeFs.existsSync(filepath)) {
          gettextCatalog.loadRemote(filepath);
        }
      }
      // COLLECTIONS_DIR
      return bestLang;
    };

    function splitLocale(locale) {
      var ret = {};
      var list = locale.split('_');
      if (list.length > 0) {
        ret.lang = list[0];
      }
      if (list.length > 1) {
        ret.country = list[1];
      }
      return ret;
    }

    function getSupportedLanguages() {
      var supported = [];
      nodeFs.readdirSync(LOCALE_DIR).forEach(function(element/*, index*/) {
        var curPath = nodePath.join(LOCALE_DIR, element);
        if (nodeFs.lstatSync(curPath).isDirectory()) {
          supported.push(splitLocale(element));
        }
      });
      return supported;
    }

    function bestLocale(locale, supported) {
      var i;
      // 1. Try complete match
      if (locale.country) {
        for (i = 0; i < supported.length; i++) {
          if (locale.lang === supported[i].lang &&
              locale.country === supported[i].country) {
            return supported[i].lang + '_' + supported[i].country;
          }
        }
      }
      // 2. Try lang match
      for (i = 0; i < supported.length; i++) {
        if (locale.lang === supported[i].lang) {
          return supported[i].lang + (supported[i].country ? '_' + supported[i].country : '');
        }
      }
      // 3. Return default lang
      return 'en';
    }

    this.multiprompt = function(messages, values, callback) {
      var i;
      var content = [];
      var n = messages.length;
      content.push('<div>');
      for (i in messages) {
        if (i > 0) {
          content.push('<br>');
        }
        content.push('  <p>' + messages[i] + '</p>');
        content.push('  <input class="ajs-input" id="input' + i.toString() + '" type="text" value="' + values[i] + '"/>');
      }
      content.push('</div>');
      // Restore values
      for (i = 0; i < n; i++) {
        $('#input' + i.toString()).val(values[i]);
      }

      alertify.confirm(content.join('\n'))
      .set('onok', function(evt) {
        var values = [];
        for (var i = 0; i < n; i++) {
          values.push($('#input' + i.toString()).val());
        }
        if (callback) {
          callback(evt, values);
        }
      })
      .set('oncancel', function(/*evt*/) {
      });
    };

    this.inputcheckboxprompt = function(messages, values, callback) {
      var content = [];
      content.push('<div>');
      content.push('  <p>' + messages[0] + '</p>');
      content.push('  <input id="label" class="ajs-input" type="text" value="' + values[0] + '"/>');
      content.push('  <br>');
      content.push('  <div class="checkbox"><label><input id="check" type="checkbox" value="" ' + (values[1] ? 'checked' : '') + '>' + messages[1] + '</label></div></li>');
      content.push('</div>');
      // Restore values
      $('#label').val(values[0]);
      $('#check').prop('checked', values[1]);

      alertify.confirm(content.join('\n'))
      .set('onok', function(evt) {
        var values = [];
        values.push($('#label').val());
        values.push($('#check').prop('checked'));
        if (callback) {
          callback(evt, values);
        }
      })
      .set('oncancel', function(/*evt*/) {
      });
    };

    this.inputcheckbox2prompt = function(messages, values, callback) {
      var content = [];
      content.push('<div>');
      content.push('  <p>' + messages[0] + '</p>');
      content.push('  <input id="label" class="ajs-input" type="text" value="' + values[0] + '"/>');
      content.push('  <br>');
      content.push('  <div class="checkbox"><label><input id="check1" type="checkbox" value="" ' + (values[1] ? 'checked' : '') + '>' + messages[1] + '</label></div></li>');
      content.push('  <div class="checkbox"><label><input id="check2" type="checkbox" value="" ' + (values[2] ? 'checked' : '') + '>' + messages[2] + '</label></div></li>');
      content.push('</div>');
      // Restore values
      $('#label').val(values[0]);
      $('#check1').prop('checked', values[1]);
      $('#check2').prop('checked', values[2]);

      alertify.confirm(content.join('\n'))
      .set('onok', function(evt) {
        var values = [];
        values.push($('#label').val());
        values.push($('#check1').prop('checked'));
        values.push($('#check2').prop('checked'));
        if (callback) {
          callback(evt, values);
        }
      })
      .set('oncancel', function(/*evt*/) {
      });
    };

    this.projectinfoprompt = function(values, callback) {
      var i;
      var content = [];
      var messages = [
        gettextCatalog.getString('Name'),
        gettextCatalog.getString('Version'),
        gettextCatalog.getString('Description'),
        gettextCatalog.getString('Author')
      ];
      var n = messages.length;
      var image = values[4];
      var blankImage = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      content.push('<div>');
      for (i in messages) {
        if (i > 0) {
          //content.push('<br>');
        }
        content.push('  <p>' + messages[i] + '</p>');
        content.push('  <input class="ajs-input" id="input' + i.toString() + '" type="text" value="' + values[i] + '"/>');
      }
      content.push('  <p>' + gettextCatalog.getString('Image') + '</p>');
      content.push('  <input id="input-open-svg" type="file" accept=".svg" class="hidden">');
      content.push('  <input id="input-save-svg" type="file" accept=".svg" class="hidden" nwsaveas="image.svg">');
      content.push('  <div>');
      content.push('  <img id="preview-svg" class="ajs-input" src="' + (image ? ('data:image/svg+xml,' + image) : blankImage) + '" height="68" style="pointer-events:none">');
      content.push('  </div>');
      content.push('  <div>');
      content.push('    <label for="input-open-svg" class="btn">' + gettextCatalog.getString('Open SVG') + '</label>');
      content.push('    <label id="save-svg" for="input-save-svg" class="btn">' + gettextCatalog.getString('Save SVG') + '</label>');
      content.push('    <label id="reset-svg" class="btn">' + gettextCatalog.getString('Reset SVG') + '</label>');
      content.push('  </div>');
      content.push('</div>');
      // Restore values
      for (i = 0; i < n; i++) {
        $('#input' + i.toString()).val(values[i]);
      }
      if (image) {
        $('#preview-svg').attr('src', 'data:image/svg+xml,' + image);
      }
      else {
        $('#preview-svg').attr('src', blankImage);
      }

      alertify.confirm()
      .set('onshow', function() {
        registerOpen();
        registerSave();
        registerReset();
      });

      function registerOpen() {
        // Open SVG
        var chooserOpen = $('#input-open-svg');
        chooserOpen.unbind('change');
        chooserOpen.change(function(/*evt*/) {
          var filepath = $(this).val();
          var svgo = new SVGO();
          nodeFs.readFile(filepath, 'utf8', function(err, data) {
            if (err) {
              throw err;
            }
            svgo.optimize(data, function(result) {
              image = encodeURI(result.data);
              registerSave();
              $('#preview-svg').attr('src', 'data:image/svg+xml,' + image);
            });
          });
          $(this).val('');
        });
      }

      function registerSave() {
        // Save SVG
        var label = $('#save-svg');
        if (image) {
          label.removeClass('disabled');
          label.attr('for', 'input-save-svg');
          var chooserSave = $('#input-save-svg');
          chooserSave.unbind('change');
          chooserSave.change(function(/*evt*/) {
            if (image) {
              var filepath = $(this).val();
              if (!filepath.endsWith('.svg')) {
                filepath += '.svg';
              }
              nodeFs.writeFile(filepath, decodeURI(image), function(err) {
                if (err) {
                  throw err;
                }
              });
              $(this).val('');
            }
          });
        }
        else {
          label.addClass('disabled');
          label.attr('for', '');
        }
      }

      function registerReset() {
        // Reset SVG
        var reset = $('#reset-svg');
        reset.click(function(/*evt*/) {
          image = '';
          registerSave();
          $('#preview-svg').attr('src', blankImage);
        });
      }

      alertify.confirm(content.join('\n'))
      .set('onok', function(evt) {
        var values = [];
        for (var i = 0; i < n; i++) {
          values.push($('#input' + i.toString()).val());
        }
        values.push(image);
        if (callback) {
          callback(evt, values);
        }
        alertify.confirm().set('onshow', function() {});
      })
      .set('oncancel', function(/*evt*/) {
        alertify.confirm().set('onshow', function() {});
      });
    };

    this.copySync = function(orig, dest) {
      var ret = true;
      try {
        if (nodeFs.existsSync(orig)) {
          nodeFse.copySync(orig, dest);
        }
        else {
          // Error: file does not exist
          ret = false;
        }
      }
      catch (e) {
        alertify.error(gettextCatalog.getString('Error: {{error}}', { error: e.toString() }), 30);
        ret = false;
      }
      return ret;
    };

    this.findIncludedFiles = function(code) {
      var ret = [];
      var patterns = [
        /@include\s(.*?)(\\n|\n|\s)/g,
        /\\"(.*\.list?)\\"/g
      ];
      for (var p in patterns) {
        var match;
        while (match = patterns[p].exec(code)) {
          var file = match[1].replace(/ /g, '');
          if (ret.indexOf(file) === -1) {
            ret.push(file);
          }
        }
      }
      return ret;
    };

    this.bold = function(text) {
      return '<b>' + text + '</b>';
    };

    this.openDialog = function(inputID, ext, callback) {
      var chooser = $(inputID);
      chooser.unbind('change');
      chooser.change(function(/*evt*/) {
        var filepath = $(this).val();
        //if (filepath.endsWith(ext)) {
          if (callback) {
            callback(filepath);
          }
        //}
        $(this).val('');
      });
      chooser.trigger('click');
    };

    this.saveDialog = function(inputID, ext, callback) {
      var chooser = $(inputID);
      chooser.unbind('change');
      chooser.change(function(/*evt*/) {
        var filepath = $(this).val();
        if (!filepath.endsWith(ext)) {
          filepath += ext;
        }
        if (callback) {
          callback(filepath);
        }
        $(this).val('');
      });
      chooser.trigger('click');
    };

    this.updateWindowTitle = function(title) {
      window.get().title = title;
    };

    this.rootScopeSafeApply = function() {
      if(!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    };

    this.parsePortLabel = function(data) {
      // e.g: name[x:y]
      var match, ret = {};
      var pattern = /([A-Za-z_]+[A-Za-z_0-9]*)?(\[([0-9]+):([0-9]+)\])?/g;
      match = pattern.exec(data);
      if (match && (match[0] === match.input)) {
        ret.name = match[1] ? match[1] : '';
        ret.rangestr = match[2];
        if (match[2]) {
          if (match[3] > match[4]) {
            ret.range = _.range(match[3], parseInt(match[4])-1, -1);
          }
          else {
            ret.range = _.range(match[3], parseInt(match[4])+1, +1);
          }
        }
        return ret;
      }
      return null;
    };

    this.parseParamLabel = function(data) {
      // e.g: name
      var match, ret = {};
      var pattern = /([A-Za-z_]+[A-Za-z_0-9]*)?/g;
      match = pattern.exec(data);
      if (match && (match[0] === match.input)) {
        ret.name = match[1] ? match[1] : '';
        return ret;
      }
      return null;
    };

    this.clone = function(data) {
      return JSON.parse(JSON.stringify(data));
    };

    this.dependencyID = function(dependency) {
      if (dependency.package && dependency.design) {
        return nodeSha1(JSON.stringify(dependency.package) +
                        JSON.stringify(dependency.design));
      }
    };

    this.newWindow = function(filepath, local) {
      var execPath = process.execPath;
      var command = [ coverPath(execPath) ];
      if (execPath.endsWith('nw') || execPath.endsWith('nw.exe') || execPath.endsWith('nwjs Helper')) {
        command.push(coverPath(nodePath.dirname(process.mainModule.filename)));
      }
      if (filepath) {
        command.push(coverPath(filepath));
      }
      /*var win = window.get();
      var position = {
        x: win.x + 30,
        y: win.y + 30
      };
      command.push(position.x + 'x' + position.y);*/
      if (local) {
        command.push('local');
      }
      nodeChildProcess.exec(command.join(' '), [], function(error/*, stdout/*, stderr*/) {
        if (error) {
          throw error;
        }
      });
    };

    this.coverPath = coverPath;
    function coverPath(filepath) {
      return '"' + filepath + '"';
    }

    this.copyToClipboard = function(selection, graph) {
      var cells = selectionToCells(selection, graph);
      var clipboard = {
        icestudio: this.cellsToProject(cells, graph)
      };
      console.log('Copy', clipboard);
      nodeCP.copy(JSON.stringify(clipboard), function() {
        // Success
      });
    };

    this.pasteFromClipboard = function(callback) {
      nodeCP.paste(function(a, text) {
        try {
          var clipboard = JSON.parse(text);
          if (callback && clipboard && clipboard.icestudio) {
            callback(clipboard, true);
          }
        }
        catch (e) {
          callback(text, false);
        }
      });
    };

    function selectionToCells(selection, graph) {
      var cells = [];
      var blocksMap = {};
      selection.each(function(block) {
        // Add block
        cells.push(block.attributes);
        // Map blocks
        blocksMap[block.id] = block;
        // Add connected wires
        var processedWires = {};
        var connectedWires = graph.getConnectedLinks(block);
        _.each(connectedWires, function(wire) {

          if (processedWires[wire.id]) {
            return;
          }

          var source = blocksMap[wire.get('source').id];
          var target = blocksMap[wire.get('target').id];

          if (source && target) {
            cells.push(wire.attributes);
            processedWires[wire.id] = true;
          }
        });
      });
      console.log(cells);
      return cells;
    }

    this.cellsToProject = function(cells, opt) {
      // Convert a list of cells into the following sections of a project:
      // - design.graph
      // - dependencies

      var blocks = [];
      var wires = [];
      var p = {
        version: common.VERSION,
        design: {},
        dependencies: {}
      };

      opt = opt || {};

      for (var c = 0; c < cells.length; c++) {
        var cell = cells[c];

        if (cell.type === 'ice.Generic' ||
            cell.type === 'ice.Input' ||
            cell.type === 'ice.Output' ||
            cell.type === 'ice.Code' ||
            cell.type === 'ice.Info' ||
            cell.type === 'ice.Constant') {
          var block = {};
          block.id = cell.id;
          block.type = cell.blockType;
          block.data = cell.data;
          block.position = cell.position;
          if (cell.type === 'ice.Generic' ||
              cell.type === 'ice.Code' ||
              cell.type === 'ice.Info') {
            block.size = cell.size;
          }
          blocks.push(block);
        }
        else if (cell.type === 'ice.Wire') {
          var wire = {};
          wire.source = { block: cell.source.id, port: cell.source.port };
          wire.target = { block: cell.target.id, port: cell.target.port };
          wire.vertices = cell.vertices;
          wire.size = (cell.size > 1) ? cell.size : undefined;
          wires.push(wire);
        }
      }

      p.design.graph = { blocks: blocks, wires: wires };

      // Update dependencies
      if (opt.deps !== false) {
        var types = this.findSubDependencies(p, common.allDependencies);
        for (var t in types) {
          p.dependencies[types[t]] = common.allDependencies[types[t]];
        }
      }

      return p;
    };

    this.findSubDependencies = function(dependency) {
      var subDependencies = [];
      if (dependency) {
        var blocks = dependency.design.graph.blocks;
        for (var i in blocks) {
          var type = blocks[i].type;
          if (type.indexOf('basic.') === -1) {
            subDependencies.push(type);
            var newSubDependencies = this.findSubDependencies(common.allDependencies[type]);
            subDependencies = subDependencies.concat(newSubDependencies);
          }
        }
        return _.unique(subDependencies);
      }
      return subDependencies;
    };

  });
