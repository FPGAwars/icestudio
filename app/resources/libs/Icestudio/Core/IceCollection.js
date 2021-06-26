'use strict';
/*jshint unused:false*/
class IceCollection {
  constructor(opts) {
    this.constants = {
      defaultCollection: "",
      maxLevelSearch: 20,
    };
    this.config = opts || {};
    this.fs = new IceHD();
  }

  getDefault() {
    return this.get(
      this.constants.defaultCollection,
      this.config.location.default,
      this.fs.getFilesRecursive(
        this.config.location.default,
        this.constants.maxLevelSearch
      )
    );
  }
  getAll(paths) {
    let _this = this;
    let collections = [];
    paths.forEach(function (path) {
      collections.push(
        _this.get(
          _this.fs.basename(path),
          path,
          _this.fs.getFilesRecursive(path, _this.constants.maxLevelSearch)
        )
      );
    });
    return collections;
  }
  get(name, path, children) {
    let collection = {
      name: name,
      path: path,
      content: {
        blocks: [],
        examples: [],
        package: {},
        readme: "",
      },
    };
    for (var i in children) {
      var child = children[i];
      switch (child.name) {
        case "blocks":
          if (child.children) {
            collection.content.blocks = child.children;
          }
          break;
        case "examples":
          if (child.children) {
            collection.content.examples = child.children;
          }
          break;
        case "package":
          if (!child.children) {
            try {
              collection.content.package = require(child.path);
            } catch (e) {}
          }
          break;
        case "README":
          if (!child.children) {
            collection.content.readme = child.path;
          }
          break;
      }
    }
    return collection;
  }

  find(folder) {
    let collectionsPaths = [];
    let _this = this;
    try {
      if (folder) {
        collectionsPaths = this.fs
          .readDir(folder)
          .map(function (name) {
            return _this.fs.joinPath(folder, name);
          })
          .filter(function (path) {
            return (_this.fs.isValidPath(path) &&
              (_this.fs.isDir(path) || _this.fs.isSymbolicLink(path)) &&
              _this.isCollectionPath(path)
            );
          });
      }
    } catch (e) {
      console.warn(e);
    }
    return collectionsPaths;
  }
  contains(array, item) {
    return array.indexOf(item) !== -1;
  }

  isCollectionPath(path) {
    let result = false;

    try {
      result = this.isValid(path);
    } catch (e) {
      console.warn(e);
    }
    return result;
  }

  isValid(path) {
    let content = this.fs.readDir(path);

    return (
      content &&
      this.hasPackageJson(path, content) &&
      (this.hasBlocks(path, content) || this.hasExamples(path, content))
    );
  }

  hasPackageJson(path, content) {
    return (
      this.contains(content, "package.json") &&
      this.fs.isFile(this.fs.joinPath(path, "package.json"))
    );
  }
  hasBlocks(path, content) {
    return (
      this.contains(content, "blocks") &&
      this.fs.isDir(this.fs.joinPath(path, "blocks"))
    );
  }
  hasExamples(path, content) {
    return (
      this.contains(content, "examples") &&
      this.fs.isDir(this.fs.joinPath(path, "examples"))
    );
  }
}
