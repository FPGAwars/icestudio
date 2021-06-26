'use strict';
/*jshint unused:false*/
class IceGuiTree {

  constructor(opts) {
    this.config = opts || {};
    if (typeof this.config.dbVersion === 'undefined') this.config.dbVersion = 1;
    this.vtree = {};
    this.groupBlocks = [];
    this.guiOpts = false;
    this.renderer = new IceTemplateSystem();
    this.assetsDB = { db: false };
    this.indexQ = [];
    this.indexing = false;
    this.openAssetsDatabase();
    this.id = -1;
    ebus.subscribe('block.loadedFromFile', 'blockContentLoaded', this);
  }

  setId(id) {
    this.id = id;
  }

  openAssetsDatabase() {
    let _this = this;
    this.assetsDB.openRequest = indexedDB.open('Collections', this.config.dbVersion);
    this.assetsDB.openRequest.onupgradeneeded = function (e) {
      var db = e.target.result;

      if (!db.objectStoreNames.contains('blockAssets')) {
        let assetsOS = db.createObjectStore('blockAssets', { keyPath: 'id' });
        assetsOS.createIndex('id', 'id', { unique: true });
      }
    };

    this.assetsDB.openRequest.onsuccess = function (e) {
      _this.assetsDB.db = e.target.result;
    };
  }

  render(opts) {
    this.guiOpts = false;
    if (typeof opts !== 'undefined') this.guiOpts = opts;
    let tpl = `<div id="tree-view-root" class="tree-view">
              {{#tree}}
                {{#isFolder}}
                  <div class="tree-view--folder closed" data-nodeid="{{{id}}}">
                    <span class="tree-view--folder-name {{#hasSubFolders}}tree-view--folder-subfolders{{/hasSubFolders}}"  data-guievt="click" data-handler="treeView.toggleFolder" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                    {{#items}}
                      {{#isFolder}}
                          <div class="tree-view--folder closed" data-nodeid="{{{id}}}">
                            <span class="tree-view--folder-name {{#hasSubFolders}}tree-view--folder-subfolders{{/hasSubFolders}}"  data-guievt="click" data-handler="treeView.toggleFolder" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                            {{#items}}
                                {{#isFolder}}
                                  <div class="tree-view--folder closed" data-nodeid="{{{id}}}">
                                    <span class="tree-view--folder-name {{#hasSubFolders}}tree-view--folder-subfolders{{/hasSubFolders}}"  data-guievt="click" data-handler="treeView.toggleFolder" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                                    {{#items}}
                                      {{#isFolder}}
                                        <div class="tree-view--folder closed" data-nodeid="{{{id}}}">
                                          <span class="tree-view--folder-name {{#hasSubFolders}}tree-view--folder-subfolders{{/hasSubFolders}}"  data-guievt="click" data-handler="treeView.toggleFolder" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                                          {{#items}}
                                            {{#isFolder}}
                                              <div class="tree-view--folder closed" data-nodeid="{{{id}}}">
                                                  <span class="tree-view--folder-name {{#hasSubFolders}}tree-view--folder-subfolders{{/hasSubFolders}}"  data-guievt="click" data-handler="treeView.toggleFolder" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                                                  {{#items}}
                                                    {{#isFolder}}
                                                      <div class="tree-view--folder closed" data-nodeid="{{{id}}}">
                                                        <span class="tree-view--folder-name {{#hasSubFolders}}tree-view--folder-subfolders{{/hasSubFolders}}"  data-guievt="click" data-handler="treeView.toggleFolder" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                                                        {{#items}}
                                                          {{#isFolder}}
                                                            <div class="tree-view--folder closed" data-nodeid="{{{id}}}">
                                                              <span class="tree-view--folder-name {{#hasSubFolders}}tree-view--folder-subfolders{{/hasSubFolders}}"  data-guievt="click" data-handler="treeView.toggleFolder" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                                                              {{#items}}
                                                                {{#isFolder}}
                                                                  <div class="tree-view--folder closed" data-nodeid="{{{id}}}">
                                                                    <span class="tree-view--folder-name {{#hasSubFolders}}tree-view--folder-subfolders{{/hasSubFolders}}"  data-guievt="click" data-handler="treeView.toggleFolder" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                                                                  </div>
                                                                {{/isFolder}}
                                                                {{#isLeaf}}
                                                                <span class="tree-view--leaf" data-nodeid="{{{id}}}"  data-guievt="click" data-handler="treeView.getBlock" data-args='{"id":"{{{id}}}"}'><i class="block-icon"></i><input type="checkbox"  data-guievt="checkbox" data-handler="treeView.selectBlock" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                                                              {{/isLeaf}}    
                                                              {{/items}}       
                                                            </div>
                                                          {{/isFolder}}
                                                          {{#isLeaf}}
                                                          <span class="tree-view--leaf" data-nodeid="{{{id}}}"  data-guievt="click" data-handler="treeView.getBlock" data-args='{"id":"{{{id}}}"}'><i class="block-icon"></i><input type="checkbox"  data-guievt="checkbox" data-handler="treeView.selectBlock" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                                                        {{/isLeaf}}    
                                                        {{/items}}        
                                                      </div>
                                                    {{/isFolder}}
                                                    {{#isLeaf}}
                                                    <span class="tree-view--leaf" data-nodeid="{{{id}}}"  data-guievt="click" data-handler="treeView.getBlock" data-args='{"id":"{{{id}}}"}'><i class="block-icon"></i><input type="checkbox"  data-guievt="checkbox" data-handler="treeView.selectBlock" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                                                  {{/isLeaf}}    
                                                  {{/items}}           
                                              </div>
                                            {{/isFolder}}
                                            {{#isLeaf}}
                                            <span class="tree-view--leaf" data-nodeid="{{{id}}}"  data-guievt="click" data-handler="treeView.getBlock" data-args='{"id":"{{{id}}}"}'><i class="block-icon"></i><input type="checkbox"  data-guievt="checkbox" data-handler="treeView.selectBlock" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                                          {{/isLeaf}}    
                                          {{/items}}            
                                        </div>
                                      {{/isFolder}}
                                      {{#isLeaf}}
                                      <span class="tree-view--leaf" data-nodeid="{{{id}}}"  data-guievt="click" data-handler="treeView.getBlock" data-args='{"id":"{{{id}}}"}'><i class="block-icon"></i><input type="checkbox"  data-guievt="checkbox" data-handler="treeView.selectBlock" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                                    {{/isLeaf}}    
                                    {{/items}}
                                  </div>
                                {{/isFolder}}
                                {{#isLeaf}}
                                <span class="tree-view--leaf" data-nodeid="{{{id}}}"  data-guievt="click" data-handler="treeView.getBlock" data-args='{"id":"{{{id}}}"}'><i class="block-icon"></i><input type="checkbox"  data-guievt="checkbox" data-handler="treeView.selectBlock" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                              {{/isLeaf}}    
                                {{/items}}
                          </div>
                      {{/isFolder}}
                      {{#isLeaf}}
                        <span class="tree-view--leaf" data-nodeid="{{{id}}}"  data-guievt="click" data-handler="treeView.getBlock" data-args='{"id":"{{{id}}}"}'><i class="block-icon"></i><input type="checkbox"  data-guievt="checkbox" data-handler="treeView.selectBlock" data-args='{"id":"{{{id}}}"}'>{{{name}}}<i class="in-use"></i></span>
                      {{/isLeaf}}    
                     {{/items}}
                  </div>
                {{/isFolder}}
              {{/tree}}
            </div>
            <div class="blocks-view">
              <div class="blocks-loader">
                <div class="blocks-loader--progress"></div>
              </div>
              <div class="blocks-db"></div>
              </div>`;
    this.guiOpts.content = this.renderer.render('tree', tpl, { tree: this.vtree });
    gui.publish('updateEl', this.guiOpts);
  }

