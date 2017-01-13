'use strict';

angular.module('icestudio')
  .service('graph', function($rootScope,
                             joint,
                             boards,
                             blocks,
                             utils,
                             gettextCatalog,
                             window) {
    // Variables

    var z = {
      index: 100
    };
    var ctrlPressed = false;

    var graph = null;
    var paper = null;
    var selection = null;
    var selectionView = null;
    var commandManager = null;
    var clipboard = [];
    var mousePosition = { x: 0, y: 0 };

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
    const ZOOM_MAX = 2;
    const ZOOM_MIN = 0.2;

    // Functions

    $(document).on('keydown', function(event) {
      ctrlPressed = event.keyCode === 17;
    });

    this.getState = function() {
      // Clone state
      return utils.clone(state);
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

    this.resetView = function() {
      this.setState(null);
    };

    this.fitContent = function() {
      if (!this.isEmpty()) {
        // Target box
        var margin = 40;
        var menuFooterHeight = 93;
        var tbox = {
          x: margin,
          y: margin,
          width: window.get().width - 2 * margin,
          height: window.get().height - menuFooterHeight - 2 * margin
        };
        // Source box
        var sbox = V(paper.viewport).bbox(true, paper.svg);
        sbox = {
          x: sbox.x * state.zoom,
          y: sbox.y * state.zoom,
          width: sbox.width * state.zoom,
          height: sbox.height * state.zoom
        };
        var scale = 1;
        if (tbox.width/sbox.width > tbox.height/sbox.height) {
          scale = tbox.height / sbox.height;
        }
        else {
          scale = tbox.width / sbox.width;
        }
        if (state.zoom * scale > ZOOM_MAX) {
          scale = ZOOM_MAX / state.zoom;
        }
        var target = {
          x: tbox.x + tbox.width / 2,
          y: tbox.y + tbox.height / 2
        };
        var source = {
          x: sbox.x + sbox.width / 2,
          y: sbox.y + sbox.height / 2
        };
        this.setState({
          pan: {
            x: target.x - source.x * scale,
            y: target.y - source.y * scale
          },
          zoom: state.zoom * scale
        });
      }
      else {
        this.resetView();
      }
    };

    this.resetBreadcrumbs = function(name) {
      if (this.breadcrumbs.length > 1) {
        this.breadcrumbs = [{ name: name }];
      }
      this.breadcrumbs[0].name = name;
      utils.rootScopeSafeApply();
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
          var i;
          var links = graph.getLinks();
          for (i in links) {
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
          // Prevent different size connections
          var tsize;
          var lsize = linkView.model.attributes.size;
          var portId = magnetT.getAttribute('port');
          var tLeftPorts = cellViewT.model.attributes.leftPorts;
          for (i in tLeftPorts) {
            var port = tLeftPorts[i];
            if (portId === port.id) {
              tsize = port.size;
              break;
            }
          }
          tsize = tsize || 1;
          lsize = lsize || 1;
          if (tsize !== lsize) {
            warning(gettextCatalog.getString('Invalid connection: {{a}} → {{b}}', { a: lsize, b: tsize }));
            return false;
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
        minZoom: ZOOM_MIN,
        maxZoom: ZOOM_MAX,
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

      // Command Manager

      commandManager = new joint.dia.CommandManager({
        paper: paper,
        graph: graph
      });

      // Selection View

     selection = new Backbone.Collection();
     selectionView = new joint.ui.SelectionView({
       paper: paper,
       graph: graph,
       model: selection,
       state: state
     });

     // Events

     var self = this;

     $('#paper').mousemove(function(event) {
       mousePosition = {
         x: event.offsetX,
         y: event.offsetY
       };
     });

     selectionView.on('selection-box:pointerdown', function(evt) {
       // Selection to top view
       if (selection) {
         selection.each(function(cell) {
           var cellView = paper.findViewByModel(cell);
           if (cellView) {
             if (!cellView.model.isLink()) {
               if (cellView.$box.css('z-index') < z.index) {
                 cellView.$box.css('z-index', ++z.index);
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
            if (cellView.$box.css('z-index') < z.index) {
              cellView.$box.css('z-index', ++z.index);
            }
          }
        }
      });

      paper.on('cell:pointerdblclick', function(cellView/*, evt, x, y*/) {
        var type =  cellView.model.attributes.blockType;
        if (type.indexOf('basic.') !== -1) {
          if (paper.options.enabled) {
            blocks.editBasic(type, cellView, function(cell) {
              addCell(cell);
            });
          }
        }
        else {
          self.breadcrumbs.push({ name: type });
          utils.rootScopeSafeApply();
          z.index = 1;
          if (self.breadcrumbs.length === 2) {
            $rootScope.$broadcast('updateProject', function() {
              self.loadDesign(dependencies[type].design, true);
            });
          }
          else {
            self.loadDesign(dependencies[type].design, true);
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

    this.undo = function() {
      disableSelected();
      commandManager.undo(state);
    };

    this.redo = function() {
      disableSelected();
      commandManager.redo(state);
    };

    this.clearAll = function() {
      graph.clear();
      this.appEnable(true);
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

    this.createBlock = function(type, block) {
      if (type.indexOf('basic.') !== -1) {
        blocks.newBasic(type, function(cell) {
          addCell(cell);
        });
      }
      else {
        dependencies[type] = block;
        blocks.newGeneric(type, block, function(cell) {
          addCell(cell);
        });
      }
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

    this.selectBoard = function(boardName) {
      graph.startBatch('change');
      // Trigger board event
      var data = {
        previous: boards.selectedBoard.name,
        next: boardName
      };
      graph.trigger('board', { data: data });
      boards.selectBoard(boardName);
      var cells = graph.getCells();
      // Reset choices in all I/O blocks
      for (var i in cells) {
        var cell = cells[i];
        var type = cell.attributes.blockType;
        if (type === 'basic.input' ||
            type === 'basic.output') {
          var view = paper.findViewByModel(cell.id);
          cell.set('choices', boards.getPinoutHTML());
          view.clearValues();
          view.applyChoices();
        }
      }
      graph.stopBatch('change');
    };

    this.resetCommandStack = function() {
      commandManager.reset();
    };

    this.cutSelected = function() {
      if (selection) {
        clipboard = selection.clone();
        this.removeSelected();
      }
    };

    this.copySelected = function() {
      if (selection) {
        clipboard = selection.clone();
      }
    };

    this.pasteSelected = function() {
      if (clipboard && clipboard.length > 0) {
        var offset = clipboard.models[0].attributes.position;
        selectionView.cancelSelection();
        var newCells = [];
        clipboard.each(function(cell) {
          var newCell = cell.clone();
          newCell.translate(
            Math.round(((mousePosition.x - state.pan.x) / state.zoom - offset.x) / gridsize) * gridsize,
            Math.round(((mousePosition.y - state.pan.y) / state.zoom - offset.y) / gridsize) * gridsize
          );
          newCells.push(newCell);
        });
        graph.addCells(newCells);
        // Select pasted cells
        _.each(newCells, function(cell) {
          if (!cell.isLink()) {
            var cellView = paper.findViewByModel(cell);
            selection.add(cell);
            selectionView.createSelectionBox(cellView);
            cellView.$box.removeClass('highlight');
          }
        });
      }
    };

    this.selectAll = function() {
      disableSelected();
      var cells = graph.getCells();
      _.each(cells, function(cell) {
        if (!cell.isLink()) {
          var cellView = paper.findViewByModel(cell);
          selection.add(cell);
          selectionView.createSelectionBox(cellView);
          cellView.$box.removeClass('highlight');
        }
      });
    };

    this.hasSelection = function() {
      return selection.length > 0;
    };

    this.removeSelected = function(removeDep) {
      if (selection) {
        selection.each(function(cell) {
          var type = cell.attributes.blockType;
          if (!typeInGraph(type)) {
            // Check if it is the last "type" block
            if (removeDep) {
              // Remove "type" dependency in the project
              removeDep(type);
            }
          }
        });
        graph.removeCells(selection.models);
        selectionView.cancelSelection();
      }
    };

    $(document).on('disableSelected', function() {
      disableSelected();
    });

    function disableSelected() {
      if (selection) {
        selectionView.cancelSelection();
      }
    }

    var stepValue = 8;

    this.stepLeft = function() {
      step({ x: -stepValue, y: 0 });
    };

    this.stepUp = function() {
      step({ x: 0, y: -stepValue });
    };

    this.stepRight = function() {
      step({ x: stepValue, y: 0 });
    };

    this.stepDown = function() {
      step({ x: 0, y: stepValue });
    };

    function step(offset) {
      if (selection) {
        graph.startBatch('change');
        selection.each(function(cell) {
          cell.translate(offset.x, offset.y);
          selectionView.updateBox(cell);
        });
        graph.stopBatch('change');
      }
    }

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

        commandManager.stopListening();

        this.clearAll();
        this.setState(design.state);

        setTimeout(function() {
          var cell;

          // Blocks
          for (i in blockInstances) {
            var blockInstance = blockInstances[i];
            if (blockInstance.type.indexOf('basic.') !== -1) {
              cell = blocks.loadBasic(blockInstance, disabled);
            }
            else {
              if (deps && deps[blockInstance.type]) {
                cell = blocks.loadGeneric(blockInstance, deps[blockInstance.type]);
              }
            }
            addCell(cell);
          }

          // Wires
          for (i in wires) {
            var source = graph.getCell(wires[i].source.block);
            var target = graph.getCell(wires[i].target.block);
            cell = blocks.loadWire(wires[i], source, target);
            addCell(cell);
          }

          self.appEnable(!disabled);
          $('body').removeClass('waiting');

          if (!disabled) {
            commandManager.listen();
          }

          if (callback) {
            callback();
          }

        }, 20);

        return true;
      }
    };

    function addCell(cell) {
      cell.attributes.state = state;
      //cell.attributes.zindex = z.index;
      graph.addCell(cell);
      if (!cell.isLink()) {
        var cellView = paper.findViewByModel(cell);
        if (cellView.$box.css('z-index') < z.index) {
          cellView.$box.css('z-index', ++z.index);
        }
      }
    }

  });
