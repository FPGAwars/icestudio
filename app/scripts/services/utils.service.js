
'use strict';

angular.module('icestudio')
  .service('utils', function($rootScope,
                             gettextCatalog,
                             _package,
                             window,
                             nodeFs,
                             nodeFse,
                             nodeOs,
                             nodePath,
                             nodeChildProcess,
                             nodeTarball,
                             nodeZlib,
                             nodeSudo,
                             nodeOnline,
                             nodeGlob,
                             SVGO) {

    const WIN32 = Boolean(process.platform.indexOf('win32') > -1);
    const DARWIN = Boolean(process.platform.indexOf('darwin') > -1);

    const CACHE = '_cache';

    const VENV = 'virtualenv-15.0.1';
    const VENV_DIR = nodePath.join(CACHE, VENV);
    const VENV_TARGZ = nodePath.join('resources', 'virtualenv', VENV + '.tar.gz');

    const SAMPLE_DIR = nodePath.join('resources', 'sample');
    this.SAMPLE_DIR = SAMPLE_DIR;

    const LOCALE_DIR = nodePath.join('resources', 'locale');

    const APP_DIR = nodePath.dirname(process.execPath);
    const TOOLCHAIN_DIR = nodePath.join(APP_DIR, 'toolchain');
    this.TOOLCHAIN_DIR = TOOLCHAIN_DIR;

    const DEFAULT_APIO = 'default-apio';
    const DEFAULT_APIO_DIR = nodePath.join(CACHE, DEFAULT_APIO);
    const DEFAULT_APIO_TARGZ = nodePath.join(TOOLCHAIN_DIR, DEFAULT_APIO + '.tar.gz');

    const DEFAULT_APIO_PACKAGES = 'default-apio-packages';
    const DEFAULT_APIO_PACKAGES_TARGZ = nodePath.join(TOOLCHAIN_DIR, DEFAULT_APIO_PACKAGES + '.tar.gz');

    const BASE_DIR = process.env.HOME || process.env.USERPROFILE;
    const ICESTUDIO_DIR = nodePath.join(BASE_DIR, '.icestudio');
    const APIO_HOME_DIR = nodePath.join(ICESTUDIO_DIR, 'apio');

    const ENV_DIR = _getEnvDir(nodePath.join(ICESTUDIO_DIR, 'venv'));
    const ENV_BIN_DIR = nodePath.join(ENV_DIR, WIN32 ? 'Scripts' : 'bin');
    const ENV_PIP = nodePath.join(ENV_BIN_DIR, 'pip');
    const ENV_APIO = nodePath.join(ENV_BIN_DIR, WIN32 ? 'apio.exe' : 'apio');
    const APIO_CMD = (WIN32 ? 'set' : 'export') + ' APIO_HOME_DIR=' + APIO_HOME_DIR + (WIN32 ? '& ' : '; ') + ENV_APIO;
    const SYSTEM_APIO = '/usr/bin/apio';

    function _getEnvDir(defaultEnvDir) {
      if (WIN32) {
        // Put the env directory to the root of the current local disk when
        // default path contains non-ASCII characters. Virtualenv will fail to
        for (var i in defaultEnvDir) {
          var char = defaultEnvDir[i];
          if (char.charCodeAt(0) > 127) {
            var defaultEnvDirFormat = nodeOs.parse(defaultEnvDir);
            return nodeOs.format({
              root: defaultEnvDirFormat.root,
              dir: defaultEnvDirFormat.root,
              base: '.icestudiovenv',
              name: '.icestudiovenv',
            });
          }
        }
      }

      return defaultEnvDir;
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
      this.extractTargz(VENV_TARGZ, CACHE, callback);
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
          [this.getPythonExecutable(), nodePath.join(VENV_DIR, 'virtualenv.py'), ENV_DIR], callback);
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
          self.executeCommand([ENV_PIP, 'install', '-U', '--no-deps'].concat(files), callback);
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
      this.executeCommand([ENV_PIP, 'install', '-U', 'apio">=' + _package.apio.min + ',<' + _package.apio.max + '"'], callback);
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
          alertify.notify('Using system wide apio', 'message', 5);
        }
        this.toolchainDisabled = true;
        return candidateApio;
      }
      this.toolchainDisabled = false;
      return APIO_CMD;
    };

    this.removeToolchain = function() {
      deleteFolderRecursive(ENV_DIR);
      deleteFolderRecursive(APIO_HOME_DIR);
    };

    var deleteFolderRecursive = function(path) {
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
    };

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

    function getFilesRecursive(folder, extension) {
      var fileContents = nodeFs.readdirSync(folder),
          fileTree = [],
          stats;

      fileContents.forEach(function (fileName) {
        var filePath = nodePath.join(folder, fileName);
        stats = nodeFs.lstatSync(filePath);

        if (stats.isDirectory()) {
          fileTree.push({
            name: fileName,
            children: getFilesRecursive(filePath, extension)
          });
        } else {
          if (fileName.endsWith(extension)) {
            var content = JSON.parse(nodeFs.readFileSync(filePath).toString());
            fileTree.push({
              name: basename(fileName),
              content: content
            });
          }
        }
      });

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
             alertify.notify(gettextCatalog.getString('<b>Unplug</b> and <b>reconnect</b> the board'), 'message', 5);
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
                alertify.notify(gettextCatalog.getString('Homebrew is required'), 'error', 30);
                // TODO: open web browser with Homebrew website on click
              }
              else if (stderr.indexOf('Error: Failed to download') !== -1) {
                alertify.notify(gettextCatalog.getString('Internet connection required'), 'error', 30);
              }
              else {
                alertify.notify(stderr, 'error', 30);
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
        nodeChildProcess.exec([APIO_CMD, 'drivers', '--enable'].join(' '), function(error, stdout, stderr) {
          // console.log(error, stdout, stderr);
          endLazyProcess();
          if (stderr) {
            alertify.notify(gettextCatalog.getString('Toolchain not installed. Please, install the toolchain'), 'error', 30);
          }
          if (!error) {
            alertify.notify(gettextCatalog.getString('<b>Unplug</b> and <b>reconnect</b> the board'), 'message', 5);
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
            alertify.notify(gettextCatalog.getString('Toolchain not installed. Please, install the toolchain'), 'error', 30);
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

    this.setLocale = function(locale) {
      // Update current locale format
      locale = splitLocale(locale);
      // Load supported languages
      var supported = getSupportedLanguages();
      // Set the best matching language
      var bestLang = bestLocale(locale, supported);
      gettextCatalog.setCurrentLanguage(bestLang);
      gettextCatalog.loadRemote(nodePath.join(LOCALE_DIR, bestLang, bestLang + '.json'));
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
      content.push('  <div class="checkbox"><label><input id="local" type="checkbox" value="" ' + (values[1] ? 'checked' : '') + '>' + messages[1] + '</label></div></li>');
      content.push('</div>');
      // Restore values
      $('#label').val(values[0]);
      $('#local').prop('checked', values[1]);

      alertify.confirm(content.join('\n'))
      .set('onok', function(evt) {
        var values = [];
        values.push($('#label').val());
        values.push($('#local').prop('checked'));
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
        alertify.notify(gettextCatalog.getString('Error: {{error}}', { error: e.toString() }), 'error', 30);
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
      var pattern = /([A-Za-z_]+[A-Za-z_0-9]*){0,1}(\[([0-9]+):([0-9]+)\]){0,1}/g;
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
      var pattern = /([A-Za-z_]+[A-Za-z_0-9]*){0,1}/g;
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

  });
