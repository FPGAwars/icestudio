'use strict';

angular.module('icestudio')
  .service('collections', function (utils,
    common,
    profile,
    gettextCatalog,
    nodePath) {

    const DEFAULT = '';
    const MAX_LEVEL_SEARCH = 20;

    this.loadAllCollections = function () {
      this.loadDefaultCollection();
      this.loadInternalCollections();
      this.loadExternalCollections();
    };

    this.loadDefaultCollection = function () {
      common.defaultCollection = getCollection(
        DEFAULT,
        common.DEFAULT_COLLECTION_DIR,
        utils.getFilesRecursive(common.DEFAULT_COLLECTION_DIR, MAX_LEVEL_SEARCH)
      );
    };

    this.loadInternalCollections = function () {
      var internalCollections = utils.findCollections(common.INTERNAL_COLLECTIONS_DIR);
      common.internalCollections = loadCollections(internalCollections);
    };

    this.loadExternalCollections = function () {
      var externalCollectionsPath = profile.get('externalCollections');
      if (externalCollectionsPath !== common.INTERNAL_COLLECTIONS_DIR) {
        var externalCollections = utils.findCollections(externalCollectionsPath);
        common.externalCollections = loadCollections(externalCollections);
      }
    };

    function loadCollections(paths) {
      var collections = [];
      paths.forEach(function (path) {
        collections.push(getCollection(
          nodePath.basename(path),
          path,
          utils.getFilesRecursive(path, MAX_LEVEL_SEARCH)
        ));
      });
      return collections;
    }

    function getCollection(name, path, children) {
      var collection = {
        name: name,
        path: path,
        content: {
          blocks: [],
          examples: [],
          package: {},
          readme: ''
        }
      };
      for (var i in children) {
        var child = children[i];
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
              catch (e) { }
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

    this.selectCollection = function (path) {
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

    this.sort = function () {
      sortCollections([common.defaultCollection]);
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
