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
                             nodeExtract,
                             nodeZlib,
                             nodeOnline,
                             nodeGlob,
                             nodeSha1,
                             nodeCP,
                             nodeGetOS,
                             nodeLangInfo,
                             SVGO) {

    var _pythonExecutableCached = null;
    // Get the system executable
    this.getPythonExecutable = function() {
      if (!_pythonExecutableCached) {
        const possibleExecutables = [];

        if (common.WIN32) {
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

    this.extractZip = function(source, destination, callback) {
      nodeExtract(source, {dir: destination}, function(error) {
        if (error) {
          callback(true);
        }
        else {
          callback();
        }
      });
    };

    this.extractVirtualenv = function(callback) {
      this.extractZip(common.VENV_ZIP, common.CACHE_DIR, callback);
    };

    function disableEvent(event) {
      event.stopPropagation();
      event.preventDefault();
    }

    this.enableClickEvents = function() {
      document.removeEventListener('click', disableEvent, true);
    };

    this.disableClickEvents = function() {
      document.addEventListener('click', disableEvent, true);
    };

    this.enableKeyEvents = function() {
      document.removeEventListener('keyup', disableEvent, true);
      document.removeEventListener('keydown', disableEvent, true);
      document.removeEventListener('keypress', disableEvent, true);
    };

    this.disableKeyEvents = function() {
      document.addEventListener('keyup', disableEvent, true);
      document.addEventListener('keydown', disableEvent, true);
      document.addEventListener('keypress', disableEvent, true);
    };

    this.executeCommand = function(command, callback) {
      nodeChildProcess.exec(command.join(' '),
        function (error, stdout, stderr) {
          common.commandOutput = command.join(' ') + '\n\n' + stdout + stderr;
          $(document).trigger('commandOutputChanged', [common.commandOutput]);
          if (error) {
            this.enableKeyEvents();
            this.enableClickEvents();
            callback(true);
            alertify.error(error.message, 30);
          }
          else {
            callback();
          }
        }.bind(this)
      );
    };

    this.createVirtualenv = function(callback) {
      if (!nodeFs.existsSync(common.ICESTUDIO_DIR)) {
        nodeFs.mkdirSync(common.ICESTUDIO_DIR);
      }
      if (!nodeFs.existsSync(common.ENV_DIR)) {
        nodeFs.mkdirSync(common.ENV_DIR);
        var command = [this.getPythonExecutable(),
         coverPath(nodePath.join(common.VENV_DIR, 'virtualenv.py')),
         coverPath(common.ENV_DIR)];
        if (common.WIN32) {
          command.push('--always-copy');
        }
        this.executeCommand(command, callback);
      }
      else {
        callback();
      }
    };

    this.checkDefaultToolchain = function() {
      try {
        // TODO: use zip with sha1
        return nodeFs.statSync(common.TOOLCHAIN_DIR).isDirectory();
      }
      catch (err) {
        return false;
      }
    };

    this.installDefaultPythonPackagesDir = function(defaultDir, callback) {
      var self = this;
      nodeGlob(nodePath.join(defaultDir, '*.*'), {}, function (error, files) {
        if (!error) {
          files = files.map(function(item) { return coverPath(item); });
          self.executeCommand([coverPath(common.ENV_PIP), 'install', '-U', '--no-deps'].concat(files), callback);
        }
      });
    };

    this.extractDefaultPythonPackages = function(callback) {
      this.extractZip(common.DEFAULT_PYTHON_PACKAGES_ZIP, common.DEFAULT_PYTHON_PACKAGES_DIR, callback);
    };

    this.installDefaultPythonPackages = function(callback) {
      this.installDefaultPythonPackagesDir(common.DEFAULT_PYTHON_PACKAGES_DIR, callback);
    };

    this.extractDefaultApio = function(callback) {
      this.extractZip(common.DEFAULT_APIO_ZIP, common.DEFAULT_APIO_DIR, callback);
    };

    this.installDefaultApio = function(callback) {
      this.installDefaultPythonPackagesDir(common.DEFAULT_APIO_DIR, callback);
    };

    this.extractDefaultApioPackages = function(callback) {
      this.extractZip(common.DEFAULT_APIO_PACKAGES_ZIP, common.APIO_HOME_DIR, callback);
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

    this.installOnlinePythonPackages = function(callback) {
      var pythonPackages = [];
      this.executeCommand([coverPath(common.ENV_PIP), 'install', '-U'] + pythonPackages, callback);
    };

    this.installOnlineApio = function(callback) {
      var versionRange = '">=' + _package.apio.min + ',<' + _package.apio.max + '"';
      var extraPackages = _package.apio.extras || [];
      var apio = this.getApioInstallable();
      this.executeCommand([coverPath(common.ENV_PIP), 'install', '-U', apio + '[' + extraPackages.toString() + ']' + versionRange], callback);
    };

    this.getApioInstallable = function() {
      return _package.apio.branch ?
        common.APIO_PIP_VCS.replace('%BRANCH%', _package.apio.branch) : 'apio';
    };

    this.apioInstall = function(pkg, callback) {
      this.executeCommand([common.APIO_CMD, 'install', pkg], callback);
    };

    this.toolchainDisabled = false;

    this.getApioExecutable = function() {
      var candidateApio = process.env.ICESTUDIO_APIO ? process.env.ICESTUDIO_APIO : _package.apio.external;
      if (nodeFs.existsSync(candidateApio)) {
        if (!this.toolchainDisabled) {
          // Show message only on start
          alertify.message('Using external apio: ' + candidateApio, 5);
        }
        this.toolchainDisabled = true;
        return coverPath(candidateApio);
      }
      this.toolchainDisabled = false;
      return common.APIO_CMD;
    };

    this.removeToolchain = function() {
      this.deleteFolderRecursive(common.ENV_DIR);
      this.deleteFolderRecursive(common.CACHE_DIR);
      this.deleteFolderRecursive(common.APIO_HOME_DIR);
    };

    this.removeCollections = function() {
      this.deleteFolderRecursive(common.INTERNAL_COLLECTIONS_DIR);
    };

    this.deleteFolderRecursive = function(path) {
      if (nodeFs.existsSync(path)) {
        nodeFs.readdirSync(path).forEach(function(file/*, index*/) {
          var curPath = nodePath.join(path, file);
          if (nodeFs.lstatSync(curPath).isDirectory()) { // recursive
            this.deleteFolderRecursive(curPath);
          }
          else { // delete file
            nodeFs.unlinkSync(curPath);
          }
        }.bind(this));
        nodeFs.rmdirSync(path);
      }
    };

    this.sep = nodePath.sep;

    this.basename = basename;
    function basename(filepath) {
      var b = nodePath.basename(filepath);
      return b.substr(0, b.lastIndexOf('.'));
    }

    this.dirname = function(filepath) {
      return nodePath.dirname(filepath);
    };

    this.readFile = function(filepath) {
      return new Promise(function(resolve, reject) {
        if (nodeFs.existsSync(common.PROFILE_PATH)) {
          nodeFs.readFile(filepath,
            function(err, content) {
              if (err) {
                reject(err.toString());
              }
              else {
                var data = isJSON(content);
                if (data) {
                  // JSON data
                  resolve(data);
                }
                else {
                  reject();
                }
              }
            });
        }
        else {
          resolve({});
        }
      });
    };

    this.saveFile = function(filepath, data) {
      return new Promise(function(resolve, reject) {
        var content = data;
        if (typeof data !== 'string') {
          content = JSON.stringify(data, null, 2);
        }
        nodeFs.writeFile(filepath, content,
          function(err) {
            if (err) {
              reject(err.toString());
            }
            else {
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
      }
      catch (e) {
        return false;
      }
    }

    this.findCollections = function(folder) {
      var collectionsPaths = [];
      try {
        if (folder) {
          collectionsPaths = nodeFs.readdirSync(folder).map(function(name) {
            return nodePath.join(folder, name);
          }).filter(function(path) {
            return (isDirectory(path) || isSymbolicLink(path)) && isCollectionPath(path);
          });
        }
      }
      catch (e) {
        console.warn(e);
      }
      return collectionsPaths;
    };

    function isCollectionPath(path) {
      var result = false;
      try {
        var content = nodeFs.readdirSync(path);
        result = content &&
          contains(content, 'package.json') && isFile(nodePath.join(path, 'package.json')) &&
          (
            (contains(content, 'blocks') && isDirectory(nodePath.join(path, 'blocks'))) ||
            (contains(content, 'examples') && isDirectory(nodePath.join(path, 'examples')))
          );
      }
      catch (e) {
        console.warn(e);
      }
      return result;
    }

    function isFile(path) {
      return nodeFs.lstatSync(path).isFile();
    }

    function isDirectory(path) {
      return nodeFs.lstatSync(path).isDirectory();
    }

    function isSymbolicLink(path) {
      return nodeFs.lstatSync(path).isSymbolicLink();
    }

    function contains(array, item) {
      return array.indexOf(item) !== -1;
    }

    function getFilesRecursive(folder, level) {
      var fileTree = [];
      var validator = /.*\.(ice|json|md)$/;

      try {
        var content = nodeFs.readdirSync(folder);

        level--;

        content.forEach(function(name) {
          var path = nodePath.join(folder, name);

          if (isDirectory(path)) {
            fileTree.push({
              name: name,
              path: path,
              children: (level >= 0) ? getFilesRecursive(path, level) : []
            });
          }
          else if (validator.test(name)) {
            fileTree.push({
              name: basename(name),
              path: path
            });
          }
        });
      }
      catch (e) {
        console.warn(e);
      }

      return fileTree;
    }

    this.getFilesRecursive = getFilesRecursive;

    this.setLocale = function(locale, callback) {
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
          gettextCatalog.loadRemote(filepath);
        }
      }
      if (callback) {
        setTimeout(function() {
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
      nodeFs.readdirSync(common.LOCALE_DIR).forEach(function(element/*, index*/) {
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

    this.renderForm = function(specs, callback) {
      var content = [];
      content.push('<div>');
      for (var i in specs) {
        var spec = specs[i];
        switch(spec.type) {
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
            var options = spec.options.map(function(option) {
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
      .set('onok', function(evt) {
        var values = [];
        if (callback) {
          for (var i in specs) {
            var spec = specs[i];
            switch(spec.type) {
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
      .set('oncancel', function(/*evt*/) {
      });
      // Restore input values
      setTimeout(function(){
        $('#form0').select();
        for (var i in specs) {
          var spec = specs[i];
          switch(spec.type) {
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
      }
      else {
        $('#preview-svg').attr('src', blankImage);
      }

      var prevOnshow = alertify.confirm().get('onshow') || function() {};

      alertify.confirm()
      .set('onshow', function() {
        prevOnshow();
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

          nodeFs.readFile(filepath, 'utf8', function(err, data) {
            if (err) {
              throw err;
            }
            optimizeSVG(data, function(result) {
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
          values.push($('#input' + i).val());
        }
        values.push(image);
        if (callback) {
          callback(evt, values);
        }
        // Restore onshow
        alertify.confirm().set('onshow', prevOnshow);
      })
      .set('oncancel', function(/*evt*/) {
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

      this.renderForm(formSpecs, function(evt, values) {
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
        }
        else {
          evt.cancel = true;
        }
      }.bind(this));
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

    this.parsePortLabel = function(data, pattern) {
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
          }
          else {
            if (match[3] > match[4]) {
              ret.range = _.range(match[3], parseInt(match[4])-1, -1);
            }
            else {
              ret.range = _.range(match[3], parseInt(match[4])+1, +1);
            }
          }
        }
        return ret;
      }
      return null;
    };

    this.parseParamLabel = function(data, pattern) {
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

    this.mergeDependencies = function(type, block) {
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

    this.copyToClipboard = function(selection, graph) {
      var cells = selectionToCells(selection, graph);
      var clipboard = {
        icestudio: this.cellsToProject(cells, graph)
      };
      // Send the clipboard object the global clipboard as a string
      nodeCP.copy(JSON.stringify(clipboard), function() {
        // Success
      });
    };

    this.pasteFromClipboard = function(callback) {
      nodeCP.paste(function(err, text) {
        if (err) {
          if (common.LINUX) {
            // xclip installation message
            var cmd = '';
            var message = gettextCatalog.getString('{{app}} is required.', { app: '<b>xclip</b>' });
            nodeGetOS(function(e, os) {
              if (!e) {
                if (os.dist.indexOf('Debian') !== -1 ||
                    os.dist.indexOf('Ubuntu Linux') !== -1 ||
                    os.dist.indexOf('Linux Mint') !== -1)
                {
                  cmd = 'sudo apt-get install xclip';
                }
                else if (os.dist.indexOf('Fedora'))
                {
                  cmd = 'sudo dnf install xclip';
                }
                else if (os.dist.indexOf('RHEL') !== -1 ||
                         os.dist.indexOf('RHAS') !== -1 ||
                         os.dist.indexOf('Centos') !== -1 ||
                         os.dist.indexOf('Red Hat Linux') !== -1)
                {
                  cmd = 'sudo yum install xclip';
                }
                else if (os.dist.indexOf('Arch Linux') !== -1)
                {
                  cmd = 'sudo pacman install xclip';
                }
                if (cmd) {
                  message += ' ' + gettextCatalog.getString('Please run: {{cmd}}', { cmd: '<br><b><code>' + cmd + '</code></b>' });
                }
              }
              alertify.warning(message, 30);
            });
          }
        }
        else {
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

      p.design.board = common.selectedBoard.name;
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

    this.hasInputRule = function(port, apply) {
      apply = (apply === undefined) ? true : apply;
      var _default;
      var rules = common.selectedBoard.rules;
      if (rules) {
        var allInitPorts = rules.input;
        if (allInitPorts) {
          for (var i in allInitPorts) {
            if (port === allInitPorts[i].port){
              _default = allInitPorts[i];
              _default.apply = apply;
              break;
            }
          }
        }
      }
      return _.clone(_default);
    };

    this.hasLeftButton = function(evt) {
      return evt.which === 1;
    };

    this.hasMiddleButton = function(evt) {
      return evt.which === 2;
    };

    this.hasRightButton = function(evt) {
      return evt.which === 3;
    };

    this.hasButtonPressed = function(evt) {
      return evt.which !== 0;
    };

    this.hasShift = function(evt) {
      return evt.shiftKey;
    };

    this.hasCtrl = function(evt) {
      return evt.ctrlKey;
    };

    this.loadProfile = function(profile, callback) {
      profile.load(function() {
        if (callback) {
          callback();
        }
      });
    };

    this.loadLanguage = function(profile, callback) {
      var lang = profile.get('language');
      if (lang) {
        this.setLocale(lang, callback);
      }
      else {
        // If lang is empty, use the system language
        nodeLangInfo(function(err, sysLang) {
          if (!err) {
            profile.set('language', this.setLocale(sysLang, callback));
          }
        }.bind(this));
      }
    };

    this.digestId = function(id) {
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

  });
