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
                gettextCatalog)
  {
    // Load boards
    boards.loadBoards();
    // Load collections
    collections.loadCollections();
    // Load language
    utils.loadLanguage(profile, function() {
      // Initialize selected board
      var selectedBoard = boards.selectBoard(profile.get('board')).name;
      profile.set('board', selectedBoard);
      // Initialize selected collection
      var selectedCollection = collections.selectCollection(profile.get('collection'));
      profile.set('collection', selectedCollection);
      // Initialize title
      project.updateTitle(gettextCatalog.getString('Untitled'));
    });
  });
