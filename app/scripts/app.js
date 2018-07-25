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
      collections.loadAllCollections();
      // Load language
      utils.loadLanguage(profile, function() {
        // Rearrange collections
        collections.sort();
        // Initialize selected board
        profile.set('board', boards.selectBoard(profile.get('board')).name);
        // Initialize selected collection
        profile.set('collection', collections.selectCollection(profile.get('collection')));
        // Initialize title
        project.updateTitle(gettextCatalog.getString('Untitled'));
        $('body').removeClass('waiting');
      });
    });
  });
