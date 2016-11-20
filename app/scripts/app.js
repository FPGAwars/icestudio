'use strict';

angular
  .module('icestudio', [
    'ngRoute',
    'ui.bootstrap',
    'gettext'
  ]).config(['$routeProvider',
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
  .run(function(gettextCatalog) {
    // Initial language
    var lang = 'es';
    gettextCatalog.setCurrentLanguage(lang);
    gettextCatalog.loadRemote('resources/locale/' + lang + '/' + lang + '.json');
  });
