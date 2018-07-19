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
      collections.loadCollections();
      // Load language
      utils.loadLanguage(profile, function() {
        // Rearrange collections
        collections.sort();
        // Initialize selected board
        var selectedBoard = boards.selectBoard(profile.get('board')).name;
        profile.set('board', selectedBoard);
        // Initialize selected collection
        var selectedCollection = collections.selectCollection(profile.get('collection'));
        profile.set('collection', selectedCollection);
        // Initialize title
        project.updateTitle(gettextCatalog.getString('Untitled'));
        $('body').removeClass('waiting');
      });
    });
  });
