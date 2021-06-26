'use strict';

//-------- This is the main APP ENTRY Point

/* exported ICEpm */
var ICEpm = new IcePlugManager();

/* exported iceConsoler */
//-- The log file by default is "icestudio.log", located in the  
//-- user home folder
var iceConsole = new IceLogger();


angular
  .module('icestudio', [
    'ui.bootstrap',
    'ngRoute',
    'gettext'
  ])
  .config(['$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/main.html',
          controller: 'MainCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });
    }
  ])
  .run(function (profile,
                  project,
                  common,
                  tools,
                  utils,
                  boards,
                  collections,
                  gettextCatalog,
                  $timeout) {

      //-- The application is on the waiting state: spinner on
      $timeout(function () {
         $('body').addClass('waiting');
      }, 0);
    
    //-- Load the boards info from their .json files and
    //-- create the GLOBAL Object common.boards
    //-- Read more information about it in the file app/scripts/services/boards.js
    boards.loadBoards();
    
    //-----------------------------------
    //-- Load the profile file
    //-- 
    utils.loadProfile(profile, function () {

      //-- Configure the iceConsole according to the profile values
      if (typeof profile.data.loggingEnabled !== 'undefined' &&
        profile.data.loggingEnabled === true) {

        if (typeof profile.data.loggingFile !== 'undefined' &&
          profile.data.loggingFile !== '') {

         // const hd = new IceHD();
          const separator = (common.DARWIN === false && common.LINUX === false) ? '\\' : '/';
          const posBasename = profile.data.loggingFile.lastIndexOf(separator) + 1;
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
      iceConsole.log(`=======================================================================================`);
      iceConsole.log(` Icestudio session ${now.toString()}`);
      iceConsole.log(` Version: ${common.ICESTUDIO_VERSION}`);
      iceConsole.log(`=======================================================================================`);
      iceConsole.log(`Architecture: ${process.arch}`);
      iceConsole.log(`Platform: ${process.platform}`);
      iceConsole.log('Profile file: ' + common.PROFILE_PATH); 
      iceConsole.log(`\n- PROFILE:\n`);
      iceConsole.log(profile);

      iceConsole.log(`\n- PATHs\n`);
      iceConsole.log("common.BASE_DIR: Icestudio base dir: " + common.BASE_DIR);
      iceConsole.log("common.ICESTUDIO_DIR: Icestudio folder: " + common.ICESTUDIO_DIR);
      iceConsole.log("common.PROFILE_PATH: Profile path: " + common.PROFILE_PATH);
      iceConsole.log("common.INTERNAL_COLLECTIONS_DIR: Internal collections: " + common.INTERNAL_COLLECTIONS_DIR);
      iceConsole.log("common.APIO_HOME_DIR: APIO folder: " + common.APIO_HOME_DIR);
      iceConsole.log("common.ENV_DIR: PYthon virtual environment: " + common.ENV_DIR);
      iceConsole.log("common.ENV_BIN_DIR: Executable files: " + common.ENV_BIN_DIR);
      iceConsole.log("common.ENV_PIP: PIP executable:  " + common.ENV_PIP);
      iceConsole.log("common.APIO_CMD: Apio command: " + common.APIO_CMD);
      iceConsole.log("Common.APP: Icestudio APP folder: " + common.APP);
      iceConsole.log("common.APP_DIR: Icestudio execution folder: " + common.APP_DIR); 
      iceConsole.log("\n\n");



      collections.loadAllCollections();
      utils.loadLanguage(profile, function () {
        if (profile.get('board') === '') {
          utils.selectBoardPrompt(function (selectedBoard) {
            var newBoard = boards.selectBoard(selectedBoard);
            profile.set('board', newBoard.name);
            alertify.success(gettextCatalog.getString('Board {{name}} selected', { name: utils.bold(newBoard.info.label) }));
            tools.checkToolchain();
          });
        }
        else {
          profile.set('board', boards.selectBoard(profile.get('board')).name);
          tools.checkToolchain();
        }


        $('html').attr('lang', profile.get('language'));
        collections.sort();
        profile.set('collection', collections.selectCollection(profile.get('collection')));
        project.updateTitle(gettextCatalog.getString('Untitled'));
        $('body').removeClass('waiting');
      });
    });
  });
