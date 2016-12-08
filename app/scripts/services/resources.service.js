'use strict';

angular.module('icestudio')
    .service('resources', ['nodePath', 'utils',
      function(nodePath, utils) {

        this.getExamples = function() {
          return utils.getFilesRecursive(nodePath.join('resources', 'examples'), '.ice');
        }

        this.getMenuBlocks = function() {
          return utils.getFilesRecursive(nodePath.join('resources', 'blocks'), '.iceb');
        }

    }]);
