class CollectionService {
  constructor() {
    this.indexQ = [];
    this.indexing = false;
    this.id = -1;
  }
  init() {

    iceStudio.bus.events.subscribe("block.loadedFromFile", "blockContentLoaded", this);
    iceStudio.bus.events.subscribe("localDatabase.stored", "blockIndexedOK", this);
  }
  setId(id) {
    this.id = id;
  }
  blockInQueue(blkid) {
    let qlength = this.indexQ.length - 1;
    while (qlength > -1) {
      if (this.indexQ[qlength].blockId === blkid) {
        return true;
      }
      qlength--;
    }
    return false;
  }

  blockContentLoaded(args) {

    if (this.blockInQueue(args.blockId)) {
      args.obj.path = args.path;
      this.indexBlock(args.blockId, args.obj);
    }
  }

  isBlockValidForIndex(obj) {
    return (typeof obj !== "undefined" &&
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
    );
  }

  indexBlock(id, obj) {

    console.log('BLOCK INDEXANDO', id, obj);

    let _this = this;
    if (this.isBlockValidForIndex(obj)) {

      let item = {
        id: id,
        description: obj.package.description,
        name: obj.package.name,
        icon: obj.package.image,
        path: obj.path,
        store:'blockAssets'
      };

      let transaction = {
        database: {dbId:'Collections',
        storages:['blockAssets','tests'],'version':1},
        data: item
      };

      iceStudio.bus.events.publish("localDatabase.store", transaction);
    } else {
      this.indexNext();
    }
  }
  blockIndexedOK(item){
    if(item.database.dbId==='Collections' &&
       item.data.store==='blockAssets' &&
    this.blockInQueue(item.data.id)){
      this.indexNext();
    }
  }
  indexNext() {
    if (this.indexing) {
      this.indexQ.splice(0, 1);
      if (this.indexQ.length > 0) {
        this.indexDB(true);
      } else {
        this.indexing = false;
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