  getBlock(opts, args) {

    let transaction = this.assetsDB.db.transaction(['blockAssets'], 'readwrite');

    transaction.onerror = function (event) {
      console.log("There has been an error with retrieving your data: " + transaction.error);
    };

    transaction.oncomplete = function (event) { };
    let store = transaction.objectStore('blockAssets');

    var request = store.get(args.id);
    request.onerror = function (event) {
      // Handle errors!
    };
    request.onsuccess = function (event) {
      ebus.publish('block.addFromFile', request.result.path);
    };
    this.setInUse(opts,args.id);
  }

  setInUse(opts,blockId){
    this.guiOpts = opts;
  //  let search = this.toggleFolderState(this.vtree, folder);
   // if (search) {
      this.guiOpts.el = `.tree-view--leaf[data-nodeid="${blockId}"]`;
      this.guiOpts.elClass = 'is-in-use';
      gui.publish('gbusAddClass', this.guiOpts);
      this.guiOpts.parentClass='tree-view--folder';
      this.guiOpts.parentRoot='#tree-view-root';
      gui.publish('gbusAddClassToParents', this.guiOpts);
      
   // }
  
  }



  toggle(opts, folder) {
    this.guiOpts = opts;
    let search = this.toggleFolderState(this.vtree, folder);
    if (search) {
      this.guiOpts.el = `.tree-view--folder[data-nodeid="${folder}"]`;
      this.guiOpts.elClass = 'closed';
      gui.publish('gbusToggleClass', this.guiOpts);
    }
  }

 

