'use strict';

angular.module('icestudio')
  .service('tools', function(project,
                             boards,
                             compiler,
                             profile,
                             resources,
                             utils,
                             gettextCatalog,
                             gettext,
                             nodeFs,
                             nodeFse,
                             nodeOs,
                             nodePath,
                             nodeChildProcess,
                             nodeSSHexec,
                             nodeRSync,
                             nodeExtract,
                             nodeSemver,
                             _package) {

    var currentAlert = null;
    var taskRunning = false;
    var toolchain = { apio: '-', installed: false, disabled: false };

    this.toolchain = toolchain;

    // Check if the toolchain is installed
    checkToolchain();

    // Remove build directory on start
    nodeFse.removeSync(utils.BUILD_DIR);

    this.verifyCode = function() {
      this.apio(['verify']);
    };

    this.buildCode = function() {
      this.apio(['build', '-b', boards.selectedBoard.name]);
    };

    this.uploadCode = function() {
      this.apio(['upload', '-b', boards.selectedBoard.name]);
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
          var message = 'start_' + commands[0];
          currentAlert = alertify.notify(gettextCatalog.getString(message), 'message', 100000);
          $('body').addClass('waiting');
          check = this.syncResources(code);
          try {
            if (check) {
              execute(commands, commands[0], currentAlert, function() {
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
          alertify.notify(gettextCatalog.getString('Toolchain not installed. Please, install the toolchain'), 'error', 30);
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
            toolchain.installed = nodeSemver.gte(toolchain.apio, _package.apio.min) &&
                                  nodeSemver.lt(toolchain.apio, _package.apio.max);
            if (toolchain.installed) {
              nodeChildProcess.exec([apio, 'clean', '-p', utils.SAMPLE_DIR].join(' '), function(error/*, stdout, stderr*/) {
                toolchain.installed = !error;
                if (callback) {
                  callback();
                }
              });
            }
            else {
              if (callback) {
                callback();
              }
            }
          }
        });
      }
    }

    this.generateCode = function() {
      if (!nodeFs.existsSync(utils.BUILD_DIR)) {
        nodeFs.mkdirSync(utils.BUILD_DIR);
      }
      project.update();
      var opt = { boardRules: profile.data.boardRules };
      if (opt.boardRules) {
        opt.initPorts = compiler.getInitPorts(project.get());
        opt.initPins = compiler.getInitPins(project.get());
      }
      var verilog = compiler.generate('verilog', project.get(), opt);
      var pcf = compiler.generate('pcf', project.get(), opt);
      nodeFs.writeFileSync(nodePath.join(utils.BUILD_DIR, 'main.v'), verilog, 'utf8');
      nodeFs.writeFileSync(nodePath.join(utils.BUILD_DIR, 'main.pcf'), pcf, 'utf8');
      return verilog;
    };

    this.syncResources = function(code) {
      var ret;

      // Remove resources
      nodeFse.removeSync('!(main.*)');

      // Sync included files
      ret = this.syncFiles(/@include\s(.*?)(\\n|\n|\s)/g, code);

      // Sync list files
      if (ret) {
        ret = this.syncFiles(/\"(.*\.list?)\"/g, code);
      }

      return ret;
    };

    this.syncFiles = function(pattern, code) {
      var ret = true;
      var match;
      while (match = pattern.exec(code)) {
        var file = match[1];
        var destPath = nodePath.join(utils.BUILD_DIR, file);
        var origPath = nodePath.join(utils.dirname(project.path), file);

        // Copy included file
        var copySuccess = utils.copySync(origPath, destPath);
        if (!copySuccess) {
          alertify.notify(gettextCatalog.getString('File {{file}} does not exist', { file: file }), 'error', 30);
          ret = false;
          break;
        }
      }

      return ret;
    };

    function execute(commands, label, currentAlert, callback) {
      var remoteHostname = profile.data.remoteHostname;

      if (remoteHostname) {
        currentAlert.setContent(gettextCatalog.getString('Synchronize remote files ...'));
        nodeRSync({
          src: utils.BUILD_DIR + '/',
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
                processExecute(label, callback, error, stdout, stderr);
              });
          }
          else {
            processExecute(label, callback, error, stdout, stderr);
          }
        });
      }
      else {
        var apio = utils.getApioExecutable();
        toolchain.disabled = utils.toolchainDisabled;
        nodeChildProcess.exec(([apio].concat(commands).concat(['-p', utils.coverPath(utils.BUILD_DIR)])).join(' '), { maxBuffer: 5000 * 1024 },
          function(error, stdout, stderr) {
            processExecute(label, callback, error, stdout, stderr);
          });
      }
    }

    function processExecute(label, callback, error, stdout, stderr) {
      if (callback) {
        callback();
      }
      if (label) {
        if (error || stderr) {
          if (stdout) {
            if (stdout.indexOf('[upload] Error') !== -1 ||
                stdout.indexOf('Error: board not detected') !== -1) {
              alertify.notify(gettextCatalog.getString('Board {{name}} not detected', { name: utils.bold(boards.selectedBoard.info.label) }), 'error', 30);
            }
            else if (stdout.indexOf('Error: unkown board') !== -1) {
              alertify.notify(gettextCatalog.getString('Unknown board'), 'error', 30);
            }
            else if (stdout.indexOf('set_io: too few arguments') !== -1) {
              alertify.notify(gettextCatalog.getString('FPGA I/O ports not defined'), 'error', 30);
            }
            else if (stdout.indexOf('error: unknown pin') !== -1) {
              alertify.notify(gettextCatalog.getString('FPGA I/O ports not defined'), 'error', 30);
            }
            else if (stdout.indexOf('error: duplicate pin constraints') !== -1) {
              alertify.notify(gettextCatalog.getString('Duplicated FPGA I/O ports'), 'error', 30);
            }
            else {
              var stdoutError = stdout.split('\n').filter(function (line) {
                return (line.indexOf('syntax error') !== -1 ||
                        line.indexOf('not installed') !== -1 ||
                        line.indexOf('error: ') !== -1 ||
                        line.indexOf('ERROR: ') !== -1 ||
                        line.indexOf('Error: ') !== -1 ||
                        line.indexOf('already declared') !== -1);
              });
              if (stdoutError.length > 0) {
                alertify.notify(stdoutError[0], 'error', 30);
              }
              else {
                alertify.notify(stdout, 'error', 30);
              }
            }
          }
          else if (stderr) {
            if (stderr.indexOf('Could not resolve hostname') !== -1 ||
                stderr.indexOf('Connection refused') !== -1) {
              alertify.notify(gettextCatalog.getString('Wrong remote hostname {{name}}', { name: profile.data.remoteHostname }), 'error', 30);
            }
            else if (stderr.indexOf('No route to host') !== -1) {
              alertify.notify(gettextCatalog.getString('Remote host {{name}} not connected', { name: profile.data.remoteHostname }), 'error', 30);
            }
            else {
              alertify.notify(stderr, 'error', 30);
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
          if ((label === 'build') && stdout) {
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
              alertify.notify('<pre>' + fpgaResources + '</pre>', 'message', 5);
            }
          }
        }
        $('body').removeClass('waiting');
      }
    }

    this.installToolchain = function() {
      if (utils.checkDefaultToolchain()) {
        utils.removeToolchain();
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
        alertify.alert(gettextCatalog.getString('Error: default toolchain not found in \'{{dir}}\'', { dir: utils.TOOLCHAIN_DIR}));
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
      utils.enableDrivers();
    };

    this.disableDrivers = function() {
      utils.disableDrivers();
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
      if (nodeOs.platform().indexOf('win32') > -1) {
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

    this.addCollection = function(filepath) {
      var name = utils.basename(filepath);
      nodeExtract(filepath, { dir: utils.COLLECTIONS_DIR }, function (err) {
        if (err) {
          throw err;
        }
        resources.loadCollections();
        alertify.success(gettextCatalog.getString('Collection file {{name}} added', { name: utils.bold(name) }));
      });
    };

    this.removeCollection = function(collection) {
      utils.deleteFolderRecursive(collection.path);
      resources.loadCollections();
      alertify.success(gettextCatalog.getString('Collection {{name}} removed', { name: utils.bold(collection.name) }));
    };

    this.removeAllCollections = function() {
      utils.removeCollections();
      resources.loadCollections();
      alertify.success(gettextCatalog.getString('All collections removed'));
    };

  });
