'use strict';

angular.module('icestudio')
    .service('common', ['$rootScope', 'gettextCatalog', 'window', 'graph', 'boards', 'compiler', 'utils', 'nodePath', 'nodeFs',
      function($rootScope, gettextCatalog, window, graph, boards, compiler, utils, nodePath, nodeFs) {
        // Functions


        this.importBlock = function(filepath) {
          var self = this;
          utils.readFile(filepath, function(data) {
            var block = data;
            if (block) {
              var name = utils.basename(filepath);
              var path = utils.dirname(filepath);
              // 1. Parse and find included files
              var code = JSON.stringify(block);
              var files = utils.findIncludedFiles(code);
              // Are there included files?
              if (files.length > 0) {
                // 2. Check project's directory
                if (self.projectPath) {
                  // 3. Copy the included files
                  copyIncludedFiles(function(success) {
                    if (success) {
                      // 4. Success: import block
                      doImportBlock();
                    }
                  });
                }
                else {
                  alertify.confirm(gettextCatalog.getString('This import operation requires a project path. You need to save the current project. Do you want to continue?'),
                    function() {
                      $rootScope.$emit('saveProjectAs', function() {
                        setTimeout(function() {
                          // 3. Copy the included files
                          copyIncludedFiles(function(success) {
                            if (success) {
                              // 4. Success: import block
                              doImportBlock();
                            }
                          });
                        }, 500);
                      });
                  });
                }
              }
              else {
                // No included files to copy
                // 4. Import block
                doImportBlock();
              }
            }

            function copyIncludedFiles(callback) {
              var success = true;
              async.eachSeries(files, function(filename, next) {
                setTimeout(function() {
                  var origPath = nodePath.join(path, filename);
                  var destPath = nodePath.join(self.projectPath, filename);
                  if (nodeFs.existsSync(destPath)) {
                    alertify.confirm(gettextCatalog.getString('File {{file}} already exists in the project path. Do you want to replace it?', { file: utils.bold(filename) }),
                    function() {
                      success &= doCopySync(origPath, destPath, filename)
                      if (!success) {
                        return next(); // break
                      }
                      next();
                    },
                    function() {
                      next();
                    });
                  }
                  else {
                    success &= doCopySync(origPath, destPath, filename)
                    if (!success) {
                      return next(); // break
                    }
                    next();
                  }
                }, 0);
              }, function(result) {
                return callback(success);
              });
            }

            function doCopySync(orig, dest, filename) {
              var success = utils.copySync(orig, dest, filename);
              if (success) {
                alertify.notify(gettextCatalog.getString('File {{file}} imported', { file: utils.bold(filename) }), 'message', 5);
              }
              else {
                alertify.notify(gettextCatalog.getString('Original file {{file}} does not exist', { file: utils.bold(filename) }), 'error', 30);
              }
              return success;
            }

            function doImportBlock() {
              graph.importBlock(name, block);
              self.project.deps[name] = block;
              alertify.success(gettextCatalog.getString('Block {{name}} imported', { name: utils.bold(name) }));
            }

          });
        };

        this.exportAsBlock = function(filepath) {
          var name = utils.basename(filepath);
          this.sortGraph();
          this.refreshProject();
          // Convert project to block
          var block = angular.copy(this.project);
          delete block.board;
          for (var i in block.graph.blocks) {
            if (block.graph.blocks[i].type == 'basic.input' ||
                block.graph.blocks[i].type == 'basic.output') {
              delete block.graph.blocks[i].data.pin;
            }
          }
          utils.saveFile(filepath, block, function() {
            alertify.success(gettextCatalog.getString('Block exported as {{name}}', { name: utils.bold(name) }));
          }, true);
        };

        this.sortGraph = function() {
          var cells = graph.getCells();

          // Sort cells by x-coordinate
          cells = _.sortBy(cells, function(cell) {
            if (!cell.isLink()) {
              return cell.attributes.position.x;
            }
          });

          // Sort cells by y-coordinate
          cells = _.sortBy(cells, function(cell) {
            if (!cell.isLink()) {
              return cell.attributes.position.y;
            }
          });

          graph.setCells(cells);
        }



        this.clearProject = function() {
          this.project = {
            image: '',
            state: this.project.state,
            board: '',
            graph: {},
            deps: {}
          };
          graph.clearAll();
          graph.breadcrumbs = [{ name: this.projectName }];
          if(!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        };

        this.cloneSelected = function() {
          graph.cloneSelected();
        };

        this.removeSelected = function() {
          var self = this;
          graph.removeSelected(function(type) {
            delete self.project.deps[type];
          });
        };

        this.setImagePath = function(imagePath) {
          this.project.image = imagePath;
        }

        this.updateProjectName = function(name) {
          if (name) {
            this.projectName = name
            if (graph.breadcrumbs.length > 1) {
              graph.breadcrumbs = [{ name: name }];
            }
            graph.breadcrumbs[0].name = name;
            if(!$rootScope.$$phase) {
              $rootScope.$apply();
            }
            window.get().title = name + ' - Icestudio';
          }
        };

        this.addBlock = function(type, block) {
          this.project.deps[type] = block;
          graph.createBlock(type, block);
        }

    }]);
