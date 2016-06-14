'use strict';

angular.module('icestudio')
  .controller('MainCtrl', function($scope, $rootScope, nodeFs, nodeGlob) {
    console.log('echo main');

    alertify.delay(2000);
    alertify.logPosition('bottom right');

    $rootScope.blocks = [];

    // Load blocks
    nodeGlob('app/res/blocks/*/*/*.json', null, function (er, files) {
      for (var i = 0; i < files.length; i++) {
        $.getJSON(files[i].substring(4), function(data) {
          $rootScope.blocks.push(data);
        });
      }
    })

  });
