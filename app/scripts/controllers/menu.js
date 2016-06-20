'use strict';

angular.module('icestudio')
  .controller('MenuCtrl', function ($scope,
                                    nodeFs,
                                    common,
                                    graph,
                                    boards) {

    $scope.common = common;
    $scope.boards = boards;
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
      alertify.confirm('Do you want to remove the selected block?',
        function() {
          graph.removeSelected();
          alertify.success('Block removed');
      });
    }

    $(document).on('keydown', function(event) {
      if (event.keyCode == 46) { // Supr
        $scope.removeSelected();
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

    // Blocks menu

    $scope.createBasicBlock = function(type) {
      graph.createBasicBlock(type)
    }

    /*

    /*$scope.loadCustomBlock = function(name) {
      alertify.confirm('The current project will be removed. ' +
                       'Do you want to continue?',
        function() {
          $rootScope.$emit('loadCustomBlock', name);
      });
    }

    $scope.removeCustomBlock = function(name) {
      alertify.confirm('Do you want to remove the custom block <b>' + name + '</b>?',
        function() {
          $rootScope.$emit('removeCustomBlock', name);
      });
    }

    $scope.saveCustomBlock = function() {
      alertify.prompt('Do you want to export your custom block?',
        $rootScope.project.name,
        function(evt, name) {
          if (name) {
            $rootScope.$emit('saveCustomBlock', name);
          }
      });
    }*/

    // Edit

    /*$scope.build = function() {
      console.log('build');
    }

    $scope.upload = function() {
      console.log('upload');
    }*/

    /*

    // View

    $scope.reloadBlocks = function() {
      blocks.loadBlocks();
    }*/

    // Blocks menu

    /*$scope.addBlock = function(type, blockdata) {
      $rootScope.$emit('addBlock', { type: type, blockdata: blockdata });
    }*/

  });
