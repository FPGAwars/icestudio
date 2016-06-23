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
            console.log(error, stdout, stderr);
            if (error) {
              if (label)
                alertify.error(label + ' error');
            }
            else if (stdout) {
              if (stdout.toString().indexOf('ERROR') != -1) {
                if (label)
                  alertify.error(label + ' error');
              }
              else {
                if (label)
                  alertify.success(label + ' success');
              }
            }
            else {
              if (label)
                alertify.success(label + ' success');
            }
          });
        }

        this.installToolchain = function() {
          // pip install apio
          // apio install --all
        }

    }]);
