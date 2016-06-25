'use strict';

angular.module('icestudio')
    .service('tools', ['nodeFs', 'nodePath', 'nodeProcess', 'nodeChildProcess', 'common', 'boards', 'compiler',
      function(nodeFs, nodePath, nodeProcess, nodeChildProcess, common, boards, compiler) {

        this.verifyCode = function() {
          if (generateCode()) {
            execute('iverilog _build/main.v', 'Verify');
            //apio('verify');
          }
        };

        this.buildCode = function() {
          apio('build');
        };

        this.uploadCode = function() {
          apio('upload');
        };

        function apio(command) {
          $('body').addClass('waiting');
          angular.element('#menu').addClass('disable-menu');
          if (generateCode()) {
            alertify.message(command + ' start');
            nodeProcess.chdir('_build');
            try {
              execute('apio init --board ' + boards.selectedBoard.id);
              execute('apio ' + command, command);
            }
            catch(e) {
            }
            finally {
              nodeProcess.chdir('..');
            }
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

        function execute(command, label) {
          nodeChildProcess.exec(command, function(error, stdout, stderr) {
            if (label) {
              if (error) {
                if (stdout.indexOf('set_io: too few arguments') != -1) {
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

        this.installToolchain = function() {
          var content = [
            '<div>',
            '  <p id="progress-message">Installing toolchain</p>',
            '  </br>',
            '  <div class="progress">',
            '    <div id="progress-bar" class="progress-bar progress-bar-info" role="progressbar"',
            '    aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%">',
            '    </div>',
            '  </div>',
            '</div>'].join('\n');
          alertify.alert(content, function(){
            alertify.message('OK');
          });

          // Install toolchain

          async.series([
            one,
            two
          ]);


          // pip install apio
          // apio install --all
        }

        function one(callback) {
          updateProgress(10);
          setTimeout( function() {
            callback(null, 'one');
          }, 2000);
        }

        function two(callback) {
          updateProgress(20);
          callback(null, 'two');
        }

        function updateProgress(value, message) {
          angular.element('#progress-message')
            .text(message);
          angular.element('#progress-bar')
            .text(value + '%')
            .attr('aria-valuenow', value)
            .css('width', value + '%');
        }

    }]);
