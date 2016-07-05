'use strict';

angular.module('icestudio')
    .service('graph', ['$rootScope', 'nodeFs', 'joint', 'boards',
      function($rootScope, nodeFs, joint, boards) {

        // Variables

        var paper = null;
        var selectedCell = null;

        var graph = new joint.dia.Graph();

        var dependencies = {};

        this.breadcrumbs = [{ name: '' }];

        // Functions

        this.createPaper = function(element) {
          paper = new joint.dia.Paper({
            el: element,
            width: 2000,
            height: 1000,
            model: graph,
            gridSize: 1,
            snapLinks: { radius: 30 },
            linkPinning: false,

            defaultLink: new joint.shapes.ice.Wire(),
            validateMagnet: function(cellView, magnet) {
              // Prevent to start wires from an input port
              return (magnet.getAttribute('type') == 'output');
            },
            validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
              // Prevent output-output links
              if (magnetS.getAttribute('type') == 'output' && magnetT.getAttribute('type') == 'output')
                return false;

              // Prevent multiple input links
              var links = graph.getLinks();
              for (var i in links) {
                if (linkView == links[i].findView(paper)) //Skip the wire the user is drawing
                  continue;
                if ( (( cellViewT.model.id == links[i].get('target').id ) && ( magnetT.getAttribute('port') == links[i].get('target').port)) ) {
                  return false;
                }
              }

              // Prevent loop links
              return magnetS !== magnetT;
            }
          });

          // Events

          paper.on('cell:pointerdown',
            function(cellView, evt, x, y) {
              cellView.model.toFront();
              if (paper.options.interactive) {
                if (selectedCell) {
                  if (paper.findViewByModel(selectedCell))
                    V(paper.findViewByModel(selectedCell).el).removeClass('highlighted');
                }
                selectedCell = cellView.model;
                if (paper.findViewByModel(selectedCell))
                  V(paper.findViewByModel(selectedCell).el).addClass('highlighted');
              }
            }
          );

          paper.on('cell:pointerdblclick',
            (function(_this) {
              return function(cellView, evt, x, y) {
                        var data = cellView.model.attributes;
                        if (data.blockType == 'basic.input' || data.blockType == 'basic.output') {
                          if (paper.options.interactive) {
                            alertify.prompt('Insert the block label', '',
                              function(evt, label) {
                                data.data.label = label;
                                data.attrs['.block-label'].text = label;
                                cellView.update();
                                alertify.success('Label updated');
                            });
                          }
                        }
                        else if (data.blockType == 'basic.code') {
                          var block = {
                            data: {
                              code: _this.getCode(cellView.model.id)
                            },
                            position: cellView.model.attributes.position
                          };
                          _this.createBlock('basic.code', block, function() {
                            cellView.model.remove();
                          });
                        }
                        else if (data.type != 'ice.Wire') {
                          _this.breadcrumbs.push({ name: data.blockType });
                          if(!$rootScope.$$phase) {
                            $rootScope.$apply();
                          }
                          var disabled = true;
                          if (_this.breadcrumbs.length == 2) {
                            $rootScope.$broadcast('refreshProject', function() {
                              loadGraph(dependencies[data.blockType], disabled);
                              appEnable(false);
                            });
                          }
                          else {
                            loadGraph(dependencies[data.blockType], disabled);
                            appEnable(false);
                          }
                        }
                      }
                    })(this));

          paper.on('blank:pointerdown',
            function() {
              if (paper.options.interactive) {
                disableSelected();
              }
            }
          );
        };

        $(document).on('disableSelected', function() {
          disableSelected();
        });

        function disableSelected() {
          if (selectedCell) {
            if (paper.findViewByModel(selectedCell))
              V(paper.findViewByModel(selectedCell).el).removeClass('highlighted');
            selectedCell = null;
          }
        }

        this.clearAll = clearAll;

        function clearAll() {
          graph.clear();
          selectedCell = null;
          appEnable(true);
        };

        this.appEnable = appEnable;

        function appEnable(value) {
          paper.options.interactive = value;
          var cells = graph.getCells();
          for (var i in cells) {
            paper.findViewByModel(cells[i].id).options.interactive = value;
          }
          if (value) {
            angular.element('#menu').removeClass('disable-menu');
            angular.element('#paper').css('opacity', '1.0');
          }
          else {
            angular.element('#menu').addClass('disable-menu');
            angular.element('#paper').css('opacity', '0.5');
          }
        };

        this.createBlock = function(type, block, callback) {
          var blockInstance = {
            id: null,
            data: {},
            type: type,
            position: { x: 50, y: 50 }
          };

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
                  blockInstance.position.x = 250;

                  if (block) {
                    blockInstance.data.code = block.data.code;
                    blockInstance.position = block.position;
                  }
                  addBasicCodeBlock(blockInstance);

                  if (callback)
                    callback();
                }
            });
          }
          else if (type == 'basic.input') {
            alertify.prompt('Insert the block name', 'i',
              function(evt, name) {
                if (name) {
                  var names = name.split(' ');
                  for (var n in names) {
                    if (names[n]) {
                      blockInstance.data = {
                        label: names[n],
                        pin: {
                          name: '',
                          value: 0
                        }
                      };
                      addBasicIOBlock(blockInstance);
                      blockInstance.position.y += 100;
                    }
                  }
                }
                else {
                  blockInstance.data = {
                    label: '',
                    pin: {
                      name: '',
                      value: 0
                    }
                  };
                  addBasicIOBlock(blockInstance);
                  blockInstance.position.y += 100;
                }
            });
          }
          else if (type == 'basic.output') {
            alertify.prompt('Insert the block name', 'o',
              function(evt, name) {
                if (name) {
                  var names = name.split(' ');
                  blockInstance.position.x = 750;
                  for (var n in names) {
                    if (names[n]) {
                      blockInstance.data = {
                        label: names[n],
                        pin: {
                          name: '',
                          value: 0
                        }
                      };
                      addBasicIOBlock(blockInstance);
                      blockInstance.position.y += 100;
                    }
                  }
                }
                else {
                  blockInstance.position.x = 750;
                  blockInstance.data = {
                    label: '',
                    pin: {
                      name: '',
                      value: 0
                    }
                  };
                  addBasicIOBlock(blockInstance);
                  blockInstance.position.y += 100;
                }
            });
          }
          else {
            if (block &&
                block.graph &&
                block.graph.blocks &&
                block.graph.wires &&
                block.deps) {
              dependencies[type] = block;
              blockInstance.position.x = 100;
              blockInstance.position.y = 150;
              addBlock(blockInstance, block);
            }
            else {
              alertify.error('Wrong block format: ' + type);
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

        this.cloneSelected = function() {
          if (selectedCell) {
            var newCell = selectedCell.clone();
            newCell.translate(50, 50);
            graph.addCell(newCell);
            alertify.success('Block ' + newCell.attributes.blockType + ' cloned');
          }
        }

        this.getSelectedType = function() {
          if (selectedCell) {
            return selectedCell.attributes.blockType;
          }
        }

        this.removeSelected = function() {
          if (selectedCell) {
            selectedCell.remove();
            selectedCell = null;
          }
        }

        this.typeInGraph = function(type) {
          var count = 0;
          var cells = graph.getCells();
          for (var i in cells) {
            if (cells[i].attributes.blockType == type) {
              count += 1;
            }
          }
          return count;
        };

        this.isEmpty = function() {
          return (graph.getCells().length == 0);
        }

        this.isEnabled = function() {
          return paper.options.interactive;
        }

        this.loadProject = function(project, disabled) {
          return loadGraph(project, disabled);
        }

        function loadGraph(project, disabled) {
          if (project &&
              project.graph &&
              project.graph.blocks &&
              project.graph.wires &&
              project.deps) {

            var blockInstances = project.graph.blocks;
            var wires = project.graph.wires;
            var deps = project.deps;

            dependencies = project.deps;

            clearAll();

            // Blocks
            for (var i in blockInstances) {
              var blockInstance = blockInstances[i];
              if (blockInstance.type == 'basic.code') {
                addBasicCodeBlock(blockInstance, disabled);
              }
              else if (blockInstance.type == 'basic.input' || blockInstance.type == 'basic.output') {
                addBasicIOBlock(blockInstance, disabled);
              }
              else {
                addBlock(blockInstance, deps[blockInstance.type]);
              }
            }

            // Wires
            for (var i in wires) {
              addWire(wires[i]);
            }

            return true;
          }
        }

        this.importBlock = function(type, block) {
          var blockInstance = {
            id: null,
            data: {},
            type: type,
            position: { x: 100, y: 100 }
          }
          dependencies[type] = block;
          addBlock(blockInstance, block);
        }

        function addBasicIOBlock(blockInstances, disabled) {
          var inPorts = [];
          var outPorts = [];

          if (blockInstances.type == 'basic.input') {
            outPorts.push({
              id: 'out',
              label: ''
            });
          }
          else if (blockInstances.type == 'basic.output') {
            inPorts.push({
              id: 'in',
              label: ''
            });
          }

          var block = new joint.shapes.ice.IO({
            id: blockInstances.id,
            blockType: blockInstances.type,
            data: blockInstances.data,
            position: blockInstances.position,
            disabled: disabled,
            choices: boards.getPinout(),
            inPorts: inPorts,
            outPorts: outPorts,
            size: { width: 120, height: 70 },
            attrs: { '.block-label': { text: blockInstances.data.label } }
          });

          graph.addCell(block);
        };

        function addBasicCodeBlock(blockInstances, disabled) {
          var inPorts = [];
          var outPorts = [];

          for (var i in blockInstances.data.ports.in) {
            inPorts.push({
              id: blockInstances.data.ports.in[i],
              label: blockInstances.data.ports.in[i]
            });
          }

          for (var o in blockInstances.data.ports.out) {
            outPorts.push({
              id: blockInstances.data.ports.out[o],
              label: blockInstances.data.ports.out[o]
            });
          }

          var block = new joint.shapes.ice.Code({
            id: blockInstances.id,
            blockType: blockInstances.type,
            data: blockInstances.data,
            position: blockInstances.position,
            disabled: disabled,
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
                id: item.id,
                label: item.data.label
              });
            }
            else if (item.type == 'basic.output') {
              outPorts.push({
                id: item.id,
                label: item.data.label
              });
            }
          }

          var numPorts = Math.max(inPorts.length, outPorts.length);

          var blockLabel = blockInstance.type.toUpperCase();

          if (blockInstance.type.indexOf('.') != -1) {
            blockLabel = blockInstance.type.split('.')[0] + '\n' +  blockInstance.type.split('.')[1].toUpperCase();
          }

          var attrs = {};

          if (block.image && nodeFs.existsSync(block.image)) {
            attrs['.block-image'] = {
              x: 60 - 48,
              y: 25 + 10 * numPorts - 48,
              'xlink:href': block.image
            };
          }
          else {
            attrs['.block-label'] = {
              text: blockLabel
            };
          }

          var block = new joint.shapes.ice.Block({
            id: blockInstance.id,
            blockType: blockInstance.type,
            data: {},
            position: blockInstance.position,
            inPorts: inPorts,
            outPorts: outPorts,
            size: { width: 120, height: 50 + 20 * numPorts },
            attrs: attrs
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
            vertices: wire.vertices
          });
          graph.addCell(_wire);
        }

    }]);
