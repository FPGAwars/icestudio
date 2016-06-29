'use strict';

angular.module('icestudio')
  .controller('MenuCtrl', function ($scope,
                                    nodeFs,
                                    common,
                                    graph,
                                    tools,
                                    boards,
                                    resources) {

    $scope.common = common;
    $scope.boards = boards;

    $scope.examples = resources.getExamples();
    $scope.currentBoards = boards.getBoards();
    $scope.menuBlocks = resources.getMenuBlocks();

    $scope.currentProjectPath = '';

    // File

    $scope.newProject = function() {
      alertify.prompt('Enter the project\'s title', 'untitled',
        function(evt, name) {
          if (name) {
            common.newProject(name);
          }
      });
    }

    $scope.openExample = function(name, project) {
      if (!graph.isEmpty()) {
        alertify.confirm('The current project will be removed. ' +
                         'Do you want to continue loading the example?',
          function() {
            common.loadProject(name, project);
        });
      }
      else {
        common.loadProject(name, project);
      }
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
                $scope.currentProjectPath = file.path;
              }
            }
          });
          ctrl.click();
        }, 0);
    }

    $scope.saveProject = function() {
      var filepath = $scope.currentProjectPath;
      if (filepath) {
        common.saveProject(filepath);
      }
      else {
        $scope.saveProjectAs();
      }
    }

    $scope.saveProjectAs = function() {
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
            $scope.currentProjectPath = filepath;
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
      if (!graph.isEmpty()) {
        alertify.confirm('Do you want to clear the graph?',
        function() {
          common.clearProject();
        });
      }
    }

    $scope.cloneSelected = function() {
      common.cloneSelected();
    }

    $scope.removeSelected = function() {
      if (graph.getSelectedType()) {
        alertify.confirm('Do you want to remove the selected block?',
          function() {
            common.removeSelected();
        });
      }
    }

    $(document).on('keydown', function(event) {
      if (graph.isEnabled()) {
        if (event.keyCode == 46 || // Supr
            (event.keyCode == 88 && event.ctrlKey)) { // Ctrl + x
          $scope.removeSelected();
        }
        else if (event.keyCode == 67 && event.ctrlKey) { // Ctrl + c
          $scope.cloneSelected();
        }
      }
    });

    // Boards

    $scope.selectBoard = function(board) {
      if (boards.selectedBoard.id != board.id) {
        if (!graph.isEmpty()) {
          alertify.confirm('The current FPGA I/O configuration will be lost. ' +
                           'Do you want to change to <b>' + board.label + '</b> board?',
            function() {
              boards.selectBoard(board.id);
              graph.resetIOChoices();
              alertify.success('Board ' + board.label + ' selected');
          });
        }
        else {
          boards.selectBoard(board.id);
          graph.resetIOChoices();
          alertify.success('Board ' + board.label + ' selected');
        }
      }
    }

    // Tools

    $scope.verifyCode = function() {
      tools.verifyCode();
    };

    $scope.buildCode = function() {
      tools.buildCode();
    };

    $scope.uploadCode = function() {
      tools.uploadCode();
    }

    $scope.installToolchain = function() {
      tools.installToolchain();
    }

    $scope.removeToolchain = function() {
      alertify.confirm('Icestudio and apio configuration directories will be removed. ' +
                       'Do you want to continue?',
        function() {
          tools.removeToolchain();
          alertify.success('Toolchain removed');
      });
    }
  });
