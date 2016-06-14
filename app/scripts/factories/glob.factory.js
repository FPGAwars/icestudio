'use strict';

angular.module('icestudio')
  .factory('nodeGlob', function() {
    return require('glob');
  });
