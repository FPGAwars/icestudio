'use strict';

angular.module('icestudio')
  .service('project', function(graph, boards, compiler, utils, gettextCatalog) {

    this.path = '';
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
      }
    };

    this.updateName = function(name) {
      if (name) {
        graph.resetBreadcrumbs(name);
        utils.updateWindowTitle(name + ' - Icestudio');
        this.project.package.name = name;
      }
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
      this.project = _safeLoad(name, data);

      if (graph.loadDesign(this.project.design)) {
        boards.selectBoard(this.project.design.board);
        this.updateName(name);
        alertify.success(gettextCatalog.getString('Project {{name}} loaded', { name: utils.bold(name) }));
      }
      else {
        alertify.notify(gettextCatalog.getString('Wrong project format: {{name}}', { name: utils.bold(name) }), 'error', 30);
      }
    };

    function _safeLoad(name, data) {
      var project = {};
      switch(data.version) {
        case '1.0':
          project = data;
          break;
        default:
          project = _default();
          project.package.name = name;
          project.design = data;
          break;
      }
      return project;
    };

    this.save = function(filepath) {
      var name = utils.basename(filepath);
      this.path = filepath;
      this.updateName(name);

      this.update();
      utils.saveFile(filepath, this.project, function() {
        alertify.success(gettextCatalog.getString('Project {{name}} saved', { name: utils.bold(name) }));
      }, true);
    };

    this.update = function(callback) {
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

      this.project.design.state = graph.getState();
      this.project.design.board = boards.selectedBoard.name;
      this.project.design.graph = { blocks: blocks, wires: wires };

      if (callback)
        callback();
    };

    this.export = function(target, filepath, message) {
      this.update();
      var data = compiler.generate(target, this.project);
      utils.saveFile(filepath, data, function() {
        alertify.success(message);
      }, false);
    };

    this.addBlock = function(type, block) {
      this.project.design.deps[type] = block;
      graph.createBlock(type, block);
    };

    this.removeSelected = function() {
      var self = this;
      graph.removeSelected(function(type) {
        delete self.project.design.deps[type];
      });
    };

  });
