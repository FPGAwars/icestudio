'use strict';

angular.module('icestudio')
  .factory('gui', function() {
    var gui = require('nw.gui');
    return gui;
  })
  .factory('window', function() {
    var gui = require('nw.gui');
    return gui.Window;
  })
  .factory('_package', function() {
    var _package = require('./package.json');
    return _package;
  });
