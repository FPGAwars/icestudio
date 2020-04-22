'use strict';

angular.module('icestudio')
    .service('graph', function ($rootScope,
        joint,
        boards,
        blocks,
        profile,
        utils,
        common,
        gettextCatalog,
        nodeDebounce,
        window) {

        var z = { index: 100 };
        var graph = null;
        var paper = null;
        var selection = null;
        var selectionView = null;
        var commandManager = null;
        var mousePosition = { x: 0, y: 0 };
        var gridsize = 8;
        var state = { pan: { x: 0, y: 0 }, zoom: 1.0 };

        var self = this;

        const ZOOM_MAX = 2.1;
        const ZOOM_MIN = 0.3;
        const ZOOM_SENS = 0.3;

        this.breadcrumbs = [{ name: '', type: '' }];
        this.addingDraggableBlock = false;

        this.getState = function () {
            // Clone state
            return utils.clone(state);
        };

        this.setState = function (_state) {
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

        this.resetView = function () {
            this.setState(null);
        };

        this.fitContent = function () {
            if (!this.isEmpty()) {
                // Target box
                var margin = 40;
                var menuFooterHeight = 93;
                var winWidth = window.get().width;
                var winHeight = window.get().height;

                var tbox = {
                    x: margin,
                    y: margin,
                    width: winWidth - 2 * margin,
                    height: winHeight - menuFooterHeight - 2 * margin
                };
                // Source box
                var sbox = V(paper.viewport).bbox(true, paper.svg);
                sbox = {
                    x: sbox.x * state.zoom,
                    y: sbox.y * state.zoom,
                    width: sbox.width * state.zoom,
                    height: sbox.height * state.zoom
                };
                var scale;
                if (tbox.width / sbox.width > tbox.height / sbox.height) {
                    scale = tbox.height / sbox.height;
                }
                else {
                    scale = tbox.width / sbox.width;
                }
                if (state.zoom * scale > 1) {
                    scale = 1 / state.zoom;
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
                $('.joint-paper.joint-theme-default>svg').attr('height', winHeight);
                $('.joint-paper.joint-theme-default>svg').attr('width', winWidth);
            }
            else {
                this.resetView();
            }
        };

        this.resetBreadcrumbs = function (name) {
            this.breadcrumbs = [{ name: name, type: '' }];
            utils.rootScopeSafeApply();
        };

        this.createPaper = function (element) {
            graph = new joint.dia.Graph();

            paper = new joint.dia.Paper({
                el: element,
                width: 3000,
                height: 3000,
                model: graph,
                gridSize: gridsize,
                clickThreshold: 6,
                snapLinks: { radius: 16 },
                linkPinning: false,
                embeddingMode: false,
                //markAvailable: true,
                getState: this.getState,
                defaultLink: new joint.shapes.ice.Wire(),
                // guard: function(evt, view) vg
                //   // FALSE means the event isn't guarded.
                //   return false;
                // },
                validateMagnet: function (cellView, magnet) {
                    // Prevent to start wires from an input port
                    return (magnet.getAttribute('type') === 'output');
                },
                validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                    // Prevent output-output links
                    if (magnetS && magnetS.getAttribute('type') === 'output' &&
                        magnetT && magnetT.getAttribute('type') === 'output') {
                        if (magnetS !== magnetT) {
                            // Show warning if source and target blocks are different
                            warning(gettextCatalog.getString('Invalid connection'));
                        }
                        return false;
                    }
                    // Ensure right -> left connections
                    if (magnetS && magnetS.getAttribute('pos') === 'right') {
                        if (magnetT && magnetT.getAttribute('pos') !== 'left') {
                            warning(gettextCatalog.getString('Invalid connection'));
                            return false;
                        }
                    }
                    // Ensure bottom -> top connections
                    if (magnetS && magnetS.getAttribute('pos') === 'bottom') {
                        if (magnetT && magnetT.getAttribute('pos') !== 'top') {
                            warning(gettextCatalog.getString('Invalid connection'));
                            return false;
                        }
                    }
                    var i;
                    var links = graph.getLinks();
                    for (i in links) {
                        var link = links[i];
                        var linkIView = link.findView(paper);
                        if (linkView === linkIView) {
                            //Skip the wire the user is drawing
                            continue;
                        }
                        // Prevent multiple input links
                        if ((cellViewT.model.id === link.get('target').id) &&
                            (magnetT.getAttribute('port') === link.get('target').port)) {
                            warning(gettextCatalog.getString('Invalid multiple input connections'));
                            return false;
                        }
                        // Prevent to connect a pull-up if other blocks are connected
                        if ((cellViewT.model.get('pullup')) &&
                            (cellViewS.model.id === link.get('source').id)) {
                            warning(gettextCatalog.getString('Invalid <i>Pull up</i> connection:<br>block already connected'));
                            return false;
                        }
                        // Prevent to connect other blocks if a pull-up is connected
                        if ((linkIView.targetView.model.get('pullup')) &&
                            (cellViewS.model.id === link.get('source').id)) {
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
                    setTimeout(function () {
                        paper.options.warningTimer = false;
                    }, 4000);
                }
            }

            var targetElement = element[0];

            this.panAndZoom = svgPanZoom(targetElement.childNodes[2],
                {
                    fit: false,
                    center: false,
                    zoomEnabled: true,
                    panEnabled: false,
                    zoomScaleSensitivity: ZOOM_SENS,
                    dblClickZoomEnabled: false,
                    minZoom: ZOOM_MIN,
                    maxZoom: ZOOM_MAX,
                    eventsListenerElement: targetElement,
                   onZoom: function (scale) {
                        state.zoom = scale;
                        // Close expanded combo
                        if (document.activeElement.className === 'select2-search__field') {
                            $('select').select2('close');
                        }
                        updateCellBoxes();
                    },
                   onPan: function (newPan) {
                        state.pan = newPan;
                        graph.trigger('state', state);
                        updateCellBoxes();
                    }
                });

            function updateCellBoxes() {
                var cells = graph.getCells();
                selectionView.options.state = state;
                
                for (var i = 0, len = cells.length; i < len; i++) {
 
                    if (!cells[i].isLink()) {
                        cells[i].attributes.state = state;
                        var elementView = paper.findViewByModel(cells[i]);
                        // Pan blocks
                        elementView.updateBox();
                        // Pan selection boxes
                        selectionView.updateBox(elementView.model);

                    }
                }
               
            }
            // Events

            var shiftPressed = false;

            $(document).on('keydown', function (evt) {
                if (utils.hasShift(evt)) {
                    shiftPressed = true;
                }
            });



            $(document).on('keyup', function (evt) {
                if (!utils.hasShift(evt)) {
                    shiftPressed = false;
                }
            });

            $(document).on('disableSelected', function () {
                if (!shiftPressed) {
                    disableSelected();
                }
            });

            $('body').mousemove(function (event) {
                mousePosition = {
                    x: event.pageX,
                    y: event.pageY
                };
            });

            selectionView.on('selection-box:pointerdown', function (/*evt*/) {
                // Move selection to top view
                if (hasSelection()) {
                    selection.each(function (cell) {
                        var cellView = paper.findViewByModel(cell);
                        if (!cellView.model.isLink()) {
                            if (cellView.$box.css('z-index') < z.index) {
                                cellView.$box.css('z-index', ++z.index);
                            }
                        }
                    });
                }
            });

            selectionView.on('selection-box:pointerclick', function (evt) {
                if (self.addingDraggableBlock) {
                    // Set new block's position
                    self.addingDraggableBlock = false;
                    processReplaceBlock(selection.at(0));
                    disableSelected();
                    updateWiresOnObstacles();
                    graph.trigger('batch:stop');
                }
                else {
                    // Toggle selected cell
                    if (shiftPressed) {
                        var cell = selection.get($(evt.target).data('model'));
                        selection.reset(selection.without(cell));
                        selectionView.destroySelectionBox(cell);
                    }
                }
            });

            /*paper.on('debug:test',function(args){

                console.log('DEBUG->TEST');
            });*/

            paper.on('cell:pointerclick', function (cellView, evt, x, y) {
                //M+

                if (!checkInsideViewBox(cellView, x, y)) {
                    // Out of the view box
                    return;
                }
                if (shiftPressed) {
                    // If Shift is pressed process the click (no Shift+dblClick allowed)
                    if (paper.options.enabled) {
                        if (!cellView.model.isLink()) {
                            // Disable current focus
                            document.activeElement.blur();
                            if (utils.hasLeftButton(evt)) {
                                // Add cell to selection
                                selection.add(cellView.model);
                                selectionView.createSelectionBox(cellView.model);
                            }
                        }
                    }
                }

            });

            paper.on('cell:pointerdblclick', function (cellView, evt, x, y) {

                if (x && y && !checkInsideViewBox(cellView, x, y)) {
                    // Out of the view box
                    return;
                }
                selectionView.cancelSelection();
                if (!shiftPressed) {

                    // Allow dblClick if Shift is not pressed
                    var type = cellView.model.get('blockType');
                    var blockId = cellView.model.get('id');


                    if (type.indexOf('basic.') !== -1) {
                        // Edit basic blocks
                        if (paper.options.enabled) {
                            blocks.editBasic(type, cellView, addCell);

                        }
                    }
                    else if (common.allDependencies[type]) {
                        if (typeof common.isEditingSubmodule !== 'undefined' &&
                            common.isEditingSubmodule === true) {
                            alertify.warning(gettextCatalog.getString('To enter on "edit mode" of deeper block, you need to finish current "edit mode", lock the keylock to do it.'));
                            return;
                        }

                        // Navigate inside generic blocks
                        z.index = 1;
                        var project = common.allDependencies[type];
                        var breadcrumbsLength = self.breadcrumbs.length;

                        $('body').addClass('waiting');
                        setTimeout(function () {
                            $rootScope.$broadcast('navigateProject', {
                                update: breadcrumbsLength === 1,
                                project: project,
                                submodule: type,
                                submoduleId: blockId
                            });
                            self.breadcrumbs.push({ name: project.package.name || '#', type: type });
                            utils.rootScopeSafeApply();
                        }, 100);
                    }
                }

            });

            function checkInsideViewBox(view, x, y) {
                var $box = $(view.$box[0]);
                var position = $box.position();
                var rbox = g.rect(position.left, position.top, $box.width(), $box.height());
                return rbox.containsPoint({
                    x: x * state.zoom + state.pan.x,
                    y: y * state.zoom + state.pan.y
                });
            }

            paper.on('blank:pointerdown', function (evt, x, y) {
                // Disable current focus
                document.activeElement.blur();

                if (utils.hasLeftButton(evt)) {
                    if (utils.hasCtrl(evt)) {
                        if (!self.isEmpty()) {
                            self.panAndZoom.enablePan();
                        }
                    }
                    else if (paper.options.enabled) {
                        selectionView.startSelecting(evt, x, y);
                    }
                }
                else if (utils.hasRightButton(evt)) {
                    if (!self.isEmpty()) {
                        self.panAndZoom.enablePan();
                    }
                }
            });

            paper.on('blank:pointerup', function (/*cellView, evt*/) {
                self.panAndZoom.disablePan();
            });

            paper.on('cell:mouseover', function (cellView, evt) {
                // Move selection to top view if !mousedown
                if (!utils.hasButtonPressed(evt)) {
                    if (!cellView.model.isLink()) {
                        if (cellView.$box.css('z-index') < z.index) {
                            cellView.$box.css('z-index', ++z.index);
                        }
                    }
                }
            });

            paper.on('cell:pointerup', function (cellView/*, evt*/) {
                graph.trigger('batch:start');
                processReplaceBlock(cellView.model);
                graph.trigger('batch:stop');
                if (paper.options.enabled) {
                    updateWiresOnObstacles();
                }
            });

            paper.on('cell:pointermove', function (cellView/*, evt*/) {
                debounceDisableReplacedBlock(cellView.model);
            });

            selectionView.on('selection-box:pointermove', function (/*evt*/) {
                if (self.addingDraggableBlock && hasSelection()) {
                    debounceDisableReplacedBlock(selection.at(0));
                }
            });

            function processReplaceBlock(upperBlock) {
                debounceDisableReplacedBlock.flush();
                var lowerBlock = findLowerBlock(upperBlock);
                replaceBlock(upperBlock, lowerBlock);
            }

            function findLowerBlock(upperBlock) {
                if (upperBlock.get('type') === 'ice.Wire' ||
                    upperBlock.get('type') === 'ice.Info') {
                    return;
                }
                var blocks = graph.findModelsUnderElement(upperBlock);
                // There is at least one model under the upper block
                if (blocks.length === 0) {
                    return;
                }
                // Get the first model found
                var lowerBlock = blocks[0];
                if (lowerBlock.get('type') === 'ice.Wire' ||
                    lowerBlock.get('type') === 'ice.Info') {
                    return;
                }
                var validReplacements = {
                    'ice.Generic': ['ice.Generic', 'ice.Code', 'ice.Input', 'ice.Output'],
                    'ice.Code': ['ice.Generic', 'ice.Code', 'ice.Input', 'ice.Output'],
                    'ice.Input': ['ice.Generic', 'ice.Code'],
                    'ice.Output': ['ice.Generic', 'ice.Code'],
                    'ice.Constant': ['ice.Constant', 'ice.Memory'],
                    'ice.Memory': ['ice.Constant', 'ice.Memory']
                }[lowerBlock.get('type')];
                // Check if the upper block is a valid replacement
                if (validReplacements.indexOf(upperBlock.get('type')) === -1) {
                    return;
                }
                return lowerBlock;
            }

            function replaceBlock(upperBlock, lowerBlock) {

                if (lowerBlock) {
                    // 1. Compute portsMap between the upperBlock and the lowerBlock
                    var portsMap = computeAllPortsMap(upperBlock, lowerBlock);
                    // 2. Reconnect the wires from the lowerBlock to the upperBlock
                    var wires = graph.getConnectedLinks(lowerBlock);
                    _.each(wires, function (wire) {
                        // Replace wire's source
                        replaceWireConnection(wire, 'source');
                        // Replace wire's target
                        replaceWireConnection(wire, 'target');
                    });
                    // 3. Move the upperModel to be centered with the lowerModel
                    var lowerBlockSize = lowerBlock.get('size');
                    var upperBlockSize = upperBlock.get('size');
                    var lowerBlockType = lowerBlock.get('type');
                    var lowerBlockPosition = lowerBlock.get('position');
                    if (lowerBlockType === 'ice.Constant' || lowerBlockType === 'ice.Memory') {
                        // Center x, Bottom y
                        upperBlock.set('position', {
                            x: lowerBlockPosition.x + (lowerBlockSize.width - upperBlockSize.width) / 2,
                            y: lowerBlockPosition.y + lowerBlockSize.height - upperBlockSize.height
                        });
                    }
                    else if (lowerBlockType === 'ice.Input') {
                        // Right x, Center y
                        upperBlock.set('position', {
                            x: lowerBlockPosition.x + lowerBlockSize.width - upperBlockSize.width,
                            y: lowerBlockPosition.y + (lowerBlockSize.height - upperBlockSize.height) / 2
                        });
                    }
                    else if (lowerBlockType === 'ice.Output') {
                        // Left x, Center y
                        upperBlock.set('position', {
                            x: lowerBlockPosition.x,
                            y: lowerBlockPosition.y + (lowerBlockSize.height - upperBlockSize.height) / 2
                        });
                    }
                    else {
                        // Center x, Center y
                        upperBlock.set('position', {
                            x: lowerBlockPosition.x + (lowerBlockSize.width - upperBlockSize.width) / 2,
                            y: lowerBlockPosition.y + (lowerBlockSize.height - upperBlockSize.height) / 2
                        });
                    }
                    // 4. Remove the lowerModel
                    lowerBlock.remove();
                    prevLowerBlock = null;
                }

                function replaceWireConnection(wire, connectorType) {
                    var connector = wire.get(connectorType);
                    if (connector.id === lowerBlock.get('id') && portsMap[connector.port]) {
                        wire.set(connectorType, {
                            id: upperBlock.get('id'),
                            port: portsMap[connector.port]
                        });
                    }
                }
            }

            function computeAllPortsMap(upperBlock, lowerBlock) {
                var portsMap = {};
                // Compute the ports for each side: left, right and top.
                // If there are ports with the same name they are ordered
                // by position, from 0 to n.
                //
                //                   Top ports 0 ·· n
                //                   _____|__|__|_____
                //  Left ports 0  --|                 |--  0 Right ports
                //             ·  --|      BLOCK      |--  ·
                //             ·  --|                 |--  ·
                //             n    |_________________|    n
                //                        |  |  |
                //                   Bottom port 0 -- n

                _.merge(portsMap, computePortsMap(upperBlock, lowerBlock, 'leftPorts'));
                _.merge(portsMap, computePortsMap(upperBlock, lowerBlock, 'rightPorts'));
                _.merge(portsMap, computePortsMap(upperBlock, lowerBlock, 'topPorts'));
                _.merge(portsMap, computePortsMap(upperBlock, lowerBlock, 'bottomPorts'));

                return portsMap;
            }

            function computePortsMap(upperBlock, lowerBlock, portType) {
                var portsMap = {};
                var usedUpperPorts = [];
                var upperPorts = upperBlock.get(portType);
                var lowerPorts = lowerBlock.get(portType);

                _.each(lowerPorts, function (lowerPort) {
                    var matchedPorts = _.filter(upperPorts, function (upperPort) {
                        return lowerPort.name === upperPort.name &&
                            lowerPort.size === upperPort.size &&
                            !_.includes(usedUpperPorts, upperPort);
                    });
                    if (matchedPorts && matchedPorts.length > 0) {
                        portsMap[lowerPort.id] = matchedPorts[0].id;
                        usedUpperPorts = usedUpperPorts.concat(matchedPorts[0]);
                    }
                });

                if (_.isEmpty(portsMap)) {
                    // If there is no match replace the connections if the
                    // port's size matches ignoring the port's name.
                    var n = Math.min(upperPorts.length, lowerPorts.length);
                    for (var i = 0; i < n; i++) {
                        if (lowerPorts[i].size === upperPorts[i].size) {
                            portsMap[lowerPorts[i].id] = upperPorts[i].id;
                        }
                    }
                }

                return portsMap;
            }

            var prevLowerBlock = null;

            function disableReplacedBlock(lowerBlock) {
                if (prevLowerBlock) {
                    // Unhighlight previous lower block
                    var prevLowerBlockView = paper.findViewByModel(prevLowerBlock);
                    prevLowerBlockView.$box.removeClass('block-disabled');
                    prevLowerBlockView.$el.removeClass('block-disabled');
                }
                if (lowerBlock) {
                    // Highlight new lower block
                    var lowerBlockView = paper.findViewByModel(lowerBlock);
                    lowerBlockView.$box.addClass('block-disabled');
                    lowerBlockView.$el.addClass('block-disabled');
                }
                prevLowerBlock = lowerBlock;
            }

            // Debounce `pointermove` handler to improve the performance
            var debounceDisableReplacedBlock = nodeDebounce(function (upperBlock) {
                var lowerBlock = findLowerBlock(upperBlock);
                disableReplacedBlock(lowerBlock);
            }, 100);

            graph.on('add change:source change:target', function (cell) {
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

            graph.on('remove', function (cell) {
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
                    var i, port;
                    var block = graph.getCell(target.id);
                    if (block) {
                        var data = block.get('data');
                        if (data && data.ports && data.ports.in) {
                            for (i in data.ports.in) {
                                port = data.ports.in[i];
                                if (port.name === target.port && port.default) {
                                    port.default.apply = value;
                                    break;
                                }
                            }
                            paper.findViewByModel(block.id).updateBox();
                        }
                    }
                }
            }
            // Initialize state
            graph.trigger('state', state);

        };
    
        function updateWiresOnObstacles() {
            var cells = graph.getCells();

            //_.each(cells, function (cell) {
            for(var i=0, n=cells.length;i<n;i++){
                if (cells[i].isLink()) {
                    paper.findViewByModel(cells[i]).update();
                }
            }
        }

        this.setBoardRules = function (rules) {
            var cells = graph.getCells();
            profile.set('boardRules', rules);

            for(var i=0, n=cells.length;i<n;i++){
                if (!cells[i].isLink()) {
                    cells[i].attributes.rules = rules;
                    var cellView = paper.findViewByModel(cells[i]);
                    cellView.updateBox();
                }
            }
        };

        this.undo = function () {
            if (!this.addingDraggableBlock) {
                disableSelected();
                commandManager.undo();
                updateWiresOnObstacles();
            }
        };

        this.redo = function () {
            if (!this.addingDraggableBlock) {
                disableSelected();
                commandManager.redo();
                updateWiresOnObstacles();
            }
        };

        this.clearAll = function () {
            graph.clear();
            this.appEnable(true);
            selectionView.cancelSelection();
        };

        this.appEnable = function (value) {
            paper.options.enabled = value;
            var ael, i;
            if (value) {


                /* In the new javascript context of nwjs, angular can't change classes over the dom in this way,
                for this we need to update directly , but for the moment we maintain angular too to maintain model synced */

                angular.element('#menu').removeClass('is-disabled');
                angular.element('.paper').removeClass('looks-disabled');
                angular.element('.board-container').removeClass('looks-disabled');
                angular.element('.banner').addClass('hidden');

                ael = document.getElementById('menu');
                if (typeof ael !== 'undefined') {
                    ael.classList.remove('is-disabled');
                }
                ael = document.getElementsByClassName('paper');
                if (typeof ael !== 'undefined' && ael.length > 0) {
                    for (i = 0; i < ael.length; i++) {
                        ael[i].classList.remove('looks-disabled');
                    }
                }

                ael = document.getElementsByClassName('board-container');
                if (typeof ael !== 'undefined' && ael.length > 0) {
                    for (i = 0; i < ael.length; i++) {
                        ael[i].classList.remove('looks-disabled');
                    }
                }

                ael = document.getElementsByClassName('banner');

                if (typeof ael !== 'undefined' && ael.length > 0) {
                    for (i = 0; i < ael.length; i++) {
                        ael[i].classList.add('hidden');
                    }
                }
                if (!common.isEditingSubmodule) {
                    angular.element('.banner-submodule').addClass('hidden');
                    ael = document.getElementsByClassName('banner-submodule');
                    if (typeof ael !== 'undefined' && ael.length > 0) {
                        for (i = 0; i < ael.length; i++) {
                            ael[i].classList.add('hidden');
                        }
                    }
                }

            }
            else {


                angular.element('#menu').addClass('is-disabled');
                angular.element('.paper').addClass('looks-disabled');
                angular.element('.board-container').addClass('looks-disabled');
                angular.element('.banner').removeClass('hidden');
                angular.element('.banner-submodule').removeClass('hidden');

                ael = document.getElementById('menu');

                if (typeof ael !== 'undefined') {
                    ael.classList.add('is-disabled');
                }

                ael = document.getElementsByClassName('paper');

                if (typeof ael !== 'undefined' && ael.length > 0) {
                    for (i = 0; i < ael.length; i++) {
                        ael[i].classList.add('looks-disabled');
                    }
                }

                ael = document.getElementsByClassName('board-container');

                if (typeof ael !== 'undefined' && ael.length > 0) {
                    for (i = 0; i < ael.length; i++) {
                        ael[i].classList.add('looks-disabled');
                    }
                }
                ael = document.getElementsByClassName('banner');

                if (typeof ael !== 'undefined' && ael.length > 0) {
                    for (i = 0; i < ael.length; i++) {
                        ael[i].classList.remove('hidden');
                    }
                }
                ael = document.getElementsByClassName('banner-submodule');

                if (typeof ael !== 'undefined' && ael.length > 0) {
                    for (i = 0; i < ael.length; i++) {
                        ael[i].classList.remove('hidden');
                    }
                }
            }

            var cells = graph.getCells();
            _.each(cells, function (cell) {
                var cellView = paper.findViewByModel(cell.id);
                cellView.options.interactive = value;
                if (cell.get('type') !== 'ice.Generic') {
                    if (value) {
                        cellView.$el.removeClass('disable-graph');
                    }
                    else {
                        cellView.$el.addClass('disable-graph');
                    }
                }
                else if (cell.get('type') !== 'ice.Wire') {
                    if (value) {
                        cellView.$el.find('.port-body').removeClass('disable-graph');
                    }
                    else {
                        cellView.$el.find('.port-body').addClass('disable-graph');
                    }
                }
            });
        };

        this.createBlock = function (type, block) {
            blocks.newGeneric(type, block, function (cell) {
                self.addDraggableCell(cell);
            });
        };

        this.createBasicBlock = function (type) {
            blocks.newBasic(type, function (cells) {
                self.addDraggableCells(cells);
            });
        };

        this.addDraggableCell = function (cell) {
            this.addingDraggableBlock = true;
            var menuHeight = $('#menu').height();
            cell.set('position', {
                x: Math.round(((mousePosition.x - state.pan.x) / state.zoom - cell.get('size').width / 2) / gridsize) * gridsize,
                y: Math.round(((mousePosition.y - state.pan.y - menuHeight) / state.zoom - cell.get('size').height / 2) / gridsize) * gridsize,
            });
            graph.trigger('batch:start');
            addCell(cell);
            disableSelected();
            var opt = { transparent: true, initooltip: false };
            selection.add(cell);
            selectionView.createSelectionBox(cell, opt);
            selectionView.startAddingSelection({ clientX: mousePosition.x, clientY: mousePosition.y });
        };

        this.addDraggableCells = function (cells) {
            this.addingDraggableBlock = true;
            var menuHeight = $('#menu').height();
            if (cells.length > 0) {
                var firstCell = cells[0];
                var offset = {
                    x: Math.round(((mousePosition.x - state.pan.x) / state.zoom - firstCell.get('size').width / 2) / gridsize) * gridsize - firstCell.get('position').x,
                    y: Math.round(((mousePosition.y - state.pan.y - menuHeight) / state.zoom - firstCell.get('size').height / 2) / gridsize) * gridsize - firstCell.get('position').y,
                };
                _.each(cells, function (cell) {
                    var position = cell.get('position');
                    cell.set('position', {
                        x: position.x + offset.x,
                        y: position.y + offset.y
                    });
                });
                graph.trigger('batch:start');
                addCells(cells);
                disableSelected();
                var opt = { transparent: true };
                _.each(cells, function (cell) {
                    selection.add(cell);
                    selectionView.createSelectionBox(cell, opt);
                });
                selectionView.startAddingSelection({ clientX: mousePosition.x, clientY: mousePosition.y });
            }
        };

        this.toJSON = function () {
            return graph.toJSON();
        };

        this.getCells = function () {
            return graph.getCells();
        };

        this.setCells = function (cells) {
            graph.attributes.cells.models = cells;
        };

        this.selectBoard = function (board, reset) {
            graph.startBatch('change');
            // Trigger board event
            var data = {
                previous: common.selectedBoard,
                next: board
            };
            graph.trigger('board', { data: data });
            var newBoard = boards.selectBoard(board.name);
            if (reset) {
                resetBlocks();
            }
            graph.stopBatch('change');
            return newBoard;
        };
        this.setBlockInfo = function (values, newValues, blockId) {

            if (typeof common.allDependencies === 'undefined') {
                return false;
            }

            graph.startBatch('change');
            // Trigger info event
            var data = {
                previous: values,
                next: newValues
            };
            graph.trigger('info', { data: data });

            common.allDependencies[blockId].package.name = newValues[0];
            common.allDependencies[blockId].package.version = newValues[1];
            common.allDependencies[blockId].package.description = newValues[2];
            common.allDependencies[blockId].package.author = newValues[3];
            common.allDependencies[blockId].package.image = newValues[4];


            graph.stopBatch('change');
        };


        this.setInfo = function (values, newValues, project) {
            graph.startBatch('change');
            // Trigger info event
            var data = {
                previous: values,
                next: newValues
            };
            graph.trigger('info', { data: data });
            project.set('package', {
                name: newValues[0],
                version: newValues[1],
                description: newValues[2],
                author: newValues[3],
                image: newValues[4]
            });
            graph.stopBatch('change');
        };

        this.selectLanguage = function (language) {
            graph.startBatch('change');
            // Trigger lang event
            var data = {
                previous: profile.get('language'),
                next: language
            };
            graph.trigger('lang', { data: data });
            language = utils.setLocale(language);
            graph.stopBatch('change');
            return language;
        };

        function resetBlocks() {
            var data, connectedLinks;
            var cells = graph.getCells();
            _.each(cells, function (cell) {
                if (cell.isLink()) {
                    return;
                }
                var type = cell.get('blockType');
                if (type === 'basic.input' || type === 'basic.output') {
                    // Reset choices in all Input / blocks
                    var view = paper.findViewByModel(cell.id);
                    cell.set('choices', (type === 'basic.input') ? common.pinoutInputHTML : common.pinoutOutputHTML);
                    view.clearValues();
                    view.applyChoices();
                }
                else if (type === 'basic.code') {
                    // Reset rules in Code block ports
                    data = utils.clone(cell.get('data'));
                    connectedLinks = graph.getConnectedLinks(cell);
                    if (data && data.ports && data.ports.in) {
                        _.each(data.ports.in, function (port) {
                            var connected = false;
                            _.each(connectedLinks, function (connectedLink) {
                                if (connectedLink.get('target').port === port.name) {
                                    connected = true;
                                    return false;
                                }
                            });
                            port.default = utils.hasInputRule(port.name, !connected);
                            cell.set('data', data);
                            paper.findViewByModel(cell.id).updateBox();
                        });
                    }
                }
                else if (type.indexOf('basic.') === -1) {
                    // Reset rules in Generic block ports
                    var block = common.allDependencies[type];
                    data = { ports: { in: [] } };
                    connectedLinks = graph.getConnectedLinks(cell);
                    if (block.design.graph.blocks) {
                        _.each(block.design.graph.blocks, function (item) {
                            if (item.type === 'basic.input' && !item.data.range) {
                                var connected = false;
                                _.each(connectedLinks, function (connectedLink) {
                                    if (connectedLink.get('target').port === item.id) {
                                        connected = true;
                                        return false;
                                    }
                                });
                                data.ports.in.push({
                                    name: item.id,
                                    default: utils.hasInputRule((item.data.clock ? 'clk' : '') || item.data.name, !connected)
                                });
                            }
                            cell.set('data', data);
                            paper.findViewByModel(cell.id).updateBox();
                        });
                    }
                }
            });
        }

        this.resetCommandStack = function () {
            commandManager.reset();
        };

        this.cutSelected = function () {
            if (hasSelection()) {
                utils.copyToClipboard(selection, graph);
                this.removeSelected();
            }
        };

        this.copySelected = function () {
            if (hasSelection()) {
                utils.copyToClipboard(selection, graph);
            }
        };

        this.pasteSelected = function () {
            if (document.activeElement.tagName === 'A' ||
                document.activeElement.tagName === 'BODY') {
                utils.pasteFromClipboard(function (object) {
                    if (object.version === common.VERSION) {
                        self.appendDesign(object.design, object.dependencies);
                    }
                });
            }
        };
        this.pasteAndCloneSelected = function () {
            if (document.activeElement.tagName === 'A' ||
                document.activeElement.tagName === 'BODY') {
                utils.pasteFromClipboard(function (object) {
                    if (object.version === common.VERSION) {

                        var hash = {};
                        // We will clone all dependencies
                        if (typeof object.dependencies !== false &&
                            object.dependencies !== false &&
                            object.dependencies !== null) {

                            var dependencies = utils.clone(object.dependencies);
                            object.dependencies = {};
                            var hId = false;

                            for (var dep in dependencies) {
                                dependencies[dep].package.name = dependencies[dep].package.name + ' CLONE';
                                var dat = new Date();
                                var seq = dat.getTime();
                                var oldversion = dependencies[dep].package.version.replace(/(.*)(-c\d*)/, '$1');
                                dependencies[dep].package.version = oldversion + '-c' + seq;

                                hId = utils.dependencyID(dependencies[dep]);
                                object.dependencies[hId] = dependencies[dep];
                                hash[dep] = hId;
                            }

                            //reassign dependencies

                            object.design.graph.blocks = object.design.graph.blocks.map(function (e) {
                                if (typeof e.type !== 'undefined' &&
                                    typeof hash[e.type] !== 'undefined') {
                                    e.type = hash[e.type];
                                }
                                return e;
                            });
                        }
                        self.appendDesign(object.design, object.dependencies);
                    }
                });
            }
        };


        this.selectAll = function () {
            disableSelected();
            var cells = graph.getCells();
            _.each(cells, function (cell) {
                if (!cell.isLink()) {
                    selection.add(cell);
                    selectionView.createSelectionBox(cell);
                }
            });
        };

        function hasSelection() {
            return selection && selection.length > 0;
        }

        this.removeSelected = function () {
            if (hasSelection()) {
                graph.removeCells(selection.models);
                selectionView.cancelSelection();
                updateWiresOnObstacles();
            }
        };

        function disableSelected() {
            if (hasSelection()) {
                selectionView.cancelSelection();
            }
        }

        var stepValue = 8;

        this.stepLeft = function () {
            performStep({ x: -stepValue, y: 0 });
        };

        this.stepUp = function () {
            performStep({ x: 0, y: -stepValue });
        };

        this.stepRight = function () {
            performStep({ x: stepValue, y: 0 });
        };

        this.stepDown = function () {
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
                stepTimer = setTimeout(function () {
                    graph.stopBatch('change');
                }, stepGroupingInterval);
                // Reset counter
                stepCounter = Date.now();
                setTimeout(function () {
                    allowStep = true;
                }, allosStepInterval);
            }
        }

        function step(offset) {
            var processedWires = {};
            // Translate blocks
            selection.each(function (cell) {
                cell.translate(offset.x, offset.y);
                selectionView.updateBox(cell);
                // Translate link vertices
                var connectedWires = graph.getConnectedLinks(cell);
                _.each(connectedWires, function (wire) {

                    if (processedWires[wire.id]) {
                        return;
                    }

                    var vertices = wire.get('vertices');
                    if (vertices && vertices.length) {
                        var newVertices = [];
                        _.each(vertices, function (vertex) {
                            newVertices.push({ x: vertex.x + offset.x, y: vertex.y + offset.y });
                        });
                        wire.set('vertices', newVertices);
                    }

                    processedWires[wire.id] = true;
                });
            });
        }

        this.isEmpty = function () {
            return (graph.getCells().length === 0);
        };

        this.isEnabled = function () {
            return paper.options.enabled;
        };

        this.loadDesign = function (design, opt, callback) {
            if (design &&
                design.graph &&
                design.graph.blocks &&
                design.graph.wires) {

                opt = opt || {};

                $('body').addClass('waiting');
                setTimeout(function () {

                    commandManager.stopListening();

                    self.clearAll();

                    var cells = graphToCells(design.graph, opt);


                    graph.addCells(cells);

                    self.setState(design.state);

                    self.appEnable(!opt.disabled);

                    if (!opt.disabled) {
                        commandManager.listen();
                    }

                    if (callback) {
                        callback();
                    }

                    $('body').removeClass('waiting');

                }, 100);

                return true;
            }
        };

        function graphToCells(_graph, opt) {
            // Options:
            // - new: assign a new id to all the cells
            // - reset: clear I/O blocks values
            // - disabled: set disabled flag to the blocks
            // - offset: apply an offset to all the cells
            // - originalPinout: if reset is true (conversion), this variable
            //   contains the pinout for the previous board.

            var cell;
            var cells = [];
            var blocksMap = {};
            opt = opt || {};
            // Blocks
            var isMigrated = false;


            function getBlocksFromLib(id) {
                for (var dep in common.allDependencies) {
                    if (id === dep) {
                        return common.allDependencies[dep].design.graph.blocks;
                    }
                }
                return false;
            }
            function outputExists(oid, blks) {
                var founded = false;
                for (var i = 0; i < blks.length; i++) {
                    if (blks[i].id === oid) {
                        return true;
                    }
                }
                return founded;
            }
            /* Check if wire source exists (block+port) */
            function wireExists(wre, blk, edge) {

                var founded = false;
                var blk2 = false;

                for (var i = 0; i < blk.length; i++) {
                    if (wre[edge].block === blk[i].id) {
                        founded = i;
                        break;
                    }
                }
                if (founded !== false) {
                    switch (blk[founded].type) {
                        case 'basic.memory':
                        case 'basic.constant':
                        case 'basic.outputLabel': case 'basic.inputLabel':
                        case 'basic.code':
                        case 'basic.input': case 'basic.output':
                            founded = true;
                            break;

                        default:
                            /* Generic type, look into the library */
                            blk2 = getBlocksFromLib(blk[i].type);
                            founded = outputExists(wre[edge].port, blk2);
                    }
                }
                return founded;
            }

            // Wires
            var test = false;
            var todelete = [];

            for (var i = 0; i < _graph.wires.length; i++) {
                test = wireExists(_graph.wires[i], _graph.blocks, 'source');
                if (test) {

                    test = wireExists(_graph.wires[i], _graph.blocks, 'target');
                    if (test === true) {
                    } else {
                        todelete.push(i);
                    }
                } else {

                    todelete.push(i);
                }
            }
            var tempw = [];
            for (var z = 0; z < _graph.wires.length; z++) {

                if (todelete.indexOf(z) === -1) {
                    tempw.push(_graph.wires[z]);
                }
            }
            _graph.wires = utils.clone(tempw);



            _.each(_graph.blocks, function (blockInstance) {


                if (blockInstance.type !== false && blockInstance.type.indexOf('basic.') !== -1) {
                    if (opt.reset &&
                        (blockInstance.type === 'basic.input' ||
                            blockInstance.type === 'basic.output')) {
                        var pins = blockInstance.data.pins;

                        // - if conversion from one board to other is in progress,
                        //   now is based on pin names, an improvement could be
                        //   through hash tables with assigned pins previously
                        //   selected by icestudio developers
                        var replaced = false;
                        for (var i in pins) {
                            replaced = false;
                            if (typeof opt.designPinout !== 'undefined') {
                                for (var opin = 0; opin < opt.designPinout.length; opin++) {
                                    if (String(opt.designPinout[opin].name) === String(pins[i].name)) {

                                        replaced = true;
                                    }else{
                                        let prefix= String(pins[i].name).replace(/[0-9]/g, '');
                                        if(String(opt.designPinout[opin].name) === prefix){

                                            replaced=true;
                                        }


                                    }

                                    if(replaced===true){
                                        pins[i].name = opt.designPinout[opin].name;
                                        pins[i].value = opt.designPinout[opin].value;
                                        opin = opt.designPinout.length;
                                        replaced = true;
                                        isMigrated = true;
                                    }
                                }
                            }
                            if (replaced === false) {
                                pins[i].name = '';
                                pins[i].value = '0';
                            }
                        }

                    }
                    cell = blocks.loadBasic(blockInstance, opt.disabled);
                }
                else {
                    if (blockInstance.type in common.allDependencies) {
                        cell = blocks.loadGeneric(blockInstance, common.allDependencies[blockInstance.type], opt.disabled);
                    }
                }

                blocksMap[cell.id] = cell;
                if (opt.new) {
                    var oldId = cell.id;
                    cell = cell.clone();
                    blocksMap[oldId] = cell;
                }
                if (opt.offset) {
                    cell.translate(opt.offset.x, opt.offset.y);
                }
                updateCellAttributes(cell);
                cells.push(cell);


            });

            if (isMigrated) {
                alertify.warning(gettextCatalog.getString('If you have blank IN/OUT pins, it\'s because there is no equivalent in this board'));
            }


            _.each(_graph.wires, function (wireInstance) {
                var source = blocksMap[wireInstance.source.block];
                var target = blocksMap[wireInstance.target.block];
                if (opt.offset) {
                    var newVertices = [];
                    var vertices = wireInstance.vertices;
                    if (vertices && vertices.length) {
                        _.each(vertices, function (vertex) {
                            newVertices.push({
                                x: vertex.x + opt.offset.x,
                                y: vertex.y + opt.offset.y
                            });
                        });
                    }
                    wireInstance.vertices = newVertices;
                }
                cell = blocks.loadWire(wireInstance, source, target);
                if (opt.new) {
                    cell = cell.clone();
                }
                updateCellAttributes(cell);
                cells.push(cell);
            });

            return cells;
        }

        this.appendDesign = function (design, dependencies) {
            if (design &&
                dependencies &&
                design.graph &&
                design.graph.blocks &&
                design.graph.wires) {

                selectionView.cancelSelection();
                // Merge dependencies
                for (var type in dependencies) {
                    if (!(type in common.allDependencies)) {
                        common.allDependencies[type] = dependencies[type];
                    }
                }

                // Append graph cells: blocks and wires
                // - assign new UUIDs to the cells
                // - add the graph in the mouse position
                var origin = graphOrigin(design.graph);
                var menuHeight = $('#menu').height();
                var opt = {
                    new: true,
                    disabled: false,
                    reset: design.board !== common.selectedBoard.name,
                    offset: {
                        x: Math.round(((mousePosition.x - state.pan.x) / state.zoom - origin.x) / gridsize) * gridsize,
                        y: Math.round(((mousePosition.y - state.pan.y - menuHeight) / state.zoom - origin.y) / gridsize) * gridsize,
                    }
                };
                var cells = graphToCells(design.graph, opt);
                graph.addCells(cells);

                // Select pasted elements
                _.each(cells, function (cell) {
                    if (!cell.isLink()) {
                        var cellView = paper.findViewByModel(cell);
                        if (cellView.$box.css('z-index') < z.index) {
                            cellView.$box.css('z-index', ++z.index);
                        }
                        selection.add(cell);
                        selectionView.createSelectionBox(cell);
                    }
                });
            }
        };

        function graphOrigin(graph) {
            var origin = { x: Infinity, y: Infinity };
            _.each(graph.blocks, function (block) {
                var position = block.position;
                if (position.x < origin.x) {
                    origin.x = position.x;
                }
                if (position.y < origin.y) {
                    origin.y = position.y;
                }
            });
            return origin;
        }

        function updateCellAttributes(cell) {
            cell.attributes.state = state;
            cell.attributes.rules = profile.get('boardRules');
            //cell.attributes.zindex = z.index;
        }

        function addCell(cell) {
            if (cell) {
                updateCellAttributes(cell);
                graph.addCell(cell);
                if (!cell.isLink()) {
                    var cellView = paper.findViewByModel(cell);
                    if (cellView.$box.css('z-index') < z.index) {
                        cellView.$box.css('z-index', ++z.index);
                    }
                }
            }
        }

        function addCells(cells) {
            _.each(cells, function (cell) {
                updateCellAttributes(cell);
            });
            graph.addCells(cells);
            _.each(cells, function (cell) {
                if (!cell.isLink()) {
                    var cellView = paper.findViewByModel(cell);
                    if (cellView.$box.css('z-index') < z.index) {
                        cellView.$box.css('z-index', ++z.index);
                    }
                }
            });
        }

        this.resetCodeErrors = function () {
            var cells = graph.getCells();
            return new Promise(function (resolve) {
                _.each(cells, function (cell) {
                    var cellView;
                    if (cell.get('type') === 'ice.Code') {
                        cellView = paper.findViewByModel(cell);
                        cellView.$box.find('.code-content').removeClass('highlight-error');
                        $('.sticker-error', cellView.$box).remove();
                        cellView.clearAnnotations();
                    }
                    else if (cell.get('type') === 'ice.Generic') {
                        cellView = paper.findViewByModel(cell);

                        $('.sticker-error', cellView.$box).remove();
                        cellView.$box.remove('.sticker-error').removeClass('highlight-error');

                    }
                    else if (cell.get('type') === 'ice.Constant') {
                        cellView = paper.findViewByModel(cell);

                        $('.sticker-error', cellView.$box).remove();
                        cellView.$box.remove('.sticker-error').removeClass('highlight-error');

                    }
                });
                resolve();
            });
        };

        $(document).on('codeError', function (evt, codeError) {
            var cells = graph.getCells();
            _.each(cells, function (cell) {
                var blockId, cellView;
                if ((codeError.blockType === 'code' && cell.get('type') === 'ice.Code') ||
                    (codeError.blockType === 'constant' && cell.get('type') === 'ice.Constant')) {
                    blockId = utils.digestId(cell.id);
                }
                else if (codeError.blockType === 'generic' && cell.get('type') === 'ice.Generic') {
                    blockId = utils.digestId(cell.attributes.blockType);
                }
                if (codeError.blockId === blockId) {
                    cellView = paper.findViewByModel(cell);
                    if (codeError.type === 'error') {
                        if (cell.get('type') === 'ice.Code') {

                            $('.sticker-error', cellView.$box).remove();
                            cellView.$box.find('.code-content').addClass('highlight-error').append('<div class="sticker-error error-code-editor"></div>');

                        }
                        else {

                            $('.sticker-error', cellView.$box).remove();
                            cellView.$box.addClass('highlight-error').append('<div class="sticker-error"></div>');

                        }
                    }
                    if (cell.get('type') === 'ice.Code') {
                        cellView.setAnnotation(codeError);
                    }
                }
            });
        });

    });
