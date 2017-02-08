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
                resources,
                utils,
                gettextCatalog,
                nodeLangInfo) {
    // Load language
    profile.load(function() {
      var lang = profile.data.language;
      if (lang) {
        utils.setLocale(lang, resources.collections);
      }
      else {
        // If lang is empty, use the system language
        nodeLangInfo(function(err, sysLang) {
          if (!err) {
            profile.data.language = utils.setLocale(sysLang, resources.collections);
          }
        });
      }
    });
    setTimeout(function() {
      project.updateTitle(gettextCatalog.getString('Untitled'));
    }, 200);
  });
