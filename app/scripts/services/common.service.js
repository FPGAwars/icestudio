'use strict';

angular.module('icestudio')
    .service('common', ['$rootScope', 'nodeFs', 'nodeGlob', 'window', 'graph', 'boards', 'utils',
      function($rootScope, nodeFs, nodeGlob, window, graph, boards, utils) {

        // Variables

        this.project = {};
        this.projectName = '';
        this.breadcrumb = [ { id: '', name: '' } ];

        // Functions

        this.newProject = function(name) {
          this.project = {};
          this.updateProjectName(name);
          graph.clearAll();
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
            this.updateProjectName(name);
            this.project = project;
            boards.selectBoard(project.board);
            graph.loadProject(project);
            alertify.success('Project ' + name + ' loaded');
          }
          $.ajaxSetup({ async: true });
        };

        this.saveProject = function(filepath) {
          var name = utils.basename(filepath);
          this.updateProjectName(name);
          this.refreshProject();
          nodeFs.writeFile(filepath, JSON.stringify(this.project, null, 2),
            function(err) {
              if (!err) {
                console.log('Project ' + name + ' saved');
              }
          });
        };

        this.exportAsBlock = function(filepath) {
          var name = utils.basename(filepath);
          this.refreshProject();
          // Convert project to block
          var block = angular.copy(this.project);
          delete block.board;
          for (var i in block.data.blocks) {
            if (block.data.blocks[i].type == 'basic.input' ||
                block.data.blocks[i].type == 'basic.output') {
              delete block.data.blocks[i].data.value;
            }
          }
          nodeFs.writeFile(filepath, JSON.stringify(block, null, 2),
            function(err) {
              if (!err) {
                console.log('Block ' + name + ' saved');
              }
          });
        };

        this.refreshProject = function() {
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

          this.project.data = { blocks: blocks, wires: wires };

          this.project.deps = [];
        };

        this.clearProject = function() {
          this.breadcrumb = [ { id: '', name: this.projectName }];
        }

        this.updateProjectName = function(name) {
          if (name) {
            this.projectName = name
            this.breadcrumb[0].name = name;
            window.title = 'Icestudio - ' + name;
            if(!$rootScope.$$phase) {
              $rootScope.$apply();
            }
          }
        }

        // Intialize project
        this.updateProjectName('untitled');

    }]);
