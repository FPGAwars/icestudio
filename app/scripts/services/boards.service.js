'use strict';

angular.module('icestudio')
    .service('boards', ['nodePath', 'nodeFs',
      function(nodePath, nodeFs) {

        this.selectedBoard = null;
        this.currentBoards = loadBoards(nodePath.join('resources', 'boards'));

        function loadBoards(path) {
          var boards = [];
          var contents = nodeFs.readdirSync(path);
          contents.forEach(function (content) {
            var contentPath = nodePath.join(path, content);
            if (nodeFs.statSync(contentPath).isDirectory()) {
              if (!content.startsWith('_')) {
                var info = readJSONFile(contentPath, 'info.json');
                var pinout = readJSONFile(contentPath, 'pinout.json');
                boards.push({
                  'name': content,
                  'info': info,
                  'pinout': pinout
                });
              }
            }
          });
          return boards;
        }

        function readJSONFile(filepath, filename) {
          var ret = {};
          try {
            var data = nodeFs.readFileSync(nodePath.join(filepath, filename));
            ret = JSON.parse(data.toString());
          }
          catch (err) { }
          return ret;
        }

        this.selectBoard = function(name) {
          for (var i in this.currentBoards) {
            if (name == this.currentBoards[i].name) {
              this.selectedBoard = this.currentBoards[i];
              break;
            }
          }
        };

        // Set default board
        this.selectBoard('icezum');

        this.getBoards = function() {
          return this.currentBoards;
        };

        this.getPinout = function() {
          return this.selectedBoard.pinout;
        };

    }]);
