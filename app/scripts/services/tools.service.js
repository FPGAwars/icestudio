'use strict';

angular.module('icestudio')
    .service('tools', ['$translate', 'profile', 'nodeFs', 'nodeFse', 'nodeOs', 'nodePath', 'nodeProcess', 'nodeChildProcess', 'nodeSSHexec', 'nodeRSync', 'nodePing', 'common', 'boards', 'compiler', 'utils',
      function($translate, profile, nodeFs, nodeFse, nodeOs, nodePath, nodeProcess, nodeChildProcess, nodeSSHexec, nodeRSync, nodePing, common, boards, compiler, utils) {

        var currentAlert = null;
        var toolchain = { installed: false };

        this.toolchain = toolchain;
        this.buildPath = '_build';
        this.currentProjectPath = '';

        checkToolchain();

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
            if (toolchain.installed) {
              angular.element('#menu').addClass('disable-menu');
              currentAlert = alertify.notify($translate.instant('start_' + commands[0]), 'message', 100000);
              $('body').addClass('waiting');
              nodeProcess.chdir('_build');
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
              installToolchain();
            }
          }
        }

        function checkToolchain() {
          var apio = utils.getApioExecutable();
          var exists = nodeFs.existsSync(apio);
          if (exists) {
            nodeChildProcess.exec([apio, 'clean'].join(' '), function(error, stdout, stderr) {
              if (stdout) {
                toolchain.installed = (stdout.indexOf('not installed') == -1);
              }
            });
          }
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
                alertify.notify($translate.instant('file_does_not_exist', { file: file }), 'error', 3);
                ret = false;
                break;
              }
            }
            catch (e) {
              alertify.notify($translate.instant('generic_error', { error: e.toString() }), 'error', 3);
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
            currentAlert.setContent($translate.instant('sync_remote_files'));
            nodeRSync({
              src: nodeProcess.cwd() + '/',
              dest: remoteHostname + ':_build/',
              ssh: true,
              recursive: true,
              delete: true,
              include: ['*.v', '*.pcf', '*.list'],
              exclude: ['.sconsign.dblite', '*.out', '*.blif', '*.asc', '*.bin']
            }, function (error, stdout, stderr, cmd) {
              if (!error) {
                currentAlert.setContent($translate.instant('execute_remote', { label: label }));
                nodeSSHexec('cd _build; ' + (['apio'].concat(commands)).join(' '), remoteHostname,
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
            nodeChildProcess.exec(([utils.getApioExecutable()].concat(commands)).join(' '), { maxBuffer: 5000 * 1024 },
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
                  alertify.notify($translate.instant('board_not_detected'), 'error', 3);
                }
                else if (stdout.indexOf('Error: unkown board') != -1) {
                  alertify.notify($translate.instant('unknown_board'), 'error', 3);
                }
                else if (stdout.indexOf('set_io: too few arguments') != -1) {
                  alertify.notify($translate.instant('fpga_io_not_defined'), 'error', 3);
                }
                else if (stdout.indexOf('error: unknown pin') != -1) {
                  alertify.notify($translate.instant('fpga_io_not_defined'), 'error', 3);
                }
                else if (stdout.indexOf('error: duplicate pin constraints') != -1) {
                  alertify.notify($translate.instant('duplicated_fpga_io'), 'error', 3);
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
                  alertify.notify($translate.instant('wrong_remote_hostname', { name: profile.data.remoteHostname }), 'error', 3);
                }
                else if (stderr.indexOf('No route to host') != -1) {
                  alertify.notify($translate.instant('remote_host_not_connected', { name: profile.data.remoteHostname }), 'error', 3);
                }
                else {
                  alertify.notify(stderr, 'error', 5);
                }
              }
            }
            else {
              alertify.success($translate.instant('done_' + label));
            }
            $('body').removeClass('waiting');
          }
        }

        this.installToolchain = installToolchain;

        function installToolchain() {

          // Configure alert
          alertify.defaults.closable = false;

          utils.disableClickEvent();

          var content = [
            '<div>',
            '  <p id="progress-message">' + $translate.instant('installing_toolchain') + '</p>',
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
            ensurePythonIsAvailable,
            extractVirtualEnv,
            makeVenvDirectory,
            ensureInternetConnection,
            installApio,
            apioInstallSystem,
            apioInstallScons,
            apioInstallIcestorm,
            apioInstallIverilog,
            apioInstallDrivers,
            installationCompleted
          ]);

          // Restore alert
          alertify.defaults.closable = true;
        }

        this.removeToolchain = function() {
          utils.removeToolchain();
          toolchain.installed = false;
        }

        this.enableDrivers = function() {
          utils.enableDrivers();
        }

        this.disableDrivers = function() {
          utils.disableDrivers();
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

        function ensureInternetConnection(callback) {
          updateProgress('Check Internet connection...', 20);
          nodePing.probe('google.com', function(isAlive) {
            if (isAlive) {
              callback();
            }
            else {
              errorProgress($translate.instant('internet_connection_required'));
              utils.enableClickEvent();
              callback(true);
            }
          });
        }

        function installApio(callback) {
          updateProgress('pip install -U apio', 30);
          utils.installApio(callback);
        }

        function apioInstallSystem(callback) {
          updateProgress('apio install system', 50);
          utils.apioInstall('system', callback);
        }

        function apioInstallScons(callback) {
          updateProgress('apio install scons', 60);
          utils.apioInstall('scons', callback);
        }

        function apioInstallIcestorm(callback) {
          updateProgress('apio install icestorm', 70);
          utils.apioInstall('icestorm', callback);
        }

        function apioInstallIverilog(callback) {
          updateProgress('apio install iverilog', 90);
          utils.apioInstall('iverilog', callback);
        }

        function apioInstallDrivers(callback) {
          if (nodeOs.platform().indexOf('win32') > -1) {
            updateProgress('apio install drivers', 95);
            utils.apioInstall('drivers', callback);
          }
          else {
            callback();
          }
        }

        function installationCompleted(callback) {
          updateProgress($translate.instant('installation_completed'), 100);
          alertify.success($translate.instant('toolchain_installed'));
          toolchain.installed = true;
          utils.enableClickEvent();
          callback();
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
