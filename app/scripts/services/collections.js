'use strict';

angular.module('icestudio')
  .service('collections', function(utils,
                                   common,
                                   profile,
                                   gettextCatalog,
                                   nodePath) {

    const DEFAULT = '';
    const MAX_LEVEL_SEARCH = 5;

    var addedCollections = [];

    this.loadCollections = function() {
      addedCollections = [];
      common.collections = [];
      // Add Default collection
      var defaultPath = nodePath.join('resources', 'collection');
      var defaultData = {
        'name': DEFAULT,
        'path': nodePath.resolve(defaultPath),
        'children': utils.getFilesRecursive(nodePath.resolve(defaultPath), MAX_LEVEL_SEARCH)
      };
      var defaultCollection = getCollection(defaultData);
      common.collections.push(defaultCollection);
      // Add installed collections
      loadCollectionsPath(common.COLLECTIONS_DIR);
      // Add external collection
      loadCollectionsPath(profile.get('externalCollections'));
    };

    function loadCollectionsPath(path) {
      var data = utils.getFilesRecursive(path, MAX_LEVEL_SEARCH);
      for (var i in data) {
        if (addedCollections.indexOf(data.path) === -1) {
          var collection = getCollection(data[i]);
          if (isCollection(collection)) {
            addedCollections.push(collection.path);
            common.collections.push(collection);
          }
        }
      }
    }

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
          case 'blocks':
            if (child.children) {
              collection.content.blocks = child.children;
            }
            break;
          case 'examples':
            if (child.children) {
              collection.content.examples = child.children;
            }
            break;
          case 'package':
            if (!child.children) {
              try {
                collection.content.package = require(child.path);
              }
              catch (e) {}
            }
            break;
          case 'README':
            if (!child.children) {
              collection.content.readme = child.path;
            }
            break;
        }
      }
      return collection;
    }

    function isCollection(collection) {
      return collection &&
             collection.content &&
             collection.content.readme &&
             collection.content.package &&
             (collection.content.blocks.length || collection.content.examples.length);
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

    this.sort = function() {
      for (var i in common.collections) {
        var collection = common.collections[i];
        if (collection.content) {
          _sort(collection.content.blocks);
          _sort(collection.content.examples);
        }
      }
    };

    function _sort(items) {
      if (items) {
        items.sort(byName);
        for (var i in items) {
          _sort(items[i].children);
        }
      }
    }

    function byName(a, b) {
      a = gettextCatalog.getString(a.name);
      b = gettextCatalog.getString(b.name);
      if (a > b) {
        return 1;
      }
      if (a < b) {
        return -1;
      }
      return 0;
    }

  });
