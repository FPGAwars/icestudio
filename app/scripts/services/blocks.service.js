'use strict';

angular.module('icestudio')
    .service('blocks', ['nodeGlob', 'utils',
      function(nodeGlob, utils) {

        this.getMenuBlocks = function() {
          var menuBlocks = {};

          nodeGlob('app/res/blocks/*', null, (function() {

            return function (er, categories) {

              for (var i in categories) {

                var category = categories[i].split('/')[3];
                menuBlocks[category] = {};

                nodeGlob(categories[i] + '/*.iceb', null, (function(c) {
                    return function(er, blocks) {
                        storeBlocks(er, blocks, c);
                    };
                })(category));

                function storeBlocks(er, blocks, category) {

                  for (var j in blocks) {

                    var name = utils.basename(blocks[j]);
                    menuBlocks[category][name] = {};

                    $.getJSON(blocks[j].substring(4), (function(c, n) {
                        return function(data) {
                            storeData(data, c, n);
                        };
                    })(category, name));

                    function storeData(data, category, name) {
                      menuBlocks[category][name] = data;
                    }
                  }
                };
              }

            };

          })());

          return menuBlocks;
        };

    }]);
