'use strict';

angular.module('icestudio')
    .service('putils', ['$rootScope', 'nodeFs', 'nodeGlob', 'window',
      function($rootScope, nodeFs, nodeGlob, window) {

        // TODO: move project functions here

        this.updateProjectName = function(name) {
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
