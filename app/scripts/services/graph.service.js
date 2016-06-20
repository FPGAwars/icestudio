'use strict';

angular.module('icestudio')
    .service('graph', ['joint', 'boards',
      function(joint, boards) {

        // Variables

        var paper = null;
        var selectedCell = null;

        var graph = new joint.dia.Graph();

        // Functions

        this.createPaper = function(element) {
          paper = new joint.dia.Paper({
            el: element,
            width: 900,
            height: 443,
            model: graph,
            gridSize: 1,
            snapLinks: { radius: 30 },
            defaultLink: new joint.shapes.ice.Wire(),
            validateConnection: function(cellViewS, magnetS,
                                         cellViewT, magnetT,
                                         end, linkView) {
              // Prevent loop linking
              return (magnetS !== magnetT);
            }
          });

          // Events
          paper.on('cell:pointerclick',
            function(cellView, evt, x, y) {
              if (paper.options.interactive) {
                if (selectedCell) {
                  V(paper.findViewByModel(selectedCell).el).removeClass('highlighted');
                }
                selectedCell = cellView.model;
                V(paper.findViewByModel(selectedCell).el).addClass('highlighted');
              }
            }
          );

          paper.on('cell:pointerdblclick',
            function(cellView, evt, x, y) {
              var data = cellView.model.attributes;
              if (data.blockType == 'basic.input' || data.blockType == 'basic.output') {
                if (paper.options.interactive) {
                  alertify.prompt('Insert the block label', '',
                    function(evt, label) {
                      if (label) {
                        data.attrs['.block-label'].text = label;
                        cellView.update();
                        alertify.success('Label updated');
                      }
                  });
                }
              }
              // TODO: edit the block ports
              /*else {
                if (data.block.code.type == 'graph') {
                  common.breadcrumb.push({ type: data.blockType, name: data.block.name });
                  if (common.breadcrumb.length == 2) {
                    refreshProject(function() {
                      loadGraph(data.block, false, false);
                    }, true);
                  }
                  else {
                    loadGraph(data.block, false, false);
                  }
                }
                else if (data.block.code.type == 'verilog') {
                  var code = hljs.highlightAuto(data.block.code.data).value;
                  alertify.alert('<pre><code class="verilog">' + code + '</code></pre>');
                }
              }*/
            }
          );

          paper.on('blank:pointerclick',
            function() {
              if (paper.options.interactive) {
                if (selectedCell) {
                  V(paper.findViewByModel(selectedCell).el).removeClass('highlighted');
                }
              }
            }
          );
        };

        this.clearAll = function() {
          graph.clear();
          selectedCell = null;
          paperEnable(true);
        };

        function paperEnable(value) {
          paper.options.interactive = value;
          if (value) {
            angular.element('#paper').css('opacity', '1.0');
          }
          else {
            angular.element('#paper').css('opacity', '0.5');
          }
        };

        this.createBasicBlock = function(type) {
          var block = {
            id: null,
            type: type,
            position: { x: 100, y: 100 }
          };

          if (paper.options.interactive) {
            if (type == 'basic.code') {
              alertify.prompt('Insert the block i/o', 'a,b c',
                function(evt, ports) {
                  if (ports) {
                    block.data = {
                      code: '',
                      ports: { in: [], out: [] }
                    };
                    // Parse ports
                    // TODO: undefined
                    var inPorts = ports.split(' ')[0].split(',');
                    var outPorts = ports.split(' ')[1].split(',');
                    for (var i in inPorts) {
                      if (inPorts[i])
                        block.data.ports.in.push(inPorts[i]);
                    }
                    for (var o in outPorts) {
                      if (outPorts[o])
                        block.data.ports.out.push(outPorts[o]);
                    }
                    addBasicCodeBlock(block);
                  }
              });
            }
            else if (type == 'basic.input' || type == 'basic.output') {
              alertify.prompt('Insert the block name', '',
                function(evt, name) {
                  if (name) {
                    block.data = {
                      name: name,
                      value: '',
                      choices: boards.getPinout()
                    };
                    addBasicIOBlock(block);
                  }
              });
            }
          }
        };

        function addBasicIOBlock(block) {
          var inPorts = [];
          var outPorts = [];

          if (block.type == 'basic.input') {
            outPorts.push({
              name: 'out',
              label: ''
            });
          }
          else if (block.type == 'basic.output') {
            inPorts.push({
              name: 'in',
              label: ''
            });
          }

          var block = new joint.shapes.ice.IO({
            id: block.id,
            blockType: block.type,
            data: { name: block.data.name, value: block.data.value },
            position: block.position,
            choices: boards.getPinout(),
            inPorts: inPorts,
            outPorts: outPorts,
            size: { width: 100, height: 70 },
            attrs: { '.block-label': { text: block.data.name } }
          });

          graph.addCell(block);
          //refreshProject();*/
        };

        function addBasicCodeBlock(block) {
          var inPorts = [];
          var outPorts = [];

          for (var i in block.data.ports.in) {
            inPorts.push({
              name: block.data.ports.in[i],
              label: block.data.ports.in[i]
            });
          }

          for (var o in block.data.ports.out) {
            outPorts.push({
              name: block.data.ports.out[o],
              label: block.data.ports.out[o]
            });
          }

          var block = new joint.shapes.ice.Code({
            id: block.id,
            blockType: block.type,
            data: block.data,
            position: block.position,
            inPorts: inPorts,
            outPorts: outPorts,
            size: { width: 400, height: 200 }
          });

          graph.addCell(block);
          //refreshProject();*/
        };

        this.toJSON = function() {
          return graph.toJSON();
        }

        this.getCode = function(id) {
          return paper.findViewByModel(id).$box.find('#content').val();
        }

        this.resetIOChoices = function() {
          var cells = graph.getCells();
          // Reset choices in all i/o blocks
          for (var i in cells) {
            var cell = cells[i];
            var type = cell.attributes.blockType;
            if (type == 'basic.input' || type == 'basic.output') {
              cell.attributes.choices = boards.getPinout();
              paper.findViewByModel(cell.id).renderChoices();
            }
          }
        }

        this.removeSelected = function() {
          if (paper.options.interactive) {
            if (selectedCell) {
              selectedCell.remove();
              selectedCell = null;
            }
          }
        }

        this.loadProject = function(project) {
          var blocks = project.data.blocks;
          var wires = project.data.wires;

          this.clearAll();

          // Blocks
          for (var i in blocks) {
            var block = blocks[i];
            if (block.type == 'basic.code') {
              addBasicCodeBlock(block);
            }
            else if (block.type == 'basic.input' || block.type == 'basic.output') {
              addBasicIOBlock(block);
            }
            else {
              //addBlock(block);
            }
          }

          // Wires
          for (var i in wires) {
            addWire(wires[i]);
          }
        }

        function addWire(wire) {
          var source = graph.getCell(wire.source.block);
          var target = graph.getCell(wire.target.block);

          // Find selectors
          var sourceSelector, targetSelector;
          for (var _out = 0; _out < source.attributes.outPorts.length; _out++) {
            if (source.attributes.outPorts[_out] == wire.source.port) {
              sourcePort = _out;
              break;
            }
          }
          for (var _in = 0; _in < source.attributes.inPorts.length; _in++) {
            if (target.attributes.inPorts[_in] == wire.target.port) {
              targetPort = _in;
              break;
            }
          }

          var _wire = new joint.shapes.ice.Wire({
            source: { id: source.id, selector: sourceSelector, port: wire.source.port },
            target: { id: target.id, selector: targetSelector, port: wire.target.port },
          });
          graph.addCell(_wire);
        }

    }]);
