'use strict';

angular
  .module('icestudio', [
    'ngRoute',
    'ui.bootstrap',
    'gettext'
  ])
  .config(['$routeProvider',
    function($routeProvider) {
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
  .run(function(profile,
                project,
                common,
                tools,
                utils,
                boards,
                collections,
                gettextCatalog,
                $timeout)
  {
    $timeout(function(){
      $('body').addClass('waiting');
    }, 0);
    // Load boards
    boards.loadBoards();
    // Load profile
    utils.loadProfile(profile, function() {
      // Load collections
      collections.loadAllCollections();
      // Load language
      utils.loadLanguage(profile, function() {
        if (profile.get('board') === '') {
          // Select board for the first time
          utils.selectBoardPrompt(function (selectedBoard) {
            // Initialize selected board
            var newBoard = boards.selectBoard(selectedBoard);
            profile.set('board', newBoard.name);
            alertify.success(gettextCatalog.getString('Board {{name}} selected',  { name: utils.bold(newBoard.info.label) }));
            // Check if the toolchain is installed
            tools.checkToolchain();
          });
        }
        else {
          // Initialize selected board
          profile.set('board', boards.selectBoard(profile.get('board')).name);
          // Check if the toolchain is installed
          tools.checkToolchain();
        }
        // Rearrange collections
        collections.sort();
        // Initialize selected collection
        profile.set('collection', collections.selectCollection(profile.get('collection')));
        // Initialize title
        project.updateTitle(gettextCatalog.getString('Untitled'));
        $('body').removeClass('waiting');
      });
    });
  });
