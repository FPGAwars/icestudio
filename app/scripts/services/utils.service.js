'use strict';

angular.module('icestudio')
    .service('utils', function() {

      this.basename = function(filepath) {
        return filepath.replace(/^.*[\\\/]/, '').split('.')[0];
      };

    });
