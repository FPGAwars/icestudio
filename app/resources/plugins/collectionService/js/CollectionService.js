class CollectionService {
  constructor() {
    this.indexQ = [];
    this.indexing = false;
    this.id = -1;
  }
  init() {

    iceStudio.bus.events.subscribe("block.loadedFromFile", "blockContentLoaded", this);
  }
  setId(id) {
    this.id = id;
  }
  blockContentLoaded(args) {
    console.log('BLOCK CARGADO', args);
    return;

    if (
      typeof this.assetsDB.db !== "boolean" &&
      this.assetsDB.db !== false &&
      this.assetsDB.db !== null
    ) {
      args.obj.path = args.path;
      this.indexBlock(args.blockId, args.obj);
    } else {
      let _this = this;
      setTimeout(function () {
        _this.blockContentLoaded(args);
      }, 1000);
    }
  }
  indexBlock(id, obj) {
    let _this = this;
    if (
      typeof obj !== "undefined" &&
      obj !== false &&
      obj !== false &&
      typeof obj.package !== "undefined" &&
      typeof obj.package.description !== "undefined" && // typoeof undefined
      typeof obj.package.name !== "undefined" &&        // typoeof undefined
      typeof obj.package.image !== "undefined" &&       // typoeof undefined

      obj.package.description !== null &&     // null
      obj.package.name !== null &&            // null
      obj.package.image !== null &&           // null

      // PERMISSIVE WITH EMPTY FIELDS like ""
      obj.package.description.length >= 0 &&  // empty
      obj.package.name.length >= 0 &&         // empty
      obj.package.image.length >= 0           // empty
    ) {
      let transaction = this.assetsDB.db.transaction(
        ["blockAssets"],
        "readwrite"
      );

      transaction.onerror = function (event) {
        console.log(
          "There has been an error with retrieving your data: " +
          transaction.error
        );
      };

      transaction.oncomplete = function (event) { };
      let store = transaction.objectStore("blockAssets");
      let item = {
        id: id,
        description: obj.package.description,
        name: obj.package.name,
        icon: obj.package.image,
        path: obj.path,
      };

      let request = store.put(item);

      request.onerror = function (event) {
        if (request.error.name == "ConstraintError") {
          event.preventDefault(); // don't abort the transaction
        } else {
          // unexpected error, can't handle it
          // the transaction will abort
        }
      };

      request.onsuccess = function (e) {
        _this.indexQ.splice(0, 1);
        if (_this.indexQ.length > 0) {
          _this.indexDB(true);
        } else {
          _this.indexing = false;
        }
      };
    } else {
      _this.indexQ.splice(0, 1);
      if (_this.indexQ.length > 0) {
        _this.indexDB(true);
      } else {
        _this.indexing = false;
      }
    }
  }

  indexDB(force) {
    force = force || false;
    if ((this.indexing === false && this.indexQ.length > 0) || force) {
      this.indexing = true;
      console.log('INDEXDB::BLOCK', this.indexQ[0]);
      iceStudio.bus.events.publish("block.loadFromFile", this.indexQ[0]);
    }
  }
  queueIndexDB(params) {
    console.log('queueIndexDB', params);
    params.dispatch = false;
    this.indexQ.push(params);
    this.indexDB();
  }

  buildTreeBlocks(child, rootPath) {
    if (typeof child.children !== "undefined") {
      let node = {
        name: child.name,
        isFolder: true,
        isLeaf: false,
        hasSubFolders: false,
        items: [],
        opened: false,
        id: this.nodeHash(`${rootPath}${child.name}`),
      };

      for (let i = 0; i < child.children.length; i++) {
        node.items.push(this.buildTreeBlocks(child.children[i], rootPath));
        if (node.items[node.items.length - 1].isFolder === false) {
          this.queueIndexDB({
            id: this.id,
            blockId: node.items[node.items.length - 1].id,
            path: node.items[node.items.length - 1].path,
          });
        }
      } //-- for child.children.length

      if (this.hasSubFolders(node)) node.hasSubFolders = true;

      return node;
    } else {
      return {
        id: this.nodeHash(child.path),
        path: child.path,
        name: child.name,
        isLeaf: true,
        isFolder: false,
      };
    }
  }
  hasSubFolders(tree) {
    if (typeof tree.items !== "undefined") {
      for (let i = 0; i < tree.items.length; i++) {
        if (tree.items[i].isFolder === true) {
          return true;
        }
      }
    }
    return false;
  }

  buildTreeFromCollection(node) {
    let tree = [];

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        tree.push(this.buildTreeFromCollection(node[i]));
      }
      return tree;
    } else {
      if (typeof node.content !== "undefined") {
        let root = {
          items: [],
          isFolder: true,
          name: node.name,
          path: node.path,
          id: this.nodeHash(node.path),
          opened: false,
          isLeaf: false,
          hasSubFolders: false,
        };

        for (let i = 0; i < node.content.blocks.length; i++) {
          root.items.push(
            this.buildTreeBlocks(node.content.blocks[i], node.path)
          );
        }
        if (root.items.length > 0) root.hasSubFolders = true;
        return root;
      }
    }
  }

  collectionsToTree(collArray) {
    this.guiOpts = false;
    collArray.sort(function compare(a, b) {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      }
      return 0;
    });

    return this.buildTreeFromCollection(collArray);
  }

  nodeHash(text) {
    return sha256.hex(text);
  }
}