//----------------------------------------------------------------------------
//-- GRAPH: Circuit drawing
//----------------------------------------------------------------------------

'use strict';

angular.module('icestudio')
    .service('graph',
        function (
            $rootScope,

            //-- Access to the JointJS API
            //-- More infor: https://www.npmjs.com/package/jointjs
            //-- Tutorial: https://resources.jointjs.com/tutorial/
            joint,
            blocks,
            boards,
            blockforms,
            profile,
            utils,
            common,
            gettextCatalog,
            nodeDebounce,

            //-- NWjs: Main window object
            //-- More info: https://docs.nwjs.io/en/latest/References/Window/
            window
        ) {

            /*-- This is a temporal trick to maintain wires ordered and avoid anoing wire rumble when navigate
                 between modules, we fix with the new engine , meanwhile this works --*/
            let _this=this;
            $('body').on('Graph::updateWires',function(){
                   setTimeout(function(){ _this.updateWires();
                   },200);
            }); 
        
            //-- ZOOM constants
            const ZOOM_MAX = 2.1;
            const ZOOM_MIN = 0.3;
            const ZOOM_SENS = 0.3;
            const ZOOM_INI = 1.0;  //-- Initial zoom

            //-----------------------------------------------------------------------
            //-- Circuit constants
            //-----------------------------------------------------------------------

            //-- Default Margin between the circuit and the window edges
            //-- top,botton, left and right 
            const CIRCUIT_MARGIN = 33;

            //-- Height of the bottom menu
            const MENU_FOOTER_HEIGHT = 93;

            //-- View State object: structure and initial values
            const VIEWSTATE_INIT = {
                pan: {   //-- Position
                    x: 0,
                    y: 0
                },
                zoom: ZOOM_INI
            };

            //-- Current view state: Position and Zoom
            //-- It is initialized from VIEWSTATE_INIT
            let state = utils.clone(VIEWSTATE_INIT);

            //-- Diagram data structure. All the graphics start here
            //-- It is created by the joint.dia.Graph constructor
            //-- Documentation: https://resources.jointjs.com/mmap/joint.html
            //-- It contains cells: Elements + links
            let graph = null;

            //-- Paper data structure
            //-- The diagrams are place on a Paper
            //-- It is created by the joint.dia.Paper constructor
            let paper = null;

            let z = { index: 100 };
            let selection = null;
            let selectionView = null;
            let commandManager = null;
            let mousePosition = { x: 0, y: 0 };
            let gridsize = 8;


            let self = this;

            this.breadcrumbs = [{ name: '', type: '' }];
            this.addingDraggableBlock = false;

            //-----------------------------------------------------------------------
            //-- Returns a deep copy of the View state
            //-----------------------------------------------------------------------
            this.getState = function () {
                // Deep copy
                return utils.clone(state);
            };

            //-----------------------------------------------------------------------
            //-- Set the current view state
            //-- Input: 
            //--    _state: new view state
            //--
            //-- It set the pan and zoom on the current circuit 
            //-----------------------------------------------------------------------
            this.setState = function (_state) {

                //-- No argument given: Use the initial value
                if (!_state) {
                    _state = utils.clone(VIEWSTATE_INIT);
                }

                //-- Set the new pan and zoom
                this.panAndZoom.zoom(_state.zoom);
                this.panAndZoom.pan(_state.pan);
            };

            //-----------------------------------------------------------------------
            //-- Reset the current view (Pan and zoom)
            //-----------------------------------------------------------------------
            this.resetView = function () {
                this.setState(null);
            };

            //-----------------------------------------------------------------------
            //-- Check if there are any cell on the circuit
            //-- Returs:
            //--   * true: The design contains no elements
            //--   * false: The design contains al least one element
            //-----------------------------------------------------------------------
            this.isEmpty = function () {

                //-- API: joint.dia.Graph.getCells()
                //-- Get all the elements and links in the graph

                //-- If there are no cell, return true
                return (graph.getCells().length === 0);
            };


            //-----------------------------------------------------------------------
            //-- fit the paper to the new Window size
            //-----------------------------------------------------------------------
            this.fitPaper = function () {

                //-- Get the window
                let win = window.get();

                //-- Set the paper height and width attributes
                $('.joint-paper.joint-theme-default>svg').attr('height', win.height);
                $('.joint-paper.joint-theme-default>svg').attr('width', win.width);
            };

            //-----------------------------------------------------------------------
            //-- Fit the Circuit to the Windows, so that the whole design is
            //-- displayed
            //-----------------------------------------------------------------------
            this.fitContent = function () {

                //-- The circuit contains at least one element
                if (!this.isEmpty()) {

                    //-- Get the current window from NW
                    let win = window.get();

                    //-- DEBUG

                    // Target box: The circuit is fit inside this target box
                    let tbox = {
                        x: CIRCUIT_MARGIN,
                        y: CIRCUIT_MARGIN,
                        width: win.width - 2 * CIRCUIT_MARGIN,
                        height: win.height - MENU_FOOTER_HEIGHT - 2 * CIRCUIT_MARGIN
                    };

                    // Source box
                    let sbox = V(paper.viewport).bbox(true, paper.svg);
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
                    const target = {
                        x: tbox.x + tbox.width / 2,
                        y: tbox.y + tbox.height / 2
                    };
                    const source = {
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
                    this.fitPaper();
                }

                //-- The circuit is blank: No elements
                else {
                    //-- Reset the current view
                    //-- Nothing to fit
                    this.resetView();
                }
            };



            //-----------------------------------------------------------------------


            //---------------------------------------------------------------------
            //-- Create the paper, where the circuits will be drawn
            //--
            //--  INPUTS:
            //--   * element: HTML element from the DOM where to place the paper
            //---------------------------------------------------------------------
            this.createPaper = function (element) {
                graph = new joint.dia.Graph();

                paper = new joint.dia.Paper({
                    el: element,
                    width: 10000,
                    height: 5000,
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
                        let i;
                        let links = graph.getLinks();
                        for (i in links) {
                            let link = links[i];
                            let linkIView = link.findView(paper);
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
                            let ret = (cellViewS.model.get('blockType') === blocks.BASIC_INPUT);
                            if (!ret) {
                                warning(gettextCatalog.getString('Invalid <i>Pull up</i> connection:<br>only <i>Input</i> blocks allowed'));
                            }
                            return ret;
                        }
                        // Prevent different size connections
                        let tsize = 0;
                        let lsize = linkView.model.get('size');
                        let portId = magnetT.getAttribute('port');
                        let tLeftPorts = cellViewT.model.get('leftPorts');
                        let port = false;
                        for (i in tLeftPorts) {
                            port = tLeftPorts[i];
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

                let targetElement = element[0];

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
                    let cells = graph.getCells();
                    selectionView.options.state = state;

                    for (let i = 0, len = cells.length; i < len; i++) {

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

                let shiftPressed = false;

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
                    if (isDblClick === false) {
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
                            if (utils.hasShift(evt)) {
                                var cell = selection.get($(evt.target).data('model'));
                                selection.reset(selection.without(cell));
                                selectionView.destroySelectionBox(cell);
                            }
                        }
                    }
                });

                paper.on('cell:pointerclick', function (cellView, evt, x, y) {

                    if (!checkInsideViewBox(cellView, x, y)) {
                        // Out of the view box
                        return;
                    }

                    // If Shift is pressed, we are updating the selection. Else new selection.
                    if (!utils.hasShift(evt)) {
                        selectionView.cancelSelection();
                    }

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
                });
                let isDblClick = false;
                paper.on('cell:pointerdblclick', function (cellView, evt, x, y) {

                    if (x && y && !checkInsideViewBox(cellView, x, y)) {
                        // Out of the view box
                        return;
                    }
                    selectionView.cancelSelection();
                    if (!utils.hasShift(evt)) {

                        // Allow dblClick if Shift is not pressed
                        var type = cellView.model.get('blockType');
                        var blockId = cellView.model.get('id');


                        if (type.indexOf('basic.') !== -1) {
                            // Edit basic blocks
                            if (paper.options.enabled) {
                                blockforms.editBasic(type, cellView, addCell);

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
                            isDblClick = true;
                            let project = common.allDependencies[type];
                            let breadcrumbsLength = self.breadcrumbs.length;
                            utils.beginBlockingTask();
                            setTimeout(function () {
                                $rootScope.$broadcast('navigateProject', {
                                    update: breadcrumbsLength === 1,
                                    project: project,
                                    submodule: type,
                                    submoduleId: blockId
                                });
                                self.breadcrumbs.push({ name: project.package.name || '#', type: type });
                                utils.rootScopeSafeApply();
                                isDblClick = false;
                            }, 500);
                        }
                    }

                });

                function checkInsideViewBox(view, x, y) {
                    let $box = $(view.$box[0]);
                    let position = $box.position();
                    let rbox = g.rect(position.left, position.top, $box.width(), $box.height());
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
                    /*-- This timeout is necesary to difference between single click or double click.
                    When you click first time , this event trigger first, then you click one more time,
                    bcause you want the double click action, you need to wait to take only one decision */

                    setTimeout(function () {
                        if (isDblClick === false) {
                            graph.trigger('batch:start');
                            processReplaceBlock(cellView.model);
                            graph.trigger('batch:stop');
                            if (paper.options.enabled) {
                                updateWiresOnObstacles();
                            }
                        }
                    }, 200);
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
                    let portsMap = false;
                    if (lowerBlock) {
                        // 1. Compute portsMap between the upperBlock and the lowerBlock
                        portsMap = computeAllPortsMap(upperBlock, lowerBlock);
                        // 2. Reconnect the wires from the lowerBlock to the upperBlock
                        let wires = graph.getConnectedLinks(lowerBlock);
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
                        let connector = wire.get(connectorType);
                        if (connector.id === lowerBlock.get('id') && portsMap[connector.port]) {
                            wire.set(connectorType, {
                                id: upperBlock.get('id'),
                                port: portsMap[connector.port]
                            });
                        }
                    }
                }

                function computeAllPortsMap(upperBlock, lowerBlock) {
                    let portsMap = {};
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
                    let portsMap = {};
                    let usedUpperPorts = [];
                    let upperPorts = upperBlock.get(portType);
                    let lowerPorts = lowerBlock.get(portType);

                    _.each(lowerPorts, function (lowerPort) {
                        let matchedPorts = _.filter(upperPorts, function (upperPort) {
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
                        let n = Math.min(upperPorts.length, lowerPorts.length);
                        for (let i = 0; i < n; i++) {
                            if (lowerPorts[i].size === upperPorts[i].size) {
                                portsMap[lowerPorts[i].id] = upperPorts[i].id;
                            }
                        }
                    }

                    return portsMap;
                }

                let prevLowerBlock = null;

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
                let debounceDisableReplacedBlock = nodeDebounce(function (upperBlock) {
                    let lowerBlock = findLowerBlock(upperBlock);
                    disableReplacedBlock(lowerBlock);
                }, 100);

                graph.on('add change:source change:target', function (cell) {
                    if (cell.isLink() && cell.get('source').id) {
                        // Link connected
                        let target = cell.get('target');
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
                        let target = cell.get('target');
                        if (!target.id) {
                            target = cell.get('lastTarget');
                        }
                        updatePortDefault(target, true);
                    }
                });

                function updatePortDefault(target, value) {
                    if (target) {
                        let i, port;
                        let block = graph.getCell(target.id);
                        if (block) {
                            let data = block.get('data');
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


            this.resetBreadcrumbs = function (name) {
                this.breadcrumbs = [{ name: name, type: '' }];
                utils.rootScopeSafeApply();
            };


            this.updateWires=function(){
                updateWiresOnObstacles();
            };

            function updateWiresOnObstacles() {
                let cells = graph.getCells();

                //_.each(cells, function (cell) {
                for (let i = 0, n = cells.length; i < n; i++) {
                    if (cells[i].isLink()) {
                        paper.findViewByModel(cells[i]).update();
                    }
                }
            }

            this.setBoardRules = function (rules) {
                let cells = graph.getCells();
                profile.set('boardRules', rules);

                for (let i = 0, n = cells.length; i < n; i++) {
                    if (!cells[i].isLink()) {
                        cells[i].attributes.rules = rules;
                        let cellView = paper.findViewByModel(cells[i]);
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
                let ael, i;
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

                let cells = graph.getCells();
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
                blockforms.newGeneric(type, block, function (cell) {
                    self.addDraggableCell(cell);
                });
            };

            this.createBasicBlock = function (type) {
                blockforms.newBasic(type, function (cells) {
                    self.addDraggableCells(cells);
                });
            };

            this.addDraggableCell = function (cell) {
                this.addingDraggableBlock = true;
                let menuHeight = $('#menu').height();
                cell.set('position', {
                    x: Math.round(((mousePosition.x - state.pan.x) / state.zoom - cell.get('size').width / 2) / gridsize) * gridsize,
                    y: Math.round(((mousePosition.y - state.pan.y - menuHeight) / state.zoom - cell.get('size').height / 2) / gridsize) * gridsize,
                });
                graph.trigger('batch:start');
                addCell(cell);
                disableSelected();
                let opt = { transparent: true, initooltip: false };
                selection.add(cell);
                selectionView.createSelectionBox(cell, opt);
                selectionView.startAddingSelection({ clientX: mousePosition.x, clientY: mousePosition.y });
            };

            this.addDraggableCells = function (cells) {
                this.addingDraggableBlock = true;
                let menuHeight = $('#menu').height();
                if (cells.length > 0) {
                    let firstCell = cells[0];
                    let offset = {
                        x: Math.round(((mousePosition.x - state.pan.x) / state.zoom - firstCell.get('size').width / 2) / gridsize) * gridsize - firstCell.get('position').x,
                        y: Math.round(((mousePosition.y - state.pan.y - menuHeight) / state.zoom - firstCell.get('size').height / 2) / gridsize) * gridsize - firstCell.get('position').y,
                    };
                    _.each(cells, function (cell) {
                        let position = cell.get('position');
                        cell.set('position', {
                            x: position.x + offset.x,
                            y: position.y + offset.y
                        });
                    });
                    graph.trigger('batch:start');
                    addCells(cells);
                    disableSelected();
                    let opt = { transparent: true };
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

            this.editLabelBlock = function (itemId, newName, newColor) {
                let cellView = paper.findViewByModel(itemId);
                blocks.editBasicLabel(cellView, newName, newColor);
            };

            this.setCells = function (cells) {
                graph.attributes.cells.models = cells;
            };

            this.selectBoard = function (board, reset) {
                graph.startBatch('change');
                // Trigger board event
                let data = {
                    previous: common.selectedBoard,
                    next: board
                };
                graph.trigger('board', { data: data });
                let newBoard = boards.selectBoard(board.name);
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
                const data = {
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
                const data = {
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
                const data = {
                    previous: profile.get('language'),
                    next: language
                };
                graph.trigger('lang', { data: data });
                language = utils.setLocale(language);
                graph.stopBatch('change');
                return language;
            };

            function resetBlocks() {
                let data, connectedLinks;
                let cells = graph.getCells();
                let type = false;
                let block = false;
                let connected = false;

                _.each(cells, function (cell) {
                    if (cell.isLink()) {
                        return;
                    }
                    type = cell.get('blockType');
                    if (type === blocks.BASIC_INPUT || type === blocks.BASIC_OUTPUT) {
                        // Reset choices in all Input / blocks
                        var view = paper.findViewByModel(cell.id);
                        cell.set('choices', (type === blocks.BASIC_INPUT) ? common.pinoutInputHTML : common.pinoutOutputHTML);
                        view.clearValues();
                        view.applyChoices();
                    }
                    else if (type === blocks.BASIC_CODE) {
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
                        block = common.allDependencies[type];
                        data = { ports: { in: [] } };
                        connectedLinks = graph.getConnectedLinks(cell);
                        if (block.design.graph.blocks) {
                            _.each(block.design.graph.blocks, function (item) {
                                if (item.type === blocks.BASIC_INPUT && !item.data.range) {
                                    connected = false;
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

                            let hash = {};
                            // We will clone all dependencies
                            if (typeof object.dependencies !== false &&
                                object.dependencies !== false &&
                                object.dependencies !== null) {

                                var dependencies = utils.clone(object.dependencies);
                                object.dependencies = {};
                                let hId = false;
                                let dep = false;
                                let dat = false;
                                let seq = false;
                                let oldversion = false;

                                for (dep in dependencies) {
                                    dependencies[dep].package.name = dependencies[dep].package.name + ' CLONE';
                                    dat = new Date();
                                    seq = dat.getTime();
                                    oldversion = dependencies[dep].package.version.replace(/(.*)(-c\d*)/, '$1');
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

            this.duplicateSelected = function() {
                if (hasSelection()) {
                    utils.duplicateSelected(selection, graph, function (object) {
                        if (object.version === common.VERSION) {
                            self.appendDesign(object.design, object.dependencies);
                        }
                    });
                }
            };

            this.removeSelected = function () {
                if (hasSelection()) {
                    graph.removeCells(selection.models);
                    selectionView.cancelSelection();
                    updateWiresOnObstacles();
                }
            };

            this.selectAll = function () {
                disableSelected();
                const cells = graph.getCells();
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

            let stepCounter = 0;
            let stepTimer = null;
            let stepGroupingInterval = 500;
            let allowStep = true;
            let allosStepInterval = 200;

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
                let processedWires = {};
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



            this.isEnabled = function () {
                if (typeof paper !== 'undefined' && paper !== null && paper !== false) {
                    return paper.options.enabled;
                }
                return false;
            };

            this.loadDesign = function (design, opt, callback) {

                if (design &&
                    design.graph &&
                    design.graph.blocks &&
                    design.graph.wires) {

                    opt = opt || { disabled: false, reset: true };
                    commandManager.stopListening();

                    self.clearAll();

                    let cells = graphToCells(design.graph, opt);

                      self.fitContent();

                    graph.addCells(cells);

                    self.setState(design.state);

                    self.appEnable(!opt.disabled);
                    if (!opt.disabled) {
                        commandManager.listen();
                    }

                    if (callback) {


                        callback();

                        utils.endBlockingTask();
                        
                         self.fitContent();
                    } else {

                        utils.endBlockingTask();
                   
                         self.fitContent();

                    }
                   
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

                let cell;
                let cells = [];
                let blocksMap = {};
                opt = opt || {};
                // Blocks
                let isMigrated = false;


                function getBlocksFromLib(id) {
                    for (let dep in common.allDependencies) {
                        if (id === dep) {
                            return common.allDependencies[dep].design.graph.blocks;
                        }
                    }
                    return false;
                }
                function outputExists(oid, blks) {
                    let founded = false;
                    for (let i = 0; i < blks.length; i++) {
                        if (blks[i].id === oid) {
                            return true;
                        }
                    }
                    return founded;
                }
                /* Check if wire source exists (block+port) */
                function wireExists(wre, blk, edge) {

                    let founded = false;
                    let blk2 = false;
                    let i = 0;
                    for (i = 0; i < blk.length; i++) {
                        if (wre[edge].block === blk[i].id) {
                            founded = i;
                            break;
                        }
                    }
                    if (founded !== false) {
                        switch (blk[founded].type) {
                            case blocks.BASIC_MEMORY:
                            case blocks.BASIC_CONSTANT:
                            case blocks.BASIC_OUTPUT_LABEL:
                            case blocks.BASIC_INPUT_LABEL:
                            case blocks.BASIC_CODE:
                            case blocks.BASIC_INPUT:
                            case blocks.BASIC_OUTPUT:
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
                let test = false;
                let todelete = [];

                for (let i = 0; i < _graph.wires.length; i++) {
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
                let tempw = [];
                for (let z = 0; z < _graph.wires.length; z++) {

                    if (todelete.indexOf(z) === -1) {
                        tempw.push(_graph.wires[z]);
                    }
                }
                _graph.wires = utils.clone(tempw);



                _.each(_graph.blocks, function (blockInstance) {


                    if (blockInstance.type !== false && blockInstance.type.indexOf('basic.') !== -1) {
                        if (opt.reset &&
                            (blockInstance.type === blocks.BASIC_INPUT ||
                                blockInstance.type === blocks.BASIC_OUTPUT)) {
                            let pins = blockInstance.data.pins;

                            // - if conversion from one board to other is in progress,
                            //   now is based on pin names, an improvement could be
                            //   through hash tables with assigned pins previously
                            //   selected by icestudio developers
                            let replaced = false;
                            for (let i in pins) {
                                replaced = false;
                                if (typeof opt.designPinout !== 'undefined') {
                                    for (var opin = 0; opin < opt.designPinout.length; opin++) {
                                        if (String(opt.designPinout[opin].name) === String(pins[i].name)) {

                                            replaced = true;
                                        } else {
                                            let prefix = String(pins[i].name).replace(/[0-9]/g, '');
                                            if (String(opt.designPinout[opin].name) === prefix) {

                                                replaced = true;
                                            }


                                        }

                                        if (replaced === true) {
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
                        cell = blockforms.loadBasic(blockInstance, opt.disabled);
                    }
                    else {
                        if (blockInstance.type in common.allDependencies) {
                            cell = blockforms.loadGeneric(blockInstance, common.allDependencies[blockInstance.type], opt.disabled);
                        }
                    }

                    blocksMap[cell.id] = cell;
                    if (opt.new) {
                        let oldId = cell.id;
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
                    let source = blocksMap[wireInstance.source.block];
                    let target = blocksMap[wireInstance.target.block];
                    if (opt.offset) {
                        let newVertices = [];
                        let vertices = wireInstance.vertices;
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
                    cell = blockforms.loadWire(wireInstance, source, target);
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
                    for (let type in dependencies) {
                        if (!(type in common.allDependencies)) {
                            common.allDependencies[type] = dependencies[type];
                        }
                    }

                    // Append graph cells: blocks and wires
                    // - assign new UUIDs to the cells
                    // - add the graph in the mouse position
                    let origin = graphOrigin(design.graph);
                    let menuHeight = $('#menu').height();
                    let opt = {
                        new: true,
                        disabled: false,
                        reset: design.board !== common.selectedBoard.name,
                        offset: {
                            x: Math.round(((mousePosition.x - state.pan.x) / state.zoom - origin.x) / gridsize) * gridsize,
                            y: Math.round(((mousePosition.y - state.pan.y - menuHeight) / state.zoom - origin.y) / gridsize) * gridsize,
                        }
                    };
                    let cells = graphToCells(design.graph, opt);
                    graph.addCells(cells);

                    // Select pasted elements
                    _.each(cells, function (cell) {
                        if (!cell.isLink()) {
                            let cellView = paper.findViewByModel(cell);
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
                let origin = { x: Infinity, y: Infinity };
                let position = false;
                _.each(graph.blocks, function (block) {
                    position = block.position;
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
                        let cellView = paper.findViewByModel(cell);
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
                let cellView = false;
                _.each(cells, function (cell) {
                    if (!cell.isLink()) {
                        cellView = paper.findViewByModel(cell);
                        if (cellView.$box.css('z-index') < z.index) {
                            cellView.$box.css('z-index', ++z.index);
                        }
                    }
                });
            }

            this.resetCodeErrors = function () {
                let cells = graph.getCells();
                return new Promise(function (resolve) {
                    _.each(cells, function (cell) {
                        let cellView;
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
                let cells = graph.getCells();
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
