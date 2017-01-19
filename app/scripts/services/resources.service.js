'use strict';

angular.module('icestudio')
  .service('resources', function(utils,
                                 nodePath) {

    const DEFAULT = '';
    const COLLECTIONS_DIR = nodePath.join(utils.ICESTUDIO_DIR, 'collections');

    console.log(utils.getFilesRecursive(COLLECTIONS_DIR, '.ice'));

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
      var selectedCollection = null;
      for (var i in this.currentCollections) {
        if (name === this.currentCollections[i].name) {
          selectedCollection = this.currentCollections[i];
          break;
        }
      }
      if (selectedCollection === null) {
        // Collection not found: select default collection
        selectedCollection = this.currentCollections[0];
      }
      this.selectedCollection = selectedCollection;
      return selectedCollection.name;
    };

    this.getCollections = function() {
      return this.currentCollections;
    };

  });
