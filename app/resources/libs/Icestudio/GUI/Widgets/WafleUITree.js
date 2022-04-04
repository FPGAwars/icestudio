"use strict";
/*jshint unused:false*/
class WafleUITree {
 constructor(opts) {
    this.config = opts || {};
    if (typeof this.config.dbVersion === "undefined") this.config.dbVersion = 1;
    this.vtree = {};
    this.groupBlocks = [];
    this.renderer = new WafleTemplate();
    this.id = -1;
    //ebus.subscribe("block.loadedFromFile", "blockContentLoaded", this);
  }

  setId(id) {
    this.id = id;
  }
  setTree(tree){
    this.vtree=tree;
  }
  render()
  {
    return (this.vtree===false)? '' : this.renderer.render (this.tpl(), {
      tree: this.vtree,
    });
    
  }

  tpl()
  {
    return `<div id="tree-view-root" class="tree-view">
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
  }
}

