'use strict';

angular.module('icestudio')
  .controller('MenuCtrl', function ($rootScope,
                                    $scope,
                                    $timeout,
                                    boards,
                                    profile,
                                    project,
                                    collections,
                                    graph,
                                    tools,
                                    utils,
                                    common,
                                    shortcuts,
                                    gettextCatalog,
                                    gui,
                                    _package,
                                    nodeFs,
                                    nodePath) {

    //-- Initialize scope

    $scope.profile = profile;
    $scope.project = project;
    $scope.tools = tools;
    $scope.common = common;

    $scope.version = _package.version;
    $scope.toolchain = tools.toolchain;

    $scope.workingdir = '';
    $scope.snapshotdir = '';

    var zeroProject = true;  // New project without changes

    // Initialize
    updateSelectedBoard();
    updateSelectedCollection();

    // Window events
    var win = gui.Window.get();
    win.on('close', function() {
      exit();
    });
    win.on('resize', function() {
      graph.fitContent();
    });

    // Darwin fix for shortcuts
    if (process.platform === 'darwin') {
      var mb = new gui.Menu({type: 'menubar'});
      mb.createMacBuiltin('Icestudio');
      win.menu = mb;
    }

    // Menu timer
    var timer;

    // mousedown event
    var mousedown = false;
    $(document).on('mouseup', function() { mousedown = false; });
    $(document).on('mousedown', function() { mousedown = true; });

    // mouseover event
    $scope.showMenu = function(menu) {
      $timeout.cancel(timer);
      if (!mousedown && !graph.addingDraggableBlock) {
        $scope.status[menu] = true;
      }
    };

    // mouseleave event
    $scope.hideMenu = function(menu) {
      timer = $timeout(function() {
        $scope.status[menu] = false;
      }, 700);
    };

    // Load app arguments
    setTimeout(function() {
      var local = false;
      for (var i in gui.App.argv) {
        var arg = gui.App.argv[i];
        processArg(arg);
        local = arg === 'local' || local;
      }
      if (local) {
        project.path = '';
      }
      else {
        updateWorkingdir(project.path);
      }
    }, 0);

    function processArg(arg) {
      if (nodeFs.existsSync(arg)) {
        // Open filepath
        var filepath = arg;
        project.open(filepath);
        //zeroProject = false;
      }
      else {
        // Move window
        var data = arg.split('x');
        var offset = {
          x: parseInt(data[0]),
          y: parseInt(data[1])
        };
        win.moveTo(offset.x, offset.y);
      }
    }


    //-- File

    $scope.newProject = function() {
      utils.newWindow();
    };

    $scope.openProjectDialog = function() {
      utils.openDialog('#input-open-project', '.ice', function(filepath) {
        if (zeroProject) {
          // If this is the first action, open
          // the projec in the same window
          updateWorkingdir(filepath);
          project.open(filepath);
          //zeroProject = false;
        }
        else if (project.changed || !equalWorkingFilepath(filepath)) {
          // If this is not the first action, and
          // the file path is different, open
          // the project in a new window
          utils.newWindow(filepath);
        }
      });
    };

    $scope.openProject = function(filepath) {
      if (zeroProject) {
        // If this is the first action, open
        // the projec in the same window
        project.open(filepath, true);
        //zeroProject = false;
      }
      else {
        // If this is not the first action, and
        // the file path is different, open
        // the project in a new window
        utils.newWindow(filepath, true);
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
      var notification = true;
      utils.openDialog('#input-add-as-block', '.ice', function(filepaths) {
        filepaths = filepaths.split(';');
        for (var i in filepaths) {
          project.addBlockFile(filepaths[i], notification);
        }
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
          utils.bold(gettextCatalog.getString('Do you want to close the application?')) + '<br>' +
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
        //profile.save();
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
      graph.cutSelected();
    };

    $scope.copySelected = function() {
      graph.copySelected();
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
      project.removeSelected();
    }

    $scope.resetView = function() {
      graph.resetView();
    };

    $scope.fitContent = function() {
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
      var current = profile.get('remoteHostname');
      alertify.prompt(gettextCatalog.getString('Enter the remote hostname user@host (experimental)'), (current) ? current : '',
        function(evt, remoteHostname) {
          profile.set('remoteHostname', remoteHostname);
      });
    };

    $scope.enableBoardRules = function() {
      graph.setBoardRules(true);
      alertify.success(gettextCatalog.getString('Board rules enabled'));
    };

    $scope.disableBoardRules = function() {
      graph.setBoardRules(false);
      alertify.success(gettextCatalog.getString('Board rules disabled'));
    };

    $(document).on('langChanged', function(evt, lang) {
      $scope.selectLanguage(lang);
    });

    $scope.selectLanguage = function(language) {
      if (profile.get('language') !== language) {
        profile.set('language', graph.selectLanguage(language));
        // Reload the project
        project.update({ deps: false }, function() {
          graph.loadDesign(project.get('design'), { disabled: false });
          //alertify.success(gettextCatalog.getString('Language {{name}} selected',  { name: utils.bold(language) }));
        });
      }
    };


    //-- View

    $scope.showPCF = function() {
      gui.Window.open('resources/viewers/plain/pcf.html?board=' + common.selectedBoard.name, {
        title: common.selectedBoard.info.label + ' - PCF',
        focus: true,
        toolbar: false,
        resizable: true,
        width: 700,
        height: 700,
        icon: 'resources/images/icestudio-logo.png'
      });
    };

    $scope.showPinout = function() {
      var board = common.selectedBoard;
      if (nodeFs.existsSync(nodePath.join('resources', 'boards', board.name, 'pinout.svg'))) {
        gui.Window.open('resources/viewers/svg/pinout.html?board=' + board.name, {
          title: common.selectedBoard.info.label + ' - Pinout',
          focus: true,
          toolbar: false,
          resizable: true,
          width: 500,
          height: 700,
          icon: 'resources/images/icestudio-logo.png'
        });
      }
      else {
        alertify.warning(gettextCatalog.getString('{{board}} pinout not defined',  { board: utils.bold(board.info.label) }), 5);
      }
    };

    $scope.showDatasheet = function() {
      var board = common.selectedBoard;
      if (board.info.datasheet) {
        gui.Shell.openExternal(board.info.datasheet);
      }
      else {
        alertify.error(gettextCatalog.getString('{{board}} datasheet not defined', { board: utils.bold(board.info.label) }), 5);
      }
    };

    $scope.showBoardRules = function() {
      var board = common.selectedBoard;
      var rules = JSON.stringify(board.rules);
      if (rules !== '{}') {
        gui.Window.open('resources/viewers/table/rules.html?rules=' + rules, {
          title: common.selectedBoard.info.label + ' - Rules',
          focus: true,
          toolbar: false,
          resizable: false,
          width: 500,
          height: 500,
          icon: 'resources/images/icestudio-logo.png'
        });
      }
      else {
        alertify.error(gettextCatalog.getString('{{board}} rules not defined', { board: utils.bold(board.info.label) }), 5);
      }
    };

    $scope.showCollectionData = function() {
      var collection = common.selectedCollection;
      var readme = collection.content.readme;
      if (readme) {
        gui.Window.open('resources/viewers/markdown/readme.html?readme=' + readme, {
          title: collection.name + ' - Data',
          focus: true,
          toolbar: false,
          resizable: true,
          width: 700,
          height: 700,
          icon: 'resources/images/icestudio-logo.png'
        });
      }
      else {
        alertify.error(gettextCatalog.getString('Collection {{collection}} data not defined', { collection: utils.bold(collection.name) }), 5);
      }
    };

    $scope.selectCollection = function(collection) {
      if (common.selectedCollection.name !== collection.name) {
        var name = collections.selectCollection(collection.name);
        profile.set('collection', name);
        alertify.success(gettextCatalog.getString('Collection {{name}} selected',  { name: utils.bold(name) }));
      }
    };

    function updateSelectedCollection() {
      profile.set('collection', collections.selectCollection(profile.get('collection')));
    }


    //-- Boards

    $(document).on('boardChanged', function(evt, board) {
      if (common.selectedBoard.name !== board.name) {
        var newBoard = graph.selectBoard(board);
        profile.set('board', newBoard.name);
      }
    });

    $scope.selectBoard = function(board) {
      if (common.selectedBoard.name !== board.name) {
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
        var newBoard = graph.selectBoard(board);
        profile.set('board', newBoard.name);
        alertify.success(gettextCatalog.getString('Board {{name}} selected',  { name: utils.bold(newBoard.info.label) }));
      }
    };

    function updateSelectedBoard() {
      profile.set('board', boards.selectBoard(profile.get('board')).name);
    }


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
        alertify.warning(gettextCatalog.getString('Add a block to start'), 5);
      }
    }

    $scope.addCollections = function() {
      utils.openDialog('#input-add-collection', '.zip', function(filepaths) {
        filepaths = filepaths.split(';');
        tools.addCollections(filepaths);
      });
    };

    $scope.removeCollection = function(collection) {
      alertify.confirm(gettextCatalog.getString('Do you want to remove the {{name}} collection?', { name: utils.bold(collection.name) }),
      function() {
        tools.removeCollection(collection);
        updateSelectedCollection();
        utils.rootScopeSafeApply();
      });
    };

    $scope.removeAllCollections = function() {
      if (common.collections.length > 1) {
        alertify.confirm(gettextCatalog.getString('All stored collections will be lost. Do you want to continue?'),
        function() {
          tools.removeAllCollections();
          updateSelectedCollection();
          utils.rootScopeSafeApply();
        });
      }
      else {
        alertify.warning(gettextCatalog.getString('No collections stored'), 5);
      }
    };


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

    // Detect prompt

    var promptShown = false;

    alertify.prompt().set({
      onshow: function() {
        promptShown = true;
      },
      onclose: function() {
        promptShown = false;
      }
    });

    alertify.confirm().set({
      onshow: function() {
        promptShown = true;
      },
      onclose: function() {
        promptShown = false;
      }
    });

    // Configure all shortcuts

    // -- File
    shortcuts.method('newProject', $scope.newProject);
    shortcuts.method('openProject', $scope.openProjectDialog);
    shortcuts.method('saveProject', $scope.saveProject);
    shortcuts.method('saveProjectAs', $scope.saveProjectAs);
    shortcuts.method('quit', $scope.quit);

    // -- Edit
    shortcuts.method('undoGraph', $scope.undoGraph);
    shortcuts.method('redoGraph', $scope.redoGraph);
    shortcuts.method('redoGraph2', $scope.redoGraph);
    shortcuts.method('cutSelected', $scope.cutSelected);
    shortcuts.method('copySelected', $scope.copySelected);
    shortcuts.method('pasteSelected', $scope.pasteSelected);
    shortcuts.method('selectAll', $scope.selectAll);
    shortcuts.method('resetView', $scope.resetView);
    shortcuts.method('fitContent', $scope.fitContent);

    // -- Tools
    shortcuts.method('verifyCode', $scope.verifyCode);
    shortcuts.method('buildCode', $scope.buildCode);
    shortcuts.method('uploadCode', $scope.uploadCode);

    // -- Misc
    shortcuts.method('stepUp', graph.stepUp);
    shortcuts.method('stepDown', graph.stepDown);
    shortcuts.method('stepLeft', graph.stepLeft);
    shortcuts.method('stepRight', graph.stepRight);

    shortcuts.method('removeSelected', removeSelected);
    shortcuts.method('back', function() {
      if (graph.isEnabled()) {
        removeSelected();
      }
      else {
        $rootScope.$broadcast('breadcrumbsBack');
      }
    });

    shortcuts.method('takeSnapshot', takeSnapshot);

    // Detect shortcuts

    $(document).on('keydown', function(event) {
      var opt = {
        prompt: promptShown,
        disabled: !graph.isEnabled()
      };

      var ret = shortcuts.execute(event, opt);
      if (ret.preventDefault) {
        event.preventDefault();
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
        nodeFs.writeFile(filepath, base64Data, 'base64', function(err) {
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
