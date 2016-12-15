'use strict';

angular.module('icestudio')
    .service('graph', function($rootScope,
                               joint,
                               boards,
                               utils,
                               gettextCatalog,
                               nodeFs) {

        // Variables

        var zIndex = 100;
        var ctrlPressed = false;

        var graph = null;
        var paper = null;
        var selection = null;
        var selectionView = null;

        var dependencies = {};
        this.breadcrumbs = [{ name: '' }];

        var gridsize = 8;
        var state = {
          pan: {
            x: 0,
            y: 0
          },
          zoom: 1
        };

        // Functions

        $(document).on('keydown', function(event) {
          ctrlPressed = event.keyCode == 17;
        });

        this.getState = function() {
          // Clone state
          return JSON.parse(JSON.stringify(state));
        }

        this.setState = function(_state) {
          if (!_state) {
            _state = {
              pan: {
                x: 0,
                y: 0
              },
              zoom: 1
            };
          }
          this.panAndZoom.zoom(_state.zoom);
          this.panAndZoom.pan(_state.pan);
          setGrid(paper, gridsize*2*_state.zoom, _state.pan);
        }

        this.resetState = function() {
          this.setState(null);
        }

        this.resetBreadcrumbs = function(name) {
          if (this.breadcrumbs.length > 1) {
            this.breadcrumbs = [{ name: name }];
          }
          this.breadcrumbs[0].name = name;
          if(!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        }

        function setGrid(paper, size, offset) {

          // TODO: draw grid in a SVG because 'background' truncates the parameters

          /*
          // Set grid size on the JointJS paper object (joint.dia.Paper instance)
          paper.options.gridsize = gridsize;
          // Draw a grid into the HTML 5 canvas and convert it to a data URI image
          var canvas = $('<canvas/>', { width: size, height: size });
          canvas[0].width = size;
          canvas[0].height = size;
          var context = canvas[0].getContext('2d');
          context.beginPath();
          context.rect(1, 1, 1, 1);
          context.fillStyle = '#555';
          context.globalAlpha = size / gridsize / 2;
          context.fill();
          // Finally, set the grid background image of the paper container element.
          var gridBackgroundImage = canvas[0].toDataURL('image/png');
          $(paper.el.childNodes[0]).css(
            'background-image', 'url("' + gridBackgroundImage + '")');
          if(typeof(offset) != 'undefined'){
            $(paper.el.childNodes[0]).css(
              'background-position', offset.x + 'px ' + offset.y + 'px');
          }*/
        }

        this.createPaper = function(element) {
          graph = new joint.dia.Graph();
          paper = new joint.dia.Paper({
            el: element,
            width: 2000,
            height: 1000,
            model: graph,
            gridSize: gridsize,
            snapLinks: { radius: 15 },
            linkPinning: false,
            embeddingMode: false,
            //markAvailable: true,
            defaultLink: new joint.shapes.ice.Wire(),
            guard: function(evt, view) {
              // FALSE means the event isn't guarded.
              return false;
            },
            validateMagnet: function(cellView, magnet) {
              // Prevent to start wires from an input port
              return (magnet.getAttribute('type') == 'output');
            },
            validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
              // Prevent output-output links
              if (magnetS.getAttribute('type') == 'output' &&
                  magnetT.getAttribute('type') == 'output') {
                if (magnetS !== magnetT) {
                  // Show warning if source and target blocks are different
                  warning(gettextCatalog.getString('Invalid connection'));
                }
                return false;
              }
              // Ensure right -> left connections
              if (magnetS.getAttribute('pos') == 'right') {
                if (magnetT.getAttribute('pos') != 'left') {
                  warning(gettextCatalog.getString('Invalid connection'));
                  return false;
                }
              }
              // Ensure bottom -> top connections
              if (magnetS.getAttribute('pos') == 'bottom') {
                if (magnetT.getAttribute('pos') != 'top') {
                  warning(gettextCatalog.getString('Invalid connection'));
                  return false;
                }
              }
              var links = graph.getLinks();
              for (var i in links) {
                var linkIView = links[i].findView(paper);
                if (linkView == linkIView) {
                  //Skip the wire the user is drawing
                  continue;
                }
                // Prevent multiple input links
                if ((cellViewT.model.id == links[i].get('target').id) &&
                    (magnetT.getAttribute('port') == links[i].get('target').port)) {
                  warning(gettextCatalog.getString('Invalid multiple input connections'));
                  return false;
                }
                // Prevent to connect a pull-up if other blocks are connected
                if ((cellViewT.model.attributes.blockType == 'config.pull_up' ||
                     cellViewT.model.attributes.blockType == 'config.pull_up_inv') &&
                     (cellViewS.model.id == links[i].get('source').id)) {
                  warning(gettextCatalog.getString('Invalid <i>Pull up</i> connection:<br>block already connected'));
                  return false;
                }
                // Prevent to connect other blocks if a pull-up is connected
                if ((linkIView.targetView.model.attributes.blockType == 'config.pull_up' ||
                     linkIView.targetView.model.attributes.blockType == 'config.pull_up_inv') &&
                     (cellViewS.model.id == links[i].get('source').id)) {
                  warning(gettextCatalog.getString('Invalid block connection:<br><i>Pull up</i> already connected'));
                  return false;
                }
              }
              // Ensure input -> pull-up connections
              if (cellViewT.model.attributes.blockType == 'config.pull_up' ||
                  cellViewT.model.attributes.blockType == 'config.pull_up_inv') {
                var ret = (cellViewS.model.attributes.blockType == 'basic.input');
                if (!ret) {
                  warning(gettextCatalog.getString('Invalid <i>Pull up</i> connection:<br>only <i>Input</i> blocks allowed'));
                }
                return ret;
              }
              // Prevent loop links
              return magnetS !== magnetT;
            }
          });

          paper.options.enabled = true;
          paper.options.warningTimer = false;

          function warning(message) {
            if (!paper.options.warningTimer) {
              paper.options.warningTimer = true;
              alertify.notify(message, 'warning', 5);
              setTimeout(function() {
                paper.options.warningTimer = false;
              }, 4000);
            }
          };

          setGrid(paper, gridsize * 2);

          var targetElement= element[0];

          this.panAndZoom = svgPanZoom(targetElement.childNodes[0],
          {
            viewportSelector: targetElement.childNodes[0].childNodes[0],
            fit: false,
            center: false,
            zoomEnabled: true,
            panEnabled: false,
            zoomScaleSensitivity: 0.1,
            dblClickZoomEnabled: false,
            minZoom: 0.2,
            maxZoom: 2,
            beforeZoom: function(oldzoom, newzoom) {
            },
            onZoom: function(scale) {
              state.zoom = scale;
              setGrid(paper, gridsize*2*state.zoom);
              // Already rendered in pan
            },
            beforePan: function(oldpan, newpan) {
              setGrid(paper, gridsize*2*state.zoom, newpan);
            },
            onPan: function(newPan) {
              state.pan = newPan;
              selectionView.options.state = state;

              var cells = graph.getCells();

              _.each(cells, function(cell) {
                if (!cell.isLink()) {
                  cell.attributes.state = state;
                  var elementView = paper.findViewByModel(cell);
                  // Pan blocks
                  elementView.updateBox();
                  // Pan selection boxes
                  selectionView.updateBox(elementView.model);
                }
              });
            }
          });

         selection = new Backbone.Collection;
         selectionView = new joint.ui.SelectionView({
           paper: paper,
           graph: graph,
           model: selection,
           state: state
         });

         // Events

         var self = this;

         selectionView.on('selection-box:pointerdown', function(evt) {
           // Selection to top view
           if (selection) {
             selection.each(function(cell) {
               var cellView = paper.findViewByModel(cell);
               if (cellView) {
                 if (!cellView.model.isLink()) {
                   if (cellView.$box.css('z-index') < zIndex) {
                     cellView.$box.css('z-index', ++zIndex);
                   }
                 }
               }
             });
           }
           // Toggle selection
           if ((evt.which == 3) && (evt.ctrlKey || evt.metaKey)) {
             var cell = selection.get($(evt.target).data('model'));
             selection.reset(selection.without(cell));
             selectionView.destroySelectionBox(paper.findViewByModel(cell));
           }
         });

         paper.on('cell:pointerup',
           function(cellView, evt, x, y) {
             if (paper.options.enabled) {
               if (!cellView.model.isLink()) {
                 if (evt.which == 3) {
                   // Disable current focus
                   document.activeElement.blur();
                   // Right button
                   selection.add(cellView.model);
                   selectionView.createSelectionBox(cellView);
                   cellView.$box.removeClass('highlight');
                 }
                 // Update wires on obstacles
                 var cells = graph.getCells();
                 for (var i in cells) {
                   var cell = cells[i];
                   if (cell.isLink()) {
                     paper.findViewByModel(cell).update();
                   }
                 }
               }
             }
           }
         );

          paper.on('cell:pointerdown',
            function(cellView, evt, x, y) {
              if (paper.options.enabled) {
                if (!cellView.model.isLink()) {
                  if (cellView.$box.css('z-index') < zIndex) {
                    cellView.$box.css('z-index', ++zIndex);
                  }
                }
              }
            }
          );

          paper.on('cell:pointerdblclick', function(cellView, evt, x, y) {
            var data = cellView.model.attributes;
            if (data.blockType == 'basic.input' ||
                data.blockType == 'basic.output') {
              if (paper.options.enabled) {
                alertify.prompt(gettextCatalog.getString('Update the port label'), data.data.label ? ' ' + data.data.label + ' ' : '',
                  function(evt, label) {
                    var label = label.replace(/ /g, '');
                    if (data.data.label != label) {
                      data.data.label = label;
                      cellView.renderLabel();
                      alertify.success(gettextCatalog.getString('Label updated'));
                    }
                });
              }
            }
            else if (data.blockType == 'basic.constant') {
              if (paper.options.enabled) {
                utils.constantprompt([
                  gettextCatalog.getString('Update the block label'),
                  gettextCatalog.getString('Update the block status'),
                  gettextCatalog.getString('Local parameter')
                ], [
                  data.data.label ? ' ' + data.data.label + ' ' : '',
                  data.data.local ? data.data.local : false
                ],
                  function(evt, values) {
                    var label = values[0].replace(/ /g, '');
                    if (data.data.label != label) {
                      data.data.label = label;
                      cellView.renderLabel();
                      alertify.success(gettextCatalog.getString('Label updated'));
                    }
                    var local = values[1];
                    data.data.local = local;
                    cellView.renderLocal();
                });
              }
            }
            else if (data.blockType == 'basic.code') {
              if (paper.options.enabled) {
                var block = {
                  data: {
                    code: self.getContent(cellView.model.id),
                    params: data.data.params,
                    ports: data.data.ports
                  },
                  position: cellView.model.attributes.position
                };
                self.createBlock('basic.code', block, function() {
                  cellView.model.remove();
                });
              }
            }
            else if (data.type != 'ice.Wire' && data.type != 'ice.Info') {
              self.breadcrumbs.push({ name: data.blockType });
              if(!$rootScope.$$phase) {
                $rootScope.$apply();
              }
              var disabled = true;
              zIndex = 1;
              if (self.breadcrumbs.length == 2) {
                $rootScope.$broadcast('refreshProject', function() {
                  self.loadDesign(dependencies[data.blockType], disabled);
                  self.appEnable(false);
                });
              }
              else {
                self.loadDesign(dependencies[data.blockType], disabled);
                self.appEnable(false);
              }
            }
          });

          paper.on('blank:pointerdown', function(evt, x, y) {
            // Disable current focus
            document.activeElement.blur();

            if (evt.which == 3) {
              // Right button
              if (paper.options.enabled) {
                selectionView.startSelecting(evt, x, y);
              }
            }
            else if (evt.which == 1) {
              // Left button
              self.panAndZoom.enablePan();
            }
          });

          paper.on('cell:pointerup blank:pointerup', function(cellView, evt) {
            self.panAndZoom.disablePan();
          });

          paper.on('cell:mouseover',
            function(cellView, evt) {
              if (!cellView.model.isLink()) {
                cellView.$box.addClass('highlight');
              }
            }
          );

          paper.on('cell:mouseout',
            function(cellView, evt) {
              if (!cellView.model.isLink()) {
                cellView.$box.removeClass('highlight');
              }
            }
          );

          graph.on('change:position', function(cell) {
            if (!selectionView.isTranslating()) {
              // Update wires on obstacles motion
              /*var cells = graph.getCells();
              for (var i in cells) {
                var cell = cells[i];
                if (cell.isLink()) {
                  paper.findViewByModel(cell).update();
                }
              }*/
            }
          });
        };

        this.clearAll = function() {
          graph.clear();
          this.appEnable(true);
          selection.reset();
          selectionView.cancelSelection();
        };

        this.appEnable = function(value) {
          paper.options.enabled = value;
          if (value) {
            angular.element('#menu').removeClass('disable-menu');
            angular.element('#paper').removeClass('disable-paper');
            angular.element('#banner').addClass('hidden');
          }
          else {
            angular.element('#menu').addClass('disable-menu');
            angular.element('#paper').addClass('disable-paper');
            angular.element('#banner').removeClass('hidden');
          }
          var cells = graph.getCells();
          for (var i in cells) {
            var cellView = paper.findViewByModel(cells[i].id);
            cellView.options.interactive = value;
            if (cells[i].attributes.type != 'ice.Generic') {
              if (value) {
                cellView.$el.removeClass('disable-graph');
              }
              else {
                cellView.$el.addClass('disable-graph');
              }
            }
            else if (cells[i].attributes.type != 'ice.Wire') {
              if (value) {
                cellView.$el.find('.port-body').removeClass('disable-graph');
              }
              else {
                cellView.$el.find('.port-body').addClass('disable-graph');
              }
            }
          }
        };

        this.createBlock = function(type, block, callback) {
          var blockInstance = {
            id: null,
            data: {},
            type: type,
            position: { x: 4 * gridsize, y: 4 * gridsize }
          };

          if (type == 'basic.code') {
            var defaultValues = [
              ' a , b ',
              ' c , d ',
              ''
            ];
            if (block && block.data) {
              if (block.data.ports) {
                defaultValues[0] = ' ' +  block.data.ports.in.join(' , ') +  ' ';
                defaultValues[1] = ' ' +  block.data.ports.out.join(' , ') +  ' ';
              }
              if (block.data.params) {
                defaultValues[2] = ' ' +  block.data.params.join(' , ') +  ' ';
              }
            }
            utils.multiprompt(
              [ gettextCatalog.getString('Enter the input ports'),
                gettextCatalog.getString('Enter the output ports'),
                gettextCatalog.getString('Enter the parameters') ],
              defaultValues,
              function(evt, ports) {
                if (ports && (ports[0].length || ports[1].length)) {
                  blockInstance.data = {
                    code: '',
                    params: [],
                    ports: { in: [], out: [] }
                  };
                  // Parse ports
                  var inPorts = [];
                  var outPorts = [];
                  var params = [];
                  if (ports.length > 0) {
                    inPorts = ports[0].replace(/ /g, '').split(',');
                  }
                  if (ports.length > 1) {
                    outPorts = ports[1].replace(/ /g, '').split(',');
                  }
                  if (ports.length > 2) {
                    params = ports[2].replace(/ /g, '').split(',');
                  }

                  for (var i in inPorts) {
                    if (inPorts[i])
                      blockInstance.data.ports.in.push(inPorts[i]);
                  }
                  for (var o in outPorts) {
                    if (outPorts[o])
                      blockInstance.data.ports.out.push(outPorts[o]);
                  }
                  for (var p in params) {
                    if (params[p])
                      blockInstance.data.params.push(params[p]);
                  }
                  blockInstance.position.x = 31 * gridsize;
                  blockInstance.position.y = 24 * gridsize;

                  var allAttrs= inPorts.concat(outPorts, params);
                  var numAttrs = allAttrs.length;

                  // Check duplicated attributes
                  if (numAttrs == $.unique(allAttrs).length) {
                    evt.cancel = false;
                    if (block) {
                      blockInstance.data.code = block.data.code;
                      blockInstance.position = block.position;
                    }
                    var cell = addBasicCodeBlock(blockInstance);
                    var cellView = paper.findViewByModel(cell);
                    if (cellView.$box.css('z-index') < zIndex) {
                      cellView.$box.css('z-index', ++zIndex);
                    }
                    if (callback)
                      callback();
                  }
                  else {
                    evt.cancel = true;
                    alertify.notify(gettextCatalog.getString('Duplicated block attributes'), 'warning', 3);
                  }
                }
            });
          }
          else if (type == 'basic.info') {
            blockInstance.data = {
              info: ''
            };
            blockInstance.position.y = 30 * gridsize;
            var cell = addBasicInfoBlock(blockInstance);
            var cellView = paper.findViewByModel(cell);
            if (cellView.$box.css('z-index') < zIndex) {
              cellView.$box.css('z-index', ++zIndex);
            }
          }
          else if (type == 'basic.input') {
            alertify.prompt(gettextCatalog.getString('Enter the input ports'), ' in ',
              function(evt, name) {
                if (name) {
                  var names = name.replace(/ /g, '').split(',');
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
                      var cellView = paper.findViewByModel(cell);
                      if (cellView.$box.css('z-index') < zIndex) {
                        cellView.$box.css('z-index', ++zIndex);
                      }
                      blockInstance.position.y += 10 * gridsize;
                    }
                  }
                }
                else {
                  /*blockInstance.data = {
                    label: '',
                    pin: {
                      name: '',
                      value: 0
                    }
                  };
                  var cell = addBasicInputBlock(blockInstance);
                  var cellView = paper.findViewByModel(cell);
                  if (cellView.$box.css('z-index') < zIndex) {
                    cellView.$box.css('z-index', ++zIndex);
                  }
                  blockInstance.position.y += 10 * gridsize;*/
                }
            });
          }
          else if (type == 'basic.output') {
            alertify.prompt(gettextCatalog.getString('Enter the output ports'), ' out ',
              function(evt, name) {
                if (name) {
                  var names = name.replace(/ /g, '').split(',');
                  blockInstance.position.x = 95 * gridsize;
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
                      var cellView = paper.findViewByModel(cell);
                      if (cellView.$box.css('z-index') < zIndex) {
                        cellView.$box.css('z-index', ++zIndex);
                      }
                      blockInstance.position.y += 10 * gridsize;
                    }
                  }
                }
                else {
                  /*blockInstance.position.x = 95 * gridsize;
                  blockInstance.data = {
                    label: '',
                    pin: {
                      name: '',
                      value: 0
                    }
                  };
                  var cell = addBasicOutputBlock(blockInstance);
                  var cellView = paper.findViewByModel(cell);
                  if (cellView.$box.css('z-index') < zIndex) {
                    cellView.$box.css('z-index', ++zIndex);
                  }
                  blockInstance.position.y += 10 * gridsize;*/
                }
            });
          }
          else if (type == 'basic.constant') {
            alertify.prompt(gettextCatalog.getString('Enter the constant blocks'), ' C ',
              function(evt, name) {
                if (name) {
                  var names = name.replace(/ /g, '').split(',');
                  blockInstance.position.x = 20 * gridsize;
                  for (var n in names) {
                    if (names[n]) {
                      blockInstance.data = {
                        label: names[n],
                        local: false,
                        value: ''
                      };
                      var cell = addBasicConstantBlock(blockInstance);
                      var cellView = paper.findViewByModel(cell);
                      if (cellView.$box.css('z-index') < zIndex) {
                        cellView.$box.css('z-index', ++zIndex);
                      }
                      blockInstance.position.x += 15 * gridsize;
                    }
                  }
                }
                else {
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
              blockInstance.position.x = 6 * gridsize;
              blockInstance.position.y = 16 * gridsize;
              var cell = addGenericBlock(blockInstance, block);
              var cellView = paper.findViewByModel(cell);
              if (cellView.$box.css('z-index') < zIndex) {
                cellView.$box.css('z-index', ++zIndex);
              }
            }
            else {
              alertify.notify(gettextCatalog.getString('Wrong block format: {{type}}', { type: type }), 'error', 30);
            }
          }
        };

        this.toJSON = function() {
          return graph.toJSON();
        }

        this.getCells = function() {
          return graph.getCells();
        }

        this.setCells = function(cells) {
          graph.attributes.cells.models = cells;
        }

        this.getContent = function(id) {
          return paper.findViewByModel(id).$box.find(
            '#content' + sha1(id).toString().substring(0, 6)).val();
        }

        this.resetIOChoices = function() {
          var cells = graph.getCells();
          // Reset choices in all i/o blocks
          for (var i in cells) {
            var cell = cells[i];
            var type = cell.attributes.blockType;
            if (type == 'basic.input' || type == 'basic.output') {
              cell.attributes.choices = boards.getPinout();
              var view = paper.findViewByModel(cell.id);
              view.renderChoices();
              view.clearValue();
            }
          }
        }

        this.cloneSelected = function() {
          var self = this;
          if (selection) {
            selection.each(function(cell) {
              var newCell = cell.clone();
              var type = cell.attributes.blockType;
              var content = self.getContent(cell.id);
              if (type == 'basic.code') {
                newCell.attributes.data.code = content;
              }
              else if (type == 'basic.info') {
                newCell.attributes.data.info = content;
              }
              newCell.translate(6 * gridsize, 6 * gridsize);
              addCell(newCell);
              if (type.indexOf('config.') != -1) {
                paper.findViewByModel(newCell).$box.addClass('config-block');
              }
              var cellView = paper.findViewByModel(newCell);
              if (cellView.$box.css('z-index') < zIndex) {
                cellView.$box.css('z-index', ++zIndex);
              }
              selection.reset(selection.without(cell));
              selectionView.cancelSelection();
            });
          }
        }

        this.hasSelection = function() {
          return selection.length > 0;
        }

        this.removeSelected = function(removeDep) {
          if (selection) {
            selection.each(function(cell) {
              selection.reset(selection.without(cell));
              selectionView.cancelSelection();
              var type = cell.attributes.blockType;
              cell.remove();
              if (!typeInGraph(type)) {
                // Check if it is the last "type" block
                if (removeDep) {
                  // Remove "type" dependency in the project
                  removeDep(type);
                }
              }
            });
          }
        }

        function typeInGraph(type) {
          var cells = graph.getCells();
          for (var i in cells) {
            if (cells[i].attributes.blockType == type) {
              return true;
            }
          }
          return false;
        };

        this.isEmpty = function() {
          return (graph.getCells().length == 0);
        }

        this.isEnabled = function() {
          return paper.options.enabled;
        }

        this.loadDesign = function(design, disabled) {
          if (design &&
              design.graph &&
              design.graph.blocks &&
              design.graph.wires &&
              design.deps) {

            var blockInstances = design.graph.blocks;
            var wires = design.graph.wires;
            var deps = design.deps;

            dependencies = design.deps;

            this.clearAll();

            this.setState(design.state);

            // Blocks
            for (var i in blockInstances) {
              var blockInstance = blockInstances[i];
              if (blockInstance.type == 'basic.code') {
                addBasicCodeBlock(blockInstance, disabled);
              }
              else if (blockInstance.type == 'basic.info') {
                addBasicInfoBlock(blockInstance, disabled);
              }
              else if (blockInstance.type == 'basic.input') {
                addBasicInputBlock(blockInstance, disabled);
              }
              else if (blockInstance.type == 'basic.output') {
                addBasicOutputBlock(blockInstance, disabled);
              }
              else if (blockInstance.type == 'basic.constant') {
                addBasicConstantBlock(blockInstance, disabled);
              }
              else {
                if (deps && deps[blockInstance.type]) {
                  addGenericBlock(blockInstance, deps[blockInstance.type]);
                }
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
            position: { x: 6 * gridsize, y: 16 * gridsize }
          }
          dependencies[type] = block;
          var cell = addGenericBlock(blockInstance, block);
          var cellView = paper.findViewByModel(cell);
          if (cellView.$box.css('z-index') < zIndex) {
            cellView.$box.css('z-index', ++zIndex);
          }
        }

        function addBasicInputBlock(blockInstances, disabled) {
          var cell = new joint.shapes.ice.Input({
            id: blockInstances.id,
            blockType: blockInstances.type,
            data: blockInstances.data,
            label: blockInstances.data.label,
            position: blockInstances.position,
            disabled: disabled,
            choices: boards.getPinout()
          });

          addCell(cell);
          return cell;
        };

        function addBasicOutputBlock(blockInstances, disabled) {
          var cell = new joint.shapes.ice.Output({
            id: blockInstances.id,
            blockType: blockInstances.type,
            data: blockInstances.data,
            label: blockInstances.data.label,
            position: blockInstances.position,
            disabled: disabled,
            choices: boards.getPinout()
          });

          addCell(cell);
          return cell;
        };

        function addBasicConstantBlock(blockInstances, disabled) {
          var cell = new joint.shapes.ice.Constant({
            id: blockInstances.id,
            blockType: blockInstances.type,
            data: blockInstances.data,
            label: blockInstances.data.label,
            position: blockInstances.position,
            disabled: disabled
          });

          addCell(cell);
          return cell;
        };

        function addBasicCodeBlock(blockInstances, disabled) {
          var leftPorts = [];
          var rightPorts = [];
          var topPorts = [];

          for (var i in blockInstances.data.ports.in) {
            leftPorts.push({
              id: blockInstances.data.ports.in[i],
              label: blockInstances.data.ports.in[i],
              gridUnits: 32
            });
          }

          for (var o in blockInstances.data.ports.out) {
            rightPorts.push({
              id: blockInstances.data.ports.out[o],
              label: blockInstances.data.ports.out[o],
              gridUnits: 32
            });
          }

          for (var p in blockInstances.data.params) {
            topPorts.push({
              id: blockInstances.data.params[p],
              label: blockInstances.data.params[p],
              gridUnits: 48
            });
          }

          var cell = new joint.shapes.ice.Code({
            id: blockInstances.id,
            blockType: blockInstances.type,
            data: blockInstances.data,
            position: blockInstances.position,
            disabled: disabled,
            leftPorts: leftPorts,
            rightPorts: rightPorts,
            topPorts: topPorts
          });

          addCell(cell);
          return cell;
        };

        function addBasicInfoBlock(blockInstances, disabled) {
          var cell = new joint.shapes.ice.Info({
            id: blockInstances.id,
            blockType: blockInstances.type,
            data: blockInstances.data,
            position: blockInstances.position,
            disabled: disabled
          });

          addCell(cell);
          return cell;
        };

        function addGenericBlock(blockInstance, block) {
          var leftPorts = [];
          var rightPorts = [];
          var topPorts = [];
          var bottomPorts = [];

          for (var i in block.graph.blocks) {
            var item = block.graph.blocks[i];
            if (item.type == 'basic.input') {
              leftPorts.push({
                id: item.id,
                label: item.data.label
              });
            }
            else if (item.type == 'basic.output') {
              rightPorts.push({
                id: item.id,
                label: item.data.label
              });
            }
            else if (item.type == 'basic.constant') {
              if (!item.data.local) {
                topPorts.push({
                  id: item.id,
                  label: item.data.label
                });
              }
            }
          }

          var numPortsHeight = Math.max(leftPorts.length, rightPorts.length);
          var numPortsWidth = Math.max(topPorts.length, bottomPorts.length);

          var height = 8 * gridsize;
          height = Math.max(4 * gridsize * numPortsHeight, height);
          var blockLabel = blockInstance.type.toUpperCase();
          var width = 12 * gridsize;
          if (blockLabel.length > 4) {
            width = Math.min((blockLabel.length + 8) * gridsize, 24 * gridsize);
          }
          width = Math.max(4 * gridsize * numPortsWidth, width);

          var gridUnitsHeight = height / gridsize;
          var gridUnitsWidth = width / gridsize;

          for (var i in leftPorts) {
            leftPorts[i].gridUnits = gridUnitsHeight;
          }
          for (var i in rightPorts) {
            rightPorts[i].gridUnits = gridUnitsHeight;
          }
          for (var i in topPorts) {
            topPorts[i].gridUnits = gridUnitsWidth;
          }
          for (var i in bottomPorts) {
            bottomPorts[i].gridUnits = gridUnitsWidth;
          }

          if (blockInstance.type.indexOf('.') != -1) {
            blockLabel = blockInstance.type.split('.').join(' ');
          }

          var blockImage = '';
          if (block.image) {
            width = 12 * gridsize;
            if (block.image.startsWith('%3Csvg')) {
              blockImage = block.image;
            }
            else if (block.image.startsWith('<svg')) {
              blockImage = encodeURI(block.image);
            }
          }

          var cell = new joint.shapes.ice.Generic({
            id: blockInstance.id,
            blockType: blockInstance.type,
            data: {},
            image: blockImage,
            label: blockLabel,
            position: blockInstance.position,
            leftPorts: leftPorts,
            rightPorts: rightPorts,
            topPorts: topPorts,
            size: {
              width: width,
              height: height
            }
          });

          addCell(cell);

          if (blockInstance.type.indexOf('config.') != -1) {
            paper.findViewByModel(cell).$box.addClass('config-block');
          }

          return cell;
        }

        function addWire(wire) {
          var source = graph.getCell(wire.source.block);
          var target = graph.getCell(wire.target.block);

          // Find selectors
          var sourceSelector, targetSelector;
          for (var _out = 0; _out < source.attributes.rightPorts.length; _out++) {
            if (source.attributes.rightPorts[_out] == wire.source.port) {
              sourcePort = _out;
              break;
            }
          }
          for (var _in = 0; _in < source.attributes.leftPorts.length; _in++) {
            if (target.attributes.leftPorts[_in] == wire.target.port) {
              targetPort = _in;
              break;
            }
          }

          var _wire = new joint.shapes.ice.Wire({
            source: {
              id: source.id,
              selector: sourceSelector,
              port: wire.source.port
            },
            target: {
              id: target.id,
              selector: targetSelector,
              port: wire.target.port
            },
            vertices: wire.vertices
          });

          addCell(_wire);
        }

      function addCell(cell) {
        cell.attributes.state = state;
        graph.addCell(cell);
      }

    });
