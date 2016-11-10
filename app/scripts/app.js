'use strict';

angular
  .module('icestudio', [
    'ngRoute',
    'pascalprecht.translate',
    'ui.bootstrap'
  ]).config(['$routeProvider', '$translateProvider',
    function($routeProvider, $translateProvider) {

      $routeProvider
        .when('/', {
          templateUrl: 'views/main.html',
          controller: 'MainCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });
      $translateProvider.useStaticFilesLoader({
        prefix: 'resources/locale/',
        suffix: '.json'
      });

      // Initial language
      $translateProvider.preferredLanguage('en');
      //$translateProvider.useSanitizeValueStrategy('escape');
    }

  ])
  .run(function(nodeFs) {
    console.log('Start');
  });
