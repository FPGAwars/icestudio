'use strict';

angular.module('icestudio')
  .controller('MenuCtrl', function ($rootScope,
                                    $scope,
                                    $timeout,
                                    boards,
                                    profile,
                                    project,
                                    resources,
                                    graph,
                                    tools,
                                    gui,
                                    utils,
                                    gettextCatalog,
                                    _package,
                                    nodeFs,
                                    nodePath) {

    //-- Initialize scope

    $scope.boards = boards;
    $scope.profile = profile;
    $scope.project = project;
    $scope.tools = tools;

    $scope.examples = resources.getExamples();
    $scope.currentBoards = boards.getBoards();
    $scope.menuBlocks = resources.getMenuBlocks();

    $scope.version = _package.version;
    $scope.toolchain = tools.toolchain;

    $scope.workingdir = '';
    $scope.snapshotdir = '';

    // Configure window
    var win = gui.Window.get();
    win.on('close', function() {
      this.hide();
      profile.save();
      this.close(true);
    });

    // Darwin fix for shortcuts
    if (process.platform === 'darwin') {
      var mb = new gui.Menu({type: 'menubar'});
      mb.createMacBuiltin('Icestudio');
      win.menu = mb;
    }

    // Menu timer
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
      }, 700);
    };


    //-- File

    $scope.newProject = function() {
      alertify.prompt(
        gettextCatalog.getString('Enter the project name'),
        gettextCatalog.getString('untitled'),
        function(evt, name) {
          if (name) {
            project.new(name);
          }
          else {
            evt.cancel = true;
          }
        });
    };

    $scope.openProject = function() {
      utils.openDialog('#input-open-project', '.ice', function(filepath) {
        updateWorkingdir(filepath);
        checkGraph(function() {
          alertify.confirm(
            gettextCatalog.getString('The current project will be removed. Do you want to continue loading the project?'),
            function() {
              project.open(filepath);
            });
        },
        function() {
          project.open(filepath);
        });
      });
    };

    $scope.loadProject = function(name, data) {
      if (data) {
        checkGraph(function() {
          alertify.confirm(
            gettextCatalog.getString('The current project will be removed. Do you want to continue loading the project?'),
            function() {
              project.load(name, data);
            });
        },
        function() {
          project.load(name, data);
        });
      }
    };

    $scope.saveProject = function() {
      var filepath = project.path;
      if (filepath) {
        project.save(filepath);
      }
      else {
        $scope.saveProjectAs();
      }
    };

    $scope.saveProjectAs = function(localCallback) {
      utils.saveDialog('#input-save-project', '.ice', function(filepath) {
        updateWorkingdir(filepath);
        project.save(filepath);
        if (localCallback) {
          localCallback();
        }
      });
    };

    $rootScope.$on('saveProjectAs', function(event, callback) {
      $scope.saveProjectAs(callback);
    });

    $scope.addAsBlock = function() {
      utils.openDialog('#input-add-as-block', '.ice', function(filepath) {
        project.addAsBlock(filepath);
      });
    };

    $scope.exportVerilog = function() {
      checkGraph(function() {
        utils.saveDialog('#input-export-verilog', '.v', function(filepath) {
          project.export('verilog', filepath, gettextCatalog.getString('Verilog code exported'));
          updateWorkingdir(filepath);
        });
      });
    };

    $scope.exportPCF = function() {
      checkGraph(function() {
        utils.saveDialog('#input-export-pcf', '.pcf', function(filepath) {
          project.export('pcf', filepath, gettextCatalog.getString('PCF file exported'));
          updateWorkingdir(filepath);
        });
      });
    };

    $scope.exportTestbench = function() {
      checkGraph(function() {
        utils.saveDialog('#input-export-testbench', '.v', function(filepath) {
          project.export('testbench', filepath, gettextCatalog.getString('Testbench exported'));
          updateWorkingdir(filepath);
        });
      });
    };

    $scope.exportGTKwave = function() {
      checkGraph(function() {
        utils.saveDialog('#input-export-gtkwave', '.gtkw', function(filepath) {
          project.export('gtkwave', filepath, gettextCatalog.getString('GTKWave exported'));
          updateWorkingdir(filepath);
        });
      });
    };

    function updateWorkingdir(filepath) {
      $scope.workingdir = utils.dirname(filepath) + utils.sep;
    }

    $scope.quit = function() {
      exit();
    };

    function exit() {
      alertify.confirm(
        gettextCatalog.getString('Do you want to exit the application?'),
        function() {
          profile.save();
          win.close(true);
        });
    }


    //-- Edit

    $scope.resetView = function() {
      graph.resetState();
    };

    $scope.cloneSelected = function() {
      graph.cloneSelected();
    };

    $scope.removeSelected = function() {
      if (graph.hasSelection()) {
        // TODO: don't show again checkbox
        alertify.confirm(gettextCatalog.getString('Do you want to remove the selected block?'),
          function() {
            project.removeSelected();
        });
      }
    };

    $scope.clearGraph = function() {
      checkGraph(function() {
        alertify.confirm(gettextCatalog.getString('Do you want to clear all?'),
        function() {
          project.clear();
        });
      }, function() {});
    };

    $scope.setProjectInformation = function() {
      var p = project.project.package;
      var values = [
        p.name,
        p.version,
        p.description,
        p.author,
        p.image
      ];
      utils.projectinfoprompt(values, function(evt, values) {
        project.project.package.name = values[0];
        project.project.package.version = values[1];
        project.project.package.description = values[2];
        project.project.package.author = values[3];
        project.project.package.image = values[4];
      });
    };

    $scope.setRemoteHostname = function() {
      var current = profile.data.remoteHostname;
      alertify.prompt(gettextCatalog.getString('Enter the remote hostname user@host (experimental)'), (current) ? current : '',
        function(evt, remoteHostname) {
          profile.data.remoteHostname = remoteHostname;
      });
    };

    $scope.selectLanguage = function(language) {
      if (profile.data.language !== language) {
        profile.data.language = language;
        utils.setLocale(language);
      }
    };

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
        if (event.keyCode === 46 || // Supr
            (event.keyCode === 88 && event.ctrlKey)) { // Ctrl + x
          $scope.removeSelected();
        }
        else if (event.keyCode === 67 && event.ctrlKey) { // Ctrl + c
          $scope.cloneSelected();
        }
        if (process.platform === 'darwin') {
          if (event.keyCode === 8) { // Back
            $scope.removeSelected();
          }
        }
      }
      if (event.keyCode === 80 && event.ctrlKey) { // Ctrl + p
        // Print and save a window snapshot
        takeSnapshot();
      }
    });

    function takeSnapshot() {
      win.capturePage(function(img) {
        var base64Data = img.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
        saveSnapshot(base64Data);
      }, 'png');
    }

    function saveSnapshot(base64Data) {
      utils.saveDialog('#input-save-snapshot', '.png', function(filepath) {
        nodeFs.writeFile(filepath, base64Data, 'base64', function (err) {
          $scope.snapshotdir = utils.dirname(filepath) + utils.sep;
          $scope.$apply();
          if (!err) {
            alertify.success(gettextCatalog.getString('Image {{name}} saved', { name: utils.bold(utils.basename(filepath)) }));
          }
          else {
            throw err;
          }
        });
      });
    }


    //-- View

    $scope.showPCF = function() {
      gui.Window.open('resources/viewers/plain/pcf.html?board=' + boards.selectedBoard.name, {
        title: boards.selectedBoard.info.label + ' - PCF',
        focus: true,
        toolbar: false,
        resizable: true,
        width: 700,
        height: 700,
        icon: 'resources/images/icestudio-logo.png'
      });
    };

    $scope.showPinout = function() {
      var board = boards.selectedBoard;
      if (nodeFs.existsSync(nodePath.join('resources', 'boards', board.name, 'pinout.svg'))) {
        gui.Window.open('resources/viewers/svg/pinout.html?board=' + board.name, {
          title: boards.selectedBoard.info.label + ' - Pinout',
          focus: true,
          toolbar: false,
          resizable: true,
          width: 500,
          height: 700,
          icon: 'resources/images/icestudio-logo.png'
        });
      }
      else {
        alertify.notify(gettextCatalog.getString('{{board}} pinout not defined',  { board: utils.bold(board.info.label) }), 'warning', 5);
      }
    };

    $scope.showDatasheet = function() {
      var board = boards.selectedBoard;
      if (board.info.datasheet) {
        gui.Shell.openExternal(board.info.datasheet);
      }
      else {
        alertify.notify(gettextCatalog.getString('{{board}} datasheet not defined', { board: utils.bold(board.info.label) }), 'error', 5);
      }
    };


    //-- Boards

    $scope.selectBoard = function(board) {
      if (boards.selectedBoard.name !== board.name) {
        if (!graph.isEmpty()) {
          alertify.confirm(gettextCatalog.getString('The current FPGA I/O configuration will be lost. Do you want to change to {{name}} board?', { name: utils.bold(board.info.label) }),
            function() {
              boards.selectBoard(board.name);
              graph.resetIOChoices();
              alertify.success(gettextCatalog.getString('Board {{name}} selected', { name: utils.bold(board.info.label) }));
              utils.rootScopeSafeApply();
          });
        }
        else {
          boards.selectBoard(board.name);
          graph.resetIOChoices();
          alertify.success(gettextCatalog.getString('Board {{name}} selected',  { name: utils.bold(board.info.label) }));
        }
      }
    };


    //-- Tools

    $scope.verifyCode = function() {
      checkGraph(function() {
        tools.verifyCode();
      });
    };

    $scope.buildCode = function() {
      checkGraph(function() {
        tools.buildCode();
      });
    };

    $scope.uploadCode = function() {
      checkGraph(function() {
        tools.uploadCode();
      });
    };

    function checkGraph(callback, callback2) {
      if (!graph.isEmpty()) {
        if (callback) {
          callback();
        }
      }
      else {
        if (callback2) {
          callback2();
        }
        else {
          alertify.notify(gettextCatalog.getString('Add a block to start'), 'warning', 5);
        }
      }
    }


    //-- Help

    $scope.openUrl = function(url) {
      event.preventDefault();
      gui.Shell.openExternal(url);
    };

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
        '    <p><span class="copyleft">&copy;</span> FPGAwars 2016-2017</p>',
        '  </div>',
        '</div>'].join('\n');
      alertify.alert(content);
    };

  });
