'use strict';

angular.module('icestudio')
  .service('collections', function(utils,
                                   common,
                                   profile,
                                   gettextCatalog,
                                   nodePath) {

    const DEFAULT = '';
    const MAX_LEVEL_SEARCH = 5;

    this.loadCollections = function() {
      // Add Default collection
      var defaultPath = nodePath.join('resources', 'collection');
      var defaultData = {
        'name': DEFAULT,
        'path': nodePath.resolve(defaultPath),
        'children': utils.getFilesRecursive(nodePath.resolve(defaultPath), MAX_LEVEL_SEARCH)
      };
      common.defaultCollection = getCollection(defaultData);
      // Add installed collections
      common.internalCollections = loadCollectionsPath(common.COLLECTIONS_DIR);
      // Add external collection
      var externalCollections = profile.get('externalCollections');
      if (externalCollections !== common.COLLECTIONS_DIR) {
        common.externalCollections = loadCollectionsPath(externalCollections);
      }
    };

    function loadCollectionsPath(path) {
      var collections = [];
      var data = utils.getFilesRecursive(path, MAX_LEVEL_SEARCH);
      for (var i in data) {
        var collection = getCollection(data[i]);
        if (isCollection(collection)) {
          collections.push(collection);
        }
      }
      return collections;
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

    this.selectCollection = function(path) {
      var selectedCollection = null;
      var collections = common.internalCollections.concat(common.externalCollections);
      for (var i in collections) {
        if (collections[i].path === path) {
          selectedCollection = collections[i];
          break;
        }
      }
      if (selectedCollection === null) {
        // Collection not found: select default collection
        selectedCollection = common.defaultCollection;
      }
      common.selectedCollection = selectedCollection;
      return selectedCollection.path;
    };

    this.sort = function() {
      sortCollections(common.internalCollections);
      sortCollections(common.externalCollection);
    };

    function sortCollections(collections) {
      for (var i in collections) {
        var collection = collections[i];
        if (collection.content) {
          sortContent(collection.content.blocks);
          sortContent(collection.content.examples);
        }
      }
    }

    function sortContent(items) {
      if (items) {
        items.sort(byName);
        for (var i in items) {
          sortContent(items[i].children);
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
