'use strict';

angular.module('icestudio')
  .service('resources', function(utils,
                                 nodePath) {

    const DEFAULT = 'Default';
    const COLLECTIONS_DIR = nodePath.join(utils.ICESTUDIO_DIR, 'collections');

    this.selectedCollection = null;
    this.currentCollections = loadCollections();

    function loadCollections() {
      var collections = [{
        'name': DEFAULT,
        'children': utils.getFilesRecursive(nodePath.join('resources', 'blocks'), '.ice')
      }];
      collections = collections.concat(utils.getFilesRecursive(COLLECTIONS_DIR, '.ice'));
      return collections;
    }

    this.getExamples = function() {
      return utils.getFilesRecursive(nodePath.join('resources', 'examples'), '.ice', true); // onlyFilepath
    };

    this.getMenuBlocks = function() {
      return utils.getFilesRecursive(nodePath.join('resources', 'blocks'), '.ice');
    };

    this.selectCollection = function(name) {
      name = name || DEFAULT;
      for (var i in this.currentCollections) {
        if (name === this.currentCollections[i].name) {
          this.selectedCollection = this.currentCollections[i];
          break;
        }
      }
    };

    this.getCollections = function() {
      return this.currentCollections;
    };

  });
