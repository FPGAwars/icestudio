'use strict';

angular.module('icestudio')
    .service('tools', ['nodeFs', 'nodeOs', 'nodePath', 'nodeProcess', 'nodeChildProcess', 'nodePing', 'common', 'boards', 'compiler', 'utils',
      function(nodeFs, nodeOs, nodePath, nodeProcess, nodeChildProcess, nodePing, common, boards, compiler, utils) {

        this.verifyCode = function() {
          //apio('verify');
        };

        this.buildCode = function() {
          apio('build');
        };

        this.uploadCode = function() {
          apio('upload');
        };

        function apio(command) {
          if (generateCode()) {
            if (checkApio()) {
              $('body').addClass('waiting');
              angular.element('#menu').addClass('disable-menu');
              alertify.message(command + ' start');
              nodeProcess.chdir('_build');
              try {
                execute([utils.getApioExecutable(), 'init', '--board', boards.selectedBoard.id].join(' '));
                execute([utils.getApioExecutable(), command].join(' '), command);
              }
              catch(e) {
              }
              finally {
                nodeProcess.chdir('..');
              }
            }
          }
        }

        function checkApio() {
          var path = utils.getApioExecutable();
          var exists = nodeFs.existsSync(path);
          if (!exists) {
            alertify.notify('Execute `Tools > Install toolchain`', 'error', 5);
          }
          return exists;
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

        function execute(command, label) {
          nodeChildProcess.exec(command, function(error, stdout, stderr) {
            console.log(error, stdout, stderr);
            if (label) {
              if (error) {
                if (stdout.indexOf('[upload] Error') != -1) {
                  alertify.notify('Board not detected', 'error', 5);
                }
                else if (stdout.indexOf('set_io: too few arguments') != -1) {
                  alertify.notify('FPGA I/O not defined', 'error', 5);
                }
                else {
                  if (stdout) {
                    var stdoutError = stdout.split('\n').filter(isError);
                    function isError(line) {
                      return (line.indexOf('ERROR: ') != -1);
                    }
                    if (stdoutError.length > 0) {
                      alertify.notify(stdoutError[0], 'error', 5);
                    }
                  }
                  else {
                    alertify.notify(stderr, 'error', 5);
                  }
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
          //alertify.defaults.closable = false;
          alertify.defaults.theme.ok = 'hidden';

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
            initProgress();
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
            installationCompleted
          ]);

          // Restore alert
          //alertify.defaults.closable = true;
          alertify.defaults.theme.ok = 'ajs-ok';
        }

        function ensurePythonIsAvailable(callback) {
          updateProgress('Check Python executable...', 0);
          if (utils.getPythonExecutable()) {
            callback();
          }
          else {
            errorProgress('Python 2.7 is needed');
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
              errorProgress('Internet connection is needed');
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
          updateProgress('apio install icestorm', 80);
          utils.apioInstall('icestorm', callback);
        }

        function installationCompleted(callback) {
          updateProgress('Installation completed', 100);
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
