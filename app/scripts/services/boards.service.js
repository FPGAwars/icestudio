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
        { name: 'SW2', value: '11' },
        { name: 'D13', value: '144' },
        { name: 'D12', value: '143' },
        { name: 'D11', value: '142' },
        { name: 'D10', value: '141' },
        { name: 'D9', value: '139' },
        { name: 'D8', value: '138' },
        { name: 'D7', value: '112' },
        { name: 'D6', value: '113' },
        { name: 'D5', value: '114' },
        { name: 'D4', value: '115' },
        { name: 'D3', value: '116' },
        { name: 'D2', value: '117' },
        { name: 'D1', value: '118' },
        { name: 'D0', value: '119' },
        { name: 'DD0', value: '78' },
        { name: 'DD1', value: '79' },
        { name: 'DD2', value: '80' },
        { name: 'DD3', value: '81' },
        { name: 'DD4', value: '88' },
        { name: 'DD5', value: '87' },
        { name: 'GP0', value: '37' },
        { name: 'GP1', value: '38' },
        { name: 'GP2', value: '39' },
        { name: 'GP3', value: '41' },
        { name: 'GP4', value: '42' },
        { name: 'GP5', value: '43' },
        { name: 'GP6', value: '49' },
        { name: 'GP7', value: '50' },
        { name: 'ADC_SCL', value: '91' },
        { name: 'ADC_SDA', value: '90' },
        { name: 'ADC_INT', value: '93' },
        { name: 'CLK', value: '21' },
        { name: 'RES', value: '66' },
        { name: 'DONE', value: '65' },
        { name: 'SS', value: '71' },
        { name: 'MISO', value: '67' },
        { name: 'MOSI', value: '68' },
        { name: 'SCK', value: '70' },
        { name: 'DCD', value: '1' },
        { name: 'DSR', value: '2' },
        { name: 'DTR', value: '3' },
        { name: 'CTS', value: '4' },
        { name: 'RTS', value: '7' },
        { name: 'TX', value: '8' },
        { name: 'RX', value: '9' }
      ];

      this.pinouts['icestick'] = [
        { name: 'D1', value: '99' },
        { name: 'D2', value: '98' },
        { name: 'D3', value: '97' },
        { name: 'D4', value: '96' },
        { name: 'D5', value: '95' },
        { name: 'IrDA_TX', value: '105' },
        { name: 'IrDA_RX', value: '106' },
        { name: 'SD', value: '107' },
        { name: 'PMOD1', value: '78' },
        { name: 'PMOD2', value: '79' },
        { name: 'PMOD3', value: '80' },
        { name: 'PMOD4', value: '81' },
        { name: 'PMOD7', value: '87' },
        { name: 'PMOD8', value: '88' },
        { name: 'PMOD9', value: '90' },
        { name: 'PMOD10', value: '91' },
        { name: 'TR3', value: '112' },
        { name: 'TR4', value: '113' },
        { name: 'TR5', value: '114' },
        { name: 'TR6', value: '115' },
        { name: 'TR7', value: '116' },
        { name: 'TR8', value: '117' },
        { name: 'TR9', value: '118' },
        { name: 'TR10', value: '119' },
        { name: 'BR3', value: '62' },
        { name: 'BR4', value: '61' },
        { name: 'BR5', value: '60' },
        { name: 'BR6', value: '56' },
        { name: 'BR7', value: '48' },
        { name: 'BR8', value: '47' },
        { name: 'BR9', value: '45' },
        { name: 'BR10', value: '44' },
        { name: 'CLK', value: '21' },
        { name: 'RES', value: '66' },
        { name: 'DONE', value: '65' },
        { name: 'SS', value: '71' },
        { name: 'MISO', value: '67' },
        { name: 'MOSI', value: '68' },
        { name: 'SCK', value: '70' },
        { name: 'DCD', value: '1' },
        { name: 'DSR', value: '2' },
        { name: 'DTR', value: '3' },
        { name: 'CTS', value: '4' },
        { name: 'RTS', value: '7' },
        { name: 'TX', value: '8' },
        { name: 'RX', value: '9' }
      ];

      this.pinouts['go-board'] = [
        { name: 'LED1', value: '56' },
        { name: 'LED2', value: '57' }
      ]

      this.getPinout = function() {
        return this.pinouts[this.selectedBoard.id];
      }

    });
