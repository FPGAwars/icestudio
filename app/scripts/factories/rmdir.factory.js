'use strict';

angular.module('icestudio')
  .factory('nodeRmdir', function() {
    return require('rmdir');
  });
