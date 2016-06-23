'use strict';

angular.module('icestudio')
    .service('tools', ['nodeFs', 'nodePath', 'nodeProcess', 'nodeChildProcess', 'common', 'compiler',
      function(nodeFs, nodePath, nodeProcess, nodeChildProcess, common, compiler) {

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
          if (generateCode()) {
            alertify.message(command + ' start');
            nodeProcess.chdir('_build');
            execute('apio ' + command, command);
            nodeProcess.chdir('..');
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
            if (error) {
              alertify.error(label + ' error');
            }
            else if (stdout) {
              if (stdout.toString().indexOf('ERROR') != -1) {
                alertify.error(label + 'error');
              }
              else {
                alertify.success(label + 'success');
              }
            }
            else {
              alertify.success(label + ' success');
            }
          });
        }

        this.installToolchain = function() {
          // pip install apio
          // apio install --all
        }

    }]);
