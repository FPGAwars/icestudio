'use strict';

angular.module('icestudio')
    .service('resources', ['nodeGlob', 'nodePath', 'utils',
      function(nodeGlob, nodePath, utils) {

        this.getExamples = function() {
          return getResources(nodePath.join('resources', 'examples', '*'), '.ice');
        }

        this.getMenuBlocks = function() {
          return getResources(nodePath.join('resources', 'blocks', '*'), '.iceb');
        }

        function getResources(path, extension) {
          var resources = {};

          nodeGlob(path, null, (function() {

            return function(er, categories) {

              for (var i in categories) {

                var category = categories[i].split('/')[2];
                resources[category] = {};

                nodeGlob(nodePath.join(categories[i], '*' + extension), null, (function(c) {
                    return function(er, blocks) {
                        storeBlocks(er, blocks, c);
                    };
                })(category));

                function storeBlocks(er, blocks, category) {

                  for (var j in blocks) {

                    var name = utils.basename(blocks[j]);

                    utils.readFile(blocks[j], (function(c, n) {
                      return function(data) {
                        resources[c][n] = data;
                      }
                    })(category, name));

                  }
                };

              }

            };

          })());

          return resources;
        };

    }]);
