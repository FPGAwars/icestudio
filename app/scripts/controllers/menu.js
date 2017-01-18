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
                                    utils,
                                    gettextCatalog,
                                    gui,
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

    var zeroProject = true;  // New project without changes

    // Window events
    var win = gui.Window.get();
    win.on('close', function() {
      exit();
    });

    var openProject = false;
    win.on('openProject', function(args) {
      if (!openProject) {
        updateWorkingdir(args.filepath);
        project.open(args.filepath);
        openProject = true;
        zeroProject = false;
      }
    });

    var loadProject = false;
    win.on('loadProject', function(args) {
      if (!loadProject) {
        project.load(args.name, args.data);
        loadProject = true;
        zeroProject = false;
      }
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
      if (!graph.mousedown) {
        $scope.status[menu] = true;
      }
    };

    // mouseleave event
    $scope.hideMenu = function (menu) {
      timer = $timeout(function () {
        $scope.status[menu] = false;
      }, 700);
    };


    //-- File

    function newWindow() {
      // TODO: issue if the first window is removed new windows
      //       are not well created. Fix: reload the new window
      /* jshint -W106 */
      var _win = gui.Window.open('index.html', {
        focus: true,
        width: 900,
        height: 620,
        min_width: 800,
        min_height: 200,
        toolbar: true,
        resizable: true,
        x: (win ? win.x : 0) + 50,
        y: (win ? win.y : 0) + 50,
        icon: 'resources/images/icestudio-logo.png'
      });
      /* jshint +W106 */
      return _win;
    }

    $scope.newProject = function() {
      newWindow();
    };

    $scope.openProject = function() {
      utils.openDialog('#input-open-project', '.ice', function(filepath) {
        if (zeroProject) {
          // If this is the first action, open
          // the projec in the same window
          updateWorkingdir(filepath);
          project.open(filepath);
          zeroProject = false;
        }
        else if (project.changed || !equalWorkingFilepath(filepath)) {
          // If this is not the first action, and
          // the file path is different, open
          // the project in a new window
          var _win = newWindow();
          _win.on('loaded', function() {
            setTimeout(function() {
              _win.emit('openProject', { filepath: filepath });
            }, 200);
          });
        }
      });
    };

    $scope.loadProject = function(name, data) {
      if (data) {
        if (zeroProject) {
          // If this is the first action, load
          // the projec in the same window
          project.load(name, data);
          zeroProject = false;
        }
        else if (project.changed || (project.name !== name)) {
          // If this is not the first action, and
          // the project name is different, load
          // the project in a new window
          var _win = newWindow();
          _win.on('loaded', function() {
            setTimeout(function() {
              _win.emit('loadProject', { name: name, data: data });
            }, 200);
          });
        }
      }
    };

    $scope.saveProject = function() {
      var filepath = project.path;
      if (filepath) {
        project.save(filepath);
        resetChanged();
      }
      else {
        $scope.saveProjectAs();
      }
    };

    $scope.saveProjectAs = function(localCallback) {
      utils.saveDialog('#input-save-project', '.ice', function(filepath) {
        updateWorkingdir(filepath);
        project.save(filepath);
        resetChanged();
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

    function equalWorkingFilepath(filepath) {
      return $scope.workingdir + project.name + '.ice' === filepath;
    }

    $scope.quit = function() {
      exit();
    };

    function exit() {
      if (project.changed) {
        alertify.confirm(
          '<b>' + gettextCatalog.getString('Do you want to close the application?') + '</b><br>' +
          gettextCatalog.getString('Your changes will be lost if you don’t save them'),
          function() {
            _exit();
          });
      }
      else {
        _exit();
      }
      function _exit() {
        //win.hide();
        profile.save();
        win.close(true);
      }
    }


    //-- Edit

    $scope.undoGraph = function() {
      graph.undo();
    };

    $scope.redoGraph = function() {
      graph.redo();
    };

    $scope.cutSelected = function() {
      if (graph.hasSelection()) {
        graph.cutSelected();
      }
    };

    $scope.copySelected = function() {
      if (graph.hasSelection()) {
        graph.copySelected();
      }
    };

    var paste = true;

    $scope.pasteSelected = function() {
      if (paste) {
        paste = false;
        graph.pasteSelected();
        setTimeout(function() {
          paste = true;
        }, 250);
      }
    };

    $scope.selectAll = function() {
      checkGraph(function() {
        graph.selectAll();
      });
    };

    function removeSelected() {
      if (graph.hasSelection()) {
        //alertify.confirm(gettextCatalog.getString('Do you want to remove the selected block?'),
          //function() {
        project.removeSelected();
        //});
      }
    }

    $scope.resetView = function() {
      graph.resetView();
    };

    $scope.fitContent = function () {
      graph.fitContent();
    };

    $scope.setProjectInformation = function() {
      var p = project.get('package');
      var values = [
        p.name,
        p.version,
        p.description,
        p.author,
        p.image
      ];
      utils.projectinfoprompt(values, function(evt, values) {
        project.set('package', {
          name: values[0],
          version: values[1],
          description: values[2],
          author: values[3],
          image: values[4]
        });
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
              _boardSelected();
          });
        }
        else {
          _boardSelected();
        }
      }
      function _boardSelected() {
        graph.selectBoard(board.name);
        alertify.success(gettextCatalog.getString('Board {{name}} selected',  { name: utils.bold(board.info.label) }));
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

    function checkGraph(callback) {
      if (!graph.isEmpty()) {
        if (callback) {
          callback();
        }
      }
      else {
        alertify.notify(gettextCatalog.getString('Add a block to start'), 'warning', 5);
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


    // Events

    var storedUndoStack = [];
    var currentUndoStack = [];

    $(document).on('stackChanged', function(evt, undoStack) {
      currentUndoStack = undoStack;
      project.changed = JSON.stringify(storedUndoStack) !== JSON.stringify(undoStack);
      project.updateTitle();
      zeroProject = false;
    });

    function resetChanged() {
      storedUndoStack = currentUndoStack;
      project.changed = false;
      project.updateTitle();
      zeroProject = false;
    }

    // Shortcuts

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
      if (!promptShown) {
        if (graph.isEnabled()) {
          if (event.ctrlKey) {
            switch (event.keyCode) {
              case 78:  // Ctrl+N
              $scope.newProject();
              break;
              case 79:  // Ctrl+O
              $scope.openProject();
              break;
              case 83:
              if (event.shiftKey) { // Ctrl+Shift+S
                $scope.saveProjectAs();
              }
              else { // Ctrl+S
                $scope.saveProject();
              }
              break;
              case 81:  // Ctrl+Q
              $scope.quit();
              break;
              case 90:
              if (event.shiftKey) { // Ctrl+Shift+Z
                $scope.redoGraph();
                event.preventDefault();
              }
              else { // Ctrl+Z
                $scope.undoGraph();
                event.preventDefault();
              }
              break;
              case 89: // Ctrl+Y
              $scope.redoGraph();
              event.preventDefault();
              break;
              case 88: // Ctrl+X
              $scope.cutSelected();
              break;
              case 67: // Ctrl+C
              $scope.copySelected();
              break;
              case 86: // Ctrl+V
              $scope.pasteSelected();
              break;
              case 65: // Ctrl+A
              $scope.selectAll();
              break;
              case 48: // Ctrl+0
              $scope.resetView();
              break;
              case 70: // Ctrl+F
              $scope.fitContent();
              break;
              case 82: // Ctrl+R
              $scope.verifyCode();
              break;
              case 66: // Ctrl+B
              $scope.buildCode();
              break;
              case 85: // Ctrl+U
              $scope.uploadCode();
              break;
            }
          }

          switch (event.keyCode) {
            case 37: // Arrow Left
            if (graph.hasSelection()) {
              graph.stepLeft();
            }
            break;
            case 38: // Arrow Up
            if (graph.hasSelection()) {
              graph.stepUp();
            }
            break;
            case 39: // Arrow Right
            if (graph.hasSelection()) {
              graph.stepRight();
            }
            break;
            case 40: // Arrow Down
            if (graph.hasSelection()) {
              graph.stepDown();
            }
            break;
          }

          if (event.keyCode === 46) { // Supr
            removeSelected();
          }
        }
        if (event.keyCode === 8) { // Back
          if (!graph.isEnabled()) {
            $rootScope.$broadcast('breadcrumbsBack');
          }
          else {
            if (process.platform === 'darwin') {
              removeSelected();
            }
          }
        }
      }
      if (event.ctrlKey && event.keyCode === 80) { // Ctrl+P
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

  });
