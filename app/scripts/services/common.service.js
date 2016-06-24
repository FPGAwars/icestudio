'use strict';

angular.module('icestudio')
    .service('common', ['$rootScope', 'nodeFs', 'nodeGlob', 'window', 'graph', 'boards', 'utils',
      function($rootScope, nodeFs, nodeGlob, window, graph, boards, utils) {

        // Variables

        this.project = {
          board: '',
          graph: {},
          deps: {}
        };
        this.projectName = '';

        // Functions

        this.newProject = function(name) {
          this.project = {
            board: '',
            graph: {},
            deps: {}
          };
          graph.clearAll();
          this.updateProjectName(name);
          alertify.success('New project ' + name + ' created');
        };

        this.openProject = function(filepath) {
          $.ajaxSetup({ async: false });
          var project;
          $.getJSON(filepath, function(data){
            project = data;
          });
          if (project) {
            var name = utils.basename(filepath);
            this.loadProject(name, project);
          }
          $.ajaxSetup({ async: true });
        };

        this.loadProject = function(name, project) {
          this.updateProjectName(name);
          this.project = project;
          boards.selectBoard(project.board);
          if (graph.loadProject(project)) {
            alertify.success('Project ' + name + ' loaded');
          }
          else {
            alertify.error('Wrong project format: ' + name);
          }
        };

        this.saveProject = function(filepath) {
          var name = utils.basename(filepath);
          this.updateProjectName(name);
          this.refreshProject();
          nodeFs.writeFile(filepath, JSON.stringify(this.project, null, 2),
            function(err) {
              if (!err) {
                alertify.success('Project ' + name + ' saved');
              }
          });
        };

        this.importBlock = function(filepath) {
          $.ajaxSetup({ async: false });
          var block;
          $.getJSON(filepath, function(data){
            block = data;
          });
          if (block) {
            var name = utils.basename(filepath);
            graph.importBlock(name, block);
            this.project.deps[name] = block;
            alertify.success('Block ' + name + ' imported');
          }
          $.ajaxSetup({ async: true });
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
          nodeFs.writeFile(filepath, JSON.stringify(block, null, 2),
            function(err) {
              if (!err) {
                alertify.success('Block exported as ' + name);
              }
          });
        };

        this.refreshProject = function(callback) {
          var graphData = graph.toJSON();

          var blocks = [];
          var wires = [];

          for (var c = 0; c < graphData.cells.length; c++) {
            var cell = graphData.cells[c];

            if (cell.type == 'ice.Block' || cell.type == 'ice.IO' || cell.type == 'ice.Code') {
              var block = {};
              block.id = cell.id;
              block.type = cell.blockType;
              block.data = cell.data;
              block.position = cell.position;
              if (cell.type == 'ice.Code') {
                block.data.code = graph.getCode(cell.id);
              }
              blocks.push(block);
            }
            else if (cell.type == 'ice.Wire') {
              var wire = {};
              wire.source = { block: cell.source.id, port: cell.source.port };
              wire.target = { block: cell.target.id, port: cell.target.port };
              wires.push(wire);
            }
          }

          this.project.board = boards.selectedBoard.id;

          this.project.graph = { blocks: blocks, wires: wires };

          if (callback)
            callback();
        };

        this.clearProject = function() {
          this.project = {
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

        this.removeSelected = function() {
          var type = graph.getSelectedType();
          graph.removeSelected();
          if (type) {
            // There is no 'type' block
            if (graph.typeInGraph(type) == 0) {
              delete this.project.deps[type];
            }
          }
        };

        this.updateProjectName = function(name) {
          if (name) {
            this.projectName = name
            if (graph.breadcrumbs.length > 1) {
              graph.breadcrumbs = [{ name: this.projectName }];
            }
            graph.breadcrumbs[0].name = name;
            if(!$rootScope.$$phase) {
              $rootScope.$apply();
            }
            window.title = 'Icestudio - ' + name;
          }
        };

        this.addBlock = function(type, block) {
          this.project.deps[type] = block;
          graph.createBlock(type, block);
        }

    }]);
