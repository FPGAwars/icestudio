'use strict';

angular.module('icestudio')
    .service('tools', ['nodeFs', 'nodeOs', 'nodePath', 'nodeProcess', 'nodeChildProcess', 'nodePing', 'common', 'boards', 'compiler', 'utils',
      function(nodeFs, nodeOs, nodePath, nodeProcess, nodeChildProcess, nodePing, common, boards, compiler, utils) {

        var currentAlert = null;
        var toolchain = { installed: false };

        this.toolchain = toolchain;

        checkToolchain();

        this.verifyCode = function() {
          apio(['verify']);
        };

        this.buildCode = function() {
          apio(['build', '--board', boards.selectedBoard.id]);
        };

        this.uploadCode = function() {
          apio(['upload', '--board', boards.selectedBoard.id]);
        };

        function apio(commands) {
          if (generateCode()) {
            if (toolchain.installed) {
              $('body').addClass('waiting');
              angular.element('#menu').addClass('disable-menu');
              currentAlert= alertify.notify(commands[0] + ' start...', 'message', 100000);
              nodeProcess.chdir('_build');
              try {
                execute(([utils.getApioExecutable()].concat(commands)).join(' '), commands[0], function() {
                  if (currentAlert)
                    setTimeout(function() {
                      currentAlert.dismiss(true);
                    }, 1000);
                });
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

        function generateCode() {
          var path = '_build';
          if (!nodeFs.existsSync(path))
            nodeFs.mkdirSync(path);
          common.refreshProject();
          var verilog = compiler.generateVerilog(common.project);
          var pcf = compiler.generatePCF(common.project);
          nodeFs.writeFileSync(nodePath.join(path, 'main.v'), verilog, 'utf8');
          nodeFs.writeFileSync(nodePath.join(path, 'main.pcf'), pcf, 'utf8');
          return verilog;
        }

        function execute(command, label, callback) {
          nodeChildProcess.exec(command, function(error, stdout, stderr) {
            console.log(error, stdout, stderr);
            if (callback)
              callback();
            if (label) {
              if (error) {
                if (stdout) {
                  if (stdout.indexOf('[upload] Error') != -1) {
                    alertify.notify('Board not detected', 'error', 3);
                  }
                  else if (stdout.indexOf('set_io: too few arguments') != -1) {
                    alertify.notify('FPGA I/O not defined', 'error', 3);
                  }
                  else if (stdout.indexOf('error: unknown pin') != -1) {
                    alertify.notify('FPGA I/O not defined', 'error', 3);
                  }
                  else if (stdout.indexOf('error: duplicate pin constraints') != -1) {
                    alertify.notify('Duplicated FPGA I/O', 'error', 3);
                  }
                  else {
                    var stdoutError = stdout.split('\n').filter(isError);
                    function isError(line) {
                      return (line.indexOf('syntax error') != -1 ||
                              line.indexOf('not installed') != -1 ||
                              line.indexOf('error: ') != -1 ||
                              line.indexOf('ERROR: ') != -1 ||
                              line.indexOf('already declared') != -1);
                    }
                    if (stdoutError.length > 0) {
                      alertify.notify(stdoutError[0], 'error', 5);
                    }
                  }
                }
                else {
                  alertify.notify(stderr, 'error', 5);
                }
              }
              else {
                alertify.success(label + ' success');
              }
              $('body').removeClass('waiting');
              angular.element('#menu').removeClass('disable-menu');
            }
          });
        }

        this.installToolchain = installToolchain;

        function installToolchain() {

          // Configure alert
          alertify.defaults.closable = false;

          // Disable click event
          document.addEventListener('click', disableClick, true);

          var content = [
            '<div>',
            '  <p id="progress-message">Installing toolchain</p>',
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
            installationCompleted
          ]);

          // Restore alert
          alertify.defaults.closable = true;
        }

        function disableClick(e) {
            e.stopPropagation();
            e.preventDefault();
        }

        this.removeToolchain = function() {
          utils.removeToolchain();
          toolchain.installed = false;
        }

        function ensurePythonIsAvailable(callback) {
          updateProgress('Check Python executable...', 0);
          if (utils.getPythonExecutable()) {
            callback();
          }
          else {
            errorProgress('Python 2.7 is required');
            callback(true);
            // Enable click event
            document.removeEventListener('click', disableClick, true);
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
              errorProgress('Internet connection is required');
              callback(true);
              // Enable click event
              document.removeEventListener('click', disableClick, true);
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

        function installationCompleted(callback) {
          updateProgress('Installation completed', 100);
          alertify.success('Toolchain installed');
          toolchain.installed = true;
          // Enable click event
          document.removeEventListener('click', disableClick, true);
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
