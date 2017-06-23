'use strict';

angular.module('icestudio')
  .service('tools', function(project,
                             compiler,
                             profile,
                             collections,
                             drivers,
                             utils,
                             common,
                             gettextCatalog,
                             gettext,
                             nodeGettext,
                             nodeFs,
                             nodeFse,
                             nodePath,
                             nodeChildProcess,
                             nodeSSHexec,
                             nodeRSync,
                             nodeAdmZip,
                             _package,
                             $rootScope) {

    var currentAlert = null;
    var taskRunning = false;
    var toolchain = { apio: '-', installed: false, disabled: false };

    this.toolchain = toolchain;

    // Check if the toolchain is installed
    checkToolchain();

    // Remove build directory on start
    nodeFse.removeSync(common.BUILD_DIR);

    this.verifyCode = function() {
      this.apio(['verify']);
    };

    this.buildCode = function() {
      this.apio(['build', '-b', common.selectedBoard.name]);
    };

    this.uploadCode = function() {
      this.apio(['upload', '-b', common.selectedBoard.name]);
    };

    this.apio = function(commands) {
      var check = true;
      if (taskRunning) {
        return;
      }
      taskRunning = true;
      var code = this.generateCode();
      if (code) {
        if (toolchain.installed || toolchain.disabled) {
          angular.element('#menu').addClass('disable-menu');
          // Annotate strings for translation
          /// Start verification ...
          gettext('start_verify');
          /// Start building ...
          gettext('start_build');
          /// Start uploading ...
          gettext('start_upload');
          var label = commands[0];
          var message = 'start_' + label;
          currentAlert = alertify.message(gettextCatalog.getString(message), 100000);
          $('body').addClass('waiting');
          check = this.syncResources(code);
          try {
            if (check) {
              execute(commands, label, code, currentAlert, function() {
                if (currentAlert) {
                  setTimeout(function() {
                    angular.element('#menu').removeClass('disable-menu');
                    currentAlert.dismiss(true);
                    taskRunning = false;
                  }, 1000);
                }
              });
            }
            else {
              setTimeout(function() {
                angular.element('#menu').removeClass('disable-menu');
                currentAlert.dismiss(true);
                taskRunning = false;
                $('body').removeClass('waiting');
              }, 2000);
            }
          }
          catch(e) {
          }
        }
        else {
          alertify.error(gettextCatalog.getString('Toolchain not installed') + '.<br>' + gettextCatalog.getString('Click here to install it'), 30)
          .callback = function(isClicked) {
            if (isClicked) {
              self.installToolchain();
            }
          };
          taskRunning = false;
        }
      }
      else {
        taskRunning = false;
      }
    };

    function checkToolchain(callback) {
      var apio = utils.getApioExecutable();
      toolchain.disabled = utils.toolchainDisabled;
      if (!toolchain.disabled) {
        nodeChildProcess.exec([apio, '--version'].join(' '), function(error, stdout/*, stderr*/) {
          if (error) {
            toolchain.apio = '';
            toolchain.installed = false;
            if (callback) {
              callback();
            }
          }
          else {
            toolchain.apio = stdout.match(/apio,\sversion\s(.+)/i)[1];
            toolchain.installed = toolchain.apio >= _package.apio.min &&
                                  toolchain.apio < _package.apio.max;
            if (toolchain.installed) {
              nodeChildProcess.exec([apio, 'clean', '-p', common.SAMPLE_DIR].join(' '), function(error/*, stdout, stderr*/) {
                toolchain.installed = !error;
                if (callback) {
                  callback();
                }
              });
            }
            else {
              // An old version is installed
              alertify.warning(gettextCatalog.getString('Toolchain version does not match') + '.<br>' + gettextCatalog.getString('Click here to install it'), 30)
              .callback = function(isClicked) {
                if (isClicked) {
                  // Install the new toolchain
                  self.installToolchain();
                }
              };
              if (callback) {
                callback();
              }
            }
          }
        });
      }
    }

    this.generateCode = function() {
      if (!nodeFs.existsSync(common.BUILD_DIR)) {
        nodeFs.mkdirSync(common.BUILD_DIR);
      }
      project.update();
      var opt = {
        datetime: false,
        boardRules: profile.get('boardRules')
      };
      if (opt.boardRules) {
        opt.initPorts = compiler.getInitPorts(project.get());
        opt.initPins = compiler.getInitPins(project.get());
      }
      var verilog = compiler.generate('verilog', project.get(), opt);
      var pcf = compiler.generate('pcf', project.get(), opt);
      nodeFs.writeFileSync(nodePath.join(common.BUILD_DIR, 'main.v'), verilog, 'utf8');
      nodeFs.writeFileSync(nodePath.join(common.BUILD_DIR, 'main.pcf'), pcf, 'utf8');
      return verilog;
    };

    this.syncResources = function(code) {
      var ret;

      // Remove resources
      nodeFse.removeSync('!(main.*)');

      // Sync included files
      ret = this.syncFiles(/[\n|\s]\/\/\s*@include\s+([^\s]*\.(v|vh))(\n|\s)/g, code);

      // Sync list files
      if (ret) {
        ret = this.syncFiles(/[\n|\s][^\/]?\"(.*\.list?)\"/g, code);
      }

      return ret;
    };

    this.syncFiles = function(pattern, code) {
      var ret = true;
      var match;
      while (match = pattern.exec(code)) {
        var file = match[1];
        var destPath = nodePath.join(common.BUILD_DIR, file);
        var origPath = nodePath.join(utils.dirname(project.filepath), file);

        // Copy included file
        var copySuccess = utils.copySync(origPath, destPath);
        if (!copySuccess) {
          alertify.error(gettextCatalog.getString('File {{file}} does not exist', { file: file }), 30);
          ret = false;
          break;
        }
      }

      return ret;
    };

    function execute(commands, label, code, currentAlert, callback) {
      var remoteHostname = profile.get('remoteHostname');

      if (remoteHostname) {
        currentAlert.setContent(gettextCatalog.getString('Synchronize remote files ...'));
        nodeRSync({
          src: common.BUILD_DIR + '/',
          dest: remoteHostname + ':.build/',
          ssh: true,
          recursive: true,
          delete: true,
          include: ['*.v', '*.pcf', '*.list'],
          exclude: ['.sconsign.dblite', '*.out', '*.blif', '*.asc', '*.bin']
        }, function (error, stdout, stderr/*, cmd*/) {
          if (!error) {
            currentAlert.setContent(gettextCatalog.getString('Execute remote {{label}} ...', { label: label }));
            nodeSSHexec((['apio'].concat(commands).concat(['-p', '.build'])).join(' '), remoteHostname,
              function (error, stdout, stderr) {
                processExecute(label, code, callback, error, stdout, stderr);
              });
          }
          else {
            processExecute(label, code, callback, error, stdout, stderr);
          }
        });
      }
      else {
        if (commands[0] === 'upload') {
          drivers.preUpload(function() {
            _execute();
          });
        }
        else {
          _execute();
        }
      }

      function _execute() {
        var apio = utils.getApioExecutable();
        toolchain.disabled = utils.toolchainDisabled;
        nodeChildProcess.exec(([apio].concat(commands).concat(['-p', utils.coverPath(common.BUILD_DIR)])).join(' '), { maxBuffer: 5000 * 1024 },
          function(error, stdout, stderr) {
            if (!error && !stderr) {
              if (commands[0] === 'upload') {
                drivers.postUpload();
              }
            }
            processExecute(label, code, callback, error, stdout, stderr);
          });
      }
    }

    function processExecute(label, code, callback, error, stdout, stderr) {
      if (callback) {
        callback();
      }
      //console.log(label, error, stdout, stderr)
      if (label) {
        if (error || stderr) {
          if (stdout) {
            // - Apio errors
            if (stdout.indexOf('[upload] Error') !== -1 ||
                stdout.indexOf('Error: board not detected') !== -1) {
              alertify.error(gettextCatalog.getString('Board {{name}} not detected', { name: utils.bold(common.selectedBoard.info.label) }), 30);
            }
            else if (stdout.indexOf('Error: unkown board') !== -1) {
              alertify.error(gettextCatalog.getString('Unknown board'), 30);
            }
            // - Arachne-pnr errors
            else if (stdout.indexOf('set_io: too few arguments') !== -1 ||
                     stdout.indexOf('fatal error: unknown pin') !== -1) {
              alertify.error(gettextCatalog.getString('FPGA I/O ports not defined'), 30);
            }
            else if (stdout.indexOf('fatal error: duplicate pin constraints') !== -1) {
              alertify.error(gettextCatalog.getString('Duplicated FPGA I/O ports'), 30);
            }
            else {
              var re, matchError, codeErrors = [];

              // - Iverilog errors & warnings
              // main.v:#: error: ...
              // main.v:#: warning: ...
              // main.v:#: syntax error
              re = /main.v:([0-9]+):\s(error|warning):\s(.*?)[\r|\n]/g;
              while (matchError = re.exec(stdout)) {
                codeErrors.push({
                  line: parseInt(matchError[1]),
                  msg: matchError[3].replace(/\sin\smain\..*$/, ''),
                  type: matchError[2]
                });
              }
              re = /main.v:([0-9]+):\ssyntax\serror[\r|\n]/g;
              while (matchError = re.exec(stdout)) {
                codeErrors.push({
                  line: parseInt(matchError[1]),
                  msg: 'Syntax error',
                  type: 'error'
                });
              }

              // - Yosys errors
              // ERROR: ... main.v:#...
              // Warning: ... main.v:#...
              re = /(ERROR|Warning):\s(.*?)\smain\.v:([0-9]+)(.*?)[\r|\n]/g;
              while (matchError = re.exec(stdout)) {
                var msg = '';
                var line = parseInt(matchError[3]);
                var type = matchError[1].toLowerCase();
                var preContent = matchError[2];
                var postContent = matchError[4];
                // Process error
                if (preContent === 'Parser error in line') {
                  postContent = postContent.substring(2); // remove :\s
                  if (postContent.startsWith('syntax error')) {
                    postContent = 'Syntax error';
                  }
                  msg = postContent;
                }
                else if (preContent.endsWith(' in line ')) {
                  msg = preContent.replace(/\sin\sline\s$/, ' ') + postContent;
                }
                else {
                  preContent = preContent.replace(/\sat\s$/, '');
                  preContent = preContent.replace(/\sin\s$/, '');
                  msg = preContent;
                }
                codeErrors.push({
                  line: line,
                  msg: msg,
                  type: type
                });
              }

              // Extract modules map from code
              var modules = mapCodeModules(code);

              for (var i in codeErrors) {
                var codeError = normalizeCodeError(codeErrors[i], modules);
                if (codeError) {
                  // Launch codeError event
                  $(document).trigger('codeError', [codeError]);
                }
              }

              if (codeErrors.length !== 0) {
                alertify.error(gettextCatalog.getString('Errors detected in the code'), 5);
              }
              else {
                var stdoutWarning = stdout.split('\n').filter(function (line) {
                  line = line.toLowerCase();
                  return (line.indexOf('warning: ') !== -1);
                });
                var stdoutError = stdout.split('\n').filter(function (line) {
                  line = line.toLowerCase();
                  return (line.indexOf('error: ') !== -1 ||
                          line.indexOf('not installed') !== -1 ||
                          line.indexOf('already declared') !== -1);
                });
                if (stdoutWarning.length > 0) {
                  alertify.warning(stdoutWarning[0]);
                }
                if (stdoutError.length > 0) {
                  alertify.error(stdoutError[0], 30);
                }
                else {
                  alertify.error(stdout, 30);
                }
              }
            }
          }
          else if (stderr) {
            // Remote hostname errors
            if (stderr.indexOf('Could not resolve hostname') !== -1 ||
                stderr.indexOf('Connection refused') !== -1) {
              alertify.error(gettextCatalog.getString('Wrong remote hostname {{name}}', { name: profile.get('remoteHostname') }), 30);
            }
            else if (stderr.indexOf('No route to host') !== -1) {
              alertify.error(gettextCatalog.getString('Remote host {{name}} not connected', { name: profile.get('remoteHostname') }), 30);
            }
            else {
              alertify.error(stderr, 30);
            }
          }
        }
        else {
          // Annotate strings for translation
          /// Verification done
          gettext('done_verify');
          /// Build done
          gettext('done_build');
          /// Upload done
          gettext('done_upload');
          var message = 'done_' + label;
          alertify.success(gettextCatalog.getString(message));
          if ((label === 'build' || label === 'upload') && stdout) {
            // Show used resources in the FPGA
            /*
            PIOs       0 / 96
            PLBs       0 / 160
            BRAMs      0 / 16
            */
            var match,
                fpgaResources = '',
                patterns = [
                  /PIOs.+/g,
                  /PLBs.+/g,
                  /BRAMs.+/g
                ];

            for (var p in patterns) {
              match = patterns[p].exec(stdout);
              fpgaResources += (match && match.length > 0) ? match[0] + '\n' : '';
            }
            if (fpgaResources) {
              alertify.message('<pre>' + fpgaResources + '</pre>', 5);
            }
          }
        }
        $('body').removeClass('waiting');
      }
    }

    function mapCodeModules(code) {
      var codelines = code.split('\n');
      var match, module = {}, modules = [];
      // Find begin/end lines of the modules
      for (var i in codelines) {
        var codeline = codelines[i];
        // Get the module name
        if (!module.name) {
          match = /module\s+(.*?)[\s|\(|$]/.exec(codeline);
          if (match) {
            module.name = match[1];
            continue;
          }
        }
        // Get the begin of the module code
        if (!module.begin) {
          match = /;/.exec(codeline);
          if (match) {
            module.begin = parseInt(i) + 1;
            continue;
          }
        }
        // Get the end of the module code
        if (!module.end) {
          match = /endmodule/.exec(codeline);
          if (match) {
            module.end = parseInt(i) + 1;
            modules.push(module);
            module = {};
          }
        }
      }
      return modules;
    }

    function normalizeCodeError(codeError, modules) {
      var newCodeError;
      // Find the module with the error
      for (var i in modules) {
        var module = modules[i];
        if ((codeError.line > module.begin) && (codeError.line <= module.end)) {
          newCodeError = {
           type: codeError.type,
           line: codeError.line - module.begin - ((codeError.line === module.end) ? 1 : 0),
           msg: codeError.msg
         };
          if (module.name.startsWith('main_')) {
            // Code block
            newCodeError.blockId = module.name.split('_')[1];
            newCodeError.blockType = 'code';
          }
          else {
            // Generic block
            newCodeError.blockId = module.name.split('_')[0];
            newCodeError.blockType = 'generic';
          }
          break;
        }
      }
      return newCodeError;
    }

    var self = this;

    $rootScope.$on('installToolchain', function(/*event*/) {
      self.installToolchain();
    });

    this.installToolchain = function() {
      utils.removeToolchain();
      if (utils.checkDefaultToolchain()) {
        installDefaultToolchain();
      }
      else {
        alertify.confirm(gettextCatalog.getString('Default toolchain not found. Toolchain will be downloaded. This operation requires Internet connection. Do you want to continue?'),
          function() {
            installOnlineToolchain();
        });
      }
    };

    this.updateToolchain = function() {
      alertify.confirm(gettextCatalog.getString('The toolchain will be updated. This operation requires Internet connection. Do you want to continue?'),
        function() {
          installOnlineToolchain();
      });
    };

    this.resetToolchain = function() {
      if (utils.checkDefaultToolchain()) {
        alertify.confirm(gettextCatalog.getString('The toolchain will be restored to default. Do you want to continue?'),
          function() {
            utils.removeToolchain();
            installDefaultToolchain();
        });
      }
      else {
        alertify.alert(gettextCatalog.getString('Error: default toolchain not found in \'{{dir}}\'', { dir: common.TOOLCHAIN_DIR}));
      }
    };

    this.removeToolchain = function() {
      alertify.confirm(gettextCatalog.getString('The toolchain will be removed. Do you want to continue?'),
        function() {
          utils.removeToolchain();
          toolchain.apio = '';
          toolchain.installed = false;
          alertify.success(gettextCatalog.getString('Toolchain removed'));
      });
    };

    this.enableDrivers = function() {
      drivers.enable();
    };

    this.disableDrivers = function() {
      drivers.disable();
    };

    function installDefaultToolchain() {
      // Configure alert
      alertify.defaults.closable = false;

      utils.disableClickEvent();

      var content = [
        '<div>',
        '  <p id="progress-message">' + gettextCatalog.getString('Installing toolchain') + '</p>',
        '  </br>',
        '  <div class="progress">',
        '    <div id="progress-bar" class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar"',
        '    aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%">',
        '    </div>',
        '  </div>',
        '</div>'].join('\n');
        alertify.alert(content, function() {
          setTimeout(function() {
            initProgress();
          }, 200);
        });

      // Reset toolchain
      async.series([
        ensurePythonIsAvailable,
        extractVirtualEnv,
        makeVenvDirectory,
        extractDefaultApio,
        installDefaultApio,
        extractDefaultApioPackages,
        installationCompleted
      ]);

      // Restore alert
      alertify.defaults.closable = true;
    }

    function installOnlineToolchain() {
      // Configure alert
      alertify.defaults.closable = false;

      utils.disableClickEvent();

      var content = [
        '<div>',
        '  <p id="progress-message">' + gettextCatalog.getString('Installing toolchain') + '</p>',
        '  </br>',
        '  <div class="progress">',
        '    <div id="progress-bar" class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar"',
        '    aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%">',
        '    </div>',
        '  </div>',
        '</div>'].join('\n');
        alertify.alert(content, function() {
          setTimeout(function() {
            initProgress();
          }, 200);
        });

      // Install toolchain
      async.series([
        checkInternetConnection,
        ensurePythonIsAvailable,
        extractVirtualEnv,
        makeVenvDirectory,
        installOnlineApio,
        apioInstallSystem,
        apioInstallIcestorm,
        apioInstallIverilog,
        apioInstallDrivers,
        apioInstallScons,
        installationCompleted
      ]);

      // Restore alert
      alertify.defaults.closable = true;
    }

    function checkInternetConnection(callback) {
      updateProgress(gettextCatalog.getString('Check Internet connection...'), 0);
      utils.isOnline(callback, function() {
        errorProgress(gettextCatalog.getString('Internet connection required'));
        utils.enableClickEvent();
      });
    }

    function ensurePythonIsAvailable(callback) {
      updateProgress(gettextCatalog.getString('Check Python...'), 0);
      if (utils.getPythonExecutable()) {
        callback();
      }
      else {
        errorProgress(gettextCatalog.getString('Python 2.7 is required'));
        utils.enableClickEvent();
        callback(true);
      }
    }

    function extractVirtualEnv(callback) {
      updateProgress(gettextCatalog.getString('Extract virtual env files...'), 5);
      utils.extractVirtualEnv(callback);
    }

    function makeVenvDirectory(callback) {
      updateProgress(gettextCatalog.getString('Make virtual env...'), 10);
      utils.makeVenvDirectory(callback);
    }

    // Local installation

    function extractDefaultApio(callback) {
      updateProgress(gettextCatalog.getString('Extract default apio files...'), 20);
      utils.extractDefaultApio(callback);
    }

    function installDefaultApio(callback) {
      updateProgress(gettextCatalog.getString('Install default apio...'), 40);
      utils.installDefaultApio(callback);
    }

    function extractDefaultApioPackages(callback) {
      updateProgress(gettextCatalog.getString('Extract default apio packages...'), 70);
      utils.extractDefaultApioPackages(callback);
    }

    // Remote installation

    function installOnlineApio(callback) {
      updateProgress('pip install -U apio', 30);
      utils.installOnlineApio(callback);
    }

    function apioInstallSystem(callback) {
      updateProgress('apio install system', 40);
      utils.apioInstall('system', callback);
    }

    function apioInstallIcestorm(callback) {
      updateProgress('apio install icestorm', 50);
      utils.apioInstall('icestorm', callback);
    }

    function apioInstallIverilog(callback) {
      updateProgress('apio install iverilog', 70);
      utils.apioInstall('iverilog', callback);
    }

    function apioInstallDrivers(callback) {
      if (common.WIN32) {
        updateProgress('apio install drivers', 80);
        utils.apioInstall('drivers', callback);
      }
      else {
        callback();
      }
    }

    function apioInstallScons(callback) {
      updateProgress('apio install scons', 90);
      utils.apioInstall('scons', callback);
    }

    function installationCompleted(callback) {
      checkToolchain(function() {
        if (toolchain.installed) {
          updateProgress(gettextCatalog.getString('Installation completed'), 100);
          alertify.success(gettextCatalog.getString('Toolchain installed'));
        }
        else {
          errorProgress(gettextCatalog.getString('Toolchain not installed'));
        }
        utils.enableClickEvent();
        callback();
      });
    }

    function updateProgress(message, value) {
      angular.element('#progress-message')
        .text(message);
      var bar = angular.element('#progress-bar');
      if (value === 100) {
        bar.removeClass('progress-bar-striped active');
      }
      bar.text(value + '%');
      bar.attr('aria-valuenow', value);
      bar.css('width', value + '%');
    }

    function initProgress() {
      angular.element('#progress-bar')
        .addClass('notransition progress-bar-info progress-bar-striped active')
        .removeClass('progress-bar-danger')
        .text('0%')
        .attr('aria-valuenow', 0)
        .css('width', '0%')
        .removeClass('notransition');
    }

    function errorProgress(message) {
      angular.element('#progress-message')
        .text(message);
      angular.element('#progress-bar')
        .addClass('notransition progress-bar-danger')
        .removeClass('progress-bar-info progress-bar-striped active')
        .text('Error')
        .attr('aria-valuenow', 100)
        .css('width', '100%');
    }

    // Collections management

    this.addCollections = function(filepaths) {
      // Load zip file
      async.eachSeries(filepaths, function(filepath, nextzip) {
        //alertify.message(gettextCatalog.getString('Load {{name}} ...', { name: utils.bold(utils.basename(filepath)) }));
        var zipData = nodeAdmZip(filepath);
        var _collections = getCollections(zipData);

        async.eachSeries(_collections, function(collection, next) {
          setTimeout(function() {
            if (collection.package && (collection.blocks || collection.examples)) {

              alertify.prompt(gettextCatalog.getString('Edit the collection name'), collection.origName,
                function(evt, name) {
                  if (!name) {
                    return false;
                  }
                  collection.name = name;

                  var destPath = nodePath.join(common.COLLECTIONS_DIR, name);
                  if (nodeFs.existsSync(destPath)) {
                    alertify.confirm(
                      gettextCatalog.getString('The collection {{name}} already exists.', { name: utils.bold(name) }) + '<br>' +
                      gettextCatalog.getString('Do you want to replace it?'),
                      function() {
                        utils.deleteFolderRecursive(destPath);
                        installCollection(collection, zipData);
                        alertify.success(gettextCatalog.getString('Collection {{name}} replaced', { name: utils.bold(name) }));
                        next(name);
                      },
                      function() {
                        alertify.warning(gettextCatalog.getString('Collection {{name}} not replaced', { name: utils.bold(name) }));
                        next(name);
                      });
                    }
                    else {
                      installCollection(collection, zipData);
                      alertify.success(gettextCatalog.getString('Collection {{name}} added', { name: utils.bold(name) }));
                      next(name);
                    }
                });
              }
              else {
                alertify.warning(gettextCatalog.getString('Invalid collection {{name}}', { name: utils.bold(name) }));
              }
            }, 0);
          }, function(name) {
            collections.loadCollections();
            // If the selected collection is replaced, load it again
            if (common.selectedCollection.name === name) {
              collections.selectCollection(name);
            }
            utils.rootScopeSafeApply();
            nextzip();
        });
      });
    };

    function getCollections(zipData) {
      var data = '';
      var _collections = {};
      var zipEntries = zipData.getEntries();

      // Validate collections
      zipEntries.forEach(function(zipEntry) {
        data = zipEntry.entryName.match(/^([^\/]+)\/$/);
        if (data) {
          _collections[data[1]] = {
            origName: data[1], blocks: [], examples: [], locale: [], package: ''
          };
        }

        addCollectionItem('blocks', 'ice', _collections, zipEntry);
        addCollectionItem('blocks', 'v', _collections, zipEntry);
        addCollectionItem('blocks', 'vh', _collections, zipEntry);
        addCollectionItem('blocks', 'list', _collections, zipEntry);
        addCollectionItem('examples', 'ice', _collections, zipEntry);
        addCollectionItem('examples', 'v', _collections, zipEntry);
        addCollectionItem('examples', 'vh', _collections, zipEntry);
        addCollectionItem('examples', 'list', _collections, zipEntry);
        addCollectionItem('locale', 'po', _collections, zipEntry);

        data = zipEntry.entryName.match(/^([^\/]+)\/package\.json$/);
        if (data) {
          _collections[data[1]].package = zipEntry.entryName;
        }
        data = zipEntry.entryName.match(/^([^\/]+)\/README\.md$/);
        if (data) {
          _collections[data[1]].readme = zipEntry.entryName;
        }
      });

      return _collections;
    }

    function addCollectionItem(key, ext, collections, zipEntry) {
      var data = zipEntry.entryName.match(RegExp('^([^\/]+)\/' + key + '\/.*\.' + ext + '$'));
      if (data) {
        collections[data[1]][key].push(zipEntry.entryName);
      }
    }

    function installCollection(collection, zip) {
      var i, dest = '';
      var pattern = RegExp('^' + collection.origName);
      for (i in collection.blocks) {
        dest = collection.blocks[i].replace(pattern, collection.name);
        safeExtract(collection.blocks[i], dest, zip);
      }
      for (i in collection.examples) {
        dest = collection.examples[i].replace(pattern, collection.name);
        safeExtract(collection.examples[i], dest, zip);
      }
      for (i in collection.locale) {
        dest = collection.locale[i].replace(pattern, collection.name);
        safeExtract(collection.locale[i], dest, zip);
        // Generate locale JSON files
        var compiler = new nodeGettext.Compiler({ format: 'json' });
        var sourcePath = nodePath.join(common.COLLECTIONS_DIR, dest);
        var targetPath = nodePath.join(common.COLLECTIONS_DIR, dest.replace(/\.po$/, '.json'));
        var content = nodeFs.readFileSync(sourcePath).toString();
        var json = compiler.convertPo([content]);
        nodeFs.writeFileSync(targetPath, json);
        // Add strings to gettext
        gettextCatalog.loadRemote(targetPath);
      }
      if (collection.package) {
        dest = collection.package.replace(pattern, collection.name);
        safeExtract(collection.package, dest, zip);
      }
      if (collection.readme) {
        dest = collection.readme.replace(pattern, collection.name);
        safeExtract(collection.readme, dest, zip);
      }
    }

    function safeExtract(entry, dest, zip) {
      try {
        var newPath = nodePath.join(common.COLLECTIONS_DIR, dest);
        zip.extractEntryTo(entry, utils.dirname(newPath), /*maintainEntryPath*/false);
      }
      catch(e) {}
    }

    this.removeCollection = function(collection) {
      utils.deleteFolderRecursive(collection.path);
      collections.loadCollections();
      alertify.success(gettextCatalog.getString('Collection {{name}} removed', { name: utils.bold(collection.name) }));
    };

    this.removeAllCollections = function() {
      utils.removeCollections();
      collections.loadCollections();
      alertify.success(gettextCatalog.getString('All collections removed'));
    };

  });
