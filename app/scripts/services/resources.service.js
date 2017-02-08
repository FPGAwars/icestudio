'use strict';

angular.module('icestudio')
  .service('resources', function(utils,
                                 nodePath) {

    const DEFAULT = '';

    this.selectedCollection = null;
    this.collections = [];

    this.loadCollections = function() {
      /*var defaultPath = nodePath.join('resources', 'blocks');
      var collections = [{
        'name': DEFAULT,
        'path': nodePath.resolve(defaultPath),
        'children': utils.getFilesRecursive(defaultPath, '.ice')
      }];*/
      this.data = utils.getFilesRecursive(utils.COLLECTIONS_DIR);
      for (var i in this.data) {
        var collection = getCollection(this.data[i]);
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

    this.loadExamples = function() {
      this.currentExamples = utils.getFilesRecursive(nodePath.join('resources', 'examples'), '.ice');
    };

    this.loadCollections();
    //this.loadExamples();

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
