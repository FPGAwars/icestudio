'use strict';

angular.module('icestudio')
  .service('utils', function ($rootScope,
    gettextCatalog,
    common,
    forms,
    _package,
    window,
    nodeFs,
    nodeFse,
    nodePath,
    nodeChildProcess,
    nodeExtract,
    nodeSha1,
    nodeCP,
    nodeGetOS,
    nodeLangInfo,
    SVGO,
    fastCopy,
    sparkMD5) {

    let _pythonExecutableCached = null;
    let _pythonPipExecutableCached = null;

    // Get the system pip executable
    // It is available in the common.ENV_PIP object
    this.getPythonPipExecutable = function () {

      if (!_pythonExecutableCached) {
        this.getPythonExecutable();
      }
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
          possibleExecutables.push('py.exe -3');
          possibleExecutables.push('python.exe');

          possibleExecutables.push('C:\\Python315\\python.exe');
          possibleExecutables.push('C:\\Python314\\python.exe');
          possibleExecutables.push('C:\\Python313\\python.exe');
          possibleExecutables.push('C:\\Python312\\python.exe');
          possibleExecutables.push('C:\\Python311\\python.exe');
          possibleExecutables.push('C:\\Python39\\python.exe');
          possibleExecutables.push('C:\\Python38\\python.exe');
          possibleExecutables.push('C:\\Python37\\python.exe');
        } //-- Python executables in Linux/Mac
        else {
          let paths = ['/usr/bin/', '/usr/local/bin/', '/opt/homebrew/bin/', ''];
          paths.forEach((base) => {
            possibleExecutables.push(`${base}python3`);
            possibleExecutables.push(`${base}python`);

            for (let i = 7; i < 16; i++) {
              possibleExecutables.push(`${base}python3.${i}`);
            }
          });
          possibleExecutables.push('/usr/local/Cellar/python/3.8.2/bin/python3');
          possibleExecutables.push('/usr/local/Cellar/python/3.7.7/bin/python3');


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
        if (result !== false && result !== null) {

          const pythonVersion = /Python 3\.(\d+)\.(\d+)/g.exec(result.toString());
          return (pythonVersion !== null && pythonVersion.length === 3 &&
            parseInt(pythonVersion[1]) >= 7);
        }

      } catch (e) {
        console.error(e);
      }
      return false;
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
    //-- INPUTS:
    //--   -command: array of string containing the commands to
    //--    execute along with the arguments
    //--   -callback: Function called when the command executed is done
    //--   -notifyerror: Show a GUI notification if there is an error
    //-------------------------------------------------------------------
    this.executeCommand = function (command,
      callback,
      notifyerror = true) {

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

      //-- String with the latest output to pass to the callback function
      let output = "";

      //-- When there are outputs available from the command...
      proccess.stdout.on('data', function (data) {

        //-- Show the output in the log
        iceConsole.log(`>>(OUTPUT): ${data}\n`);

        common.commandOutput = command.join(' ') + '\n\n' + data;
        $(document).trigger('commandOutputChanged', [common.commandOutput]);

        //-- Store the output string in the output variable
        //-- to pass to the callback function
        output = data;
      });

      //-- If there are errors ...
      proccess.stderr.on('data', function (data) {

        //-- Show them in the log file
        iceConsole.log(`>>(ERROR): ${data}\n`);

        common.commandOutput = command.join(' ') + '\n\n' + data;
        $(document).trigger('commandOutputChanged', [common.commandOutput]);
      });

      proccess.on('exit', function (code) {

        if (code !== 0) {
          _this.enableKeyEvents();
          _this.enableClickEvents();

          iceConsole.log("----!!!! ERROR !!!! -----");
          iceConsole.log("CMD: " + command);

          //-- Error executing the command
          //-- Show the error notification
          if (notifyerror) {
            alertify.error('Error executting command ' + command, 30);
          }

          //-- Comand finished with errors. Call the callback function
          callback(true, output);

        } else {
          //-- Command finished with NO errors. Cal lthe callback function
          callback(false, output);
        }
      });

    };

    //------------------------------------------
    //-- Return a String with the Apio version
    //
    this.printApioVersion = function (version) {
      let msg = "";

      switch (version) {
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

      if (navigator.onLine) {

        callback();
      } else {
        error();
        callback(true);
      }

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

      //-- Get the pip executable
      let pipExec = this.getPythonPipExecutable();
      //-- Place the executable between quotes ("") just in case there
      //-- is a path with spaces in their names
      const executable = coverPath(pipExec);

      //-- Get the pip parameters needed for installing apio
      //-- The needed apio vesion is also added
      const params = this.getApioParameters();
      console.log(pipExec, executable, params);
      //-- Run the pip command!
      this.executeCommand([executable, params], callback);
    };


    //------------------------------------------------------------------------
    //-- Return the parameters needed for pip for installing  
    //-- the apio toolchains. The version to install is read  
    //-- from the common.APIO_VERSION global object
    //--
    this.getApioParameters = function () {

      //-- Get the extra python packages to install
      let extraPackages = _package.apio.extras || [];
      let extraPackagesString = "";

      //-- Get the pip string with the version
      //-- Stable: "==0.6.0"
      //-- Latest stable and dev: ""
      let versionString = "";

      if (common.APIO_VERSION === common.APIO_VERSION_STABLE) {

        //-- The stable version to installed is read from the 
        //  icestudio app/package.json:
        //-- apio.min object!
        versionString = "==" + _package.apio.min;

        //-- Get the extraPackages. Only used when installing the stable 
        //-- version
        //-- Bug in Windows: If the extra packages are used during the apio
        //-- upgrading (installing the latest stable), apio is not upgraded
        extraPackagesString = "[" + extraPackages.toString() + "]";
      }

      //-- Get the apio package name:
      //-- Stable and latest stable: "apio"
      //-- dev: "git+https://github.com/FPGAwars/apio.git@develop#egg=apio"
      let apio = (common.APIO_VERSION === common.APIO_VERSION_DEV) ?
        common.APIO_PIP_VCS :
        "apio";

      //-- Get the pip params for installing apio
      const params = "install -U " + apio + extraPackagesString +
        versionString;

      console.log("--> DEBUG: Params paased to pip: " + params);

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

    //------------------------------------------------------------------------
    //-- Get the command that should be used for executing the apio toolchain
    //-- This command includes the full path to apio executable, as well as  
    //-- the setting of the APIO_HOME_DIR environment variable
    this.getApioExecutable = function () {

      //-- Check if the ICESTUDIO_APIO env variable is set with the apio 
      //-- toolchain to use  or if it has been set on the package.json file
      let candidateApio = process.env.ICESTUDIO_APIO ?
        process.env.ICESTUDIO_APIO :
        _package.apio.external;

      //-- The is an alternative apio toolchain ready
      if (nodeFs.existsSync(candidateApio)) {

        if (!this.toolchainDisabled) {
          // Show message only on start
          alertify.message('Using external apio: ' + candidateApio, 5);
        }
        this.toolchainDisabled = true;
        return coverPath(candidateApio);
      }

      //-- There are no external apio toolchain. Use the one installed 
      //-- by icestudio
      this.toolchainDisabled = false;

      //-- The apio command to execute is located in the 
      //-- common.APIO_CMD global object
      return common.APIO_CMD;
    };


    //-----------------------------------------------------------------------
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
      // If we want to remove spaces 
      // return nodePath.join(path,dirname).replace(/ /g, '_');
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
                data = isJSON(content);

                if (data) {
                  resolve(data);
                } else {
                  reject();
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
      if (image) {
        let embeded = '<div id="preview-svg-wrapper">';
        /*  if (image.startsWith('%3Csvg')) {
            embeded += decodeURI(image);
          }
          else if (image.startsWith('<svg')) {
            embeded+= image;
          }*/
        let virtualBlock = new IceBlock({ cacheDirImg: common.IMAGE_CACHE_DIR });

        let tmpImage = '';
        let tmpImageSrc = '';
        let hash = '';
        if (image.startsWith('%3Csvg')) {
          tmpImage = decodeURI(image);
        }
        else if (image.startsWith('<svg')) {
          tmpImage = image;
        }
        if (tmpImage.length > 0) {
          hash = sparkMD5.hash(tmpImage);
          tmpImageSrc = virtualBlock.svgFile(hash, tmpImage);
          embeded = `${embeded}<img src="file://${tmpImageSrc}"/>`;
        }


        embeded += '</div">';


        content.push(embeded);

      } else {

        content.push('  <div id="preview-svg-wrapper"><img id="preview-svg" class="ajs-input" src="' + blankImage + '" height="68" style="pointer-events:none"></div>');
      }
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

              $('#preview-svg-wrapper').html(result.data);
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
          $('#preview-svg-wrapper').empty();
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

      //-- Create the form
      let form = new forms.FormSelectBoard();

      //-- Display the form
      form.display((evt) => {

        //-- Process the information in the form
        form.process(evt);

        //-- Read the selected board
        let selectedBoard = form.values[0];

        if (selectedBoard) {

          evt.cancel = false;

          //-- Execute the callback
          if (callback) {
            callback(selectedBoard);
          }

          // Enable user events
          this.enableKeyEvents();
        }
      });

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

    //-----------------------------------------------------------------------
    //-- Return a text in bold HTML
    //-- Input:
    //--    * text: String to converto to Bold
    //-- Returns:
    //--    * The HTML text in bold
    //-----------------------------------------------------------------------
    this.bold = function (text) {
      return `<b>${text}</b>`;
    };

    //-----------------------------------------------------------------------
    //-- Open the Dialog for choosing a file
    //--
    //-- INPUTS:
    //--   * inputID (String): Html selector of the file chooser input
    //--  
    //--   * callback(filepath): It is called when the user has pressed the 
    //--        ok button. The chosen file is passed as a parameter
    //-----------------------------------------------------------------------
    this.openDialog = function (inputID, callback) {

      //-- Get the filechooser element (from the DOM)
      let chooser = $(inputID);

      //-- Reove any previously event attached
      chooser.unbind('change');

      //-- Atach a new callback function
      chooser.change(function () {

        //-- It is executed when the user has selected the file
        //-- Read the filepath entered by the user
        let filepath = $(this).val();

        //-- Execute the callback (if it was given)
        if (callback) {
          callback(filepath);
        }

        //-- Remove the current select filename from the chooser
        $(this).val('');
      });

      //-- Activate the File chooser! (The element is shown, it waits for
      //-- the user to enter the file and the calblack is executed
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

    //-----------------------------------------------------------------------
    //-- clone. Return a deep copy of the given input object data
    //--  * data: Input object to copy
    //--  * Returns: A copy of the input object
    //-----------------------------------------------------------------------
    this.clone = function (data) {

      //-- Implementation using the fast-copy npm package:
      //-- More info: https://www.npmjs.com/package/fast-copy
      return fastCopy(data);

      //-- Alternative implementation:
      // Very slow in comparison but more stable for all types
      // of objects, if fails, rollback to JSON method or try strict
      // on fast-copy module
      //return  JSON.parse(JSON.stringify(data));
    };

    this.dependencyID = function (dependency) {
      if (dependency.package && dependency.design) {
        return nodeSha1(JSON.stringify(dependency.package) +
          JSON.stringify(dependency.design));
      }
    };

    //-----------------------------------------------------------------------
    //-- Create a new ICESTUDIO window
    //--
    //--  INPUTS:
    //--    * filepath: (optional) Icestudio file to open in the new window
    //-----------------------------------------------------------------------
    this.newWindow = function (filepath) {

      //-- If there are parameters to pass or not
      //-- No parameters by default
      let hasParams = false;

      //-- URL with no parameters
      let url = 'index.html';

      //-- Create the arguments
      //-- The filepath was given: pass it as an argument
      if (filepath) {

        //-- There are params in the URL
        hasParams = true;

        //-- Create the object params
        //-- Currently it only contains one element, but in the future
        //-- it can be increased
        let params = {
          'filepath': filepath
        };

        //-- Convert the params to json
        let jsonParams = JSON.stringify(params);

        //-- Encode the params into Base64 format
        let paramsBase64 = Buffer.from(jsonParams).toString('base64');

        //-- Create the URL query with the icestudio_argv param
        let icestudioArgv = '?icestudio_argv=' + paramsBase64;

        //-- Create the final URL, with parameters
        url += icestudioArgv;
      }

      //-- Get the Window configuration from the package.json
      let window = this.clone(_package.window);

      //-- Set some needed properties:
      window['new_instance'] = true;
      window['show'] = true;

      //-- The URL has this syntax:
      //
      //-- index.html?icestudio_argv=encoded_value
      //--
      //-- Where encoded value is something like: 
      //--     eyJmaWxlcGF0aCI6Ii9ob21lL29iaWp1YW4vRGV2ZW...

      //-----------------------------------------------------------
      //-- Open the new window
      //-- More information:
      //-- https://nwjs.readthedocs.io/en/latest/References/Window/
      //--   #windowopenurl-options-callback
      //-----------------------------------------------------------
      nw.Window.open(url, window);

    };


    //-- Place the path inside quotes. It is important for managing filepaths
    //-- that contains spaces in their names
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

      $('body').trigger('Graph::updateWires');
      angular.element('#menu').removeClass('is-disabled');
      $('body').removeClass('waiting');
    };

    this.isFunction = function (functionToCheck) {
      return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    };

    this.openDevToolsUI = function () {
      nw.Window.get().showDevTools();
    };

    //-----------------------------------------------------------
    //-- Open a given url in an external browser
    //--
    //--  INPUTS:
    //--   * url (String): The URL to show
    //-----------------------------------------------------------
    this.openUrlExternalBrowser = function (url) {

      nw.Shell.openExternal(url);

    };

    // RENDERFORM "color-dropdown" functions
    // show/hide dropdown list
    $(document).on("mousedown", ".lb-dropdown-title", function () {
      if ($('.lb-dropdown-menu').hasClass('show')) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });
    $(document).on("mouseleave", ".lb-dropdown-menu", function () {
      closeDropdown();
    });
    $(document).on("mouseenter", ".ajs-button", function () {
      closeDropdown();
    });
    // get selected option
    $(document).on("mousedown", ".lb-dropdown-option", function () {
      let selected = this;
      $('.lb-dropdown-title').html("<span class=\"lb-selected-color color-" + selected.dataset.color + "\" data-color=\"" + selected.dataset.color + "\"></span>" + selected.dataset.name + "<span class=\"lb-dropdown-icon\"></span>");
      closeDropdown();
    });

    function openDropdown() {
      $('.lb-dropdown-menu').addClass('show');
    }
    function closeDropdown() {
      $('.lb-dropdown-menu').removeClass('show');
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
              <input class="ajs-input" type="text" id="form' + i + '" autocomplete="off"/>\
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
          case 'color-dropdown':
            content.push('\
              <div class="form-group">\
                <label style ="font-weight:normal">' + spec.label + '</label>\
                <div class="lb-color--dropdown">\
                  <div class="lb-dropdown-title"><span class="lb-selected-color color-fuchsia" data-color="fuchsia" data-name="Fuchsia"></span>Fuchsia<span class="lb-dropdown-icon"></span></div>\
                  <div class="lb-dropdown-menu">\
                    <div class="lb-dropdown-option" data-color="indianred" data-name="IndianRed"><span class="lb-option-color color-indianred"></span>IndianRed</div>\
                    <div class="lb-dropdown-option" data-color="red" data-name="Red"><span class="lb-option-color color-red"></span>Red</div>\
                    <div class="lb-dropdown-option" data-color="deeppink" data-name="DeepPink"><span class="lb-option-color color-deeppink"></span>DeepPink</div>\
                    <div class="lb-dropdown-option" data-color="mediumvioletred"data-name="MediumVioletRed"><span class="lb-option-color color-mediumvioletred"></span>MediumVioletRed</div>\
                    <div class="lb-dropdown-option" data-color="coral"data-name="Coral"><span class="lb-option-color color-coral"></span>Coral</div>\
                    <div class="lb-dropdown-option" data-color="orangered"data-name="OrangeRed"><span class="lb-option-color color-orangered"></span>OrangeRed</div>\
                    <div class="lb-dropdown-option" data-color="darkorange"data-name="DarkOrange"><span class="lb-option-color color-darkorange"></span>DarkOrange</div>\
                    <div class="lb-dropdown-option" data-color="gold"data-name="Gold"><span class="lb-option-color color-gold"></span>Gold</div>\
                    <div class="lb-dropdown-option" data-color="yellow"data-name="Yellow"><span class="lb-option-color color-yellow"></span>Yellow</div>\
                    <div class="lb-dropdown-option" data-color="fuchsia"data-name="Fuchsia"><span class="lb-option-color color-fuchsia"></span>Fuchsia</div>\
                    <div class="lb-dropdown-option" data-color="slateblue"data-name="SlateBlue"><span class="lb-option-color color-slateblue"></span>SlateBlue</div>\
                    <div class="lb-dropdown-option" data-color="greenyellow"data-name="GreenYellow"><span class="lb-option-color color-greenyellow"></span>GreenYellow</div>\
                    <div class="lb-dropdown-option" data-color="springgreen"data-name="SpringGreen"><span class="lb-option-color color-springgreen"></span>SpringGreen</div>\
                    <div class="lb-dropdown-option" data-color="darkgreen"data-name="DarkGreen"><span class="lb-option-color color-darkgreen"></span>DarkGreen</div>\
                    <div class="lb-dropdown-option" data-color="olivedrab"data-name="OliveDrab"><span class="lb-option-color color-olivedrab"></span>OliveDrab</div>\
                    <div class="lb-dropdown-option" data-color="lightseagreen"data-name="LightSeaGreen"><span class="lb-option-color color-lightseagreen"></span>LightSeaGreen</div>\
                    <div class="lb-dropdown-option" data-color="turquoise"data-name="Turquoise"><span class="lb-option-color color-turquoise"></span>Turquoise</div>\
                    <div class="lb-dropdown-option" data-color="steelblue"data-name="SteelBlue"><span class="lb-option-color color-steelblue"></span>SteelBlue</div>\
                    <div class="lb-dropdown-option" data-color="deepskyblue"data-name="DeepSkyBlue"><span class="lb-option-color color-deepskyblue"></span>DeepSkyBlue</div>\
                    <div class="lb-dropdown-option" data-color="royalblue"data-name="RoyalBlue"><span class="lb-option-color color-royalblue"></span>RoyalBlue</div>\
                    <div class="lb-dropdown-option" data-color="navy"data-name="Navy"><span class="lb-option-color color-navy"></span>Navy</div>\
                    <div class="lb-dropdown-option" data-color="lightgray"data-name="LightGray"><span class="lb-option-color color-lightgray"></span>LightGray</div>\
                  </div>\
                </div>\
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
                case 'color-dropdown':
                  values.push($('.lb-selected-color').data('color'));
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
            case 'color-dropdown':
              $('.lb-dropdown-title').html("<span class=\"lb-selected-color color-fuchsia\" data-color=\"fuchsia\"></span>Fuchsia<span class=\"lb-dropdown-icon\"></span>");
              break;
          }
        }
      }, 50);
    };

  });