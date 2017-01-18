'use strict';

angular.module('icestudio')
  .service('resources', function(utils,
                                 nodePath) {

    this.getExamples = function() {
      return utils.getFilesRecursive(nodePath.join('resources', 'examples'), '.ice', true); // onlyFilepath
    };

    this.getMenuBlocks = function() {
      return utils.getFilesRecursive(nodePath.join('resources', 'blocks'), '.ice');
    };

  });
