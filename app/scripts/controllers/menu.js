'use strict';

angular.module('icestudio')
  .controller('MenuCtrl', function ($scope,
                                    nodeFs,
                                    common,
                                    graph,
                                    boards,
                                    blocks) {

    $scope.common = common;
    $scope.boards = boards;
    $scope.menuBlocks = blocks.getMenuBlocks();
    $scope.currentBoards = boards.getBoards();

    // File

    $scope.newProject = function() {
      alertify.prompt('Enter the project\'s title', 'untitled',
        function(evt, name) {
          if (name) {
            common.newProject(name);
          }
      });
    }

    $scope.openProject = function() {
        setTimeout(function() {
          var ctrl = angular.element('#input-open-project');
          ctrl.on('change', function(event) {
            var file = event.target.files[0];
            event.target.files.clear();
            if (file) {
              if (file.path.endsWith('.ice')) {
                common.openProject(file.path);
              }
            }
          });
          ctrl.click();
        }, 0);
    }

    $scope.saveProject = function() {
      setTimeout(function() {
        var ctrl = angular.element('#input-save-project');
        ctrl.on('change', function(event) {
          var file = event.target.files[0];
          if (file) {
            event.target.files.clear();
            var filepath = file.path;
            if (! filepath.endsWith('.ice')) {
                filepath += '.ice';
            }
            common.saveProject(filepath);
          }
        });
        ctrl.click();
      }, 0);
    }

    $scope.importBlock = function() {
        setTimeout(function() {
          var ctrl = angular.element('#input-import-block');
          ctrl.on('change', function(event) {
            var file = event.target.files[0];
            event.target.files.clear();
            if (file) {
              if (file.path.endsWith('.iceb')) {
                common.importBlock(file.path);
              }
            }
          });
          ctrl.click();
        }, 0);
    }


    $scope.exportAsBlock = function() {
      setTimeout(function() {
        var ctrl = angular.element('#input-export-block');
        ctrl.on('change', function(event) {
          var file = event.target.files[0];
          if (file) {
            event.target.files.clear();
            var filepath = file.path;
            if (! filepath.endsWith('.iceb')) {
                filepath += '.iceb';
            }
            common.exportAsBlock(filepath);
          }
        });
        ctrl.click();
      }, 0);
    }


    // Edit

    $scope.clearGraph = function() {
      alertify.confirm('Do you want to clear the graph?',
        function() {
          graph.clearAll();
      });
    }

    $scope.removeSelected = function() {
      graph.removeSelected();
    }

    $(document).on('keydown', function(event) {
      if (event.keyCode == 46) { // Supr
        graph.removeSelected();
      }
    });

    // Boards

    $scope.selectBoard = function(board) {
      if (boards.selectedBoard != board) {
        alertify.confirm('The current FPGA I/O configuration will be lost. ' +
                         'Do you want to change to <b>' + board.label + '</b> board?',
          function() {
            boards.selectBoard(board.id);
            graph.resetIOChoices();
            alertify.success('Board ' + board.label + ' selected');
        });
      }
    }

  });
