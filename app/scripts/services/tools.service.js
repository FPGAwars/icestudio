'use strict';

angular.module('icestudio')
    .service('tools', ['nodeFs', 'nodeSha1', 'common', 'compiler',
      function(nodeFs, nodeSha1, common, compiler) {

        this.verifyCode = function() {
          common.refreshProject();
          console.log(compiler.generateVerilog(common.project));
          console.log(compiler.generatePCF(common.project));
          // apio verify
        };

        this.buildCode = function() {
          // apio build
        };

        this.uploadCode = function() {
          // apio upload
        };

        this.installToolchain = function() {
          // pip install apio
          // apio install --all
        }

    }]);
