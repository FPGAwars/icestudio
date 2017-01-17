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
    this.changed = false;

    const VERSION = '1.1';

    var project = _default();
    var allDependencies = {};

    function _default() {
      return {
        version: VERSION,
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
          state: { pan: { x: 0, y: 0 }, zoom: 1.0 }
        },
        dependencies: {}
      };
    }

    /* Dependency format
    {
      package: {
        name: '',
        version: '',
        description: '',
        author: '',
        image: ''
      },
      design: {
        graph: { blocks: [], wires: [] }
        state: { pan: { x: 0, y: 0 }, zoom: 1.0 }
      },
    }
    */

    this.get = function(key) {
      if (key in project) {
        return project[key];
      }
      else {
        return project;
      }
    };

    this.set = function(key, obj) {
      if (key in project) {
        project[key] = obj;
      }
    };

    this.getAllDependencies = function() {
      return allDependencies;
    };

    this.new = function(name) {
      this.path = '';
      project = _default();
      this.updateTitle(name);

      graph.clearAll();
      graph.resetCommandStack();
      graph.setState(project.design.state);

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
      if (data.version !== VERSION) {
        alertify.notify(gettextCatalog.getString('Old project format'), 'warning', 5);
      }
      project = _safeLoad(data);
      allDependencies = project.dependencies;
      graph.setDependencies(allDependencies);
      var ret = graph.loadDesign(project.design, false, function() {
        graph.resetCommandStack();
        alertify.success(gettextCatalog.getString('Project {{name}} loaded', { name: utils.bold(name) }));
      });

      if (ret) {
        boards.selectBoard(project.design.board);
        this.updateTitle(name);
      }
      else {
        alertify.notify(gettextCatalog.getString('Wrong project format: {{name}}', { name: utils.bold(name) }), 'error', 30);
      }
    };

    function _safeLoad(data) {
      var project = {};
      switch(data.version) {
        case VERSION:
          project = data;
          break;
        case '1.0':
          project = _default();
          project.package = data.package;
          project.design.board = data.design.board;
          project.design.graph = convertTypes10to11(data.design.graph);
          project.design.state = data.design.state;
          project.dependencies = findDependencies10to11(data.design.deps);
          break;
        default:
          for (var b in data.graph.blocks) {
            var block = data.graph.blocks[b];
            switch(block.type) {
              case 'basic.input':
              case 'basic.output':
                block.data = {
                  name: block.data.label,
                  pins: [{
                    index: '0',
                    name: block.data.pin ? block.data.pin.name : '',
                    value: block.data.pin? block.data.pin.value : '0'
                  }],
                  virtual: false
                };
                break;
              case 'basic.constant':
                block.data = {
                  name: block.data.label,
                  value: block.data.value,
                  local: false
                };
                break;
              case 'basic.code':
                var params = [];
                for (var p in block.data.params) {
                  params.push({
                    name: block.data.params[p]
                  });
                }
                var inPorts = [];
                for (var i in block.data.ports.in) {
                  inPorts.push({
                    name: block.data.ports.in[i]
                  });
                }

                var outPorts = [];
                for (var o in block.data.ports.out) {
                  outPorts.push({
                    name: block.data.ports.out[o]
                  });
                }
                block.data = {
                  code: block.data.code,
                  params: params,
                  ports: {
                    in: inPorts,
                    out: outPorts
                  }
                };
                break;
            }
          }
          project = _default();
          project.design.board = data.board;
          project.design.graph = data.graph;
          project.design.state = data.state;
          project.dependencies = data.deps;
          break;
      }
      // Safe load all dependencies recursively
      /*for (var d in project.design.deps) {
        project.design.deps[d] = _safeLoad(project.design.deps[d]);
      }*/
      return project;
    }

    function convertTypes10to11(graph) {
      return graph;
    }

    function findDependencies10to11(dependencies) {
      return dependencies;
    }

    this.save = function(filepath) {
      var name = utils.basename(filepath);
      this.path = filepath;
      this.updateTitle(name);

      sortGraph();
      this.update();
      utils.saveFile(filepath, project, function() {
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
        if (data.version !== VERSION) {
          alertify.notify(gettextCatalog.getString('Old project format'), 'warning', 5);
        }
        var block = _safeLoad(data);
        if (block) {
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
                  doImportBlock(block);
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
                          doImportBlock(block);
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
            doImportBlock(block);
          }
        }

        function copyIncludedFiles(callback) {
          var success = true;
          async.eachSeries(files, function(filename, next) {
            setTimeout(function() {
              var origPath = nodePath.join(path, filename);
              var destPath = nodePath.join(utils.dirname(self.path), filename);
              if (origPath !== destPath) {
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
              }
              else {
                return next(); // break
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

        function doImportBlock(block) {
          self.addBlock(block);
          alertify.success(gettextCatalog.getString('Block {{name}} imported', { name: utils.bold(block.package.name) }));
        }
      });
    };

    this.update = function(callback, updateDependencies) {
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
          if (cell.type === 'ice.Code' ||
              cell.type === 'ice.Info') {
            delete block.data.deltas;
          }
          blocks.push(block);
        }
        else if (cell.type === 'ice.Wire') {
          var wire = {};
          wire.source = { block: cell.source.id, port: cell.source.port };
          wire.target = { block: cell.target.id, port: cell.target.port };
          wire.vertices = cell.vertices;
          wire.size = (cell.size > 1) ? cell.size : undefined;
          wires.push(wire);
        }
      }

      var state = graph.getState();
      project.design.board = boards.selectedBoard.name;
      project.design.graph = { blocks: blocks, wires: wires };
      project.design.state = {
        pan: {
          x: parseFloat(state.pan.x.toFixed(4)),
          y: parseFloat(state.pan.y.toFixed(4))
        },
        zoom: parseFloat(state.zoom.toFixed(4))
      };

      // Update dependencies
      if (updateDependencies !== false) {
        project.dependencies = {};
        var types = findSubDependencies(project);
        for (var i in types) {
          project.dependencies[types[i]] = allDependencies[types[i]];
        }
      }

      if (callback) {
        callback();
      }
    };

    function findSubDependencies(dependency) {
      var subDependencies = [];
      var blocks = dependency.design.graph.blocks;
      for (var i in blocks) {
        var type = blocks[i].type;
        if (type.indexOf('basic.') === -1) {
          subDependencies.push(type);
          var newSubDependencies = findSubDependencies(allDependencies[type]);
          subDependencies = subDependencies.concat(newSubDependencies);
        }
      }
      return _.unique(subDependencies);
    }

    this.updateTitle = function(name) {
      if (name) {
        this.name = name;
        graph.resetBreadcrumbs(name);
      }
      var title = (this.changed ? '●' : '') + this.name + ' ─ Icestudio';
      utils.updateWindowTitle(title);
    };

    this.export = function(target, filepath, message) {
      this.update();
      var data = compiler.generate(target, project);
      utils.saveFile(filepath, data, function() {
        alertify.success(message);
      }, false);
    };

    this.addBlock = function(arg) {
      if (typeof arg === 'string' && arg.match(/basic\..+/g)) {
        graph.createBasicBlock(arg);
      }
      else if (arg) {
        var block = _safeLoad(arg);
        block = pruneBlock(block);
        var type = utils.dependencyID(block);
        mergeDependencies(type, block);
        graph.createBlock(type, block);
        graph.setDependencies(allDependencies);
      }
    };

    function pruneBlock(block) {
      // Remove all unnecessary information for a dependency:
      // - version, board, FPGA I/O pins (->size if >1), virtual flag
      delete block.version;
      delete block.design.board;
      var i, pins;
      for (i in block.design.graph.blocks) {
        if (block.design.graph.blocks[i].type === 'basic.input' ||
            block.design.graph.blocks[i].type === 'basic.output') {
          pins = block.design.graph.blocks[i].data.pins;
          block.design.graph.blocks[i].data.size = (pins && pins.length > 1) ? pins.length : undefined;
          delete block.design.graph.blocks[i].data.pins;
          delete block.design.graph.blocks[i].data.virtual;
        }
      }
      return block;
    }

    function mergeDependencies(type, block) {
      if (type in allDependencies) {
        return; // If the block is already in dependencies
      }
      // Merge the block dependencies
      var deps = block.dependencies;
      for (var i in deps) {
        var depType = utils.dependencyID(deps[i]);
        if (!(depType in allDependencies)) {
          allDependencies[depType] = deps[i];
        }
      }
      // Add the block as a dependency
      delete block.dependencies;
      allDependencies[type] = block;
    }

    this.removeSelected = function() {
      graph.removeSelected();
    };

    this.clear = function() {
      project = _default();
      graph.clearAll();
      graph.resetBreadcrumbs();
      graph.resetCommandStack();
    };

  });
