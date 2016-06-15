'use strict';

angular.module('icestudio')
  .controller('MainCtrl', function($scope, $rootScope) {
    console.log('echo main');

    alertify.delay(2000);
    alertify.logPosition('bottom right');

    $rootScope.blocks = {};
    $rootScope.projectName = 'untitled';

  });
