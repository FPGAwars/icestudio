'use strict';

angular.module('icestudio')
  .controller('MenuCtrl', function ($scope, $rootScope, nodeFs, blocksStore) {

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
      blocksStore.loadBlocks();
    }

    $scope.removeBlock = function() {
      $rootScope.$emit('remove');
    }

    $scope.clearGraph = function() {
      $rootScope.$emit('clear');
    }

  });
