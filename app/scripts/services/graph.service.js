'use strict';

angular.module('icestudio')
    .service('graph', ['$rootScope', 'nodeFs', 'joint', 'boards',
      function($rootScope, nodeFs, joint, boards) {

        // Variables

        var graph = null;
        var paper = null;
        var selectedCellView = null;
        var dependencies = {};

        this.breadcrumbs = [{ name: '' }];

        // Functions

        this.createPaper = function(element) {
          graph = new joint.dia.Graph();
          paper = new joint.dia.Paper({
            el: element,
            width: 2000,
            height: 1000,
            model: graph,
            gridSize: 10,
            snapLinks: { radius: 15 },
            linkPinning: false,
            //markAvailable: true,
            defaultLink: new joint.shapes.test.Wire(),
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
              if (paper.options.interactive) {
                select(cellView);
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
                        data.label = label;
                        cellView.renderLabel();
                        alertify.success('Label updated');
                    });
                  }
                }
                else if (data.blockType == 'basic.code') {
                  if (paper.options.interactive) {
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
                }
                else if (data.type != 'test.Wire') {
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
            })(this)
          );

          paper.on('blank:pointerdown',
            function() {
              if (paper.options.interactive) {
                disableSelected();
              }
            }
          );

          paper.on('cell:mouseover',
            function(cellView, evt, x, y) {
              if (!cellView.model.isLink()) {
                cellView.$box.addClass('highlight');
              }
            }
          );

          paper.on('cell:mouseout',
            function(cellView, evt, x, y) {
              if (!cellView.model.isLink()) {
                cellView.$box.removeClass('highlight');
              }
            }
          );
        };

        function select(cellView) {
          if (!cellView.model.isLink()) {
            if (selectedCellView) {
              if (selectedCellView)
                selectedCellView.$box.removeClass('selected front');
            }
            selectedCellView = cellView;
            if (selectedCellView) {
              //cellView.$box.css('z-index', zIndex);
              //$('#xpaper svg').css('z-index', zIndex);
              selectedCellView.$box.addClass('selected front');
              cellView.model.toFront();
            }
          }
        }

        $(document).on('disableSelected', function() {
          disableSelected();
        });

        function disableSelected() {
          if (selectedCellView) {
            selectedCellView.$box.removeClass('selected');
            selectedCellView = null;
          }
        }

        this.clearAll = clearAll;

        function clearAll() {
          graph.clear();
          selectedCellView = null;
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
                  var cell = addBasicCodeBlock(blockInstance);
                  select(paper.findViewByModel(cell));

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
                      var cell = addBasicInputBlock(blockInstance);
                      select(paper.findViewByModel(cell));
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
                  var cell = addBasicInputBlock(blockInstance);
                  select(paper.findViewByModel(cell));
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
                      var cell = addBasicOutputBlock(blockInstance);
                      select(paper.findViewByModel(cell));
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
                  var cell = addBasicOutputBlock(blockInstance);
                  select(paper.findViewByModel(cell));
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
              var cell = addGenericBlock(blockInstance, block);
              select(paper.findViewByModel(cell));
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
          if (selectedCellView) {
            var newCell = selectedCellView.model.clone();
            newCell.translate(50, 50);
            graph.addCell(newCell);
            select(paper.findViewByModel(newCell));
            alertify.success('Block ' + newCell.attributes.blockType + ' cloned');
          }
        }

        this.getSelectedType = function() {
          if (selectedCellView) {
            return selectedCellView.model.attributes.blockType;
          }
        }

        this.removeSelected = function() {
          if (selectedCellView) {
            selectedCellView.model.remove();
            selectedCellView = null;
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
              else if (blockInstance.type == 'basic.input') {
                addBasicInputBlock(blockInstance, disabled);
              }
              else if (blockInstance.type == 'basic.output') {
                addBasicOutputBlock(blockInstance, disabled);
              }
              else {
                addGenericBlock(blockInstance, deps[blockInstance.type]);
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
          var cell = addGenericBlock(blockInstance, block);
          select(paper.findViewByModel(cell));
        }

        function addBasicInputBlock(blockInstances, disabled) {
          var cell = new joint.shapes.test.Input({
            id: blockInstances.id,
            blockType: blockInstances.type,
            data: blockInstances.data,
            label: blockInstances.data.label,
            position: blockInstances.position,
            disabled: disabled,
            choices: boards.getPinout()
          });

          graph.addCell(cell);
          return cell;
        };

        function addBasicOutputBlock(blockInstances, disabled) {
          var cell = new joint.shapes.test.Output({
            id: blockInstances.id,
            blockType: blockInstances.type,
            data: blockInstances.data,
            label: blockInstances.data.label,
            position: blockInstances.position,
            disabled: disabled,
            choices: boards.getPinout()
          });

          graph.addCell(cell);
          return cell;
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

          var cell = new joint.shapes.test.Code({
            id: blockInstances.id,
            blockType: blockInstances.type,
            data: blockInstances.data,
            position: blockInstances.position,
            disabled: disabled,
            inPorts: inPorts,
            outPorts: outPorts
          });

          graph.addCell(cell);
          return cell;
        };

        function addGenericBlock(blockInstance, block) {
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

          var blockImage = '';
          if (block.image && nodeFs.existsSync(block.image)) {
            blockImage = block.image;
          }

          var cell = new joint.shapes.test.Generic({
            id: blockInstance.id,
            blockType: blockInstance.type,
            data: {},
            image: blockImage,
            label: blockLabel,
            position: blockInstance.position,
            inPorts: inPorts,
            outPorts: outPorts
          });

          graph.addCell(cell);
          return cell;
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

          var _wire = new joint.shapes.test.Wire({
            source: { id: source.id, selector: sourceSelector, port: wire.source.port },
            target: { id: target.id, selector: targetSelector, port: wire.target.port },
            vertices: wire.vertices
          });

          graph.addCell(_wire);
        }

    }]);
