'use strict';

angular.module('icestudio')
  .service('graph', function($rootScope,
                             joint,
                             boards,
                             blocks,
                             utils,
                             gettextCatalog,
                             nodeSha1) {
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
      zoom: 1.0
    };

    // Functions

    $(document).on('keydown', function(event) {
      ctrlPressed = event.keyCode === 17;
    });

    this.getState = function() {
      // Clone state
      return JSON.parse(JSON.stringify(state));
    };

    this.setState = function(_state) {
      if (!_state) {
        _state = {
          pan: {
            x: 0,
            y: 0
          },
          zoom: 1.0
        };
      }
      this.panAndZoom.zoom(_state.zoom);
      this.panAndZoom.pan(_state.pan);
    };

    this.resetState = function() {
      this.setState(null);
    };

    this.resetBreadcrumbs = function(name) {
      if (this.breadcrumbs.length > 1) {
        this.breadcrumbs = [{ name: name }];
      }
      this.breadcrumbs[0].name = name;
      if(!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    };

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
        /*guard: function(evt, view) {
          // FALSE means the event isn't guarded.
          return false;
        },*/
        validateMagnet: function(cellView, magnet) {
          // Prevent to start wires from an input port
          return (magnet.getAttribute('type') === 'output');
        },
        validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
          // Prevent output-output links
          if (magnetS.getAttribute('type') === 'output' &&
              magnetT.getAttribute('type') === 'output') {
            if (magnetS !== magnetT) {
              // Show warning if source and target blocks are different
              warning(gettextCatalog.getString('Invalid connection'));
            }
            return false;
          }
          // Ensure right -> left connections
          if (magnetS.getAttribute('pos') === 'right') {
            if (magnetT.getAttribute('pos') !== 'left') {
              warning(gettextCatalog.getString('Invalid connection'));
              return false;
            }
          }
          // Ensure bottom -> top connections
          if (magnetS.getAttribute('pos') === 'bottom') {
            if (magnetT.getAttribute('pos') !== 'top') {
              warning(gettextCatalog.getString('Invalid connection'));
              return false;
            }
          }
          var links = graph.getLinks();
          for (var i in links) {
            var linkIView = links[i].findView(paper);
            if (linkView === linkIView) {
              //Skip the wire the user is drawing
              continue;
            }
            // Prevent multiple input links
            if ((cellViewT.model.id === links[i].get('target').id) &&
                (magnetT.getAttribute('port') === links[i].get('target').port)) {
              warning(gettextCatalog.getString('Invalid multiple input connections'));
              return false;
            }
            // Prevent to connect a pull-up if other blocks are connected
            if ((cellViewT.model.attributes.blockType === 'config.pull_up' ||
                 cellViewT.model.attributes.blockType === 'config.pull_up_inv') &&
                 (cellViewS.model.id === links[i].get('source').id)) {
              warning(gettextCatalog.getString('Invalid <i>Pull up</i> connection:<br>block already connected'));
              return false;
            }
            // Prevent to connect other blocks if a pull-up is connected
            if ((linkIView.targetView.model.attributes.blockType === 'config.pull_up' ||
                 linkIView.targetView.model.attributes.blockType === 'config.pull_up_inv') &&
                 (cellViewS.model.id === links[i].get('source').id)) {
              warning(gettextCatalog.getString('Invalid block connection:<br><i>Pull up</i> already connected'));
              return false;
            }
          }
          // Ensure input -> pull-up connections
          if (cellViewT.model.attributes.blockType === 'config.pull_up' ||
              cellViewT.model.attributes.blockType === 'config.pull_up_inv') {
            var ret = (cellViewS.model.attributes.blockType === 'basic.input');
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
      }

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
        /*beforeZoom: function(oldzoom, newzoom) {
        },*/
        onZoom: function(scale) {
          state.zoom = scale;
          // Already rendered in pan
        },
        /*beforePan: function(oldpan, newpan) {
        },*/
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

     selection = new Backbone.Collection();
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
       if ((evt.which === 3) && (evt.ctrlKey || evt.metaKey)) {
         var cell = selection.get($(evt.target).data('model'));
         selection.reset(selection.without(cell));
         selectionView.destroySelectionBox(paper.findViewByModel(cell));
       }
     });

     paper.on('cell:pointerup', function(cellView, evt/*, x, y*/) {
       if (paper.options.enabled) {
         if (!cellView.model.isLink()) {
           if (evt.which === 3) {
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
     });

      paper.on('cell:pointerdown', function(cellView) {
        if (paper.options.enabled) {
          if (!cellView.model.isLink()) {
            if (cellView.$box.css('z-index') < zIndex) {
              cellView.$box.css('z-index', ++zIndex);
            }
          }
        }
      });

      paper.on('cell:pointerdblclick', function(cellView/*, evt, x, y*/) {
        var data = cellView.model.attributes;
        if (data.blockType === 'basic.input' ||
            data.blockType === 'basic.output') {
          if (paper.options.enabled) {
            utils.inputcheckboxprompt([
              gettextCatalog.getString('Update the port label'),
              gettextCatalog.getString('Virtual port')
            ], [
              data.data.label,
              data.data.virtual
            ],
              function(evt, values) {
                var label = values[0].replace(/ /g, '');
                if (data.data.label !== label) {
                  data.data.label = label;
                  alertify.success(gettextCatalog.getString('Block updated'));
                }
                var virtual = values[1];
                data.data.virtual = virtual;
                cellView.render();
            });
          }
        }
        else if (data.blockType === 'basic.constant') {
          if (paper.options.enabled) {
            utils.inputcheckboxprompt([
              gettextCatalog.getString('Update the block label'),
              gettextCatalog.getString('Local parameter')
            ], [
              data.data.label,
              data.data.local
            ],
              function(evt, values) {
                var label = values[0].replace(/ /g, '');
                if (data.data.label !== label) {
                  data.data.label = label;
                  cellView.renderLabel();
                  alertify.success(gettextCatalog.getString('Block updated'));
                }
                var local = values[1];
                data.data.local = local;
                cellView.renderLocal();
            });
          }
        }
        else if (data.blockType === 'basic.code') {
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
        else if (data.type !== 'ice.Wire' && data.type !== 'ice.Info') {
          self.breadcrumbs.push({ name: data.blockType });
          if(!$rootScope.$$phase) {
            $rootScope.$apply();
          }
          zIndex = 1;
          if (self.breadcrumbs.length === 2) {
            $rootScope.$broadcast('updateProject', function() {
              self.loadDesign(dependencies[data.blockType].design, true);
            });
          }
          else {
            self.loadDesign(dependencies[data.blockType].design, true);
          }
        }
      });

      paper.on('blank:pointerdown', function(evt, x, y) {
        // Disable current focus
        document.activeElement.blur();

        if (evt.which === 3) {
          // Right button
          if (paper.options.enabled) {
            selectionView.startSelecting(evt, x, y);
          }
        }
        else if (evt.which === 1) {
          // Left button
          self.panAndZoom.enablePan();
        }
      });

      paper.on('cell:pointerup blank:pointerup', function(/*cellView, evt*/) {
        self.panAndZoom.disablePan();
      });

      paper.on('cell:mouseover', function(cellView/*, evt*/) {
        if (!cellView.model.isLink()) {
          cellView.$box.addClass('highlight');
        }
      });

      paper.on('cell:mouseout', function(cellView/*, evt*/) {
        if (!cellView.model.isLink()) {
          cellView.$box.removeClass('highlight');
        }
      });

      graph.on('change:position', function(/*cell*/) {
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
        if (cells[i].attributes.type !== 'ice.Generic') {
          if (value) {
            cellView.$el.removeClass('disable-graph');
          }
          else {
            cellView.$el.addClass('disable-graph');
          }
        }
        else if (cells[i].attributes.type !== 'ice.Wire') {
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
      blocks.new(type, block, function(cell) {
        addCell(cell);
        if (callback) {
          callback();
        }
      });

      /*var blockInstance = {
        id: null,
        data: {},
        type: type,
        position: { x: 4 * gridsize, y: 4 * gridsize }
      };

      if (type === 'basic.code') {
        var defaultValues = [
          'a , b',
          'c , d',
          ''
        ];
        if (block && block.data) {
          if (block.data.ports) {
            defaultValues[0] = block.data.ports.in.join(' , ');
            defaultValues[1] = block.data.ports.out.join(' , ');
          }
          if (block.data.params) {
            defaultValues[2] = block.data.params.join(' , ');
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
                if (inPorts[i]) {
                  blockInstance.data.ports.in.push(inPorts[i]);
                }
              }
              for (var o in outPorts) {
                if (outPorts[o]) {
                  blockInstance.data.ports.out.push(outPorts[o]);
                }
              }
              for (var p in params) {
                if (params[p]) {
                  blockInstance.data.params.push(params[p]);
                }
              }
              blockInstance.position.x = 31 * gridsize;
              blockInstance.position.y = 24 * gridsize;

              var allAttrs= inPorts.concat(outPorts, params);
              var numAttrs = allAttrs.length;

              // Check duplicated attributes
              if (numAttrs === $.unique(allAttrs).length) {
                evt.cancel = false;
                if (block) {
                  blockInstance.data.code = block.data.code;
                  blockInstance.position = block.position;
                }
                var cell = blocks.basicCode(blockInstance);
                addCell(cell);
                var cellView = paper.findViewByModel(cell);
                if (cellView.$box.css('z-index') < zIndex) {
                  cellView.$box.css('z-index', ++zIndex);
                }
                if (callback) {
                  callback();
                }
              }
              else {
                evt.cancel = true;
                alertify.notify(gettextCatalog.getString('Duplicated block attributes'), 'warning', 3);
              }
            }
        });
      }
      else if (type === 'basic.info') {
        blockInstance.data = {
          info: ''
        };
        blockInstance.position.y = 30 * gridsize;
        var cell = blocks.basicInfo(blockInstance);
        addCell(cell);
        var cellView = paper.findViewByModel(cell);
        if (cellView.$box.css('z-index') < zIndex) {
          cellView.$box.css('z-index', ++zIndex);
        }
      }
      else if (type === 'basic.constant') {
        alertify.prompt(gettextCatalog.getString('Enter the constant blocks'), 'C',
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
                  var cell = addCell(blocks.basicConstant(blockInstance));
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
            block.design &&
            block.design.graph &&
            block.design.graph.blocks &&
            block.design.graph.wires &&
            block.design.deps) {
          dependencies[type] = block;
          blockInstance.position.x = 6 * gridsize;
          blockInstance.position.y = 16 * gridsize;
          var _cell = blocks.generic(blockInstance, block);
          addCell(_cell);
          var _cellView = paper.findViewByModel(_cell);
          if (_cellView.$box.css('z-index') < zIndex) {
            _cellView.$box.css('z-index', ++zIndex);
          }
        }
        else {
          alertify.notify(gettextCatalog.getString('Wrong block format: {{type}}', { type: type }), 'error', 30);
        }
      }*/
    };

    this.toJSON = function() {
      return graph.toJSON();
    };

    this.getCells = function() {
      return graph.getCells();
    };

    this.setCells = function(cells) {
      graph.attributes.cells.models = cells;
    };

    this.getContent = function(id) {
      return paper.findViewByModel(id).$box.find(
        '#content' + nodeSha1(id).toString().substring(0, 6)).val();
    };

    this.resetIOChoices = function() {
      var cells = graph.getCells();
      // Reset choices in all i/o blocks
      for (var i in cells) {
        var cell = cells[i];
        var type = cell.attributes.blockType;
        if (type === 'basic.input' || type === 'basic.output') {
          cell.attributes.choices = boards.getPinoutHTML();
          var view = paper.findViewByModel(cell.id);
          view.renderChoices();
          view.clearValue();
        }
      }
    };

    this.cloneSelected = function() {
      var self = this;
      if (selection) {
        selection.each(function(cell) {
          var newCell = cell.clone();
          var type = cell.attributes.blockType;
          var content = self.getContent(cell.id);
          if (type === 'basic.code') {
            newCell.attributes.data.code = content;
          }
          else if (type === 'basic.info') {
            newCell.attributes.data.info = content;
          }
          newCell.translate(6 * gridsize, 6 * gridsize);
          addCell(newCell);
          if (type.indexOf('config.') !== -1) {
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
    };

    this.hasSelection = function() {
      return selection.length > 0;
    };

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
    };

    function typeInGraph(type) {
      var cells = graph.getCells();
      for (var i in cells) {
        if (cells[i].attributes.blockType === type) {
          return true;
        }
      }
      return false;
    }

    this.isEmpty = function() {
      return (graph.getCells().length === 0);
    };

    this.isEnabled = function() {
      return paper.options.enabled;
    };

    this.loadDesign = function(design, disabled, callback) {
      if (design &&
          design.graph &&
          design.graph.blocks &&
          design.graph.wires &&
          design.deps) {

        var i;
        var self = this;
        var blockInstances = design.graph.blocks;
        var wires = design.graph.wires;
        var deps = design.deps;

        dependencies = design.deps;

        $('body').addClass('waiting');

        this.clearAll();
        this.setState(design.state);

        setTimeout(function() {
          var cell;

          // Blocks
          for (i in blockInstances) {
            var blockInstance = blockInstances[i];
            if (blockInstance.type === 'basic.input') {
              cell = blocks.loadBasicInput(blockInstance, disabled);
            }
            else if (blockInstance.type === 'basic.output') {
              cell = blocks.loadBasicOutput(blockInstance, disabled);
            }
            else if (blockInstance.type === 'basic.code') {
              cell = blocks.basicCode(blockInstance, disabled);
            }
            else if (blockInstance.type === 'basic.info') {
              cell = blocks.basicInfo(blockInstance, disabled);
            }
            else if (blockInstance.type === 'basic.constant') {
              cell = blocks.basicConstant(blockInstance, disabled);
            }
            else {
              if (deps && deps[blockInstance.type]) {
                cell = blocks.generic(blockInstance, deps[blockInstance.type]);
                if (blockInstance.type.indexOf('config.') !== -1) {
                  paper.findViewByModel(cell).$box.addClass('config-block');
                }
              }
            }
            addCell(cell);
          }

          // Wires
          for (i in wires) {
            cell = blocks.wire(wires[i],
                               graph.getCell(wires[i].source.block),
                               graph.getCell(wires[i].target.block));
            addCell(cell);
          }

          self.appEnable(!disabled);

          $('body').removeClass('waiting');

          if (callback) {
            callback();
          }

        }, 20);

        return true;
      }
    };

    this.importBlock = function(type, block) {
      var blockInstance = {
        id: null,
        data: {},
        type: type,
        position: { x: 6 * gridsize, y: 16 * gridsize }
      };
      dependencies[type] = block;
      var cell = blocks.generic(blockInstance, block);
      addCell(cell);
      var cellView = paper.findViewByModel(cell);
      if (cellView.$box.css('z-index') < zIndex) {
        cellView.$box.css('z-index', ++zIndex);
      }
    };

    function addCell(cell) {
      cell.attributes.state = state;
      graph.addCell(cell);
      var cellView = paper.findViewByModel(cell);
      if (cellView.$box.css('z-index') < zIndex) {
        cellView.$box.css('z-index', ++zIndex);
      }
    }

  });
