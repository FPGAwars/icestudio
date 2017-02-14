'use strict';

angular.module('icestudio')
  .service('common', function() {

    // Project version
    this.VERSION = '1.1';

    // All project dependencies
    this.allDependencies = {};

    // Selected board
    this.selectedBoard = null;
    this.pinoutInputHTML = '';
    this.pinoutOutputHTML = '';

    // TODO: move all constants

  });
