'use strict';


/*jshint unused:false*/
angular.module('icestudio')
  .service('utils', function ($rootScope,
    gettextCatalog,
    common,
    _package,
    window,
    nodeFs,
    nodeFse,
    nodePath,
    nodeChildProcess,
    nodeExtract,
    nodeZlib,
    nodeOnline,
    nodeGlob,
    nodeSha1,
    nodeCP,
    nodeGetOS,
    nodeLangInfo,
    gui,
    SVGO,
    fastCopy) {

    let _pythonExecutableCached = null;
    let _pythonPipExecutableCached = null;
   
    // Get the system pip executable
    // It is available in the common.ENV_PIP object
    this.getPythonPipExecutable = function () {
      
      if (!_pythonPipExecutableCached) {
        _pythonPipExecutableCached = common.ENV_PIP;
      }

      return _pythonPipExecutableCached;
    };

    //------------------------------------------------
    //-- Get the system python executable
    //--
    this.getPythonExecutable = function () {

      //-- If the executable was not obtained before...
      if (!_pythonExecutableCached) {

        //-- The possible executables are stored in this Array
        const possibleExecutables = [];

        if (typeof common.PYTHON_ENV !== 'undefined' &&
          common.PYTHON_ENV.length > 0) {

          possibleExecutables.push(common.PYTHON_ENV);

        } //-- Possible python executables in Windows
          else if (common.WIN32) {
            possibleExecutables.push('C:\\Python39\\python.exe');
            possibleExecutables.push('C:\\Python38\\python.exe');
            possibleExecutables.push('C:\\Python37\\python.exe');
            possibleExecutables.push('C:\\Python36\\python.exe');
            possibleExecutables.push('C:\\Python35\\python.exe');
            possibleExecutables.push('py.exe -3');
            possibleExecutables.push('python.exe');

        } //-- Python executables in Linux/Mac
          else {
            possibleExecutables.push('/usr/local/Cellar/python/3.8.2/bin/python3');
            possibleExecutables.push('/usr/local/Cellar/python/3.7.7/bin/python3');

            possibleExecutables.push('/usr/bin/python3.9');
            possibleExecutables.push('/usr/bin/python3.8');
            possibleExecutables.push('/usr/bin/python3.7');
            possibleExecutables.push('/usr/bin/python3.6');
            possibleExecutables.push('/usr/bin/python3.5');
            possibleExecutables.push('/usr/bin/python3');
            possibleExecutables.push('/usr/bin/python');

            possibleExecutables.push('/usr/local/bin/python3.9');
            possibleExecutables.push('/usr/local/bin/python3.8');
            possibleExecutables.push('/usr/local/bin/python3.7');
            possibleExecutables.push('/usr/local/bin/python3.6');
            possibleExecutables.push('/usr/local/bin/python3.5');
            possibleExecutables.push('/usr/local/bin/python3');
            possibleExecutables.push('/usr/local/bin/python');

            possibleExecutables.push('python3.9');
            possibleExecutables.push('python3.8');
            possibleExecutables.push('python3.7');
            possibleExecutables.push('python3.6');
            possibleExecutables.push('python3.5');
            possibleExecutables.push('python3');
            possibleExecutables.push('python');
        }

        //-- Move through all the possible executables
        //-- checking if they are executable
        for (let executable of possibleExecutables) {

          if (isPython3(executable)) {
            _pythonExecutableCached = executable;
            console.log("Executable: " + executable);
            break;
          }
        }
      }
      return _pythonExecutableCached;
    };


    function isValidPip(executable) {

      executable += ' -V';
      try {
        const result = nodeChildProcess.execSync(executable);
        return (result !== false && result !== null &&
          (result.toString().indexOf('3.5') >= 0 || result.toString().indexOf('3.6') >= 0 ||
            result.toString().indexOf('3.7') >= 0 || result.toString().indexOf('3.8') >= 0 ||
            result.toString().indexOf('3.9') >= 0));
      } catch (e) {
        return false;
      }
    }


    //---------------------------------------------------------
    //-- Check if the given file is a python3 interpreter 
    //--
    function isPython3(executable) {

      //-- Add the '-V' flag for reading the python version
      executable += ' -V';

      try {

        //-- Run the executable
        const result = nodeChildProcess.execSync(executable);

        //-- Check the output. Return true if it is python3
        return (result !== false && result !== null &&
          (result.toString().indexOf('3.5') >= 0 || result.toString().indexOf('3.6') >= 0 ||
            result.toString().indexOf('3.7') >= 0 || result.toString().indexOf('3.8') >= 0 ||
            result.toString().indexOf('3.9') >= 0));

      } catch (e) {
        return false;
      }
    }


    this.extractZip = function (source, destination, callback) {
      nodeExtract(source, {
        dir: destination
      }, function (error) {
        if (error) {
          callback(true);
        } else {
          callback();
        }
      });
    };

    function disableEvent(event) {
      event.stopPropagation();
      event.preventDefault();
    }

    this.enableClickEvents = function () {
      document.removeEventListener('click', disableEvent, true);
    };

    this.disableClickEvents = function () {
      document.addEventListener('click', disableEvent, true);
    };

    this.enableKeyEvents = function () {
      document.removeEventListener('keyup', disableEvent, true);
      document.removeEventListener('keydown', disableEvent, true);
      document.removeEventListener('keypress', disableEvent, true);
    };

    this.disableKeyEvents = function () {
      document.addEventListener('keyup', disableEvent, true);
      document.addEventListener('keydown', disableEvent, true);
      document.addEventListener('keypress', disableEvent, true);
    };

    //--------------------------------------------------------------
    //-- Execute the given system command
    //-- command is an array of string containing the commands to
    //-- execute along with the arguments
    //--
    this.executeCommand = function (command, callback) {

      //-- Construct a string with the full command
      let cmd = command.join(' ');
      let _this = this;

      //-- Show the command in the DEBUG log
      iceConsole.log(`>>>> utils.executeCommand => ${cmd}\n`);

      //-- Array for storing the arguments
      let args = [];

      //-- Get the arguments, if any
      if (command.length > 0) {
        args = command.slice(1);
      }

      //-- Execute the command in background!!
      let proccess = nodeChildProcess.spawn(command[0], args, { shell: true });

      //-- When there are outputs available from the command...
      proccess.stdout.on('data', function (data) {

        //-- Show the output in the log
        iceConsole.log(`>>(OUTPUT): ${data}\n`);

        common.commandOutput = command.join(' ') + '\n\n' + data;
        $(document).trigger('commandOutputChanged', [common.commandOutput]);
      });

      //-- If there are errors ...
      proccess.stderr.on('data', function (data) {

        //-- Show them in the log file
        iceConsole.log(`>>(ERROR): ${data}\n`);
        
        common.commandOutput = command.join(' ') + '\n\n' + data;
        $(document).trigger('commandOutputChanged', [common.commandOutput]);
      });

      proccess.on('close', function (code) {
        if (code !== 0) {
          _this.enableKeyEvents();
          _this.enableClickEvents();
          iceConsole.log("----!!!! ERROR !!!! -----");
          iceConsole.log("CMD: " + command);
          callback(true);
          alertify.error('Error executting command ' + command, 30);
        } else {
          callback();
        }
      });

      proccess.on('exit', function (code) {
        if (code !== 0) {
          _this.enableKeyEvents();
          _this.enableClickEvents();
          callback(true);
          alertify.error(common.commandOutput, 30);
        } else {
          callback();
        }
      });

    };

    //------------------------------------------
    //-- Return a String with the Apio version
    //
    this.printApioVersion = function (version) {
      let msg = "";

      switch(version) {
        case common.APIO_VERSION_LATEST_STABLE:
          msg = "Apio LATEST STABLE version";
          break;
        
        case common.APIO_VERSION_STABLE:
          msg = "Apio STABLE version";
          break;

        case common.APIO_VERSION_DEV:
          msg = "Apio DEVELOPMENT VERSION";
          break;

        default:
          msg = "UNKNOWN apio Version (ERROR)";
          break;
      }

      return msg;
    };

    //------------------------------------------
    //-- Create the python virtual environment
    //-- with the command python -m venv venv
    //------------------------------------------
    this.createVirtualenv = function (callback) {

      //-- Check if the .icestudio folder exist
      if (!nodeFs.existsSync(common.ICESTUDIO_DIR)) {

        //-- Create the .icestudio folder
        nodeFs.mkdirSync(common.ICESTUDIO_DIR);
      }

      //-- Check if the venv folder exist
      if (!nodeFs.existsSync(common.ENV_DIR)) {

        //-- python -m venv venv
        var command = [this.getPythonExecutable(), '-m venv', coverPath(common.ENV_DIR)];
        //-- Check if extra parameter is needed for windows...
        if (common.WIN32) {
          //command.push('--always-copy');
        }
        this.executeCommand(command, callback);

      } else {
        //-- The virtual environment already existed
        callback();
      }
    };


    //-----------------------------------------------------------------
    //-- Check if there is internet connection
    //--
    this.isOnline = function (callback, error) {
      nodeOnline({
        timeout: 5000
      }, function (err, online) {
        if (online) {
          callback();
        } else {
          error();
          callback(true);
        }
      });
    };


    //-----------------------------------------------------
    //-- Install the Apio toolchain. The version to install is taken
    //-- from the common.APIO_VERSION object
    //--
    //-- Installing the apio stable:
    //-- Ej.  pip install -U apio[extra packages]==0.6.0
    //
    //-- Installing the apio latest stable:
    //-- Ej.  pip install -U apio[extra packages]
    //
    //-- Installing the apio dev:
    //-- Ej.  pip install -U git+https://github.com/FPGAwars/apio.git@develop#egg=apio
    //
    this.installOnlineApio = function (callback) {
      
      console.log("UTILS: InstallOnlineApio: " + this.printApioVersion(common.APIO_VERSION));

      //-- Get the extra python packages to install
      let extraPackages = _package.apio.extras || [];

      //-- Get the pip string with the version
      //-- Stable: "==0.6.0"
      //-- Latest stable and dev: ""
      let versionString = "";

      if (common.APIO_VERSION === common.APIO_VERSION_STABLE) {
        versionString = "==" + _package.apio.min;
      }

      //-- Get the apio package name:
      //-- Stable and latest stable: "apio"
      //-- dev: "git+https://github.com/FPGAwars/apio.git@develop#egg=apio"
      let apio = (common.APIO_VERSION === common.APIO_VERSION_DEV) ? common.APIO_PIP_VCS : "apio";

      //-- Get the pip executable
      let pipExec = this.getPythonPipExecutable();

      //-- Place the executable between quotes ("") just in case there
      //-- is a path with spaces in their names
      const executable = coverPath(pipExec);

      //-- Get the pip parameters needed for installing apio
      const params = this.getApioParameters();

      //-- Run the pip command!
      this.executeCommand([executable, params], callback);
    };

    
    //------------------------------------------------
    //-- Return the parameters needed for pip for installing  
    //-- the apio toolchains. The version to install is read  
    //-- from the common.APIO_VERSION global object
    //--
    this.getApioParameters = function () {

      //-- Get the extra python packages to install
      let extraPackages = _package.apio.extras || [];

      //-- Get the pip string with the version
      //-- Stable: "==0.6.0"
      //-- Latest stable and dev: ""
      let versionString = "";

      if (common.APIO_VERSION === common.APIO_VERSION_STABLE) {
        versionString = "==" + _package.apio.min;
      }  

      //-- Get the apio package name:
      //-- Stable and latest stable: "apio"
      //-- dev: "git+https://github.com/FPGAwars/apio.git@develop#egg=apio"
      let apio = (common.APIO_VERSION === common.APIO_VERSION_DEV) ? common.APIO_PIP_VCS : "apio";

      //-- Get the pip params for installing apio
      const params = "install -U " + apio + "[" + extraPackages.toString() + "]" + versionString;

      return params;
    };

    //------------------------------------------------------------------
    //-- Install an APIO package
    //-- apio install <pkg>
    //--
    this.apioInstall = function (pkg, callback) {

      //-- common.APIO_CMD contains the command for executing APIO
      this.executeCommand([common.APIO_CMD, 'install', pkg], callback);
    };

    //-- The toolchains are NOT disabled by default
    this.toolchainDisabled = false;

    //---------------------------------------------------------------------------
    //-- Get the command that should be used for executing the apio toolchain
    //-- This command includes the full path to apio executable, as well as  
    //-- the setting of the APIO_HOME_DIR environment variable
    this.getApioExecutable = function () {
      
      //-- Check if the ICESTUDIO_APIO env variable is set with the apio toolchain to use  or  
      //-- if it has been set on the package.json file
      var candidateApio = process.env.ICESTUDIO_APIO ? process.env.ICESTUDIO_APIO : _package.apio.external;

      //-- The is an alternative apio toolchain ready
      if (nodeFs.existsSync(candidateApio)) {

        if (!this.toolchainDisabled) {
          // Show message only on start
          alertify.message('Using external apio: ' + candidateApio, 5);
        }
        this.toolchainDisabled = true;
        return coverPath(candidateApio);
      }

      //-- There are no external apio toolchain. Use the one installed by icestudio
      this.toolchainDisabled = false;
      
      //-- The apio command to execute is located in the common.APIO_CMD global object
      return common.APIO_CMD;
    };


    //-------------------------------------------------------------------------
    //-- Remove the toolchains and related folders
    //-- 
    this.removeToolchain = function () {

      //-- Remove the Virtual environment
      this.deleteFolderRecursive(common.ENV_DIR);

      //-- Remove APIO
      this.deleteFolderRecursive(common.APIO_HOME_DIR);

      //-- Remove the cache dir (temporal)
      this.deleteFolderRecursive(common.CACHE_DIR);
    };

    this.removeCollections = function () {
      this.deleteFolderRecursive(common.INTERNAL_COLLECTIONS_DIR);
    };

    this.deleteFolderRecursive = function (path) {
      if (nodeFs.existsSync(path)) {
        nodeFs.readdirSync(path).forEach(function (file /*, index*/) {
          var curPath = nodePath.join(path, file);
          if (nodeFs.lstatSync(curPath).isDirectory()) { // recursive
            this.deleteFolderRecursive(curPath);
          } else { // delete file
            nodeFs.unlinkSync(curPath);
          }
        }.bind(this));
        nodeFs.rmdirSync(path);
      }
    };

    this.sep = nodePath.sep;

    this.basename = basename;

    function basename(filepath) {
      let b = nodePath.basename(filepath);
      return b.substr(0, b.lastIndexOf('.'));
    }

    this.dirname = function (filepath) {
      return nodePath.dirname(filepath);
    };

    this.filepath2buildpath = function (filepath) {

      let b = nodePath.basename(filepath);
      let localdir = filepath.substr(0, filepath.lastIndexOf(b));
      let dirname = b.substr(0, b.lastIndexOf('.'));
      let path = nodePath.join(localdir, 'ice-build');
      //If we want to remove spaces return nodePath.join(path,dirname).replace(/ /g, '_');
      return nodePath.join(path, dirname);
    };


    //----------------------------------------------------
    //-- Read the profile file
    //--
    this.readFile = function (filepath) {

      return new Promise(function (resolve, reject) {
        if (nodeFs.existsSync(common.PROFILE_PATH)) {
          nodeFs.readFile(filepath, "utf8",
            function (err, content) {
              if (err) {
                reject(err.toString());
              } else {

                var data = false;

                let name = basename(filepath);
                let test = true;
                if (test && typeof ICEpm !== 'undefined' &&
                  ICEpm.isFactory(name)) {

                  ICEpm.factory(name, content, function (data) {
                    if (data) {
                      // JSON data
                      resolve(data);
                    } else {
                      reject();
                    }
                  });

                } else {

                  data = isJSON(content);

                  if (data) {
                    // JSON data
                    resolve(data);
                  } else {
                    reject();
                  }
                }
              }
            });
        } else {
          resolve({});
        }
      });
    };

    this.saveFile = function (filepath, data) {
      return new Promise(function (resolve, reject) {
        var content = data;
        if (typeof data !== 'string') {
          content = JSON.stringify(data, null, 2);
        }
        nodeFs.writeFile(filepath, content,
          function (err) {
            if (err) {
              reject(err.toString());
            } else {
              resolve();
            }
          });
      });
    };

    /*function compressJSON(data, callback) {
      var content = JSON.stringify(data);
      nodeZlib.gzip(content, function (_, compressed) {
        if (callback) {
          callback(compressed);
        }
      });
    }*/

    /*function decompressJSON(content, callback) {
      nodeZlib.gunzip(content, function(_, uncompressed) {
        var data = JSON.parse(uncompressed);
        if (callback) {
          callback(data);
        }
      });
    }*/

    function isJSON(content) {
      try {
        return JSON.parse(content);
      } catch (e) {
        return false;
      }
    }

    this.setLocale = function (locale, callback) {
      // Update current locale format
      locale = splitLocale(locale);
      // Load supported languages
      var supported = getSupportedLanguages();
      // Set the best matching language
      var bestLang = bestLocale(locale, supported);
      gettextCatalog.setCurrentLanguage(bestLang);
      // Application strings
      gettextCatalog.loadRemote(nodePath.join(common.LOCALE_DIR, bestLang, bestLang + '.json'));
      // Collections strings
      var collections = [common.defaultCollection].concat(common.internalCollections).concat(common.externalCollections);
      for (var c in collections) {
        var collection = collections[c];
        var filepath = nodePath.join(collection.path, 'locale', bestLang, bestLang + '.json');
        if (nodeFs.existsSync(filepath)) {
          gettextCatalog.loadRemote('file://' + filepath);
        }
      }
      if (callback) {
        setTimeout(function () {
          callback();
        }, 50);
      }
      // Return the best language
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
      nodeFs.readdirSync(common.LOCALE_DIR).forEach(function (element /*, index*/) {
        var curPath = nodePath.join(common.LOCALE_DIR, element);
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

    this.renderForm = function (specs, callback) {
      var content = [];
      content.push('<div>');
      for (var i in specs) {
        var spec = specs[i];
        switch (spec.type) {
          case 'text':
            content.push('\
              <p>' + spec.title + '</p>\
              <input class="ajs-input" type="text" id="form' + i + '"/>\
            ');
            break;
          case 'checkbox':
            content.push('\
              <div class="checkbox">\
                <label><input type="checkbox" ' + (spec.value ? 'checked' : '') + ' id="form' + i + '"/>' + spec.label + '</label>\
              </div>\
            ');
            break;
          case 'combobox':
            var options = spec.options.map(function (option) {
              var selected = spec.value === option.value ? ' selected' : '';
              return '<option value="' + option.value + '"' + selected + '>' + option.label + '</option>';
            }).join('');
            content.push('\
              <div class="form-group">\
                <label style="font-weight:normal">' + spec.label + '</label>\
                <select class="form-control" id="form' + i + '">\
                  ' + options + '\
                </select>\
              </div>\
            ');
            break;
        }
      }
      content.push('</div>');
      alertify.confirm(content.join('\n'))
        .set('onok', function (evt) {
          var values = [];
          if (callback) {
            for (var i in specs) {
              var spec = specs[i];
              switch (spec.type) {
                case 'text':
                case 'combobox':
                  values.push($('#form' + i).val());
                  break;
                case 'checkbox':
                  values.push($('#form' + i).prop('checked'));
                  break;
              }
            }
            callback(evt, values);
          }
        })
        .set('oncancel', function ( /*evt*/) { });
      // Restore input values
      setTimeout(function () {
        $('#form0').select();
        for (var i in specs) {
          var spec = specs[i];
          switch (spec.type) {
            case 'text':
            case 'combobox':
              $('#form' + i).val(spec.value);
              break;
            case 'checkbox':
              $('#form' + i).prop('checked', spec.value);
              break;
          }
        }
      }, 50);
    };

    this.projectinfoprompt = function (values, callback) {
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
        content.push('  <input class="ajs-input" id="input' + i + '" type="text" value="' + values[i] + '">');
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
        $('#input' + i).val(values[i]);
      }
      if (image) {
        $('#preview-svg').attr('src', 'data:image/svg+xml,' + image);
      } else {
        $('#preview-svg').attr('src', blankImage);
      }

      var prevOnshow = alertify.confirm().get('onshow') || function () { };

      alertify.confirm()
        .set('onshow', function () {
          prevOnshow();
          registerOpen();
          registerSave();
          registerReset();
        });

      function registerOpen() {
        // Open SVG
        var chooserOpen = $('#input-open-svg');
        chooserOpen.unbind('change');
        chooserOpen.change(function ( /*evt*/) {
          var filepath = $(this).val();

          nodeFs.readFile(filepath, 'utf8', function (err, data) {
            if (err) {
              throw err;
            }
            optimizeSVG(data, function (result) {
              image = encodeURI(result.data);
              registerSave();
              $('#preview-svg').attr('src', 'data:image/svg+xml,' + image);
            });
          });
          $(this).val('');
        });
      }

      function optimizeSVG(data, callback) {
        SVGO.optimize(data, callback);
      }

      function registerSave() {
        // Save SVG
        var label = $('#save-svg');
        if (image) {
          label.removeClass('disabled');
          label.attr('for', 'input-save-svg');
          var chooserSave = $('#input-save-svg');
          chooserSave.unbind('change');
          chooserSave.change(function ( /*evt*/) {
            if (image) {
              var filepath = $(this).val();
              if (!filepath.endsWith('.svg')) {
                filepath += '.svg';
              }
              nodeFs.writeFile(filepath, decodeURI(image), function (err) {
                if (err) {
                  throw err;
                }
              });
              $(this).val('');
            }
          });
        } else {
          label.addClass('disabled');
          label.attr('for', '');
        }
      }

      function registerReset() {
        // Reset SVG
        var reset = $('#reset-svg');
        reset.click(function ( /*evt*/) {
          image = '';
          registerSave();
          $('#preview-svg').attr('src', blankImage);
        });
      }

      alertify.confirm(content.join('\n'))
        .set('onok', function (evt) {
          var values = [];
          for (var i = 0; i < n; i++) {
            values.push($('#input' + i).val());
          }
          values.push(image);
          if (callback) {
            callback(evt, values);
          }
          // Restore onshow
          alertify.confirm().set('onshow', prevOnshow);
        })
        .set('oncancel', function ( /*evt*/) {
          // Restore onshow
          alertify.confirm().set('onshow', prevOnshow);
        });
    };

    this.selectBoardPrompt = function (callback) {
      // Disable user events
      this.disableKeyEvents();
      // Hide Cancel button
      $('.ajs-cancel').addClass('hidden');

      var formSpecs = [{
        type: 'combobox',
        label: gettextCatalog.getString('Select your board'),
        value: '',
        options: common.boards.map(function (board) {
          return {
            value: board.name,
            label: board.info.label
          };
        })
      }];

      this.renderForm(formSpecs, function (evt, values) {
        var selectedBoard = values[0];
        if (selectedBoard) {
          evt.cancel = false;
          if (callback) {
            callback(selectedBoard);
          }
          // Enable user events
          this.enableKeyEvents();
          // Restore Cancel button
          setTimeout(function () {
            $('.ajs-cancel').removeClass('hidden');
          }, 200);
        } else {
          evt.cancel = true;
        }
      }.bind(this));
    };

    this.copySync = function (orig, dest) {
      var ret = true;
      try {
        if (nodeFs.existsSync(orig)) {
          nodeFse.copySync(orig, dest);
        } else {
          // Error: file does not exist
          ret = false;
        }
      } catch (e) {
        alertify.error(gettextCatalog.getString('Error: {{error}}', {
          error: e.toString()
        }), 30);
        ret = false;
      }
      return ret;
    };

    this.findIncludedFiles = function (code) {
      var ret = [];
      var patterns = [
        /[\n|\s]\/\/\s*@include\s+([^\s]*\.(v|vh))(\n|\s)/g,
        /[\n|\s][^\/]?\"(.*\.list?)\"/g
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

    this.bold = function (text) {
      return '<b>' + text + '</b>';
    };

    this.openDialog = function (inputID, ext, callback) {
      var chooser = $(inputID);
      chooser.unbind('change');
      chooser.change(function ( /*evt*/) {
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

    this.saveDialog = function (inputID, ext, callback) {
      var chooser = $(inputID);
      chooser.unbind('change');
      chooser.change(function ( /*evt*/) {
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

    this.updateWindowTitle = function (title) {
      window.get().title = title;
    };

    this.rootScopeSafeApply = function () {
      if (!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    };

    this.parsePortLabel = function (data, pattern) {
      // e.g: name[x:y]
      var match, ret = {};
      var maxSize = 95;
      pattern = pattern || common.PATTERN_PORT_LABEL;
      match = pattern.exec(data);
      if (match && (match[0] === match.input)) {
        ret.name = match[1] ? match[1] : '';
        ret.rangestr = match[2];
        if (match[2]) {
          if (match[3] > maxSize || match[4] > maxSize) {
            alertify.warning(gettextCatalog.getString('Maximum bus size: 96 bits'), 5);
            return null;
          } else {
            if (match[3] > match[4]) {
              ret.range = _.range(match[3], parseInt(match[4]) - 1, -1);
            } else {
              ret.range = _.range(match[3], parseInt(match[4]) + 1, +1);
            }
          }
        }
        return ret;
      }
      return null;
    };

    this.parseParamLabel = function (data, pattern) {
      // e.g: name
      var match, ret = {};
      pattern = pattern || common.PATTERN_PARAM_LABEL;
      match = pattern.exec(data);
      if (match && (match[0] === match.input)) {
        ret.name = match[1] ? match[1] : '';
        return ret;
      }
      return null;
    };

    this.clone = function (data) {
      // Very slow in comparison but more stable for all types
      // of objects, if fails, rollback to JSON method or try strict
      // on fast-copy module
      //return  JSON.parse(JSON.stringify(data));
      return fastCopy(data);


    };

    this.dependencyID = function (dependency) {
      if (dependency.package && dependency.design) {
        return nodeSha1(JSON.stringify(dependency.package) +
          JSON.stringify(dependency.design));
      }
    };

    this.newWindow = function (filepath, local) {



      var params = false;

      if (typeof filepath !== 'undefined') {
        params = {
          'filepath': filepath
        };
      }

      if (typeof local !== 'undefined' && local === true) {
        if (params === false) {
          params = {};
        }
        params.local = 'local';
      }
      // To pass parameters to the new project window, we use de GET parameter "icestudio_argv"
      // that contains the same arguments that shell call, in this way the two calls will be
      // compatible.
      // If in the future you will add more paremeters to the new window , you should review
      // scripts/controllers/menu.js even if all parameters that arrive are automatically parse

      var url = 'index.html' + ((params === false) ? '' : '?icestudio_argv=' + encodeURI(btoa(JSON.stringify(params))));
      // Create a new window and get it.
      // new-instance and new_instance are necesary for OS compatibility
      // to avoid crash on new window project after close parent
      // (little trick for nwjs bug).
      //url='index.html?icestudio_argv=fsdfsfa';

      gui.Window.open(url, {
        // new_instance: true,  //Deprecated for new nwjs versios
        //      'new_instance': true,  //Deprecated for new nwjs versios
        'position': 'center',
        //        'toolbar': false,   //Deprecated for new nwjs versios
        'width': 900,
        'height': 600,
        'show': true,
      });

    };

    //-- Place the path inside quotes. It is important for managing filepaths
    //-- that contains spaces in ther names
    this.coverPath = coverPath;
    
    function coverPath(filepath) {
      return '"' + filepath + '"';
    }

    this.mergeDependencies = function (type, block) {
      if (type in common.allDependencies) {
        return; // If the block is already in dependencies
      }
      // Merge the block's dependencies
      var deps = block.dependencies;
      for (var depType in deps) {
        if (!(depType in common.allDependencies)) {
          common.allDependencies[depType] = deps[depType];
        }
      }
      // Add the block as a dependency
      delete block.dependencies;
      common.allDependencies[type] = block;
    };

    this.copyToClipboard = function (selection, graph) {

      var cells = selectionToCells(selection, graph);
      var clipboard = {
        icestudio: this.cellsToProject(cells, graph)
      };

      // Send the clipboard object the global clipboard as a string
      nodeCP.copy(JSON.stringify(clipboard), function () {
        // Success
      });
    };

    this.pasteFromClipboard = function (callback) {
      nodeCP.paste(function (err, text) {
        if (err) {
          if (common.LINUX) {
            // xclip installation message
            var cmd = '';
            var message = gettextCatalog.getString('{{app}} is required.', {
              app: '<b>xclip</b>'
            });
            nodeGetOS(function (e, os) {
              if (!e) {
                if (os.dist.indexOf('Debian') !== -1 ||
                  os.dist.indexOf('Ubuntu Linux') !== -1 ||
                  os.dist.indexOf('Linux Mint') !== -1) {
                  cmd = 'sudo apt-get install xclip';
                } else if (os.dist.indexOf('Fedora')) {
                  cmd = 'sudo dnf install xclip';
                } else if (os.dist.indexOf('RHEL') !== -1 ||
                  os.dist.indexOf('RHAS') !== -1 ||
                  os.dist.indexOf('Centos') !== -1 ||
                  os.dist.indexOf('Red Hat Linux') !== -1) {
                  cmd = 'sudo yum install xclip';
                } else if (os.dist.indexOf('Arch Linux') !== -1) {
                  cmd = 'sudo pacman install xclip';
                }
                if (cmd) {
                  message += ' ' + gettextCatalog.getString('Please run: {{cmd}}', {
                    cmd: '<br><b><code>' + cmd + '</code></b>'
                  });
                }
              }
              alertify.warning(message, 30);
            });
          }
        } else {
          // Parse the global clipboard
          var clipboard = JSON.parse(text);
          if (callback && clipboard && clipboard.icestudio) {
            callback(clipboard.icestudio);
          }
        }
      });
    };

    function selectionToCells(selection, graph) {
      var cells = [];
      var blocksMap = {};
      selection.each(function (block) {
        // Add block
        cells.push(block.attributes);
        // Map blocks
        blocksMap[block.id] = block;
        // Add connected wires
        var processedWires = {};
        var connectedWires = graph.getConnectedLinks(block);
        _.each(connectedWires, function (wire) {

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
      return cells;
    }

    this.cellsToProject = function (cells, opt) {
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
          cell.type === 'ice.Constant' ||
          cell.type === 'ice.Memory') {
          var block = {};
          block.id = cell.id;
          block.type = cell.blockType;
          block.data = cell.data;
          block.position = cell.position;
          if (cell.type === 'ice.Generic' ||
            cell.type === 'ice.Code' ||
            cell.type === 'ice.Info' ||
            cell.type === 'ice.Memory') {
            block.size = cell.size;
          }
          blocks.push(block);
        } else if (cell.type === 'ice.Wire') {
          var wire = {};
          wire.source = {
            block: cell.source.id,
            port: cell.source.port
          };
          wire.target = {
            block: cell.target.id,
            port: cell.target.port
          };
          wire.vertices = cell.vertices;
          wire.size = (cell.size > 1) ? cell.size : undefined;
          wires.push(wire);
        }
      }

      p.design.board = common.selectedBoard.name;
      p.design.graph = {
        blocks: blocks,
        wires: wires
      };

      // Update dependencies
      if (opt.deps !== false) {
        var types = this.findSubDependencies(p, common.allDependencies);
        for (var t in types) {
          p.dependencies[types[t]] = common.allDependencies[types[t]];
        }
      }

      return p;
    };

    this.findSubDependencies = function (dependency) {
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

    this.hasInputRule = function (port, apply) {
      apply = (apply === undefined) ? true : apply;
      var _default;
      var rules = common.selectedBoard.rules;
      if (rules) {
        var allInitPorts = rules.input;
        if (allInitPorts) {
          for (var i in allInitPorts) {
            if (port === allInitPorts[i].port) {
              _default = allInitPorts[i];
              _default.apply = apply;
              break;
            }
          }
        }
      }
      return _.clone(_default);
    };

    this.hasLeftButton = function (evt) {
      return evt.which === 1;
    };

    this.hasMiddleButton = function (evt) {
      return evt.which === 2;
    };

    this.hasRightButton = function (evt) {
      return evt.which === 3;
    };

    this.hasButtonPressed = function (evt) {
      return evt.which !== 0;
    };

    this.hasShift = function (evt) {
      return evt.shiftKey;
    };

    this.hasCtrl = function (evt) {
      return evt.ctrlKey;
    };

    //------------------------------------------------------
    //-- Load the profile file
    this.loadProfile = function (profile, callback) {
      profile.load(function () {
        if (callback) {
          callback();
        }
      });
    };

    this.loadLanguage = function (profile, callback) {
      var lang = profile.get('language');
      if (lang) {
        this.setLocale(lang, callback);
      } else {
        // If lang is empty, use the system language
        nodeLangInfo(function (err, sysLang) {
          if (!err) {
            profile.set('language', this.setLocale(sysLang, callback));
          }
        }.bind(this));
      }
    };

    this.digestId = function (id) {
      if (id.indexOf('-') !== -1) {
        id = nodeSha1(id).toString();
      }
      return 'v' + id.substring(0, 6);
    };

    this.beginBlockingTask = function () {
      angular.element('#menu').addClass('is-disabled');
      $('body').addClass('waiting');
    };

    this.endBlockingTask = function () {
      angular.element('#menu').removeClass('is-disabled');
      $('body').removeClass('waiting');
    };

    this.isFunction = function (functionToCheck) {
      return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    };

    this.openDevToolsUI = function () {
      gui.Window.get().showDevTools();
    };
    this.openUrlExternalBrowser = function (url) {

      gui.Shell.openExternal(url);
      //require('nw.gui').Shell.openExternal( url);
    };

  });