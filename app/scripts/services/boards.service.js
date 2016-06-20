'use strict';

angular.module('icestudio')
    .service('boards', function() {

      this.getBoards = function() {
        return [
          { id: 'icezum', label: 'Icezum' },
          { id: 'icestick', label: 'iCEstick' },
          { id: 'goboard', label: 'Go board' }
        ]
      };

      this.selectedBoard = this.getBoards()[0];

      this.selectBoard = function(id) {
        var boards = this.getBoards();
        for (var i in boards) {
          if (id == boards[i].id) {
            this.selectedBoard = boards[i];
            break;
          }
        }
      };

      this.pinouts = {
        icezum: [
          { name: 'LED0', value: '95' },
          { name: 'LED1', value: '96' }
        ],
        icestick: [
          { name: 'D1', value: '99' },
          { name: 'D2', value: '98' }
        ],
        goboard: [
          { name: 'LED1', value: '56' },
          { name: 'LED2', value: '57' }
        ]
      };

      this.getPinout = function() {
        return this.pinouts[this.selectedBoard.id];
      }

    });
