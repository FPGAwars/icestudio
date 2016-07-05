'use strict';

angular.module('icestudio')
  .controller('MenuCtrl', function ($scope,
                                    nodeFs,
                                    common,
                                    graph,
                                    tools,
                                    boards,
                                    resources,
                                    gui,
                                    _package) {

    $scope.common = common;
    $scope.boards = boards;

    $scope.examples = resources.getExamples();
    $scope.currentBoards = boards.getBoards();
    $scope.menuBlocks = resources.getMenuBlocks();

    $scope.currentProjectPath = '';

    $scope.version = _package.version;

    $scope.toolchain = tools.toolchain;

    // File

    $scope.newProject = function() {
      alertify.prompt('Enter the project\'s title', 'untitled',
        function(evt, name) {
          if (name) {
            common.newProject(name);
            $scope.currentProjectPath = '';
          }
      });
    }

    $scope.openExample = function(name, project) {
      if (!graph.isEmpty()) {
        alertify.confirm('The current project will be removed. ' +
                         'Do you want to continue loading the example?',
          function() {
            common.loadProject(name, project);
            $scope.currentProjectPath = '';
        });
      }
      else {
        common.loadProject(name, project);
        $scope.currentProjectPath = '';
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
      if (!graph.isEmpty()) {
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
    }

    $scope.exportVerilog = function() {
      if (!graph.isEmpty()) {
        setTimeout(function() {
          var ctrl = angular.element('#input-export-verilog');
          ctrl.on('change', function(event) {
            var file = event.target.files[0];
            if (file) {
              event.target.files.clear();
              var filepath = file.path;
              if (! filepath.endsWith('.v')) {
                  filepath += '.v';
              }
              common.exportVerilog(filepath);
            }
          });
          ctrl.click();
        }, 0);
      }
    }

    $scope.exportPCF = function() {
      if (!graph.isEmpty()) {
        setTimeout(function() {
          var ctrl = angular.element('#input-export-pcf');
          ctrl.on('change', function(event) {
            var file = event.target.files[0];
            if (file) {
              event.target.files.clear();
              var filepath = file.path;
              if (! filepath.endsWith('.pcf')) {
                  filepath += '.pcf';
              }
              common.exportPCF(filepath);
            }
          });
          ctrl.click();
        }, 0);
      }
    }

    // Edit

    $scope.setImagePath = function() {
      var current = common.project.image;
      alertify.prompt('Enter the project\'s image path', (current) ? current : 'resources/images/',
        function(evt, imagePath) {
          if (imagePath) {
            common.setImagePath(imagePath);
          }
      });
    }

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

    // Key events

    var promptShown = false;

    alertify.prompt().set({
      onshow: function() {
        promptShown = true;
      },
      onclose: function() {
        promptShown = false;
      }
    });

    $(document).on('keydown', function(event) {
      if (graph.isEnabled() && !promptShown) {
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

    // Help

    $scope.openUrl = function(url) {
      /*gui.Window.open(url, {
        nodejs: false,
        "new-instance": false
      });*/
      event.preventDefault();
      gui.Shell.openExternal(url);
    }

    $scope.about = function() {
      var content = [
        '<div class="row">',
        '  <div class="col-sm-4">',
        '   <img src="resources/images/fpgawars-logo.png">',
        '  </div>',
        '  <div class="col-sm-7" style="margin-left: 20px;">',
        '    <h4>Icestudio</h4>',
        '    <p><i>Graphic editor for open FPGAs</i></p>',
        '    <p>Version: ' + $scope.version + '</p>',
        '    <p>License: GPL v2</p>',
        '    <p>Date: June 2016</p>',
        '    <p>Created by Jesús Arroyo Torrens</p>',
        '  </div>',
        '</div>'].join('\n');
      alertify.alert(content);
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
