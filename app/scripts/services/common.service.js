'use strict';

angular.module('icestudio')
    .service('common', ['$rootScope', 'window', 'graph', 'boards', 'compiler', 'utils',
      function($rootScope, window, graph, boards, compiler, utils) {

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
          utils.readFile(filepath, (function(_this) {
            return function(data) {
              var project = data;
              if (project) {
                var name = utils.basename(filepath);
                _this.loadProject(name, project);
              }
            };
          })(this));
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
          utils.saveFile(filepath, this.project, function() {
            alertify.success('Project ' + name + ' saved');
          });
        };

        this.importBlock = function(filepath) {
          utils.readFile(filepath, (function(_this) {
            return function(data) {
              var block = data;
              if (block) {
                var name = utils.basename(filepath);
                graph.importBlock(name, block);
                _this.project.deps[name] = block;
                alertify.success('Block ' + name + ' imported');
              }
            };
          })(this));
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
            alertify.success('Block exported as ' + name);
          });
        };

        this.exportVerilog = function(filepath) {
          var name = utils.basename(filepath);
          this.refreshProject();
          // Generate verilog code from project
          var verilog = compiler.generateVerilog(this.project);
          utils.saveFile(filepath, verilog, function() {
            alertify.success('Exported verilog from project ' + name);
          });
        };

        this.exportPCF = function(filepath) {
          var name = utils.basename(filepath);
          this.refreshProject();
          // Generate pcf code from project
          var pcf = compiler.generatePCF(this.project);
          utils.saveFile(filepath, pcf, function() {
            alertify.success('Exported PCF from project ' + name);
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
              wire.vertices = cell.vertices;
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

        this.cloneSelected = function() {
          graph.cloneSelected();
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
            window.get().title = 'Icestudio - ' + name;
          }
        };

        this.addBlock = function(type, block) {
          this.project.deps[type] = block;
          graph.createBlock(type, block);
        }

    }]);
