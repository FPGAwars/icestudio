'use strict';

angular.module('icestudio')
  .service('resources', function(utils,
                                 nodePath) {

    const DEFAULT = '';

    this.collections = [];
    this.selectedCollection = null;

    this.loadCollections = function() {
      this.collections = [];
      // Add Default collection
      var defaultPath = nodePath.join('resources', 'collection');
      var defaultData = {
        'name': DEFAULT,
        'path': nodePath.resolve(defaultPath),
        'children': utils.getFilesRecursive(defaultPath)
      };
      var defaultCollection = getCollection(defaultData);
      this.collections.push(defaultCollection);
      // Add installed collections
      var data = utils.getFilesRecursive(utils.COLLECTIONS_DIR);
      for (var i in data) {
        var collection = getCollection(data[i]);
        if (collection) {
          this.collections.push(collection);
        }
      }
    };

    function getCollection(data) {
      var collection = {
        name: data.name,
        path: data.path,
        content: {
          blocks: [],
          examples: [],
          package: {}
        }
      };
      for (var i in data.children) {
        var child = data.children[i];
        switch (child.name) {
          case ('blocks'):
            if (child.children) {
              collection.content.blocks = child.children;
            }
            break;
          case ('examples'):
            if (child.children) {
              collection.content.examples = child.children;
            }
            break;
          case ('locale'):
            if (child.children) {
              collection.content.locale = child.children;
            }
            break;
          case ('package'):
            if (!child.children) {
              // TODO: use package data
              //collection.content.package = require(child.path);
            }
            break;
        }
      }
      return collection;
    }

    this.loadCollections();

    this.selectCollection = function(name) {
      name = name || DEFAULT;
      var selectedCollection = null;
      for (var i in this.collections) {
        if (this.collections[i].name === name) {
          selectedCollection = this.collections[i];
          break;
        }
      }
      if (selectedCollection === null) {
        // Collection not found: select default collection
        selectedCollection = this.collections[0];
      }
      this.selectedCollection = selectedCollection;
      return selectedCollection.name;
    };

  });
