'use strict';

angular.module('icestudio')
    .service('tools', ['gettextCatalog', 'profile', 'nodeFs', 'nodeFse', 'nodeOs', 'nodePath', 'nodeProcess', 'nodeChildProcess', 'nodeSSHexec', 'nodeRSync', 'common', 'boards', 'compiler', 'utils',
      function(gettextCatalog, profile, nodeFs, nodeFse, nodeOs, nodePath, nodeProcess, nodeChildProcess, nodeSSHexec, nodeRSync, common, boards, compiler, utils) {

        var currentAlert = null;
        var toolchain = { apio: '-', installed: false, disabled: false };

        this.toolchain = toolchain;
        this.buildPath = '_build';
        this.currentProjectPath = '';

        // Check if the toolchain is installed
        checkToolchain();

        // Update toolchain information
        updateToolchainInfo();

        // Remove _build directory on start
        nodeFse.removeSync(this.buildPath);

        this.verifyCode = function() {
          this.apio(['verify']);
        };

        this.buildCode = function() {
          this.apio(['build', '--board', boards.selectedBoard.name]);
        };

        this.uploadCode = function() {
          this.apio(['upload', '--board', boards.selectedBoard.name]);
        };

        this.apio = function(commands) {
          var check = true;
          var code = this.generateCode();
          if (code) {
            if (toolchain.installed || toolchain.disabled) {
              angular.element('#menu').addClass('disable-menu');
              currentAlert = alertify.notify(gettextCatalog.getString('start_' + commands[0]), 'message', 100000);
              $('body').addClass('waiting');
              nodeProcess.chdir(this.buildPath);
              check = this.syncResources(code);
              try {
                if (check) {
                  execute(commands, commands[0], currentAlert, function() {
                    if (currentAlert) {
                      setTimeout(function() {
                        angular.element('#menu').removeClass('disable-menu');
                        currentAlert.dismiss(true);
                      }, 1000);
                    }
                  });
                }
                else {
                  setTimeout(function() {
                    angular.element('#menu').removeClass('disable-menu');
                    currentAlert.dismiss(true);
                    $('body').removeClass('waiting');
                  }, 1000);
                }
              }
              catch(e) {
              }
              finally {
                nodeProcess.chdir('..');
              }
            }
            else {
              alertify.notify(gettextCatalog.getString('toolchain_not_installed'), 'error', 5);
            }
          }
        }

        function checkToolchain(callback) {
          var apio = utils.getApioExecutable();
          toolchain.disabled = utils.toolchainDisabled;
          nodeChildProcess.exec([
            'cd', utils.SAMPLE_DIR, (process.platform === 'win32' ? '&' : ';'),
            apio, 'clean'].join(' '), function(error, stdout, stderr) {
            if (!toolchain.disabled) {
              toolchain.installed = !error;
              if (callback) {
                callback(toolchain.installed);
              }
            }
          });
        }

        function updateToolchainInfo() {
          var apio = utils.getApioExecutable();
          nodeChildProcess.exec([apio, '--version'].join(' '), function(error, stdout, stderr) {
            if (error) {
              toolchain.apio = '-';
            }
            else {
              toolchain.apio = stdout.match(/apio, version (.+)/i)[1];
            }
          });
        }

        this.generateCode = function() {
          if (!nodeFs.existsSync(this.buildPath))
            nodeFs.mkdirSync(this.buildPath);
          common.refreshProject();
          var verilog = compiler.generateVerilog(common.project);
          var pcf = compiler.generatePCF(common.project);
          nodeFs.writeFileSync(nodePath.join(this.buildPath, 'main.v'), verilog, 'utf8');
          nodeFs.writeFileSync(nodePath.join(this.buildPath, 'main.pcf'), pcf, 'utf8');
          return verilog;
        }

        this.syncResources = function(code) {
          var ret = true;

          // Remove resources
          nodeFse.removeSync('!(main.*)');

          // Sync Verilog files
          if (ret) ret = this.syncFiles(/@include (.*?)\.v\s+/g, 'v', code);

          // Sync Verilog Header files
          if (ret) ret = this.syncFiles(/@include (.*?)\.vh\s+/g, 'vh', code);

          // Sync List files
          if (ret) ret = this.syncFiles(/\"(.*?)\.list\"/g, 'list', code);

          return ret;
        }

        this.syncFiles = function(pattern, ext, code) {
          var ret = true;
          var match;
          while (match = pattern.exec(code)) {
            var file = match[1] + '.' + ext;
            var destPath = nodePath.join('.', file);
            var origPath = nodePath.join(this.currentProjectPath, file);

            try {
              // Copy list file
              if (nodeFs.existsSync(origPath)) {
                nodeFse.copySync(origPath, destPath);
              }
              else {
                // Error: file does not exist
                alertify.notify(gettextCatalog.getString('file_does_not_exist', { file: file }), 'error', 3);
                ret = false;
                break;
              }
            }
            catch (e) {
              alertify.notify(gettextCatalog.getString('generic_error', { error: e.toString() }), 'error', 3);
              ret = false;
              break;
            }
          }

          return ret;
        }

        this.setProjectPath = function(path) {
          this.currentProjectPath = path;
        }

        function execute(commands, label, currentAlert, callback) {
          var remoteHostname = profile.data.remoteHostname;

          if (remoteHostname) {
            currentAlert.setContent(gettextCatalog.getString('sync_remote_files'));
            nodeRSync({
              src: nodeProcess.cwd() + '/',
              dest: remoteHostname + ':' + this.buildPath + '/',
              ssh: true,
              recursive: true,
              delete: true,
              include: ['*.v', '*.pcf', '*.list'],
              exclude: ['.sconsign.dblite', '*.out', '*.blif', '*.asc', '*.bin']
            }, function (error, stdout, stderr, cmd) {
              if (!error) {
                currentAlert.setContent(gettextCatalog.getString('execute_remote', { label: label }));
                nodeSSHexec('cd ' + this.buildPath + '; ' + (['apio'].concat(commands)).join(' '), remoteHostname,
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
            nodeChildProcess.exec(([apio].concat(commands)).join(' '), { maxBuffer: 5000 * 1024 },
              function(error, stdout, stderr) {
                processExecute(label, callback, error, stdout, stderr);
              });
          }
        }

        function processExecute(label, callback, error, stdout, stderr) {
          if (callback)
            callback();
          if (label) {
            if (error || stderr) {
              if (stdout) {
                if (stdout.indexOf('[upload] Error') != -1 ||
                    stdout.indexOf('Error: board not detected') != -1) {
                  alertify.notify(gettextCatalog.getString('board_not_detected', { name: '<b>' + boards.selectedBoard.info.label + '</b>' }), 'error', 3);
                }
                else if (stdout.indexOf('Error: unkown board') != -1) {
                  alertify.notify(gettextCatalog.getString('unknown_board'), 'error', 3);
                }
                else if (stdout.indexOf('set_io: too few arguments') != -1) {
                  alertify.notify(gettextCatalog.getString('fpga_io_not_defined'), 'error', 3);
                }
                else if (stdout.indexOf('error: unknown pin') != -1) {
                  alertify.notify(gettextCatalog.getString('fpga_io_not_defined'), 'error', 3);
                }
                else if (stdout.indexOf('error: duplicate pin constraints') != -1) {
                  alertify.notify(gettextCatalog.getString('duplicated_fpga_io'), 'error', 3);
                }
                else {
                  var stdoutError = stdout.split('\n').filter(isError);
                  function isError(line) {
                    return (line.indexOf('syntax error') != -1 ||
                            line.indexOf('not installed') != -1 ||
                            line.indexOf('error: ') != -1 ||
                            line.indexOf('ERROR: ') != -1 ||
                            line.indexOf('Error: ') != -1 ||
                            line.indexOf('already declared') != -1);
                  }
                  if (stdoutError.length > 0) {
                    alertify.notify(stdoutError[0], 'error', 5);
                  }
                  else {
                    alertify.notify(stdout, 'error', 5);
                  }
                }
              }
              else if (stderr) {
                if (stderr.indexOf('Could not resolve hostname') != -1 ||
                    stderr.indexOf('Connection refused') != -1) {
                  alertify.notify(gettextCatalog.getString('wrong_remote_hostname', { name: profile.data.remoteHostname }), 'error', 3);
                }
                else if (stderr.indexOf('No route to host') != -1) {
                  alertify.notify(gettextCatalog.getString('remote_host_not_connected', { name: profile.data.remoteHostname }), 'error', 3);
                }
                else {
                  alertify.notify(stderr, 'error', 5);
                }
              }
            }
            else {
              alertify.success(gettextCatalog.getString('done_' + label));
            }
            $('body').removeClass('waiting');
          }
        }

        this.installToolchain = function() {
          if (utils.checkDefaultToolchain()) {
            installDefaultToolchain();
          }
          else {
            alertify.confirm('Default toolchain not found. Toolchain will be downloaded. This operation requires Internet connection. Do you want to continue?',
              function() {
                installOnlineToolchain();
            });
          }
        }

        this.updateToolchain = function() {
          alertify.confirm('The toolchain will be updated. This operation requires Internet connection. Do you want to continue?',
            function() {
              installOnlineToolchain();
          });
        }

        this.resetToolchain = function() {
          if (utils.checkDefaultToolchain()) {
            alertify.confirm('The toolchain will be restored to default. Do you want to continue?',
              function() {
                utils.removeToolchain();
                installDefaultToolchain();
            });
          }
          else {
            alertify.alert('Error: default toolchain not found in \'' + utils.TOOLCHAIN_DIR + '\'');
          }
        }

        this.removeToolchain = function() {
          alertify.confirm(gettextCatalog.getString('remove_toolchain_confirmation'),
            function() {
              utils.removeToolchain();
              toolchain.installed = false;
              alertify.success(gettextCatalog.getString('toolchain_removed'));
          });
        }

        this.enableDrivers = function() {
          utils.enableDrivers();
        }

        this.disableDrivers = function() {
          utils.disableDrivers();
        }

        function installDefaultToolchain() {
          // Configure alert
          alertify.defaults.closable = false;

          utils.disableClickEvent();

          var content = [
            '<div>',
            '  <p id="progress-message">' + gettextCatalog.getString('installing_toolchain') + '</p>',
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
            '  <p id="progress-message">' + gettextCatalog.getString('installing_toolchain') + '</p>',
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
          updateProgress('Check Internet connection...', 0);
          utils.isOnline(callback, function() {
            errorProgress(gettextCatalog.getString('internet_connection_required'));
            utils.enableClickEvent();
          });
        }

        function ensurePythonIsAvailable(callback) {
          updateProgress('Check Python executable...', 0);
          if (utils.getPythonExecutable()) {
            callback();
          }
          else {
            errorProgress('Python 2.7 is required');
            utils.enableClickEvent();
            callback(true);
          }
        }

        function extractVirtualEnv(callback) {
          updateProgress('Extract virtual env files...', 5);
          utils.extractVirtualEnv(callback);
        }

        function makeVenvDirectory(callback) {
          updateProgress('Make virtual env...', 10);
          utils.makeVenvDirectory(callback);
        }

        // Local installation

        function extractDefaultApio(callback) {
          updateProgress('Extract default apio files...', 20);
          utils.extractDefaultApio(callback);
        }

        function installDefaultApio(callback) {
          updateProgress('Install default apio...', 40);
          utils.installDefaultApio(callback);
        }

        function extractDefaultApioPackages(callback) {
          updateProgress('Extract default apio packages...', 70);
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
          checkToolchain(function(installed) {
            if (installed) {
              updateProgress(gettextCatalog.getString('installation_completed'), 100);
              alertify.success(gettextCatalog.getString('toolchain_installed'));
              updateToolchainInfo();
            }
            else {
              errorProgress('Toolchain not installed');
              alertify.error('Toolchain not installed');
            }
            utils.enableClickEvent();
            callback();
          });
        }

        function updateProgress(message, value) {
          angular.element('#progress-message')
            .text(message);
          var bar = angular.element('#progress-bar')
          if (value == 100)
            bar.removeClass('progress-bar-striped active');
          bar.text(value + '%')
          bar.attr('aria-valuenow', value)
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

    }]);
