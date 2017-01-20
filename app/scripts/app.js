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
                utils,
                gettextCatalog,
                nodeLangInfo) {
    // Load language
    profile.load(function() {
      var lang = profile.data.language;
      if (lang) {
        utils.setLocale(lang);
      }
      else {
        // If lang is empty, use the system language
        nodeLangInfo(function(err, sysLang) {
          if (!err) {
            profile.data.language = utils.setLocale(sysLang);
          }
        });
      }
    });
    setTimeout(function() {
      project.updateTitle(gettextCatalog.getString('Untitled'));
    }, 100);
  });
