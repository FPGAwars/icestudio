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
    utils.loadLanguage(profile);

    setTimeout(function() {
      project.updateTitle(gettextCatalog.getString('Untitled'));
    }, 200);
  });
