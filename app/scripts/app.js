//---------------------------------------------------------------------------
//-- ICESTUDIO Main entry point
//---------------------------------------------------------------------------
//-- External packages used:
//--
//--  * Alertify: https://www.npmjs.com/package/alertifyjs
//--     Developing pretty browser dialogs and notifications
//---------------------------------------------------------------------------
"use strict";

//-- Disable the jshint Warning: "xxxx defined but never used"
/*jshint unused:false*/

//-- Global Icestudio
//-- this is the core system with services, api and communications.
//-- Group inside different object for efficiency model by V8 engine.
//-- The global variable should be declared as "var" and not "let" 
//-- because it is accessible from popups windows
var iceStudio = new Icestudio();

//-- Global CONSOLE. Used for Debugging
//-- The log file by default is "icestudio.log", located in the
//-- user home folder
var iceConsole = new IceLogger();

angular
  .module("icestudio", ["ui.bootstrap", "ngRoute", "gettext"])
  .run(function (
    profile,  //-- Icestudio profile file management
    project,
    common,
    tools,
    utils,
    boards,
    collections,

    //-- Angular-gettext package
    //-- More info: 
    //-- https://angular-gettext.rocketeer.be/dev-guide/api/angular-gettext/
    gettextCatalog
    )
  {
    console.log("->DEBUG: app.js");

    /* If in package.json appears development:{mode:true}*/
    /* activate development tools */
    tools.ifDevelopmentMode();

    //-- Configure ALERTIFY. Default values
    alertify.defaults.movable = false;
    alertify.defaults.closable = false;
    alertify.defaults.transition = "fade";
    alertify.defaults.notifier.delay = 3;

    //-- Configure ALERTIFY default labels for the buttons
    let labels = {
      ok: gettextCatalog.getString("OK"),
      cancel: gettextCatalog.getString("Cancel"),
    };
    alertify.set("alert", "labels", labels);
    alertify.set("prompt", "labels", labels);
    alertify.set("confirm", "labels", labels);
    
    //-- Links configuration:
    //-- All the html elements belonging to the given class
    //-- will be open in an external browser
    $(document).delegate(
      ".action-open-url-external-browser", //-- Selector
      "click",

      //-- Callback (when the link is clicked)
      function (e) {
        e.preventDefault();
        utils.openUrlExternalBrowser($(this).prop("href"));
        return false;
      }
    );

    //-- Load the boards info from their .json files and
    //-- create the GLOBAL Object common.boards
    //-- Read more information about it in the file app/scripts/services/boards.js
    boards.loadBoards();  //-- Init common.boards

    //-----------------------------------
    //-- Load the profile file
    //--
    utils.loadProfile(profile, function () {
      //-- Configure the iceConsole according to the profile values
      if (
        typeof profile.data.loggingEnabled !== "undefined" &&
        profile.data.loggingEnabled === true
      ) {
        if (
          typeof profile.data.loggingFile !== "undefined" &&
          profile.data.loggingFile !== ""
        ) {
          // const hd = new IceHD();
          const separator =
            common.DARWIN === false && common.LINUX === false ? "\\" : "/";
          const posBasename =
            profile.data.loggingFile.lastIndexOf(separator) + 1;
          const dirLFile = profile.data.loggingFile.substring(0, posBasename);
          const basename = profile.data.loggingFile.substring(posBasename);
          iceConsole.setPath(dirLFile, basename);
        } else {
          iceConsole.setPath(common.BASE_DIR);
        }

        iceConsole.enable();
      }

      //-- DEBUG: In the development version (wip) the log is ALWAYS active
      //-- The log file is icestudio.log (located in the BASE_DIR folder)
      iceConsole.setPath(common.BASE_DIR);
      iceConsole.enable();

      //-- Show information in the log file (if enabled)
      const now = new Date();
      iceConsole.log("\n\n\n");
      iceConsole.log(
        `=======================================================================================`
      );
      iceConsole.log(` Icestudio session ${now.toString()}`);
      iceConsole.log(` Version: ${common.ICESTUDIO_VERSION}`);
      iceConsole.log(
        `=======================================================================================`
      );
      iceConsole.log("Node information:");
      iceConsole.log(`  * Node version: ${process.version}`);
      iceConsole.log(`  * lts: ${process.release.lts}`);
      iceConsole.log(`  * SourceURL: ${process.release.sourceUrl}`);

      iceConsole.log("");
      iceConsole.log(`NW information: `);
      iceConsole.log(`  * NW version: ${process.versions['nw']}`);
      iceConsole.log(`  * NW-flavor: ${process.versions['nw-flavor']}`);  
      iceConsole.log(`  * Chromium: ${process.versions['chromium']}`);

      iceConsole.log("");
      iceConsole.log("System information:");
      iceConsole.log(`  * Architecture: ${process.arch}`);
      iceConsole.log(`  * Platform: ${process.platform}`);

      iceConsole.log("");
      iceConsole.log("Profile file: " + common.PROFILE_PATH);
      iceConsole.log(`\n- PROFILE:\n`);
      iceConsole.log(profile);

      iceConsole.log(`\n- PATHs\n`);
      iceConsole.log("common.BASE_DIR: Icestudio base dir: " + common.BASE_DIR);
      iceConsole.log(
        "common.ICESTUDIO_DIR: Icestudio folder: " + common.ICESTUDIO_DIR
      );
      iceConsole.log(
        "common.PROFILE_PATH: Profile path: " + common.PROFILE_PATH
      );
      iceConsole.log(
        "common.INTERNAL_COLLECTIONS_DIR: Internal collections: " +
          common.INTERNAL_COLLECTIONS_DIR
      );
      iceConsole.log(
        "common.APIO_HOME_DIR: APIO folder: " + common.APIO_HOME_DIR
      );
      iceConsole.log(
        "common.ENV_DIR: Python virtual environment: " + common.ENV_DIR
      );
      iceConsole.log(
        "common.ENV_BIN_DIR: Executable files: " + common.ENV_BIN_DIR
      );
      iceConsole.log("common.ENV_PIP: PIP executable:  " + common.ENV_PIP);
      iceConsole.log("common.APIO_CMD: APIO command: " + common.APIO_CMD);
      iceConsole.log("Common.APP: Icestudio APP folder: " + common.APP);
      iceConsole.log(
        "common.APP_DIR: Icestudio execution folder: " + common.APP_DIR
      );
      iceConsole.log("\n\n");

      collections.loadAllCollections();

      utils.loadLanguage(profile, function () {
        if (profile.get("board") === "") {
          utils.selectBoardPrompt(function (selectedBoard) {
            var newBoard = boards.selectBoard(selectedBoard);
            profile.set("board", newBoard.name);

            //-- Display a Dialog with the board selected
            alertify.success(

              //-- Message to show. Board name in Bold
              gettextCatalog.getString(
                "Board {{name}} selected", 
                { name: utils.bold(newBoard.info.label) }
              )
            );

            tools.checkToolchain(
                () => {}, //-- No callback
                false     //-- No error notifications
            );
          });
        } else {
          profile.set("board", boards.selectBoard(profile.get("board")).name);
          tools.checkToolchain(
              () => {}, //-- No callback
              false     //-- No error notifications
          );
        }

        $("html").attr("lang", profile.get("language"));
        collections.sort();
        profile.set(
          "collection",
          collections.selectCollection(profile.get("collection"))
        );
        project.updateTitle(gettextCatalog.getString("Untitled"));
      });
      // setTimeout(function () {
      $("#main-icestudio-wrapper").addClass("loaded");
      $("#main-icestudio-load-wrapper").addClass("fade-loaded");
      setTimeout(function () {
          $("#main-icestudio-load-wrapper").addClass("loaded");
          $("#main-icestudio-load-wrapper").removeClass("fade-loaded");
        }, 1000);
      //}, 1000);
    });
    
    console.log("->DEBUG: app.js: END");
  });
