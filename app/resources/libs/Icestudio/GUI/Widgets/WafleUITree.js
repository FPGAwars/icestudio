"use strict";
/*jshint unused:false*/
class WafleUITree {
  constructor(opts) {
    this.config = opts || {};
    this.vtree = {};
    this.groupBlocks = [];
    this.guiOpts = false;
    this.renderer = new IceTemplateSystem();
    this.id = -1;
    ebus.subscribe("block.loadedFromFile", "blockContentLoaded", this);
  }

  setId(id) {
    this.id = id;
  }

   render(opts) {
    this.guiOpts = false;
    if (typeof opts !== "undefined") this.guiOpts = opts;
    let tpl = `<div id="tree-view-root" class="tree-view">
              {{#tree}}
                {{#isFolder}}
                  <div class="tree-view-main--folder tree-view--folder closed" data-nodeid="{{{id}}}">
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

    const tree = (typeof opts.vtree !== 'undefined') ? opts.vtree : this.vtree;
    
    this.guiOpts.content = this.renderer.render("tree", tpl, {
      tree: tree,
    });
    
    gui.publish("updateEl", this.guiOpts);
  }

  getBlock(opts, args) {
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

    var request = store.get(args.id);
    request.onerror = function (event) {
      // Handle errors!
    };
    request.onsuccess = function (event) {
      ebus.publish("block.addFromFile", request.result.path);
    };
    this.setInUse(opts, args.id);
  }

  setInUse(opts, blockId) {
    this.guiOpts = opts;
    //  let search = this.toggleFolderState(this.vtree, folder);
    // if (search) {
    this.guiOpts.el = `.tree-view--leaf[data-nodeid="${blockId}"]`;
    this.guiOpts.elClass = "is-in-use";
    gui.publish("gbusAddClass", this.guiOpts);
    this.guiOpts.parentClass = "tree-view--folder";
    this.guiOpts.parentRoot = "#tree-view-root";
    gui.publish("gbusAddClassToParents", this.guiOpts);

    // }
  }
  toggle(opts, folder) {
    this.guiOpts = opts;
    let search = this.toggleFolderState(this.vtree, folder);
    if (search) {
      this.guiOpts.el = `.tree-view--folder[data-nodeid="${folder}"]`;
      this.guiOpts.elClass = "closed";
      gui.publish("gbusToggleClass", this.guiOpts);
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

  toggleFolderState(tree, folder) {
    if (Array.isArray(tree)) {
      for (let i = 0; i < tree.length; i++) {
        if (tree[i].id === folder) {
          tree[i].opened = tree[i].opened ? false : true;
          return tree[i];
        }
        let tmp = this.toggleFolderState(tree[i], folder);
        if (tmp !== false) return tmp;
      }
    } else {
      if (tree.isFolder === true) {
        if (tree.id === folder) {
          tree.opened = tree.opened ? false : true;
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
}

