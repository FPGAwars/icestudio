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
    


    utils.loadProfile(profile, function () {

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

      const now = new Date();
      iceConsole.log(`=======================================================================================`);
      iceConsole.log(` Icestudio session ${now.toString()}`);
      iceConsole.log(`=======================================================================================`);
      iceConsole.log('Profile file: ' + common.PROFILE_PATH); 
      iceConsole.log(`\n- PROFILE:\n`);
      iceConsole.log(profile);
      iceConsole.log(`\n- ENVIRONMENT:\n`);
      iceConsole.log("common.APIO_PIP_VCS: Development Apio package:  " + common.APIO_PIP_VCS);
      iceConsole.log("common.ENV_PIP: PIP executable:  " + common.ENV_PIP);
      //iceConsole.log(common);

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
