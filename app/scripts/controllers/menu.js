'use strict';

angular.module('icestudio')
  .controller('MenuCtrl', function ($scope,
                                    $translate,
                                    common,
                                    graph,
                                    tools,
                                    boards,
                                    resources,
                                    profile,
                                    gui,
                                    utils,
                                    _package) {

    // Manage language

    profile.load(function() {
      $translate.use(profile.data.language);
    });
    var win = gui.Window.get();
    win.on('close', function() {
      this.hide();
      profile.save();
      this.close(true);
    });

    // Initialize scope

    $scope.common = common;
    $scope.boards = boards;
    $scope.profile = profile;

    $scope.examples = resources.getExamples();
    $scope.templates = resources.getTemplates();
    $scope.currentBoards = boards.getBoards();
    $scope.menuBlocks = resources.getMenuBlocks();

    $scope.version = _package.version;
    $scope.toolchain = tools.toolchain;

    $scope.workingdir = '';
    $scope.currentProjectPath = '';

    function pathSync() {
      tools.setProjectPath(utils.dirname($scope.currentProjectPath));
    }

    // File

    $scope.newProject = function() {
      alertify.prompt($translate.instant('enter_project_title'), 'untitled',
        function(evt, name) {
          if (name) {
            common.newProject(name);
            $scope.currentProjectPath = '';
            pathSync();
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

              $scope.workingdir = utils.dirname(file.path) + utils.sep;
              if (!graph.isEmpty()) {
                alertify.confirm('The current project will be removed. ' +
                                 'Do you want to continue loading the project?',
                  function() {
                    common.openProject(file.path);
                    $scope.currentProjectPath = file.path;
                    pathSync();
                });
              }
              else {
                common.openProject(file.path);
                $scope.currentProjectPath = file.path;
                pathSync();
              }

            }
          }
        });
        ctrl.click();
      }, 0);
    }

    $scope.openStoredProject = function(name, project) {
      if (project) {
        if (!graph.isEmpty()) {
          alertify.confirm('The current project will be removed. ' +
          'Do you want to continue loading the project?',
          function() {
            common.loadProject(name, project);
            $scope.currentProjectPath = '';
            pathSync();
          });
        }
        else {
          common.loadProject(name, project);
          $scope.currentProjectPath = '';
          pathSync();
        }
      }
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
            $scope.workingdir = utils.dirname(filepath) + utils.sep;
            common.saveProject(filepath);
            $scope.currentProjectPath = filepath;
            pathSync();
          }
        });
        ctrl.click();
      }, 0);
    }

    $scope.importBlock = function() {
      setTimeout(function() {
        var ctrl = angular.element('#input-import-block');
        ctrl.on('change', function(event) {
          var files = JSON.parse(JSON.stringify(event.target.files));
          for (var i in files) {
            if (files[i] &&
                files[i].path &&
                files[i].path.endsWith('.iceb')) {
              common.importBlock(files[i].path);
            }
          }
          event.target.files.clear();
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
              $scope.workingdir = utils.dirname(filepath) + utils.sep;
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
              $scope.workingdir = utils.dirname(filepath) + utils.sep;
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
              $scope.workingdir = utils.dirname(filepath) + utils.sep;
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
      alertify.prompt('Enter the project\'s image path', (current) ? current : '',
        function(evt, imagePath) {
          common.setImagePath(imagePath);
      });
    }

    $scope.selectLanguage = function(language) {
      if (profile.data.language != language) {
        profile.data.language = language;
        $translate.use(language);
      }
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
      if (graph.hasSelection()) {
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

    // View

    $scope.resetState = function() {
      graph.resetState();
    }

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
        '    <p>Date: June, July 2016</p>',
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
