'use strict';

angular.module('icestudio')
  .factory('window', function() {
    var gui = require('nw.gui');
    return gui.Window.get();
  });
