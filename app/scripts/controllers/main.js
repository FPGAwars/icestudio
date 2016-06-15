'use strict';

angular.module('icestudio')
  .controller('MainCtrl', function($scope, $rootScope, nodeFs, nodeGlob) {
    console.log('echo main');

    alertify.delay(2000);
    alertify.logPosition('bottom right');

    // Load blocks

    $rootScope.blocks = {};

    nodeGlob('app/res/blocks/*', null, function (er, categories) {
      for (var i = 0; i < categories.length; i++) {

        var category = categories[i].split('/')[3];

        $rootScope.blocks[category] = {};

        nodeGlob(categories[i] + '/*/*.json', null, (function(c) {
            return function(er, blocks) {
                storeBlocks(er, blocks, c);
            };
        })(category));

        function storeBlocks(er, blocks, category) {

          for (var j = 0; j < blocks.length; j++) {

            var name = blocks[j].split('/')[4];

            $.getJSON(blocks[j].substring(4), (function(c, n) {
                return function(data) {
                    storeData(data, c, n);
                };
            })(category, name));

            function storeData(data, category, name) {
              $rootScope.blocks[category][name] = data;
            }
          }
        };
      }
    });
  });
