'use strict';

angular.module('icestudio')
  .service('graph', function($rootScope,
                             joint,
                             boards,
                             blocks,
                             profile,
                             utils,
                             common,
                             gettextCatalog,
                             window) {
    // Variables

    var z = {
      index: 100
    };

    var graph = null;
    var paper = null;
    var selection = null;
    var selectionView = null;
    var commandManager = null;
    var mousePosition = { x: 0, y: 0 };

    this.breadcrumbs = [{ name: '', type: '' }];

    var gridsize = 8;
    var state = { pan: { x: 0, y: 0 }, zoom: 1.0 };
    const ZOOM_MAX = 2.0;
    const ZOOM_MIN = 0.3;

    // Functions

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
      this.breadcrumbs = [{ name: name, type: '' }];
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
        snapLinks: { radius: 16 },
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
            if ((cellViewT.model.get('pullup')) &&
                 (cellViewS.model.id === links[i].get('source').id)) {
              warning(gettextCatalog.getString('Invalid <i>Pull up</i> connection:<br>block already connected'));
              return false;
            }
            // Prevent to connect other blocks if a pull-up is connected
            if ((linkIView.targetView.model.get('pullup')) &&
                 (cellViewS.model.id === links[i].get('source').id)) {
              warning(gettextCatalog.getString('Invalid block connection:<br><i>Pull up</i> already connected'));
              return false;
            }
          }
          // Ensure input -> pull-up connections
          if (cellViewT.model.get('pullup')) {
            var ret = (cellViewS.model.get('blockType') === 'basic.input');
            if (!ret) {
              warning(gettextCatalog.getString('Invalid <i>Pull up</i> connection:<br>only <i>Input</i> blocks allowed'));
            }
            return ret;
          }
          // Prevent different size connections
          var tsize;
          var lsize = linkView.model.get('size');
          var portId = magnetT.getAttribute('port');
          var tLeftPorts = cellViewT.model.get('leftPorts');
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

      paper.options.enabled = true;
      paper.options.warningTimer = false;

      function warning(message) {
        if (!paper.options.warningTimer) {
          paper.options.warningTimer = true;
          alertify.warning(message, 5);
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
          state.zoom = scale; // Already rendered in pan

          // Close expanded combo
          if (document.activeElement.className === 'select2-search__field') {
            $('select').select2('close');
          }
        },
        /*beforePan: function(oldpan, newpan) {
        },*/
        onPan: function(newPan) {
          state.pan = newPan;
          selectionView.options.state = state;
          graph.trigger('state', state);
          updateCellBoxes();
        }
      });

      function updateCellBoxes() {
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

     // Events

     this.mousedown = false;
     $(document).on('mouseup', function() { self.mousedown = false; });
     $(document).on('mousedown', function() { self.mousedown = true; });

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
           if (!cellView.model.isLink()) {
             if (cellView.$box.css('z-index') < z.index) {
               cellView.$box.css('z-index', ++z.index);
             }
           }
         });
       }
       // Toggle selection
       if (evt.which === 3) {
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
             unhighlight(cellView);
           }
           updateWiresOnObstacles();
         }
       }
     });

     paper.on('cell:pointerdown', function(cellView) {
       if (paper.options.enabled) {
         if (cellView.model.isLink()) {
           // Unhighlight source block of the wire
           unhighlight(paper.findViewByModel(cellView.model.get('source').id));
         }
       }
      });

      paper.on('cell:pointerdblclick', function(cellView/*, evt, x, y*/) {
        var type =  cellView.model.get('blockType');
        if (type.indexOf('basic.') !== -1) {
          if (paper.options.enabled) {
            blocks.editBasic(type, cellView, function(cell) {
              addCell(cell);
            });
          }
        }
        else if (common.allDependencies[type]) {
          z.index = 1;
          var project = common.allDependencies[type];
          var breadcrumbsLength = self.breadcrumbs.length;
          $rootScope.$broadcast('navigateProject', {
            update: breadcrumbsLength === 1,
            project: project
          });
          self.breadcrumbs.push({ name: project.package.name || '#', type: type });
          utils.rootScopeSafeApply();
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
        if (!self.mousedown) {
          if (!cellView.model.isLink()) {
            highlight(cellView);
            if (cellView.$box.css('z-index') < z.index) {
              cellView.$box.css('z-index', ++z.index);
            }
          }
        }
      });

      paper.on('cell:mouseout', function(cellView/*, evt*/) {
        if (!self.mousedown) {
          if (!cellView.model.isLink()) {
            unhighlight(cellView);
          }
        }
      });

      graph.on('change:position', function(/*cell*/) {
        /*if (!selectionView.isTranslating()) {
          // Update wires on obstacles motion
          var cells = graph.getCells();
          for (var i in cells) {
            var cell = cells[i];
            if (cell.isLink()) {
              paper.findViewByModel(cell).update();
            }
          }
        }*/
      });

      graph.on('add change:source change:target', function(cell) {
        if (cell.isLink() && cell.get('source').id) {
          // Link connected
          var target = cell.get('target');
          if (target.id) {
            // Connected to a port
            cell.attributes.lastTarget = target;
            updatePortDefault(target, false);
          }
          else {
            // Moving the wire connection
            target = cell.get('lastTarget');
            updatePortDefault(target, true);
          }
        }
      });

      graph.on('remove', function(cell) {
        if (cell.isLink()) {
          // Link removed
          var target = cell.get('target');
          if (!target.id) {
            target = cell.get('lastTarget');
          }
          updatePortDefault(target, true);
        }
      });

      function updatePortDefault(target, value) {
        if (target) {
          var block = graph.getCell(target.id);
          if (block) {
            var ports = block.get('leftPorts');
            for (var i in ports) {
              if (ports[i].id === target.port && ports[i].default) {
                ports[i].default.apply = value;
                break;
              }
            }
            paper.findViewByModel(block.id).updateBox();
          }
        }
      }

      // Initialize state
      graph.trigger('state', state);

    };

    function updateWiresOnObstacles() {
      var cells = graph.getCells();
      for (var i in cells) {
        var cell = cells[i];
        if (cell.isLink()) {
          paper.findViewByModel(cell).update();
        }
      }
    }

    this.refreshBoardRules = function() {
      var cells = graph.getCells();

      _.each(cells, function(cell) {
        if (!cell.isLink()) {
          cell.attributes.rules = profile.data.boardRules;
          var cellView = paper.findViewByModel(cell);
          cellView.updateBox();
        }
      });
    };

    this.undo = function() {
      disableSelected();
      commandManager.undo();
    };

    this.redo = function() {
      disableSelected();
      commandManager.redo();
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
        if (cells[i].get('type') !== 'ice.Generic') {
          if (value) {
            cellView.$el.removeClass('disable-graph');
          }
          else {
            cellView.$el.addClass('disable-graph');
          }
        }
        else if (cells[i].get('type') !== 'ice.Wire') {
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
      blocks.newGeneric(type, block, function(cell) {
        addCell(cell);
      });
    };

    this.createBasicBlock = function(type) {
      blocks.newBasic(type, function(cell) {
        addCell(cell);
      });
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
      boardName = boards.selectBoard(boardName);
      var cells = graph.getCells();
      // Reset choices in all I/O blocks
      for (var i in cells) {
        var cell = cells[i];
        var type = cell.get('blockType');
        if (type === 'basic.input' ||
            type === 'basic.output') {
          var view = paper.findViewByModel(cell.id);
          cell.set('choices', (type === 'basic.input') ? boards.pinoutInputHTML : boards.pinoutOutputHTML);
          view.clearValues();
          view.applyChoices();
        }
      }
      graph.stopBatch('change');
      return boardName;
    };

    this.resetCommandStack = function() {
      commandManager.reset();
    };

    this.cutSelected = function() {
      if (selection) {
        utils.copyToClipboard(selection, graph);
        this.removeSelected();
      }
    };

    this.copySelected = function() {
      if (selection) {
        utils.copyToClipboard(selection, graph);
      }
    };

    this.pasteSelected = function() {
      utils.pasteFromClipboard(function(clipboard) {
        if (clipboard && clipboard.length > 0) {
          var origin = clipboardOrigin(clipboard);
          var offset = {
            x: Math.round(((mousePosition.x - state.pan.x) / state.zoom - origin.x) / gridsize) * gridsize,
            y: Math.round(((mousePosition.y - state.pan.y) / state.zoom - origin.y) / gridsize) * gridsize,
          };
          var newCells = [];
          var blocksMap = {};
          var processedWires = {};
          console.log('MOMOMOMO');
          selectionView.cancelSelection();
          /*clipboard.each(function(block) {

            console.log('BLOCK', block);

            // Create new cell
            var newBlock = block.clone();
            console.log(newBlock);
            newBlock.translate(offset.x, offset.y);
            newCells.push(newBlock);

            // Map old and new cells
            blocksMap[block.id] = newBlock;

            // Create new wires
            var connectedWires = graph.getConnectedLinks(block);
            _.each(connectedWires, function(wire) {

              if (processedWires[wire.id]) {
                return;
              }

              var newSource = blocksMap[wire.get('source').id];
              var newTarget = blocksMap[wire.get('target').id];

              if (newSource && newTarget) {

                // Translate the new vertices
                var newVertices = [];
                var vertices = wire.get('vertices');
                if (vertices && vertices.length) {
                  _.each(vertices, function(vertex) {
                    newVertices.push({
                      x: vertex.x + offset.x,
                      y: vertex.y + offset.y
                    });
                  });
                }

                // Create a new wire
                var instance = {
                  source: { block: newSource.id, port: wire.get('source').port },
                  target: { block: newTarget.id, port: wire.get('target').port },
                  vertices: newVertices,
                  size: wire.get('size')
                };
                var newWire = blocks.loadWire(instance, newSource, newTarget);
                newCells.push(newWire);
                processedWires[wire.id] = true;
              }

            });
          });*/

          // All all cells: blocks and wires
          graph.addCells(newCells);

          // Select pasted elements
          _.each(newCells, function(cell) {
            if (!cell.isLink()) {
              var cellView = paper.findViewByModel(cell);
              selection.add(cell);
              selectionView.createSelectionBox(cellView);
              unhighlight(cellView);
            }
          });
        }
      });
    };

    function clipboardOrigin(clipboard) {
      var origin = { x: Infinity, y: Infinity };
      clipboard.each(function(cell) {
        var position = cell.get('position');
        if (position.x < origin.x) {
          origin = position;
        }
      });
      return origin;
    }

    this.selectAll = function() {
      disableSelected();
      var cells = graph.getCells();
      _.each(cells, function(cell) {
        if (!cell.isLink()) {
          var cellView = paper.findViewByModel(cell);
          selection.add(cell);
          selectionView.createSelectionBox(cellView);
          unhighlight(cellView);
        }
      });
    };

    function highlight(cellView) {
      if (cellView) {
        switch(cellView.model.get('type')) {
          case 'ice.Input':
          case 'ice.Output':
            if (cellView.model.get('data').virtual) {
              cellView.$box.addClass('highlight-green');
            }
            else {
              cellView.$box.addClass('highlight-yellow');
            }
            break;
          case 'ice.Constant':
            cellView.$box.addClass('highlight-orange');
            break;
          case 'ice.Code':
            cellView.$box.addClass('highlight-blue');
            break;
          case 'ice.Generic':
            if (cellView.model.get('config')) {
              cellView.$box.addClass('highlight-yellow');
            }
            else {
              cellView.$box.addClass('highlight-blue');
            }
            break;
          case 'ice.Info':
            cellView.$box.addClass('highlight-gray');
            break;
        }
      }
    }

    function unhighlight(cellView) {
      if (cellView) {
        switch(cellView.model.get('type')) {
          case 'ice.Input':
          case 'ice.Output':
            if (cellView.model.get('data').virtual) {
              cellView.$box.removeClass('highlight-green');
            }
            else {
              cellView.$box.removeClass('highlight-yellow');
            }
            break;
          case 'ice.Constant':
            cellView.$box.removeClass('highlight-orange');
            break;
          case 'ice.Code':
            cellView.$box.removeClass('highlight-blue');
            break;
          case 'ice.Generic':
            if (cellView.model.get('config')) {
              cellView.$box.removeClass('highlight-yellow');
            }
            else {
              cellView.$box.removeClass('highlight-blue');
            }
            break;
          case 'ice.Info':
            cellView.$box.removeClass('highlight-gray');
            break;
        }
      }
    }

    this.hasSelection = function() {
      return selection.length > 0;
    };

    this.removeSelected = function() {
      if (selection) {
        graph.removeCells(selection.models);
        selectionView.cancelSelection();
        updateWiresOnObstacles();
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
      performStep({ x: -stepValue, y: 0 });
    };

    this.stepUp = function() {
      performStep({ x: 0, y: -stepValue });
    };

    this.stepRight = function() {
      performStep({ x: stepValue, y: 0 });
    };

    this.stepDown = function() {
      performStep({ x: 0, y: stepValue });
    };

    var stepCounter = 0;
    var stepTimer = null;
    var stepGroupingInterval = 500;
    var allowStep = true;
    var allosStepInterval = 200;

    function performStep(offset) {
      if (selection && allowStep) {
        allowStep = false;
        // Check consecutive-change interval
        if (Date.now() - stepCounter < stepGroupingInterval) {
          clearTimeout(stepTimer);
        }
        else {
          graph.startBatch('change');
        }
        // Move a step
        step(offset);
        // Launch timer
        stepTimer = setTimeout(function() {
          graph.stopBatch('change');
        }, stepGroupingInterval);
        // Reset counter
        stepCounter = Date.now();
        setTimeout(function() {
          allowStep = true;
        }, allosStepInterval);
      }
    }

    function step(offset) {
      var processedWires = {};
      // Translate blocks
      selection.each(function(cell) {
        cell.translate(offset.x, offset.y);
        selectionView.updateBox(cell);
        // Translate link vertices
        var connectedWires = graph.getConnectedLinks(cell);
        _.each(connectedWires, function(wire) {

          if (processedWires[wire.id]) {
            return;
          }

          var vertices = wire.get('vertices');
          if (vertices && vertices.length) {
            var newVertices = [];
            _.each(vertices, function(vertex) {
              newVertices.push({ x: vertex.x + offset.x, y: vertex.y + offset.y });
            });
            wire.set('vertices', newVertices);
          }

          processedWires[wire.id] = true;
        });
      });
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
          design.graph.wires) {

        var i;
        var self = this;
        var blockInstances = design.graph.blocks;
        var wires = design.graph.wires;

        $('body').addClass('waiting');

        setTimeout(function() {

          self.setState(design.state);

          commandManager.stopListening();

          self.clearAll();

          var cell;

          // Blocks
          for (i in blockInstances) {
            var blockInstance = blockInstances[i];
            if (blockInstance.type.indexOf('basic.') !== -1) {
              cell = blocks.loadBasic(blockInstance, disabled);
            }
            else {
              if (blockInstance.type in common.allDependencies) {
                cell = blocks.loadGeneric(blockInstance, common.allDependencies[blockInstance.type], disabled);
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

          if (!disabled) {
            commandManager.listen();
          }

          if (callback) {
            callback();
          }

          $('body').removeClass('waiting');

        }, 20);

        return true;
      }
    };

    function addCell(cell) {
      cell.attributes.state = state;
      cell.attributes.rules = profile.data.boardRules;
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
