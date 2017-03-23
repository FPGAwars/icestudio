'use strict';

angular.module('icestudio')
  .service('collections', function(utils,
                                   common,
                                   nodePath) {

    const DEFAULT = '';

    this.loadCollections = function() {
      common.collections = [];
      // Add Default collection
      var defaultPath = nodePath.join('resources', 'collection');
      var defaultData = {
        'name': DEFAULT,
        'path': nodePath.resolve(defaultPath),
        'children': utils.getFilesRecursive(nodePath.resolve(defaultPath))
      };
      var defaultCollection = getCollection(defaultData);
      common.collections.push(defaultCollection);
      // Add installed collections
      var data = utils.getFilesRecursive(common.COLLECTIONS_DIR);
      for (var i in data) {
        var collection = getCollection(data[i]);
        if (collection) {
          common.collections.push(collection);
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
          package: {},
          readme: ''
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
          case ('package'):
            if (!child.children) {
              // TODO: use package data
              //collection.content.package = require(child.path);
            }
            break;
          case ('README'):
            if (!child.children) {
              collection.content.readme = child.path;
            }
            break;
        }
      }
      return collection;
    }

    this.selectCollection = function(name) {
      name = name || DEFAULT;
      var selectedCollection = null;
      for (var i in common.collections) {
        if (common.collections[i].name === name) {
          selectedCollection = common.collections[i];
          break;
        }
      }
      if (selectedCollection === null) {
        // Collection not found: select default collection
        selectedCollection = common.collections[0];
      }
      common.selectedCollection = selectedCollection;
      return selectedCollection.name;
    };

  });
