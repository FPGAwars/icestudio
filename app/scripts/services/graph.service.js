'use strict';

angular.module('icestudio')
    .service('graph', ['$rootScope', 'joint', 'boards',
      function($rootScope, joint, boards) {

        // Variables

        var paper = null;
        var selectedCell = null;

        var graph = new joint.dia.Graph();

        var dependencies = {};

        var breadcrumb = [ { id: '', name: '' } ];

        this.breadcrumb = breadcrumb;

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
              else if (data.blockType == 'basic.code') {
                // TODO.
              }
              else {
                  breadcrumb.push({ type: data.blockType, name: data.blockType });
                  if(!$rootScope.$$phase) {
                    $rootScope.$apply();
                  }
                  if (breadcrumb.length == 2) {
                    $rootScope.$broadcast('refreshProject', function() {
                      loadGraph(dependencies[data.blockType]);
                      paperEnable(false);
                    });
                  }
                  else {
                    loadGraph(dependencies[data.blockType]);
                    paperEnable(false);
                  }
                }
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

        this.clearAll = clearAll;

        function clearAll() {
          graph.clear();
          selectedCell = null;
          paperEnable(true);
        };

        this.paperEnable = paperEnable;

        function paperEnable(value) {
          paper.options.interactive = value;
          var cells = graph.getCells();
          for (var i in cells) {
            paper.findViewByModel(cells[i].id).options.interactive = value;
          }
          if (value) {
            angular.element('#paper').css('opacity', '1.0');
          }
          else {
            angular.element('#paper').css('opacity', '0.5');
          }
        };

        this.createBlock = function(type, block) {
          var blockInstance = {
            id: null,
            type: type,
            position: { x: 100, y: 100 }
          };

          if (paper.options.interactive) {
            if (type == 'basic.code') {
              alertify.prompt('Insert the block i/o', 'a,b c',
                function(evt, ports) {
                  if (ports) {
                    blockInstance.data = {
                      code: '',
                      ports: { in: [], out: [] }
                    };
                    // Parse ports
                    var inPorts = [];
                    var outPorts = [];
                    if (ports.split(' ').length > 0) {
                      inPorts = ports.split(' ')[0].split(',');
                    }
                    if (ports.split(' ').length > 1) {
                      outPorts = ports.split(' ')[1].split(',');
                    }

                    for (var i in inPorts) {
                      if (inPorts[i])
                        blockInstance.data.ports.in.push(inPorts[i]);
                    }
                    for (var o in outPorts) {
                      if (outPorts[o])
                        blockInstance.data.ports.out.push(outPorts[o]);
                    }
                    addBasicCodeBlock(blockInstance);
                  }
              });
            }
            else if (type == 'basic.input' || type == 'basic.output') {
              alertify.prompt('Insert the block name', '',
                function(evt, name) {
                  if (name) {
                    blockInstance.data = {
                      name: name,
                      value: '',
                      choices: boards.getPinout()
                    };
                    addBasicIOBlock(blockInstance);
                  }
              });
            }
            else {
              if (block && block.graph) {
                addBlock(blockInstance, block);
              }
              else {
                alertify.error('Wrong block format: ' + type);
              }
            }
          }
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
              alertify.confirm('Do you want to remove the selected block?',
                function() {
                  selectedCell.remove();
                  selectedCell = null;
                  alertify.success('Block removed');
              });
            }
          }
        }

        this.loadProject = function(project) {
          dependencies = project.deps;
          loadGraph(project);
        }

        function loadGraph(project) {
          var blockInstances = project.graph.blocks;
          var wires = project.graph.wires;
          var deps = project.deps;

          clearAll();

          // Blocks
          for (var i in blockInstances) {
            var blockInstance = blockInstances[i];
            if (blockInstance.type == 'basic.code') {
              addBasicCodeBlock(blockInstance);
            }
            else if (blockInstance.type == 'basic.input' || blockInstance.type == 'basic.output') {
              addBasicIOBlock(blockInstance);
            }
            else {
              addBlock(blockInstance, deps[blockInstance.type]);
            }
          }

          // Wires
          for (var i in wires) {
            addWire(wires[i]);
          }
        }

        this.importBlock = function(type, block) {
          var blockInstance = {
            id: null,
            type: type,
            data: {},
            position: { x: 100, y: 100 }
          }
          // TODO: unique add deps
          dependencies[type] = block;
          addBlock(blockInstance, block);
        }

        function addBasicIOBlock(blockInstances) {
          var inPorts = [];
          var outPorts = [];

          if (blockInstances.type == 'basic.input') {
            outPorts.push({
              name: 'out',
              label: ''
            });
          }
          else if (blockInstances.type == 'basic.output') {
            inPorts.push({
              name: 'in',
              label: ''
            });
          }

          var block = new joint.shapes.ice.IO({
            id: blockInstances.id,
            blockType: blockInstances.type,
            data: { name: blockInstances.data.name, value: blockInstances.data.value },
            position: blockInstances.position,
            choices: boards.getPinout(),
            inPorts: inPorts,
            outPorts: outPorts,
            size: { width: 100, height: 70 },
            attrs: { '.block-label': { text: blockInstances.data.name } }
          });

          graph.addCell(block);
        };

        function addBasicCodeBlock(blockInstances) {
          var inPorts = [];
          var outPorts = [];

          for (var i in blockInstances.data.ports.in) {
            inPorts.push({
              name: blockInstances.data.ports.in[i],
              label: blockInstances.data.ports.in[i]
            });
          }

          for (var o in blockInstances.data.ports.out) {
            outPorts.push({
              name: blockInstances.data.ports.out[o],
              label: blockInstances.data.ports.out[o]
            });
          }

          var block = new joint.shapes.ice.Code({
            id: blockInstances.id,
            blockType: blockInstances.type,
            data: blockInstances.data,
            position: blockInstances.position,
            inPorts: inPorts,
            outPorts: outPorts,
            size: { width: 400, height: 200 }
          });

          graph.addCell(block);
        };

        function addBlock(blockInstance, block) {
          var inPorts = [];
          var outPorts = [];

          for (var i in block.graph.blocks) {
            var item = block.graph.blocks[i];
            if (item.type == 'basic.input') {
              inPorts.push({
                name: item.data.name,
                label: item.data.name
              });
            }
            else if (item.type == 'basic.output') {
              outPorts.push({
                name: item.data.name,
                label: item.data.name
              });
            }
          }

          var numPorts = Math.max(inPorts.length, outPorts.length);

          var blockLabel = blockInstance.type.toUpperCase();

          if (blockInstance.type.indexOf('.') != -1) {
            blockLabel = blockInstance.type.split('.')[0] + '\n' +  blockInstance.type.split('.')[1].toUpperCase();
          }

          var block = new joint.shapes.ice.Block({
            id: blockInstance.id,
            blockType: blockInstance.type,
            data: {},
            position: blockInstance.position,
            inPorts: inPorts,
            outPorts: outPorts,
            size: { width: 120, height: 50 + 20 * numPorts },
            attrs: { '.block-label': { text: blockLabel } }
          });

          graph.addCell(block);
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
