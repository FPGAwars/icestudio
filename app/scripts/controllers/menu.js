'use strict';

angular.module('icestudio')
  .controller('MenuCtrl', function ($scope) {

    $scope.load = function() {
      console.log('load');
    }

    $scope.save = function() {
      console.log('save');
    }

    $scope.build = function() {
      console.log('build');
    }

    $scope.upload = function() {
      console.log('upload');
    }

  });
