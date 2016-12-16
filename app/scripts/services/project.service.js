'use strict';

angular.module('icestudio')
  .service('project', function($rootScope,
                               graph,
                               boards,
                               compiler,
                               utils,
                               gettextCatalog,
                               nodeFs,
                               nodePath) {

    this.name = '';  // Used in File dialogs
    this.path = '';  // Used in Save / Save as
    this.project = _default();

    function _default() {
      return {
        version: '1.0',
        package: {
          name: '',
          version: '',
          description: '',
          author: '',
          image: ''
        },
        design: {
          board: '',
          graph: { blocks: [], wires: [] },
          deps: {},
          state: { pan: { x: 0, y: 0 }, zoom: 1.0 }
        }
      };
    }

    this.new = function(name) {
      this.path = '';
      this.project = _default();
      this.updateName(name);

      graph.clearAll();
      graph.setState(this.project.design.state);

      alertify.success(gettextCatalog.getString('New project {{name}} created', { name: utils.bold(name) }));
    };

    this.open = function(filepath) {
      var self = this;
      this.path = filepath;
      utils.readFile(filepath, function(data) {
        if (data) {
          var name = utils.basename(filepath);
          self.load(name, data);
        }
      });
    };

    this.load = function(name, data) {
      this.project = _safeLoad(data);
      var ret = graph.loadDesign(this.project.design, false, function() {
        alertify.success(gettextCatalog.getString('Project {{name}} loaded', { name: utils.bold(name) }));
      });

      if (ret) {
        boards.selectBoard(this.project.design.board);
        this.updateName(name);
      }
      else {
        alertify.notify(gettextCatalog.getString('Wrong project format: {{name}}', { name: utils.bold(name) }), 'error', 30);
      }
    };

    function _safeLoad(data) {
      var project = {};
      switch(data.version) {
        case '1.0':
          project = data;
          break;
        default:
          project = _default();
          project.design.board = data.board;
          project.design.graph = data.graph;
          project.design.deps = data.deps;
          project.design.state = data.state;
          break;
      }
      // Safe load all dependencies recursively
      for (var d in project.design.deps) {
        project.design.deps[d] = _safeLoad(project.design.deps[d]);
      }
      return project;
    }

    this.save = function(filepath) {
      var name = utils.basename(filepath);
      this.path = filepath;
      this.updateName(name);

      sortGraph();
      this.update();
      utils.saveFile(filepath, this.project, function() {
        alertify.success(gettextCatalog.getString('Project {{name}} saved', { name: utils.bold(name) }));
      }, true);
    };

    function sortGraph() {
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

    this.addAsBlock = function(filepath) {
      var self = this;
      utils.readFile(filepath, function(data) {
        var block = _safeLoad(data);
        if (block) {
          var name = utils.basename(filepath);
          var path = utils.dirname(filepath);
          // 1. Parse and find included files
          var code = JSON.stringify(block);
          var files = utils.findIncludedFiles(code);
          // Are there included files?
          if (files.length > 0) {
            // 2. Check project's directory
            if (self.path) {
              // 3. Copy the included files
              copyIncludedFiles(function(success) {
                if (success) {
                  // 4. Success: import block
                  doImportBlock(name, block);
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
                          doImportBlock(name, block);
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
            doImportBlock(name, block);
          }
        }

        function copyIncludedFiles(callback) {
          var success = true;
          async.eachSeries(files, function(filename, next) {
            setTimeout(function() {
              var origPath = nodePath.join(path, filename);
              var destPath = nodePath.join(utils.dirname(self.path), filename);
              if (nodeFs.existsSync(destPath)) {
                alertify.confirm(gettextCatalog.getString('File {{file}} already exists in the project path. Do you want to replace it?', { file: utils.bold(filename) }),
                function() {
                  success = success && doCopySync(origPath, destPath, filename);
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
                success = success && doCopySync(origPath, destPath, filename);
                if (!success) {
                  return next(); // break
                }
                next();
              }
            }, 0);
          }, function(/*result*/) {
            return callback(success);
          });
        }

        function doCopySync(orig, dest, filename) {
          var success = utils.copySync(orig, dest);
          if (success) {
            alertify.notify(gettextCatalog.getString('File {{file}} imported', { file: utils.bold(filename) }), 'message', 5);
          }
          else {
            alertify.notify(gettextCatalog.getString('Original file {{file}} does not exist', { file: utils.bold(filename) }), 'error', 30);
          }
          return success;
        }

        function doImportBlock(name, block) {
          // Convert project to block
          delete block.design.board;
          for (var i in block.design.graph.blocks) {
            if (block.design.graph.blocks[i].type === 'basic.input' ||
                block.design.graph.blocks[i].type === 'basic.output') {
              delete block.design.graph.blocks[i].data.pin;
            }
          }
          // Add block
          graph.importBlock(name, block);
          self.project.design.deps[name] = block;
          alertify.success(gettextCatalog.getString('Block {{name}} imported', { name: utils.bold(name) }));
        }
      });
    };

    this.update = function(callback) {
      var graphData = graph.toJSON();

      var blocks = [];
      var wires = [];

      for (var c = 0; c < graphData.cells.length; c++) {
        var cell = graphData.cells[c];

        if (cell.type === 'ice.Generic' ||
            cell.type === 'ice.Input' ||
            cell.type === 'ice.Output' ||
            cell.type === 'ice.Code' ||
            cell.type === 'ice.Info' ||
            cell.type === 'ice.Constant') {
          var block = {};
          block.id = cell.id;
          block.type = cell.blockType;
          block.data = cell.data;
          block.position = cell.position;
          if (cell.type === 'ice.Code') {
            block.data.code = graph.getContent(cell.id);
          }
          else if (cell.type === 'ice.Info') {
            block.data.info = graph.getContent(cell.id);
          }
          blocks.push(block);
        }
        else if (cell.type === 'ice.Wire') {
          var wire = {};
          wire.source = { block: cell.source.id, port: cell.source.port };
          wire.target = { block: cell.target.id, port: cell.target.port };
          wire.vertices = cell.vertices;
          wires.push(wire);
        }
      }

      this.project.design.state = graph.getState();
      this.project.design.board = boards.selectedBoard.name;
      this.project.design.graph = { blocks: blocks, wires: wires };

      if (callback) {
        callback();
      }
    };

    this.updateName = function(name) {
      if (name) {
        this.name = name;
        graph.resetBreadcrumbs(name);
        utils.updateWindowTitle(name + ' - Icestudio');
      }
    };

    this.export = function(target, filepath, message) {
      this.update();
      var data = compiler.generate(target, this.project);
      utils.saveFile(filepath, data, function() {
        alertify.success(message);
      }, false);
    };

    this.addBlock = function(type, block) {
      if (block) {
        block = _safeLoad(block);
        this.project.design.deps[type] = block;
      }
      graph.createBlock(type, block);
    };

    this.removeSelected = function() {
      var self = this;
      graph.removeSelected(function(type) {
        delete self.project.design.deps[type];
      });
    };

    this.clear = function() {
      this.project = _default();
      graph.clearAll();
      graph.resetBreadcrumbs();
    };

  });
