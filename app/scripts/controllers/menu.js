'use strict';

angular.module('icestudio')
  .controller('MenuCtrl', function ($scope) {

    $scope.load = function() {
      setTimeout(function() {
        var ctrl = angular.element('#input-load');
        ctrl.on('change', function(event) {
          var file = event.target.files[0];
          event.target.files.clear();
          if (file) {
            load(file.path);
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
          event.target.files.clear();
          if (file) {
            save(file.path);
          }
        });
        ctrl.click();
      }, 0);
    }

    function load(filepath) {
      alert("Load " + filepath);
    }

    function save(filepath) {
      alert("Save " + filepath);
    }

    $scope.build = function() {
      console.log('build');
    }

    $scope.upload = function() {
      console.log('upload');
    }

  });
