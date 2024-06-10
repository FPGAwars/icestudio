"use strict";

//-- Nodejs path module
//-- https://nodejs.org/docs/latest-v17.x/api/path.html
const path = require('path');

//-- Nodejs URL module
//-- https://nodejs.org/api/url.html
const url = require('url');

//-- node fs module
//-- https://nodejs.org/api/fs.html
const fs = require('fs');

angular
  .module("icestudio")
  .controller(
    "MenuCtrl",
    function (
      $rootScope,
      $scope,
      $timeout,
      profile,
      project,
      collections,
      graph,
      tools,
      utils,
      blocks,
      forms,
      common,
      shortcuts,
      gettextCatalog,

      //-- Accessing _package object
      //-- Defined in module app/scripts/factories/window.js
      _package
    ) {

      //-------------------------------------------------------------------------
      //-- This code is executed when a new Icestudio Window is created:
      //--  Either on startup, when a new project is created or when an
      //--  example is opened
      //--
      //-- The new window receives the parameters through the URL
      //-- Ex. 
      //-------------------------------------------------------------------------  

      //-- Initialize scope

      $scope.profile = profile;
      $scope.project = project;
      $scope.tools = tools;
      $scope.common = common;

      $scope.version = _package.version;
      $scope.toolchain = tools.toolchain;

      $scope.workingdir = "";
      $scope.snapshotdir = "";

      let zeroProject = true; // New project without changes
      let resultAlert = null;
      let winCommandOutput = null;

      let buildUndoStack = [];
      let changedUndoStack = [];
      let currentUndoStack = [];

      //-----------------------------------
      // MAIN WINDOW
      //-----------------------------------

      //-- Get the Window object
      //-- The nw object is globally available. It contains all the
      //-- NWjs APIs
      //-- More information:
      //--  https://nwjs.readthedocs.io/en/latest/ 
      let win = nw.Window.get();

      //-- ONLY MAC:
      //-- Creates the builtin menus (App, Edit and Window) within the menubar
      //-- on Mac
      //-- More information: 
      //-- https://nwjs.readthedocs.io/en/latest/References/Menu/
      //-- #menucreatemacbuiltinappname-options-mac
      if (process.platform === "darwin") {

        let mb = new nw.Menu({
          type: "menubar",
        });

        mb.createMacBuiltin("Icestudio");
        win.menu = mb;
      }

      //-- Get the focus on the main window
      win.focus();

      //--------------------------------------------------------------
      //-- Configure the window events
      //-- More information:
      //-- https://nwjs.readthedocs.io/en/latest/References/Window/
      //--------------------------------------------------------------

      //-- Event: Window closed
      win.on("close", function () {

        //-- Call the exit function
        exit();
      });

      //-- Event: The window is maximized
      win.on("maximize", function () {

        //-- Adjust the paper to the new size
        graph.fitPaper();
      });

      //-- Event: The window was resized
      win.on("resize", function () {

        //-- When working with big designs it is better not to fit 
        //-- the contents (Leave it commented)
        graph.fitPaper();
        //graph.fitContent();
      });

      //-- Event: The window was moved
      win.on("move", function () {
        //-- When working with big designs it is better not to fit
        //-- the contents (leave it commented)
        //graph.fitContent();
      });

      //-- Emitted when window is restored from minimize, maximize and 
      //-- fullscreen state.
      win.on("restore", function () {
        graph.fitContent();
      });


      //-------------------------------------------------------------------------
      //-- Read the arguments passed to the app
      //-- If no arguments, nothing is done (just a blank project)
      //-- Currently, there is only one argument to pass: The filename of the
      //--   icestudio design to open
      //-------------------------------------------------------------------------

      //-- The parameters are located in the URL
      //-- They can be obtained by the global object window.location.search
      //--  It returns the querystring part of a URL, including the question
      //--  mark (?).

      //-- Build the URL object
      let myURL = new url.URL("http://index.html" + window.location.search);

      //-- Icestudio file to open on the new window. 
      //-- There is no .ice file by default
      let filepath = "";

      //-- Get the icestudio_argv param
      let icestudioArgv = myURL.searchParams.get('icestudio_argv');

      //-- The argument is given as URL
      //-- It happens when a new icestudio project is created or a file/example
      //-- are loaded in a new window
      if (icestudioArgv) {

        //-- Decode the arguments again (from base64 to utf8)
        //-- What is obtained is a json string
        let paramsJson = Buffer.from(icestudioArgv, 'base64').toString('utf8');

        //-- Get the final params object
        let params = JSON.parse(paramsJson);

        //-- Get the filepath
        filepath = params["filepath"];
      }
      //-- No argument through url
      //-- Check if there was an argument coming from the command line
      //-- If there are arguments is because it has been start by double
      //-- clicking on an .ice file
      else {

        //-- Read the arguments from nw API
        let args = nw.App.argv;

        //-- There arguments
        if (args.length > 0) {

          //-- Read the first argument. It should be the filepath
          filepath = nw.App.argv[0];
        }
      }

      //-- If there was a .ice file given
      if (filepath) {

        //-- Check the filepath
        if (fs.existsSync(filepath)) {

          //-- Open the file
          project.open(filepath);
        }
      }

      //-- Set the working directory for the current design
      updateWorkingdir(project.path);

      //-- Show the version notes after some time, if the corresponding option
      //-- was set in the profile
      setTimeout(function () {

        //-- Get the current state of the version info
        let versionW = $scope.profile.get("displayVersionInfoWindow");

        //-- Get the latest version used
        let lastversionReview = $scope.profile.get("lastVersionReview");

        //-- Check if the current version is newer than the one used
        //-- before
        let hasNewVersion =
          lastversionReview === false || lastversionReview < _package.version;

        //-- Display the version notes, if the option is enabled or
        //-- if this is a newer version

        if (versionW === "yes" || hasNewVersion) {
          $scope.openVersionInfoWindow();
        }
      }, 500);


      //-------------------------------------------------------------------------
      //--  FUNCTIONS
      //-------------------------------------------------------------------------

      //-----------------------------------------------------------
      //-- Display the version notes info window
      //-----------------------------------------------------------
      $scope.openVersionInfoWindow = function () {

        //-- The version notes panel is no longer hidden: Show it!
        $("#version-info-tab").removeClass("hidden");

        //-- Get the state of the version notes: to be displayed or not
        let versionW = $scope.profile.get("displayVersionInfoWindow");

        //-- Get the state for the "don't display" checkbox
        let noShowVersion = (versionW === "no");

        //-- Set the state of the "don't display" checkbox
        $('#version-info-tab--no-display').prop(
          "checked",
          noShowVersion
        );
      };

      //-------------------------------------------------------------------------
      //-- Callback function of the CLOSE button from the version notes window
      //-- The state of the "don't display" checkbox is stored in the
      //-- profile file
      //-------------------------------------------------------------------------
      $scope.closeVersionInfoWindow = function () {

        //-- Hide the version notes window
        $("#version-info-tab").addClass("hidden");

        //-- Get the state of the "Don't display" checkbox
        let nodisplay = $('#version-info-tab--no-display').is(
          ":checked"
        );

        console.log('VERSION WIN', nodisplay);
        //-- Write the option to the profile file (so that it is remembered
        //--  after icestudio is closed)
        let option = (nodisplay) ? "no" : "yes";
        profile.set("displayVersionInfoWindow", option);
        profile.set("lastVersionReview", _package.version);
      };


      //---------------------------------------------------------------------
      //-- CALLBACK FUNCTIONS for the File MENU
      //---------------------------------------------------------------------

      //-- FILE/New
      $scope.newProject = () => {

        //-- Create a new blank icestudio window
        //-- A non-existent file is passed as a parameters
        //-- It let us distinguish if the new window was created because of
        //-- a new file, or it was the first window opened
        iceConsole.log("---> NEW PROJECT!!");
        utils.newWindow("Untitled.ice");
      };


      //-------------------------------------------------------------------------
      //-- FILE/Open
      //-- Open a new .ice file and load it in Icestudio
      //-- A Dialog for selecting the file is displayed
      //-------------------------------------------------------------------------
      $scope.openProjectDialog = function () {

        //-- Open the file Dialog
        //-- The selector is passed as a parameter
        //-- The html element is located in the menu.html file
        utils.openDialog("#input-open-project", function (filepath) {

          //-- Open the file in icestudio
          $scope.openProject(filepath);

        });
      };

      //--------------------------------------------------------------------------
      //-- Open an icestudio File directly (No Dialog)
      //--
      //-- INPUTS:
      //--   * filepath (String): Icestudio file to open
      //--------------------------------------------------------------------------
      $scope.openProject = function (filepath) {

        if (zeroProject) {
          // If this is the first action, open
          // the project in the same window

          updateWorkingdir(filepath);
          project.open(filepath);

        }
        else if (project.changed || !equalWorkingFilepath(filepath)) {
          // If this is not the first action, and
          // the file path is different, open
          // the project in a new window
          utils.newWindow(filepath);
        }
      };



      $scope.saveProject = function () {
        if (
          (typeof common.isEditingSubmodule !== "undefined" &&
            common.isEditingSubmodule === true) || graph.breadcrumbs.length > 1
        ) {
          alertify.alert(
            gettextCatalog.getString("Save submodule"),
            gettextCatalog.getString(
              'To save your design you need to lock the padlock and \
              go to the top-level design.<br/><br/>If you want to export \
              this submodule to a file, use the \"Save as\" command.'
            ),
            function () { }
          );

          return;
        }

        var filepath = project.path;
        if (filepath) {
          project.save(filepath, function () {
            reloadCollectionsIfRequired(filepath);
          });
          resetChangedStack();
        } else {
          $scope.saveProjectAs();
        }
      };

      $scope.doSaveProjectAs = function (localCallback) {
        utils.saveDialog("#input-save-project", ".ice", function (filepath) {
          updateWorkingdir(filepath);


          project.save(filepath, function () {
            reloadCollectionsIfRequired(filepath);
          });
          resetChangedStack();
          if (localCallback) {
            localCallback();
          }
        });
      };


      $scope.saveProjectAs = function (localCallback) {
        if ((typeof common.isEditingSubmodule === "undefined" || (
          typeof common.isEditingSubmodule !== "undefined" &&
          common.isEditingSubmodule === false)

        ) && graph.breadcrumbs.length > 1) {

          alertify.alert(
            gettextCatalog.getString("Export submodule"),
            gettextCatalog.getString(
              'You are navigating into the design: If you want to save the entire design, you need to go back \
                     to the top-level. If you want to export this module as new file, unlock the module and use \"Save as\".'
            ),
            function () { }
          );
        } else {
          if (
            typeof common.isEditingSubmodule !== "undefined" &&
            common.isEditingSubmodule === true
          ) {
            alertify.confirm(
              gettextCatalog.getString("Export submodule"),
              gettextCatalog.getString(
                'You are editing a submodule, so you will save just this submodule (\"Save as\" works like \"Export \
                module\"). Do you want to continue?'
              ),
              function () {
                $scope.doSaveProjectAs(localCallback);
              },
              function () { }
            );
          } else {
            $scope.doSaveProjectAs(localCallback);
          }
        }
      };

      function reloadCollectionsIfRequired(filepath) {
        var selected = common.selectedCollection.name;
        if (filepath.startsWith(common.INTERNAL_COLLECTIONS_DIR)) {
          collections.loadInternalCollections();
        }
        if (filepath.startsWith(profile.get("externalCollections"))) {
          collections.loadExternalCollections();
        }
        if (
          (selected &&
            filepath.startsWith(
              path.join(common.INTERNAL_COLLECTIONS_DIR, selected)
            )) ||
          filepath.startsWith(
            path.join(profile.get("externalCollections"), selected)
          )
        ) {
          collections.selectCollection(common.selectedCollection.path);
        }
      }

      $rootScope.$on("saveProjectAs", function (event, callback) {
        $scope.saveProjectAs(callback);
      });

      $scope.addAsBlock = function () {
        var notification = true;
        utils.openDialog("#input-add-as-block",
          function (filepaths) {
            filepaths = filepaths.split(";");
            for (var i in filepaths) {
              project.addBlockFile(filepaths[i], notification);
            }
          });
      };

      $scope.exportVerilog = function () {
        exportFromCompiler("verilog", "Verilog", ".v");
      };

      $scope.exportPCF = function () {
        exportFromCompiler("pcf", "PCF", ".pcf");
      };

      $scope.exportTestbench = function () {
        exportFromCompiler("testbench", "Testbench", ".v");
      };

      $scope.exportGTKwave = function () {
        exportFromCompiler("gtkwave", "GTKWave", ".gtkw");
      };

      $scope.exportBLIF = function () {
        exportFromBuilder("blif", "BLIF", ".blif");
      };

      $scope.exportASC = function () {
        exportFromBuilder("asc", "ASC", ".asc");
      };
      $scope.exportBitstream = function () {
        exportFromBuilder("bin", "Bitstream", ".bin");
      };

      function exportFromCompiler(id, name, ext) {
        checkGraph()
          .then(function () {
            // TODO: export list files
            utils.saveDialog("#input-export-" + id, ext, function (filepath) {
              // Save the compiler result
              var data = project.compile(id)[0].content;
              utils
                .saveFile(filepath, data)
                .then(function () {
                  alertify.success(
                    gettextCatalog.getString("{{name}} exported", {
                      name: name,
                    })
                  );
                })
                .catch(function (error) {
                  alertify.error(error, 30);
                });
              // Update the working directory
              updateWorkingdir(filepath);
            });
          })
          .catch(function () { });
      }

      function exportFromBuilder(id, name, ext) {
        checkGraph()
          .then(function () {
            return tools.buildCode();
          })
          .then(function () {
            resetBuildStack();
          })
          .then(function () {
            utils.saveDialog("#input-export-" + id, ext, function (filepath) {
              // Copy the built file
              if (
                utils.copySync(
                  path.join(common.BUILD_DIR, "hardware" + ext),
                  filepath
                )
              ) {
                alertify.success(
                  gettextCatalog.getString("{{name}} exported", {
                    name: name,
                  })
                );
              }
              // Update the working directory
              updateWorkingdir(filepath);
            });
          })
          .catch(function () { });
      }

      //---------------------------------------------------------------------
      //-- Store the current working directory
      //-- It is extracted from the given filepath
      //--
      //--  Ex. filepath = "/home/obijuan/test.ice"
      //--  The current working directory is set to "/home/obijuan/"
      //---------------------------------------------------------------------
      function updateWorkingdir(filepath) {

        //-- Get the directory name
        //-- Ex. "/home/obijuan"
        let dirname = path.dirname(filepath);

        //-- Add the final separator
        //-- Ex. "/home/obijuan/"
        let workingdir = path.join(dirname, path.sep);

        //-- Store the current working directory
        $scope.workingdir = workingdir;

        //-- Debug:
        console.log("Working dir: " + $scope.workingdir);
      }


      function equalWorkingFilepath(filepath) {
        return $scope.workingdir + project.name + ".ice" === filepath;
      }


      $scope.quit = function () {
        exit();
      };

      function exit() {
        if (project.changed) {
          alertify.set("confirm", "labels", {
            ok: gettextCatalog.getString("Close"),
          });
          alertify.set("confirm", "defaultFocus", "cancel");
          alertify.confirm(
            utils.bold(
              gettextCatalog.getString("Do you want to close " +
                "the application?")
            ) +
            "<br>" +
            gettextCatalog.getString(
              "Your changes will be lost if you don’t save them"
            ),
            function () {
              // Close
              _exit();
            },
            function () {
              // Cancel
              setTimeout(function () {
                alertify.set("confirm", "labels", {
                  ok: gettextCatalog.getString("OK"),
                });
                alertify.set("confirm", "defaultFocus", "ok");
              }, 200);
            }
          );
        } else {
          _exit();
        }

        //-----------------------------
        //-- Close the current window
        //-----------------------------
        function _exit() {
          win.close(true);
        }
      }

      //---------------------------------------------------------------------
      //-- CALLBACK FUNCTIONS for the EDIT MENU
      //---------------------------------------------------------------------
      $scope.undoGraph = function () {
        graph.undo();
      };

      $scope.redoGraph = function () {
        graph.redo();
      };

      $scope.cutSelected = function () {
        graph.cutSelected();
      };

      $scope.copySelected = function () {
        graph.copySelected();
      };

      var paste = true;

      $scope.pasteSelected = function () {
        if (paste) {
          paste = false;
          graph.pasteSelected();
          setTimeout(function () {
            paste = true;
          }, 250);
        }
      };
      var pasteAndClone = true;
      $scope.pasteAndCloneSelected = function () {
        if (paste) {
          pasteAndClone = false;
          graph.pasteAndCloneSelected();
          setTimeout(function () {
            pasteAndClone = true;
          }, 250);
        }
      };

      $scope.duplicateSelected = function () {
        graph.duplicateSelected();
      };

      $scope.removeSelected = function () {
        graph.removeSelected();
      };

      $scope.selectAll = function () {
        checkGraph()
          .then(function () {
            graph.selectAll();
          })
          .catch(function () { });
      };

      $scope.showLabelFinder = function () {
        showLabelFinder();
      };

      $scope.showToolBox = function () {
        showToolBox();
      };

      $scope.showCollectionManager = function () {
        showCollectionManager();
      };

      /* redundant: patched via $scope - @mgesteiro
      function removeSelected() {
        project.removeSelected();  // <- this is justa a wrapper of graph.removeSelected()
      }
      */

      $scope.fitContent = function () {
        graph.fitContent();
      };

      //---------------------------------------------------------------------
      //-- Display a form for asking the user to introduce the
      //-- log filename
      //---------------------------------------------------------------------
      $scope.setLoggingFile = function () {

        //-- Get the current log file
        const lFile = profile.get("loggingFile");

        //-- Create the form
        let form = new forms.FormLogfile(lFile);

        //-- Display the form
        form.display((evt) => {

          //-- The callback is executed when the user has pressed the 
          //-- OK button

          //-- Process the information in the form
          //-- The results are stored inside the form
          //-- In case of error the corresponding notifications are raised
          form.process(evt);

          //-- If there were errors, the form is not closed
          //-- Return without closing
          if (evt.cancel) {
            return;
          }

          //-- Read the new logfile
          let newLogfile = form.values[0];

          //-- If there was not a change in the log file... return
          if (newLogfile === lFile) {
            return;
          }

          const hd = new IceHD();
          const separator =
            common.DARWIN === false && common.LINUX === false ? "\\" : "/";

          const dirLFile = newLogfile.substring(
            0,
            newLogfile.lastIndexOf(separator) + 1
          );

          //-- If the file is valid ...
          if (newLogfile === "" || hd.isValidPath(dirLFile)) {

            //-- Set the new file
            profile.set("loggingFile", newLogfile);

            //-- Notify to the user
            alertify.success(
              gettextCatalog.getString("Logging file updated")
            );
          }
          //-- The file is not valid 
          else {

            //-- Notify the error
            evt.cancel = true;
            resultAlert = alertify.error(
              gettextCatalog.getString(
                "Path {{path}} does not exist",
                {
                  path: newLogfile,
                },
                5
              )
            );
          }
        });
      };

      //---------------------------------------------------------------------
      //-- Display a form for asking the user to introduce the
      //-- external plugin path
      //---------------------------------------------------------------------
      $scope.setExternalPlugins = function () {

        //-- Get the current external Plugin path
        const externalPlugins = profile.get("externalPlugins");

        //-- Create the form
        let form = new forms.FormExternalPlugins(externalPlugins);

        //-- Display the form
        form.display((evt) => {

          //-- The callback is executed when the user has pressed the 
          //-- OK button

          //-- Process the information in the form
          form.process(evt);

          //-- Read the new plugins path
          let newPath = form.values[0];

          //-- If there was not a change... return
          if (newPath === externalPlugins) {
            return;
          }

          //-- If the file is valid...
          if (newPath === "" || fs.existsSync(newPath)) {

            //-- Set the new file
            profile.set("externalPlugins", newPath);

            //-- Notify to the user
            alertify.success(
              gettextCatalog.getString("External plugins updated")
            );
          }
          //-- The file is not valid 
          else {
            //-- Notify the error
            evt.cancel = true;
            resultAlert = alertify.error(
              gettextCatalog.getString(
                "Path {{path}} does not exist",
                {
                  path: newPath,
                },
                5
              )
            );
          }
        });
      };

      //---------------------------------------------------------------------
      //-- Display a form for asking the user to introduce the
      //-- python path
      //---------------------------------------------------------------------
      $scope.setPythonEnv = function () {

        //-- Get the current python path
        let pythonEnv = profile.get("pythonEnv");

        //-- Create the form
        let form = new forms.FormPythonEnv(pythonEnv.python, pythonEnv.pip);

        //-- Display the form
        form.display((evt) => {

          //-- The callback is executed when the user has pressed the 
          //-- OK button

          //-- Process the information in the form
          form.process(evt);

          //-- Read the new paths
          let newPythonPath = form.values[0];
          let newPipPath = form.values[1];

          //-- If there where no changes ... return
          if (newPythonPath === pythonEnv.python &&
            newPipPath === pythonEnv.pip) {
            return;
          }

          //-- If the files are valid...
          if (
            (newPythonPath === "" || fs.existsSync(newPythonPath)) &&
            (newPipPath === "" || fs.existsSync(newPipPath))) {
            //-- The files are valid...
            //-- Set them in the profile
            let newPythonEnv = {
              python: newPythonPath, pip: newPipPath
            };
            profile.set("pythonEnv", newPythonEnv);

            //-- Notify to the user
            alertify.success(
              gettextCatalog.getString("Python environment updated")
            );
          }
          //-- The file is not valid 
          else {
            //-- Notify the user
            evt.cancel = true;
            resultAlert = alertify.error(
              gettextCatalog.getString(
                "Path {{path}} does not exist",
                {
                  path: "of python or pip",
                },
                5
              )
            );
          }
        });
      };

      //---------------------------------------------------------------------
      //-- Display a form for asking the user to introduce the
      //-- external collections path
      //---------------------------------------------------------------------
      $scope.setExternalCollections = function () {

        //-- Get the current external collection path
        let externalCollections = profile.get("externalCollections") || "";

        //-- Create the form
        let form = new forms.FormExternalCollections(externalCollections);

        //-- Display the form
        form.display((evt) => {
          //-- The callback is executed when the user has pressed the 
          //-- OK button

          //-- Process the information in the form
          form.process(evt);

          //-- Read the new path
          let newExternalCollections = form.values[0];

          //-- If there where no changes ... return
          if (newExternalCollections === externalCollections) {
            return;
          }

          //-- If the file is valid...
          if (
            newExternalCollections === "" ||
            fs.existsSync(newExternalCollections)
          ) {
            //-- The file is valid...
            //-- Set it in the profile
            profile.set("externalCollections", newExternalCollections);

            //-- Load the collections
            collections.loadExternalCollections();
            collections.selectCollection(); // default
            utils.rootScopeSafeApply();

            //-- Notify the user
            alertify.success(
              gettextCatalog.getString("External collections updated")
            );
          }
          //-- The file is not valid
          else {
            //-- Notify the user
            evt.cancel = true;
            resultAlert = alertify.error(
              gettextCatalog.getString(
                "Path {{path}} does not exist",
                {
                  path: newExternalCollections,
                },
                5
              )
            );
          }
        });
      };


      $(document).on("infoChanged", function (evt, newValues) {
        var values = getProjectInformation();
        if (!_.isEqual(values, newValues)) {
          graph.setInfo(values, newValues, project);
          alertify.message(
            gettextCatalog.getString("Project information updated") +
            ".<br>" +
            gettextCatalog.getString("Click here to view"),
            5
          ).callback = function (isClicked) {
            if (isClicked) {
              $scope.setProjectInformation();
            }
          };
        }
      });

      $scope.setProjectInformation = function () {
        var values = getProjectInformation();
        utils.projectinfoprompt(values, function (evt, newValues) {
          if (!_.isEqual(values, newValues)) {
            if (
              subModuleActive &&
              typeof common.submoduleId !== "undefined" &&
              typeof common.allDependencies[common.submoduleId] !== "undefined"
            ) {
              graph.setBlockInfo(values, newValues, common.submoduleId);
            } else {
              graph.setInfo(values, newValues, project);
            }
            alertify.success(
              gettextCatalog.getString("Project information updated")
            );
          }
        });
      };

      function getProjectInformation() {
        var p = false;
        if (
          subModuleActive &&
          typeof common.submoduleId !== "undefined" &&
          typeof common.allDependencies[common.submoduleId] !== "undefined"
        ) {
          p = common.allDependencies[common.submoduleId].package;
        } else {
          p = project.get("package");
        }
        return [p.name, p.version, p.description, p.author, p.image];
      }

      $scope.setRemoteHostname = function () {
        var current = profile.get("remoteHostname");
        alertify.prompt(
          gettextCatalog.getString("Enter the remote hostname user@host"),
          current ? current : "",
          function (evt, remoteHostname) {
            profile.set("remoteHostname", remoteHostname);
          }
        );
      };

      $scope.toggleBoardRules = function () {
        graph.setBoardRules(!profile.get("boardRules"));
        if (profile.get("boardRules")) {
          alertify.success(gettextCatalog.getString("Board rules enabled"));
        } else {
          alertify.success(gettextCatalog.getString("Board rules disabled"));
        }
      };

      $scope.toggleInoutPorts = function () {
        const newState = !profile.get("allowInoutPorts");
        profile.set("allowInoutPorts", newState);
        if (newState) {
          alertify.success(gettextCatalog.getString("Tri-state connections (inout ports) enabled"));
        } else {
          common.allowProjectInoutPorts = true; // if tri-state in current design, keep behaviour unchanged
          alertify.success(gettextCatalog.getString("Tri-state connections (inout ports) disabled"));
        }
      };

      $(document).on("langChanged", function (evt, lang) {
        $scope.selectLanguage(lang);
      });

      $scope.selectLanguage = function (language) {
        if (profile.get("language") !== language) {
          profile.set("language", graph.selectLanguage(language));
          // Reload the project
          project.update(
            {
              deps: false,
            },
            function () {
              graph.loadDesign(project.get("design"), {
                disabled: false,
              });
              //alertify.success(
              //  gettextCatalog.getString('Language {{name}} selected',
              //  { name: utils.bold(language) }));
            }
          );
          // Rearrange the collections content
          collections.sort();
        }
      };

      // Theme support
      $scope.selectTheme = function (theme) {
        if (profile.get("uiTheme") !== theme) {
          profile.set("uiTheme", theme);
          //-- Shared variable for ace-editor blocks in "profile.js"
          global.uiTheme = theme;
          //-- Load selected profile
          utils.loadProfile(profile);
          //-- Update actual opened project and/or blocks
          project.update(
            {
              deps: false,
            },
            function () {
              graph.loadDesign(project.get("design"), {
                disabled: false,
              });
            }
          );
          //ICEpm.publishAt('all', 'ui.updateTheme', { uiTheme: theme });
        }
      };

      $scope.showPCF = function () {
        nw.Window.open(
          "resources/viewers/plain/pcf.html?board=" + common.selectedBoard.name,
          {
            title: common.selectedBoard.info.label + " - PCF",
            focus: true,
            //toolbar: false,
            resizable: true,
            width: 700,
            height: 700,
            icon: "resources/images/icestudio-logo.png",
          }
        );
      };

      $scope.showPinout = function () {
        var board = common.selectedBoard;
        if (
          fs.existsSync(
            path.join("resources", "boards", board.name, "pinout.svg")
          )
        ) {
          nw.Window.open(
            "resources/viewers/svg/pinout.html?board=" + board.name,
            {
              title: common.selectedBoard.info.label + " - Pinout",
              focus: true,
              resizable: true,
              width: 500,
              height: 700,
              icon: "resources/images/icestudio-logo.png",
            }
          );
        } else {
          alertify.warning(
            gettextCatalog.getString("{{board}} pinout not defined", {
              board: utils.bold(board.info.label),
            }),
            5
          );
        }
      };

      $scope.showDatasheet = function () {
        var board = common.selectedBoard;
        if (board.info.datasheet) {
          nw.Shell.openExternal(board.info.datasheet);
        } else {
          alertify.error(
            gettextCatalog.getString("{{board}} datasheet not defined", {
              board: utils.bold(board.info.label),
            }),
            5
          );
        }
      };

      $scope.showBoardRules = function () {
        var board = common.selectedBoard;
        var rules = JSON.stringify(board.rules);
        if (rules !== "{}") {
          var encRules = encodeURIComponent(rules);
          nw.Window.open(
            "resources/viewers/table/rules.html?rules=" + encRules,
            {
              title: common.selectedBoard.info.label + " - Rules",
              focus: true,
              resizable: false,
              width: 500,
              height: 500,
              icon: "resources/images/icestudio-logo.png",
            }
          );
        } else {
          alertify.error(
            gettextCatalog.getString("{{board}} rules not defined", {
              board: utils.bold(board.info.label),
            }),
            5
          );
        }
      };

      //-----------------------------------------------------------------
      // View/System Info Window
      //--
      $scope.showSystemInfo = function () {
        //-- Write the information to the log file:
        iceConsole.log("---------------------");
        iceConsole.log("  VIEW/System Info");
        iceConsole.log("--------------------");
        iceConsole.log("BASE_DIR: " + common.BASE_DIR + "---");
        iceConsole.log("ICESTUDIO_DIR: " + common.ICESTUDIO_DIR + "---");
        iceConsole.log("PROFILE_PATH: " + common.PROFILE_PATH + "---");
        iceConsole.log("APIO_HOME_DIR: " + common.APIO_HOME_DIR + "---");
        iceConsole.log("ENV_DIR: " + common.ENV_DIR + "---");
        iceConsole.log("ENV_BIN_DIR: " + common.ENV_BIN_DIR + "---");
        iceConsole.log("ENV_PIP: " + common.ENV_PIP + "---");
        iceConsole.log("APIO_CMD: " + common.APIO_CMD + "---");
        iceConsole.log("APP: " + common.APP + "---");
        iceConsole.log("APP_DIR: " + common.APP_DIR + "---");
        iceConsole.log("\n\n");

        //-- Build the URL with all the parameters to pass to the window
        //-- The encodeURIComponent() function the characters so that the spaces and
        //-- other special characters can be place on the original URL
        let URL =
          `resources/viewers/system/system.html?version=${common.ICESTUDIO_VERSION}` +
          `&base_dir=${encodeURIComponent(common.BASE_DIR)}---` +
          `&icestudio_dir=${encodeURIComponent(common.ICESTUDIO_DIR)}---` +
          `&profile_path=${encodeURIComponent(common.PROFILE_PATH)}---` +
          `&apio_home_dir=${encodeURIComponent(common.APIO_HOME_DIR)}---` +
          `&env_dir=${encodeURIComponent(common.ENV_DIR)}---` +
          `&env_bin_dir=${encodeURIComponent(common.ENV_BIN_DIR)}---` +
          `&env_pip=${encodeURIComponent(common.ENV_PIP)}---` +
          `&apio_cmd=${encodeURIComponent(common.APIO_CMD)}---` +
          `&app=${encodeURIComponent(common.APP)}---` +
          `&app_dir=${encodeURIComponent(common.APP_DIR)}---`;

        //-- Create the window
        nw.Window.open(URL, {
          title: "System Info",
          focus: true,
          resizable: false,
          width: 700,
          height: 500,
          icon: "resources/images/icestudio-logo.png",
        });
      };

      $scope.toggleFPGAResources = function () {
        profile.set("showFPGAResources", !profile.get("showFPGAResources"));
      };

      $scope.toggleLoggingEnabled = function () {
        const newState = !profile.get("loggingEnabled");
        profile.set("loggingEnabled", newState);
        if (newState) {
          iceConsole.enable();
        } else {
          iceConsole.disable();
        }
      };

      $scope.showCollectionData = function () {
        var collection = common.selectedCollection;
        var readme = collection.content.readme;
        if (readme) {
          nw.Window.open(
            "resources/viewers/markdown/readme.html?readme=" + readme,
            {
              title:
                (collection.name ? collection.name : "Default") +
                " Collection - Data",
              focus: true,
              resizable: true,
              width: 700,
              height: 700,
              icon: "resources/images/icestudio-logo.png",
            }
          );
        } else {
          alertify.error(
            gettextCatalog.getString(
              "Collection {{collection}} info not defined",
              {
                collection: utils.bold(collection.name),
              }
            ),
            5
          );
        }
      };

      $scope.showCommandOutput = function () {
        winCommandOutput = nw.Window.open(
          "resources/viewers/plain/output.html?content=" +
          encodeURIComponent(common.commandOutput),
          {
            title: gettextCatalog.getString("Command output"),
            focus: true,
            resizable: true,
            width: 700,
            height: 400,
            icon: "resources/images/icestudio-logo.png",
          }
        );
      };

      $(document).on("commandOutputChanged", function (evt, commandOutput) {
        if (winCommandOutput) {
          try {
            winCommandOutput.window.location.href =
              "resources/viewers/plain/output.html?content=" +
              encodeURIComponent(commandOutput);
          } catch (e) {
            winCommandOutput = null;
          }
        }
      });

      $scope.selectCollection = function (collection) {
        if (common.selectedCollection.path !== collection.path) {
          var name = collection.name;
          profile.set(
            "collection",
            collections.selectCollection(collection.path)
          );
          alertify.success(
            gettextCatalog.getString("Collection {{name}} selected", {
              name: utils.bold(name ? name : "Default"),
            })
          );
        }
      };

      function updateSelectedCollection() {
        profile.set(
          "collection",
          collections.selectCollection(profile.get("collection"))
        );
      }

      $(document).on("boardChanged", function (evt, board) {
        if (common.selectedBoard.name !== board.name) {
          var newBoard = graph.selectBoard(board);
          profile.set("board", newBoard.name);
        }
      });

      $scope.selectBoard = function (board) {
        if (common.selectedBoard.name !== board.name) {
          if (!graph.isEmpty()) {
            alertify.confirm(
              gettextCatalog.getString(
                "The current FPGA I/O configuration will be lost. Do you want to change to the {{name}} board?",
                {
                  name: utils.bold(board.info.label),
                }
              ),
              function () {
                _boardSelected();
              }
            );
          } else {
            _boardSelected();
          }
        }

        function _boardSelected() {
          var reset = true;
          var newBoard = graph.selectBoard(board, reset);
          profile.set("board", newBoard.name);
          alertify.success(
            gettextCatalog.getString("Board {{name}} selected", {
              name: utils.bold(newBoard.info.label),
            })
          );
        }
      };

      $scope.verifyCode = function () {
        var startMessage = gettextCatalog.getString("Start verification");
        var endMessage = gettextCatalog.getString("Verification done");
        checkGraph()
          .then(function () {
            return tools.verifyCode(startMessage, endMessage);
          })
          .catch(function () { });
      };

      $scope.buildCode = function () {
        console.log('BUILDCODE', common);
        console.log('STACK', graph.breadcrumbs);
        if (graph.breadcrumbs.length > 1) {
          alertify.alert(
            gettextCatalog.getString("Build"),
            gettextCatalog.getString(
              "You can only build at the top-level design. Inside submodules, you can <strong>Verify</strong>"
            ),
            function () { }
          );
          return;
        }

        var startMessage = gettextCatalog.getString("Start build");
        var endMessage = gettextCatalog.getString("Build done");
        checkGraph()
          .then(function () {
            return tools.buildCode(startMessage, endMessage);
          })
          .then(function () {
            resetBuildStack();
          })
          .catch(function () { });
      };

      $scope.uploadCode = function () {

        if (graph.breadcrumbs.length > 1) {
          alertify.alert(
            gettextCatalog.getString("Upload"),
            gettextCatalog.getString(
              "You can only upload at the top-level design. Inside submodules, you can <strong>Verify</strong>"
            ),
            function () { }
          );

          return;
        }

        var startMessage = gettextCatalog.getString("Start upload");
        var endMessage = gettextCatalog.getString("Upload done");
        checkGraph()
          .then(function () {
            return tools.uploadCode(startMessage, endMessage);
          })
          .then(function () {
            resetBuildStack();
          })
          .catch(function () { });
      };

      function checkGraph() {
        return new Promise(function (resolve, reject) {
          if (!graph.isEmpty()) {
            resolve();
          } else {
            if (resultAlert) {
              resultAlert.dismiss(true);
            }
            resultAlert = alertify.warning(
              gettextCatalog.getString("Add a block to start"),
              5
            );
            reject();
          }
        });
      }

      $scope.addCollections = function () {
        utils.openDialog("#input-add-collection", function (filepaths) {
          filepaths = filepaths.split(";");
          tools.addCollections(filepaths);
        });
      };

      $scope.reloadCollections = function () {
        collections.loadAllCollections();
        collections.selectCollection(common.selectedCollection.path);
        //ICEpm.setEnvironment(common);
      };

      $scope.removeCollection = function (collection) {
        alertify.confirm(
          gettextCatalog.getString(
            "Do you want to remove the {{name}} collection?",
            {
              name: utils.bold(collection.name),
            }
          ),
          function () {
            tools.removeCollection(collection);
            updateSelectedCollection();
            utils.rootScopeSafeApply();
          }
        );
      };

      $scope.removeAllCollections = function () {
        if (common.internalCollections.length > 0) {
          alertify.confirm(
            gettextCatalog.getString(
              "All stored collections will be lost. Do you want to continue?"
            ),
            function () {
              tools.removeAllCollections();
              updateSelectedCollection();
              utils.rootScopeSafeApply();
            }
          );
        } else {
          alertify.warning(
            gettextCatalog.getString("No collections stored"),
            5
          );
        }
      };

      $scope.showChromeDevTools = function () {
        //win.showDevTools();
        utils.openDevToolsUI();
      };

      $scope.openUrl = function (url, $event) {
        $event.preventDefault();

        utils.openUrlExternalBrowser(url);
        return false;
      };

      $scope.about = function () {
        // English un-translated description:
        var content = [
          '<div class="row">',
          '  <div class="col-sm-4">',
          '    <img width="220px" src="resources/images/icestudio-github.svg">',
          '  </div>',
          '  <div class="col-sm-7" style="margin-left: 45px;">',
          '    <h4>Icestudio</h4>',
          '    <p><i>Visual editor for open FPGA boards</i></p>',
          '    <p>Version: ' + $scope.version + '</p>',
          '    <p>License: GPL-2.0</p>',
          '  </div>',
          '</div>',
          '<div class="row" style="margin-top:30px;">',
          '  <div class="col-sm-12">',

          '    <p>Core Team:</p>',
          '    <ul  class="credits-developers-list">',

          '           <li><strong>Carlos Venegas Arrabé</strong>&nbsp;&nbsp;&nbsp;',
          '<a class="action-open-url-external-browser" href="https://github.com/cavearr"><img class="credits-rss-icon" src="resources/images/icon-github.svg"></a>&nbsp;&nbsp;',
          '<a class="action-open-url-external-browser" href="https://twitter.com/cavearr"><img class="credits-rss-icon" src="resources/images/icon-twitter.svg"></a>',
          '</li>',
          '           <li><strong>Juan González Gómez</strong>&nbsp;&nbsp;&nbsp;',
          '<a class="action-open-url-external-browser" href="https://github.com/Obijuan"><img class="credits-rss-icon" src="resources/images/icon-github.svg"></a>&nbsp;&nbsp;',
          '<a class="action-open-url-external-browser" href="https://twitter.com/Obijuan_cube"><img class="credits-rss-icon" src="resources/images/icon-twitter.svg"></a>',
          '</li>',
          '</ul>',
          '    <p>Highlighted contributors:</p>',
          '    <ul  class="credits-developers-list">',

          '           <li><strong>Alex Gutierrez Tomas</strong>&nbsp;&nbsp;&nbsp;',
          '<a class="action-open-url-external-browser" href="https://github.com/mslider"><img class="credits-rss-icon" src="resources/images/icon-github.svg"></a>&nbsp;&nbsp;',
          '<a class="action-open-url-external-browser" href="https://twitter.com/microslider"><img class="credits-rss-icon" src="resources/images/icon-twitter.svg"></a>',
          '</li>',
          '           <li><strong>Joaquim</strong>&nbsp;&nbsp;&nbsp;',
          '<a class="action-open-url-external-browser" href="https://github.com/jojo535275"><img class="credits-rss-icon" src="resources/images/icon-github.svg"></a>&nbsp;&nbsp;',
          '</li>',
          '           <li><strong>Democrito</strong>&nbsp;&nbsp;&nbsp;',
          '<a class="action-open-url-external-browser" href="https://github.com/Democrito"><img class="credits-rss-icon" src="resources/images/icon-github.svg"></a>&nbsp;&nbsp;',
          '</li>',
          '<li><strong>Fernando Mosquera</strong>&nbsp;&nbsp;&nbsp;',
          '<a class="action-open-url-external-browser" href="https://github.com/benitoss"><img class="credits-rss-icon" src="resources/images/icon-github.svg"></a>&nbsp;&nbsp;',
          '</li>',
          '</ul>',
          '    <p>Thanks to <strong>Jesús Arroyo Torrens</strong>, ',
          '<a class="action-open-url-external-browser" href="https://github.com/Jesus89"><img class="credits-rss-icon" src="resources/images/icon-github.svg"></a>&nbsp;&nbsp;',
          '<a class="action-open-url-external-browser" href="https://twitter.com/JesusArroyo89"><img class="credits-rss-icon" src="resources/images/icon-twitter.svg"></a>',
          'who started this project and was the main developer from 2016/Jan/28 to 2019/Oct',
          '</p>',
          '    <p>Thanks to the rest of <a class="action-open-url-external-browser" href="https://github.com/FPGAwars/icestudio#user-content-main-page">contributors</a></p>',
          '    <p><span class="copyleft">&copy;</span> <a class="action-open-url-external-browser" href="https://fpgawars.github.io">FPGAwars</a> 2016-2024</p>',
          '<img src="resources/images/fpgawars-logo.png">',
          '  </div>',
          '</div>',
        ].join("\n");
        alertify.alert(content);
      };

      $(document).on("stackChanged", function (evt, undoStack) {
        currentUndoStack = undoStack;
        var undoStackString = JSON.stringify(undoStack);
        project.changed = JSON.stringify(changedUndoStack) !== undoStackString;
        project.updateTitle();
        zeroProject = false;
        common.hasChangesSinceBuild =
          JSON.stringify(buildUndoStack) !== undoStackString;
        utils.rootScopeSafeApply();
      });

      function resetChangedStack() {
        changedUndoStack = currentUndoStack;
        project.changed = false;
        project.updateTitle();
      }

      function resetBuildStack() {
        buildUndoStack = currentUndoStack;
        common.hasChangesSinceBuild = false;
        utils.rootScopeSafeApply();
      }

      var promptShown = false;

      alertify.prompt().set({
        onshow: function () {
          promptShown = true;
        },
        onclose: function () {
          promptShown = false;
        },
      });

      alertify.confirm().set({
        onshow: function () {
          promptShown = true;
        },
        onclose: function () {
          promptShown = false;
        },
      });

      // Configure all shortcuts

      // -- File
      shortcuts.method("newProject", $scope.newProject);
      shortcuts.method("openProject", $scope.openProjectDialog);
      shortcuts.method("saveProject", $scope.saveProject);
      shortcuts.method("saveProjectAs", $scope.saveProjectAs);
      shortcuts.method("quit", $scope.quit);

      // -- Edit
      shortcuts.method("undoGraph", $scope.undoGraph);
      shortcuts.method("redoGraph", $scope.redoGraph);
      shortcuts.method("redoGraph2", $scope.redoGraph);
      shortcuts.method("cutSelected", $scope.cutSelected);
      shortcuts.method("copySelected", $scope.copySelected);
      shortcuts.method("pasteAndCloneSelected", $scope.pasteAndCloneSelected);
      shortcuts.method("pasteSelected", $scope.pasteSelected);
      shortcuts.method("duplicateSelected", $scope.duplicateSelected);
      shortcuts.method("removeSelected", $scope.removeSelected);
      shortcuts.method("selectAll", $scope.selectAll);
      shortcuts.method("fitContent", $scope.fitContent);

      // -- Tools
      shortcuts.method("verifyCode", $scope.verifyCode);
      shortcuts.method("buildCode", $scope.buildCode);
      shortcuts.method("uploadCode", $scope.uploadCode);

      // -- Misc
      shortcuts.method("stepUp", graph.stepUp);
      shortcuts.method("stepDown", graph.stepDown);
      shortcuts.method("stepLeft", graph.stepLeft);
      shortcuts.method("stepRight", graph.stepRight);

      // -- Label-Finder Pop-up
      shortcuts.method("showLabelFinder", $scope.showLabelFinder);

      // -- Show Floating toolbox
      shortcuts.method("showToolBox", $scope.showToolBox);

      // -- Show colection Manager
      shortcuts.method("showCollectionManager", $scope.showCollectionManager);

      shortcuts.method("back", function () {
        if (graph.isEnabled()) {
          graph.removeSelected();
        } else {
          console.log("--------> BACK!!!!");
          //-- When inside a block in non-edit mode
          //-- the back key causes it to return to 
          //-- the top-main module

          //-- Changed: The Back key is disabled by default
          //--  (asked by joaquim) 
          //-- (Uncomment the next sentence  for enabling it)
          // $rootScope.$broadcast("breadcrumbsBack");
        }
      });

      shortcuts.method("takeSnapshot", takeSnapshot);

      //-- Shortcut for Testing and Debugging
      shortcuts.method("testing", testing);

      $(document).on("keydown", function (event) {
        var opt = {
          prompt: promptShown,
          disabled: !graph.isEnabled(),
        };
        event.stopImmediatePropagation();
        var ret = shortcuts.execute(event, opt);
        if (ret.preventDefault) {
          event.preventDefault();
        }
      });

      //-- LABEL-FINDER POPUP
      // key functions
      $('body').keydown(function (e) {
        if (e.which === 13 &&
          $('.lFinder-popup').hasClass('lifted') === false) { // enter key -> Find items
          $scope.fitContent(); // Fit content before search
          findItems();
        }
        if (e.which === 37 &&
          $('.lFinder-popup').hasClass('lifted') === false) { // left key -> previous item selection
          prevItem();
        }
        if (e.which === 39 &&
          $('.lFinder-popup').hasClass('lifted') === false) { // right key -> next item selection
          nextItem();
        }
        if (e.which === 9 &&
          $('.lFinder-popup').hasClass('lifted') === false) { // tab key -> show/hide advanced tab
          toggleAdvancedTab();
        }
      });

      // advanced retractable button
      $(document).on("mousedown", ".lFinder-advanced--toggle", function () {
        toggleAdvancedTab();
      });

      // input finder
      $(document).on("input", ".lFinder-field", function () {
        $scope.fitContent(); // Fit content before search
        findItems();
      });

      // find button
      $(document).on("mousedown", ".lFinder-find", function () {
        $scope.fitContent(); // Fit content before search
        findItems();
      });

      // find prev button
      $(document).on("mousedown", ".lFinder-prev", function () {
        prevItem();
      });

      // find next button
      $(document).on("mousedown", ".lFinder-next", function () {
        nextItem();
      });

      // option -> case sensitive
      $(document).on("mousedown", ".lFinder-case--option", function () {
        optionCase = !optionCase;
        if (optionCase === true) {
          $('.lFinder-case--option').addClass('on');
        } else {
          $('.lFinder-case--option').removeClass('on');
        }
        findItems();
      });

      // option -> exact
      $(document).on("mousedown", ".lFinder-exact--option", function () {
        optionExact = !optionExact;
        if (optionExact === true) {
          $('.lFinder-exact--option').addClass('on');
        } else {
          $('.lFinder-exact--option').removeClass('on');
        }
        findItems();
      });

      // close button
      $(document).on("mousedown", ".lFinder-close", function () {
        showLabelFinder();
      });

      // Replace Name
      $(document).on("mousedown", ".lFinder-replace--name", function () {
        replaceLabelName();
        findItems();
      });

      // Change Color
      $(document).on("mousedown", ".lFinder-change--color", function () {
        changeLabelColor();
      });

      // Replace All
      $(document).on("mousedown", ".lFinder-replace--all", function () {
        for (let i = 1; i <= foundItems; i++) {
          actualItem = i;
          replaceLabelName();
        }
      });

      // Color dropdown menu
      $(document).on("mousedown", ".lf-dropdown-title", function () {
        toggleColorDropdown();
      });
      $(document).on("mouseleave", ".lf-dropdown-menu", function () {
        if (colorDropdown === true) {
          toggleColorDropdown();
        }
      });

      // color get option
      $(document).on("mousedown", ".lf-dropdown-option", function () {
        let selected = this;
        $('.lf-dropdown-title').html("<span class=\"lf-selected-color color-" + selected.dataset.color + "\" data-color=\"" + selected.dataset.color + "\"></span>" + selected.dataset.name + "<span class=\"lf-dropdown-icon\"></span>");
        toggleColorDropdown();
      });

      //-- Global LABEL-FINDER vars
      let foundItems = 0;
      let actualItem = 0;
      let itemList = [];
      let itemHtmlList = [];
      let optionCase = false;
      let optionExact = false;
      let advanced = false;
      let colorDropdown = false;

      //-- LABEL-FINDER functions
      function showLabelFinder() {
        if ($('.lFinder-popup').hasClass('lifted')) { // Show Label-Finder
          $('.lFinder-popup').removeClass('lifted');
          $('.lFinder-field').focus();
        } else { // Hide Label-Finder
          $('.lFinder-popup').addClass('lifted');
          $('.lFinder-field').focusout();
          $('.lFinder-field').val(''); // reset entry
          $('.highlight').removeClass('highlight');
          $('.greyedout').removeClass('greyedout');
          if (advanced === true) {
            advanced = false;
            $('.lFinder-advanced--toggle').removeClass('on');
            $('.lFinder-advanced').removeClass('show');
          }
          findItems();
        }
      }

      function toggleAdvancedTab() {
        advanced = !advanced;
        if (advanced === true) {
          $('.lFinder-advanced--toggle').addClass('on');
          $('.lFinder-advanced').addClass('show');
        } else {
          $('.lFinder-advanced--toggle').removeClass('on');
          $('.lFinder-advanced').removeClass('show');
          if (colorDropdown === true) {
            toggleColorDropdown();
          }
        }
      }

      function toggleColorDropdown() {
        if (colorDropdown === true) {
          colorDropdown = false;
          $('.lf-dropdown-menu').removeClass('show');
        } else {
          colorDropdown = true;
          $('.lf-dropdown-menu').addClass('show');
        }
      }

      function findItems() {
        $('.highlight').removeClass('highlight');
        $('.greyedout').removeClass('greyedout');
        let searchName = $('.lFinder-field').val();
        let parsedSearch = utils.parsePortLabel(searchName, common.PATTERN_PORT_LABEL); // parse search label name

        let reName = null; // regex search Name
        if (parsedSearch && parsedSearch.name) {
          reName = new RegExp(parsedSearch.name, 'i'); // contains + case insensitive (less restrictive)
          if (optionCase === true && optionExact === false) { // contains + case sensitive
            reName = new RegExp(parsedSearch.name);
          } else if (optionCase === false && optionExact === true) { // exact + case-insensitive
            reName = new RegExp("\\b" + parsedSearch.name + "\\b", 'i');
          } else if (optionCase === true && optionExact === true) { // exact + case sensitive (most restrictive)
            reName = new RegExp("\\b" + parsedSearch.name + "\\b");
          }
        } else {
          if (searchName.length > 0) {
            alertify.warning(gettextCatalog.getString('Invalid search name!'));
          }
        }

        foundItems = 0;
        actualItem = 0;
        itemList = []; // List with "json" elements of blocks
        itemHtmlList = []; // List with "html" elements of blocks
        let graphCells = graph.getCells();
        let htmlCells = $('.io-virtual-content');
        let htmlIoBlocks = $('.io-block'); // htmlCells parent with "blkid"

        //-- label filter + indexing
        for (let i = 0; i < graphCells.length; i++) {
          if (graphCells[i].attributes.blockType === blocks.BASIC_INPUT_LABEL ||
            graphCells[i].attributes.blockType === blocks.BASIC_OUTPUT_LABEL) {
            if (parsedSearch && parsedSearch.name.length > 0 &&
              graphCells[i].attributes.data.name.match(reName) !== null) {
              for (let j = 0; j < htmlIoBlocks.length; j++) {
                if (htmlIoBlocks[j].dataset.blkid === graphCells[i].attributes.id) {
                  itemList.push(graphCells[i]);
                  itemHtmlList.push(htmlCells[j]);
                }
              }
            }
          }
        }
        foundItems = itemHtmlList.length;
        if (foundItems > 0) {
          for (let k = 0; k < htmlCells.length; k++) {
            htmlCells[k].classList.add('greyedout');
          }
          for (let n = 0; n < foundItems; n++) {
            itemHtmlList[n].classList.remove('greyedout');
          }
        }
        $('.items-found').html(actualItem + "/" + foundItems);
        nextItem();
      }

      function prevItem() {
        $('.highlight').removeClass('highlight');
        actualItem--;
        if (foundItems === 0) {
          actualItem = 0;
        }
        else {
          if (actualItem < 1) {
            actualItem = foundItems;
          }
          showMatchedItem();
        }
        $('.items-found').html(actualItem + "/" + foundItems);
      }

      function nextItem() {
        $('.highlight').removeClass('highlight');
        actualItem++;
        if (foundItems === 0) {
          actualItem = 0;
        }
        else {
          if (actualItem > foundItems) {
            actualItem = 1;
          }
          showMatchedItem();
        }
        $('.items-found').html(actualItem + "/" + foundItems);
      }

      function showMatchedItem() {
        itemHtmlList[actualItem - 1].querySelector('.header').classList.add('highlight');
      }

      function replaceLabelName() {
        let newName = $('.lFinder-name--field').val();
        let parsedNewName = utils.parsePortLabel(newName, common.PATTERN_PORT_LABEL); // parse search label name

        if (parsedNewName && parsedNewName.name) {
          if (actualItem > 0 && newName.length > 0) {
            let matchName = $('.lFinder-field').val();
            if (optionCase === false) {
              matchName = new RegExp(matchName, 'i'); // case insensitive
            }
            let actualName = itemHtmlList[actualItem - 1].querySelector('.header label').innerHTML;

            let iBus = actualName.indexOf("["); // slice vector part of label buses
            if (iBus > 0) {
              actualName = actualName.slice(0, iBus);
            }

            newName = actualName.replace(matchName, newName);
            graph.editLabelBlock(itemList[actualItem - 1].attributes.id, newName, itemList[actualItem - 1].attributes.data.blockColor);
          }
        } else {
          if (newName.length > 0) {
            alertify.warning(gettextCatalog.getString('Invalid new name!'));
          }
        }
      }

      function changeLabelColor() {
        let newColor = $('.lf-selected-color').data('color');
        if (actualItem > 0 && newColor.length > 0) {
          graph.editLabelBlock(itemList[actualItem - 1].attributes.id, itemList[actualItem - 1].attributes.data.name, newColor);
        }
      }
      //-- END LABEL-FINDER functions

      //-- BASIC TOOLBOX
      //-- close floating toolbox with x button
      $(document).on("mousedown", ".closeToolbox-button", function () {
        mousedown = true;
        showToolBox();  // close toolbox 
      });

      //-- draggable toolbox
      $(document).on("mousedown", "#iceToolbox .title-bar", function () {
        mouseDownTB = true;
      });

      $(document).on("mouseup", function () {
        mouseDownTB = false;
      });

      $(document).on("mousemove", function (e) {
        mousePosition.x = e.pageX;
        mousePosition.y = e.pageY;
        if (mouseDownTB === true) {
          let posY = mousePosition.y - 40;
          let posX = mousePosition.x - 80;
          const winW = window.innerWidth;
          const winH = window.innerHeight;
          const topMenuH = $('#menu').height();
          const bottomMenuH = $('.footer.ice-bar').height();
          const offsetY = winH - (bottomMenuH + 277);
          const offsetX = winW - 160;
          if (posX < 0) {
            posX = 0;
          } else if (posX > offsetX) {
            posX = offsetX - 1;
          }
          if (posY < topMenuH - 24) {
            posY = topMenuH - 24;
          } else if (posY > offsetY) {
            posY = offsetY - 1;
          }

          toolbox.dom.css('top', `${posY}px`);
          toolbox.dom.css('left', `${posX}px`);
        }
      });

      //-- Global mousePosition & drag vars
      let mouseDownTB = false;
      let mousePosition = { x: 0, y: 0 };
      let toolbox = {
        dom: false,
        isOpen: false,
        icons: false
      };

      //----------------------------------------------------
      //-- Callback function for the EDIT/TOOLBOX option
      //----------------------------------------------------
      function showToolBox() {
        if (toolbox.dom === false) {
          toolbox.dom = $('#iceToolbox');
          toolbox.icons = $('.iceToolbox--item');
        }
        if (toolbox.isOpen) {
          toolbox.isOpen = false;
          toolbox.dom.removeClass('opened');
        } else {
          toolbox.isOpen = true;
          let posY = mousePosition.y - 110;
          let posX = mousePosition.x - 80;
          const winW = window.innerWidth;
          const winH = window.innerHeight;
          const topMenuH = $('#menu').height();
          const bottomMenuH = $('.footer.ice-bar').height();
          const offsetY = winH - (bottomMenuH + 276);
          const offsetX = winW - 160;
          if (posX < 0) {
            posX = 0;
          } else if (posX > offsetX) {
            posX = offsetX - 1;
          }
          if (posY < topMenuH) {
            posY = topMenuH - 24;
          } else if (posY > offsetY) {
            posY = offsetY - 1;
          }

          toolbox.dom.css('top', `${posY}px`);
          toolbox.dom.css('left', `${posX}px`);

          toolbox.dom.addClass('opened');
        }
      }


      //////////////////////////////////////

      //----------------------------------------------------
      //-- Callback function for launching CM from Menu
      //----------------------------------------------------

      function showCollectionManager() {
        iceStudio.bus.events.publish('pluginManager.launch', 'collectionManager2');

      }
      /////////////////////////////////////////////////////



      //-----------------------------------------------------------------
      //-- Callback function for the ToolBox menu. Whenever an option
      //-- is selected, this function is executed
      //-----------------------------------------------------------------
      $(document).delegate('.js-shortcut--action', 'click', function (e) {

        e.preventDefault();

        //-- Read the item selected
        let menuOption = $(this).data('item');

        //-- Call the callback function for every menu option
        switch (menuOption) {

          //-- Input: Place an input port
          case 'input':
            project.addBasicBlock(blocks.BASIC_INPUT);
            break;

          //-- Output: Place an output port
          case 'output':
            project.addBasicBlock(blocks.BASIC_OUTPUT);
            break;

          //-- Input label
          case 'labelInput':
            project.addBasicBlock(blocks.BASIC_OUTPUT_LABEL);
            break;

          //-- Output label
          case 'labelOutput':
            project.addBasicBlock(blocks.BASIC_INPUT_LABEL);
            break;

          //-- Paired labels
          case 'labelPaired':
            project.addBasicBlock(blocks.BASIC_PAIRED_LABELS);
            break;

          case 'memory':
            project.addBasicBlock(blocks.BASIC_MEMORY);
            break;

          case 'code':
            project.addBasicBlock(blocks.BASIC_CODE);
            break;

          case 'information':
            project.addBasicBlock(blocks.BASIC_INFO);
            break;

          case 'constant':
            project.addBasicBlock(blocks.BASIC_CONSTANT);
            break;

          case 'verify':
            $scope.verifyCode();
            break;

          case 'build':
            $scope.buildCode();
            break;

          case 'upload':
            $scope.uploadCode();
            break;
        }
        return false;
      });
      //-- END BASIC TOOLBOX

      //---------------------------------------------------------------------
      //-- testing. Function for Debugging
      //---------------------------------------------------------------------
      function testing() {
        console.log("--> TESTING!!!!! ");
        alertify.alert('<b>Ready!</b> ' + process.platform);
      }

      function takeSnapshot() {
        win.capturePage(function (img) {
          var base64Data = img.replace(
            /^data:image\/(png|jpg|jpeg);base64,/,
            ""
          );
          saveSnapshot(base64Data);
        }, "png");
      }

      function saveSnapshot(base64Data) {
        utils.saveDialog("#input-save-snapshot", ".png", function (filepath) {
          fs.writeFile(filepath, base64Data, "base64", function (err) {
            $scope.snapshotdir = utils.dirname(filepath) + utils.sep;
            $scope.$apply();
            if (!err) {
              alertify.success(
                gettextCatalog.getString("Image {{name}} saved", {
                  name: utils.bold(utils.basename(filepath)),
                })
              );
            } else {
              throw err;
            }
          });
        });
      }

      var menu;
      var timerOpen;
      var timerClose;

      var mousedown = false;
      $(document).on("mouseup", function () {
        mousedown = false;
      });

      $(document).on("mousedown", ".paper", function () {
        mousedown = true;
        // Close current menu
        if (
          typeof $scope.status !== "undefined" &&
          typeof $scope.status[menu] !== "undefined"
        ) {
          $scope.status[menu] = false;
        }
        utils.rootScopeSafeApply();
      });


      $scope.showMenu = function (newMenu) {
        cancelTimeouts();
        if (
          !mousedown &&
          !graph.addingDraggableBlock &&
          !$scope.status[newMenu]
        ) {
          timerOpen = $timeout(function () {
            $scope.fixMenu(newMenu);
          }, 300);
        }
      };

      $scope.hideMenu = function () {
        cancelTimeouts();
        timerClose = $timeout(function () {
          $scope.status[menu] = false;
        }, 900);
      };

      $scope.fixMenu = function (newMenu) {
        menu = newMenu;
        $scope.status[menu] = true;
      };

      function cancelTimeouts() {
        $timeout.cancel(timerOpen);
        $timeout.cancel(timerClose);
      }

      // Disable click in submenus
      $(document).click(".dropdown-submenu", function (event) {
        if ($(event.target).hasClass("dropdown-toggle")) {
          event.stopImmediatePropagation();
          event.preventDefault();
        }
      });

      function ebusCollection(args) {
        //console.log(args);
        if (typeof args.status !== "undefined") {
          switch (args.status) {
            case "enable":
              $("#menu .navbar-right>li").removeClass("hidden");
              break;
            case "disable":
              let first = true;
              $("#menu .navbar-right>li").each(function () {
                if (!first) {
                  $(this).addClass("hidden");
                }
                first = false;
              });
              break;
          }
        }
      }
      iceStudio.bus.events.subscribe("menu.collection", ebusCollection);
    });

