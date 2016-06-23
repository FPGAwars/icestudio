'use strict';

angular.module('icestudio')
    .service('boards', function() {

      this.getBoards = function() {
        return [
          { id: 'icezum', label: 'Icezum' },
          { id: 'icestick', label: 'iCEstick' },
          { id: 'go-board', label: 'Go board' }
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

      this.pinouts = {};

      this.pinouts['icezum'] = [
        { name: 'LED0', value: '95' },
        { name: 'LED1', value: '96' },
        { name: 'LED2', value: '97' },
        { name: 'LED3', value: '98' },
        { name: 'LED4', value: '99' },
        { name: 'LED5', value: '101' },
        { name: 'LED6', value: '102' },
        { name: 'LED7', value: '104' },
        { name: 'SW1', value: '10' },
        { name: 'SW2', value: '11' }
      ];

      this.pinouts['icestick'] = [
        { name: 'D1', value: '99' },
        { name: 'D2', value: '98' },
        { name: 'D3', value: '97' },
        { name: 'D4', value: '96' },
        { name: 'D5', value: '95' }
      ];

      this.pinouts['go-board'] = [
        { name: 'LED1', value: '56' },
        { name: 'LED2', value: '57' }
      ]

      this.getPinout = function() {
        return this.pinouts[this.selectedBoard.id];
      }

    });
