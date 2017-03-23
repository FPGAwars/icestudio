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
                nodeLangInfo) {
    // Load boards
    boards.loadBoards();
    // Load collections
    collections.loadCollections();
    // Load language
    profile.load(function() {
      var lang = profile.get('language');
      if (lang) {
        utils.setLocale(lang, common.collections);
      }
      else {
        // If lang is empty, use the system language
        nodeLangInfo(function(err, sysLang) {
          if (!err) {
            profile.set('language', utils.setLocale(sysLang, common.collections));
          }
        });
      }
    });
    setTimeout(function() {
      project.updateTitle(gettextCatalog.getString('Untitled'));
    }, 200);
  });
