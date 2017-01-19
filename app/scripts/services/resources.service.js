'use strict';

angular.module('icestudio')
  .service('resources', function(utils,
                                 nodePath) {

    const DEFAULT = '';

    this.selectedCollection = null;
    this.currentCollections = [];

    this.loadCollections = function() {
      var collections = [{
        'name': DEFAULT,
        'children': utils.getFilesRecursive(nodePath.join('resources', 'blocks'), '.ice')
      }];
      this.currentCollections = collections.concat(utils.getFilesRecursive(utils.COLLECTIONS_DIR, '.ice'));
    };

    this.loadCollections();

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

  });
