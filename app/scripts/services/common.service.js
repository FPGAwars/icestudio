'use strict';

angular.module('icestudio')
    .service('common', ['$rootScope', 'gettextCatalog', 'window', 'graph', 'boards', 'compiler', 'utils', 'nodePath', 'nodeFs',
      function($rootScope, gettextCatalog, window, graph, boards, compiler, utils, nodePath, nodeFs) {

        // Variables

        this.project = {
          image: '',
          state: null,
          board: '',
          graph: {},
          deps: {}
        };
        this.projectName = '';
        this.projectPath = '';

        // Functions

        this.setProjectPath = function(path) {
          this.projectPath = path;
        }

        this.newProject = function(name) {
          this.project = {
            image: '',
            state: null,
            board: '',
            graph: {},
            deps: {}
          };
          graph.clearAll();
          graph.setState(this.project.state);
          this.updateProjectName(name);
          alertify.success(gettextCatalog.getString('New project {{name}} created', { name: utils.bold(name) }));
        };

        this.openProject = function(filepath) {
          var self = this;
          utils.readFile(filepath, function(data) {
            var project = data;
            if (project) {
              var name = utils.basename(filepath);
              self.loadProject(name, project);
            }
          });
        };

        this.loadProject = function(name, project) {
          this.updateProjectName(name);
          this.project = project;
          boards.selectBoard(project.board);
          if (graph.loadGraph(project)) {
            alertify.success(gettextCatalog.getString('Project {{name}} loaded', { name: utils.bold(name) }));
          }
          else {
            alertify.notify(gettextCatalog.getString('Wrong project format: {{name}}', { name: utils.bold(name) }), 'error', 30);
          }
          $rootScope.$apply();
        };

        this.saveProject = function(filepath) {
          var name = utils.basename(filepath);
          this.updateProjectName(name);
          this.refreshProject();
          utils.saveFile(filepath, this.project, function() {
            alertify.success(gettextCatalog.getString('Project {{name}} saved', { name: utils.bold(name) }));
          }, true);
        };

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

        this.exportVerilog = function(filepath) {
          var name = utils.basename(filepath);
          this.refreshProject();
          // Generate verilog code from project
          var verilog = compiler.generateVerilog(this.project);
          utils.saveFile(filepath, verilog, function() {
            alertify.success(gettextCatalog.getString('Verilog code exported'));
          }, false);
        };

        this.exportPCF = function(filepath) {
          var name = utils.basename(filepath);
          this.refreshProject();
          // Generate pcf code from project
          var pcf = compiler.generatePCF(this.project);
          utils.saveFile(filepath, pcf, function() {
            alertify.success(gettextCatalog.getString('PCF file exported'));
          }, false);
        };

        this.exportTestbench = function(filepath) {
          var name = utils.basename(filepath);
          this.refreshProject();
          // Generate testbench code from project
          var testbench = compiler.generateTestbench(this.project);
          utils.saveFile(filepath, testbench, function() {
            alertify.success(gettextCatalog.getString('Testbench exported'));
          }, false);
        };

        this.exportGTKWave = function(filepath) {
          var name = utils.basename(filepath);
          this.refreshProject();
          // Generate gtkwave code from project
          var gtkwave = compiler.generateGTKWave(this.project);
          utils.saveFile(filepath, gtkwave, function() {
            alertify.success(gettextCatalog.getString('GTKWave exported'));
          }, false);
        };

        this.refreshProject = function(callback) {
          var graphData = graph.toJSON();

          var blocks = [];
          var wires = [];

          for (var c = 0; c < graphData.cells.length; c++) {
            var cell = graphData.cells[c];

            if (cell.type == 'ice.Generic' ||
                cell.type == 'ice.Input' ||
                cell.type == 'ice.Output' ||
                cell.type == 'ice.Code' ||
                cell.type == 'ice.Info' ||
                cell.type == 'ice.Constant') {
              var block = {};
              block.id = cell.id;
              block.type = cell.blockType;
              block.data = cell.data;
              block.position = cell.position;
              if (cell.type == 'ice.Code') {
                block.data.code = graph.getContent(cell.id);
              }
              else if (cell.type == 'ice.Info') {
                block.data.info = graph.getContent(cell.id);
              }
              blocks.push(block);
            }
            else if (cell.type == 'ice.Wire') {
              var wire = {};
              wire.source = { block: cell.source.id, port: cell.source.port };
              wire.target = { block: cell.target.id, port: cell.target.port };
              wire.vertices = cell.vertices;
              wires.push(wire);
            }
          }

          this.project.state = graph.getState();

          this.project.board = boards.selectedBoard.name;

          this.project.graph = { blocks: blocks, wires: wires };

          if (callback)
            callback();
        };

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
