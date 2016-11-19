'use strict';

angular.module('icestudio')
  .controller('MenuCtrl', function ($scope,
                                    $timeout,
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

    // Menu

    var timer;

    // mouseover event
    $scope.showMenu = function (menu) {
      $timeout.cancel(timer);
      $scope.status[menu] = true;
    };

    // mouseleave event
    $scope.hideMenu = function (menu) {
      timer = $timeout(function () {
          $scope.status[menu] = false;
      }, 500);
    };

    // File

    $scope.newProject = function() {
      alertify.prompt($translate.instant('enter_project_title'),
                      $translate.instant('untitled'),
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
                alertify.confirm($translate.instant('load_project_confirmation'),
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
          alertify.confirm($translate.instant('load_project_confirmation'),
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

    $scope.exportTestbench = function() {
      if (!graph.isEmpty()) {
        setTimeout(function() {
          var ctrl = angular.element('#input-export-testbench');
          ctrl.on('change', function(event) {
            var file = event.target.files[0];
            if (file) {
              event.target.files.clear();
              var filepath = file.path;
              if (! filepath.endsWith('.v')) {
                  filepath += '.v';
              }
              $scope.workingdir = utils.dirname(filepath) + utils.sep;
              common.exportTestbench(filepath);
            }
          });
          ctrl.click();
        }, 0);
      }
    }

    $scope.exportGTKwave = function() {
      if (!graph.isEmpty()) {
        setTimeout(function() {
          var ctrl = angular.element('#input-export-gtkwave');
          ctrl.on('change', function(event) {
            var file = event.target.files[0];
            if (file) {
              event.target.files.clear();
              var filepath = file.path;
              if (! filepath.endsWith('.gtkw')) {
                  filepath += '.gtkw';
              }
              $scope.workingdir = utils.dirname(filepath) + utils.sep;
              common.exportGTKWave(filepath);
            }
          });
          ctrl.click();
        }, 0);
      }
    }

    // Edit

    $scope.setImagePath = function() {
      var current = common.project.image;
      alertify.prompt($translate.instant('enter_project_image_path'), (current) ? current : '',
        function(evt, imagePath) {
          common.setImagePath(imagePath);
      });
    }

    $scope.setRemoteHostname = function() {
      var current = profile.data.remoteHostname;
      alertify.prompt($translate.instant('enter_remote_hostname'), (current) ? current : '',
        function(evt, remoteHostname) {
          profile.data.remoteHostname = remoteHostname;
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
        alertify.confirm($translate.instant('clear_all_confirmation'),
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
        alertify.confirm($translate.instant('remove_block_confirmation'),
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

    $scope.showPCF = function() {
      gui.Window.open('resources/viewers/plain/pcf.html?board=' + boards.selectedBoard.name, {
        title: boards.selectedBoard.info.label + ' - PCF',
        focus: true,
        toolbar: false,
        resizable: true,
        width: 650,
        height: 700,
        icon: 'resources/images/icestudio-logo.png'
      });
    }

    $scope.showPinout = function() {
      gui.Window.open('resources/viewers/svg/pinout.html?board=' + boards.selectedBoard.name, {
        title: boards.selectedBoard.info.label + ' - Pinout',
        focus: true,
        toolbar: false,
        resizable: true,
        width: 500,
        height: 700,
        icon: 'resources/images/icestudio-logo.png'
      });
    }

    $scope.showDatasheet = function() {
      if (boards.selectedBoard.info.datasheet) {
        gui.Shell.openExternal(boards.selectedBoard.info.datasheet);
      }
      else {
        alertify.error($translate.instant('datasheet_not_defined'));
      }
    }

    // Boards

    $scope.selectBoard = function(board) {
      if (boards.selectedBoard.name != board.name) {
        if (!graph.isEmpty()) {
          alertify.confirm($translate.instant('change_board_confirmation', { name: '<b>' + board.info.label + '</b>' }),
            function() {
              boards.selectBoard(board.name);
              graph.resetIOChoices();
              alertify.success($translate.instant('board_selected', { name: '<b>' + board.info.label + '</b>' }));
          });
        }
        else {
          boards.selectBoard(board.name);
          graph.resetIOChoices();
          alertify.success($translate.instant('board_selected',  { name: '<b>' + board.info.label + '</b>' }));
        }
      }
    }

    // Tools

    $scope.verifyCode = function() {
      if (!graph.isEmpty()) {
        tools.verifyCode();
      }
    };

    $scope.buildCode = function() {
      if (!graph.isEmpty()) {
        tools.buildCode();
      }
    };

    $scope.uploadCode = function() {
      if (!graph.isEmpty()) {
        tools.uploadCode();
      }
    }

    $scope.installToolchain = function() {
      tools.installToolchain();
    }

    $scope.updateToolchain = function() {
      tools.updateToolchain();
    }

    $scope.removeToolchain = function() {
      tools.removeToolchain();
    }

    $scope.resetToolchain = function() {
      tools.resetToolchain();
    }

    $scope.enableDrivers = function() {
      tools.enableDrivers();
    }

    $scope.disableDrivers = function() {
      tools.disableDrivers();
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
        '    <p>Created by Jesús Arroyo Torrens</p>',
        '    <p><span class="copyleft">&copy;</span> FPGAwars 2016</p>',
        '  </div>',
        '</div>'].join('\n');
      alertify.alert(content);
    }
  });
