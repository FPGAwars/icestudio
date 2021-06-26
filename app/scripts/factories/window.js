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
    let _package = require('./package.json');
    const _buildinfo = require('./buildinfo.json');
    _package.version=`${_package.version}${_buildinfo.ts}`;
    return _package;
  });
