'use strict';

angular.module('icestudio')
  .controller('MenuCtrl', function ($scope, $rootScope, nodeGlob, nodeFs) {

    // Initialize blocks menu
    loadBlocks()

    $scope.new = function() {
      $rootScope.$emit('new');
    }

    $scope.load = function() {
      setTimeout(function() {
        var ctrl = angular.element('#input-load');
        ctrl.on('change', function(event) {
          var file = event.target.files[0];
          event.target.files.clear();
          if (file) {
            $rootScope.$emit('load', file.path);
          }
        });
        ctrl.click();
      }, 0);
    }

    $scope.save = function() {
      setTimeout(function() {
        var ctrl = angular.element('#input-save');
        ctrl.on('change', function(event) {
          var file = event.target.files[0];
          if (file) {
            event.target.files.clear();
            var filepath = file.path;
            if (! filepath.endsWith('.json')) {
                filepath += '.json';
            }
            $rootScope.$emit('save', filepath);
          }
        });
        ctrl.click();
      }, 0);
    }

    $scope.exportCustomBlock = function() {
      $rootScope.$emit('exportCustomBlock');
    }

    $scope.addBlock = function(category, name, block) {
      $rootScope.$emit('addBlock', { type: category + '.' + name, block: block });
    }

    $scope.build = function() {
      console.log('build');
    }

    $scope.upload = function() {
      console.log('upload');
    }

    $scope.reloadBlocks = function() {
      loadBlocks();
    }

    $scope.clearGraph = function() {
      $rootScope.$emit('clear');
    }

    function loadBlocks() {
      nodeGlob('app/res/blocks/*', null, function (er, categories) {
        for (var i = 0; i < categories.length; i++) {

          var category = categories[i].split('/')[3];

          $rootScope.blocks[category] = {};

          nodeGlob(categories[i] + '/*/*.json', null, (function(c) {
              return function(er, blocks) {
                  storeBlocks(er, blocks, c);
              };
          })(category));

          function storeBlocks(er, blocks, category) {

            for (var j = 0; j < blocks.length; j++) {

              var name = blocks[j].split('/')[4];

              $.getJSON(blocks[j].substring(4), (function(c, n) {
                  return function(data) {
                      storeData(data, c, n);
                  };
              })(category, name));

              function storeData(data, category, name) {
                $rootScope.blocks[category][name] = data;
              }
            }
          };
        }
      });
    }

  });