  hasSubFolders(tree) {

    if (typeof tree.items !== 'undefined') {
      for (let i = 0; i < tree.items.length; i++) {
        if (tree.items[i].isFolder === true) {
          return true;
        }
      }
    }
    return false;
  }

  toggleFolderState(tree, folder) {

    if (Array.isArray(tree)) {
      for (let i = 0; i < tree.length; i++) {
        if (tree[i].id === folder) {
          tree[i].opened = (tree[i].opened) ? false : true;
          return tree[i];
        }
        let tmp = this.toggleFolderState(tree[i], folder);
        if (tmp !== false) return tmp;
      }
    } else {
      if (tree.isFolder === true) {
        if (tree.id === folder) {
          tree.opened = (tree.opened) ? false : true;
          return tree;
        }
        for (let j = 0; j < tree.items.length; j++) {
          let tmp2 = this.toggleFolderState(tree.items[j], folder);
          if (tmp2 !== false) return tmp2;
        }
      }
    }
    return false;
  }

  collectionsToTree(collArray, updatingOpts) {
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
    if (typeof updatingOpts !== 'undefined') {
      this.guiOpts = updatingOpts;
    }
    this.vtree = this.buildTreeFromCollection(collArray);
  }

  nodeHash(text) {
    return sha256.hex(text);
  }

  blockContentLoaded(args) {
    if (typeof this.assetsDB.db !== 'boolean' &&
      this.assetsDB.db !== false &&
      this.assetsDB.db !== null) {
      args.obj.path = args.path;
      this.indexBlock(args.blockId, args.obj);
    } else {
      let _this = this;
      setTimeout(function () {
        _this.blockContentLoaded(args);
      }, 1000);

    }
  }

  afterIndexingDB(callback) {

    if (this.indexQ.length === 0 && this.indexing === false) {
      callback();
    } else {
      let _this = this;
      setTimeout(function () {
        _this.afterIndexingDB(callback);
      }, 1000);
    }
  }

  indexBlock(id, obj) {
    let _this = this;
    if (typeof obj !== 'undefined' &&
        obj !== false && obj !== false &&
        typeof obj.package !== 'undefined' &&
      typeof obj.package.image !== 'undefined' &&
      typeof obj.package.description !== 'undefined' &&
      typeof obj.package.name != 'undefined' &&
      obj.package.description !== null && obj.package.description.length > 0 &&
      obj.package.name !== null && obj.package.name.length > 0 &&
      obj.package.image !== null && obj.package.image.length > 0

    ) {

      let transaction = this.assetsDB.db.transaction(['blockAssets'], 'readwrite');

      transaction.onerror = function (event) {
        console.log("There has been an error with retrieving your data: " + transaction.error);
      };

      transaction.oncomplete = function (event) { };
      let store = transaction.objectStore('blockAssets');
      let item = {
        id: id,
        description: obj.package.description,
        name: obj.package.name,
        icon: obj.package.image,
        path: obj.path
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
      ebus.publish('block.loadFromFile', this.indexQ[0]);
    }
  }

  queueIndexDB(params) {
    params.dispatch = false;
    this.indexQ.push(params);
    this.indexDB();
  }

  buildTreeBlocks(child, rootPath) {
    if (typeof child.children !== 'undefined') {

      let node = { name: child.name, isFolder: true, isLeaf: false, hasSubFolders: false, items: [], opened: false, id: this.nodeHash(`${rootPath}${child.name}`) };

      for (let i = 0; i < child.children.length; i++) {

        node.items.push(this.buildTreeBlocks(child.children[i], rootPath));
        if (node.items[node.items.length - 1].isFolder === false) {
          this.queueIndexDB({ id: this.id, blockId: node.items[node.items.length - 1].id, path: node.items[node.items.length - 1].path });
        }

      } //-- for child.children.length

      if (this.hasSubFolders(node)) node.hasSubFolders = true;

      return node;

    } else {
       return { id: this.nodeHash(child.path), path: child.path, name: child.name, isLeaf: true, isFolder: false };
    }
  }

  buildTreeFromCollection(node) {
    let tree = [];

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {

        tree.push(this.buildTreeFromCollection(node[i]));
      }
      return tree;

    } else {
      if (typeof node.content !== 'undefined') {
        let root = {
          items: [],
          isFolder: true,
          name: node.name,
          path: node.path,
          id: this.nodeHash(node.path),
          opened: false,
          isLeaf: false,
          hasSubFolders: false
        };

        for (let i = 0; i < node.content.blocks.length; i++) {
          root.items.push(this.buildTreeBlocks(node.content.blocks[i], node.path));
        }
        if (root.items.length > 0) root.hasSubFolders = true;
        return root;
      }
    }
  }
}