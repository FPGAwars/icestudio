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
  .run(function(profile, common, utils, nodeLangInfo, gettextCatalog) {
    // Load language
    profile.load(function(data) {
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
      common.updateProjectName(gettextCatalog.getString('untitled'));
    }, 100);
  });
