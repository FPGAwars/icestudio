'use strict';

angular.module('icestudio')
  .controller('MainCtrl', function($scope) {
    console.log('echo main');

    alertify.delay(2000);
    alertify.logPosition("bottom right");
  });
