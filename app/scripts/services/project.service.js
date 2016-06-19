'use strict';

angular.module('icestudio')
    .service('project', ['$rootScope', 'nodeFs', 'nodeGlob', 'window',
      function($rootScope, nodeFs, nodeGlob, window) {

        // TODO: move project functions here

        this.updateName = function(name) {
          if (name) {
            $rootScope.breadcrumb[0].name = name;
            window.title = 'Icestudio - ' + name;
            $rootScope.project.name = name;
            if(!$rootScope.$$phase) {
              $rootScope.$apply();
            }
          }
        };

    }]);
