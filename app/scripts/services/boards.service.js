'use strict';

angular.module('icestudio')
    .service('boards', ['nodePath', 'utils',
      function(nodePath, utils) {

        this.currentBoards = utils.getFilesRecursive(nodePath.join('resources', 'boards'), '.json');
        this.selectedBoard = null;

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
          return this.selectedBoard.content.pinout;
        };

    }]);
