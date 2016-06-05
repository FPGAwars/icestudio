'use strict';

angular
    .module('icestudio', [
        'ngRoute',
        'pascalprecht.translate'
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
                prefix: 'res/locales/',
                suffix: '.json'
            });

            //indicamos el idioma inicial
            $translateProvider.preferredLanguage('es-ES');
            $translateProvider.fallbackLanguage('es-ES');
        }

    ])
    .run(function(nodeFs) {
        console.log('Start');
    });
