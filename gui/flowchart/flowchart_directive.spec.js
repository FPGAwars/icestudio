
describe('flowchart-directive', function () {

	var testObject;
	var mockScope;
	var mockDragging;
	var mockSvgElement;

	//
	// Bring in the flowChart module before each test.
	//
	beforeEach(module('flowChart'));

	//
	// Helper function to create the controller for each test.
	//
	var createController = function ($rootScope, $controller) {

 		mockScope = $rootScope.$new();
 		mockDragging = createMockDragging();
		mockSvgElement = {
			get: function () {
				return createMockSvgElement();
			}
		};

      	testObject = $controller('FlowChartController', {
      		$scope: mockScope,
      		dragging: mockDragging,
      		$element: mockSvgElement,
      	});
	};

	//
	// Setup the controller before each test.
	//
	beforeEach(inject(function ($rootScope, $controller) {

		createController($rootScope, $controller);
	}));

	// 
	// Create a mock DOM element.
	//
	var createMockElement = function(attr, parent, scope) {
		return {
			attr: function() {
				return attr;
			},

			parent: function () {
				return parent;
			},		

			scope: function () {
				return scope || {};
			},

		};
	}

	//
	// Create a mock node data model.
	//
	var createMockNode = function (inputConnectors, outputConnectors) {
		return {
			x: function () { return 0 },
			y: function () { return 0 },
			inputConnectors: inputConnectors || [],
			outputConnectors: outputConnectors || [],
			select: jasmine.createSpy(),
			selected: function () { return false; },
		};
	};

	//
	// Create a mock chart.
	//
	var createMockChart = function (mockNodes, mockConnections) {
		return {
			nodes: mockNodes,
			connections: mockConnections,

			handleNodeClicked: jasmine.createSpy(),
			handleConnectionMouseDown: jasmine.createSpy(),
			updateSelectedNodesLocation: jasmine.createSpy(),
			deselectAll: jasmine.createSpy(),
			createNewConnection: jasmine.createSpy(),
			applySelectionRect: jasmine.createSpy(),
		};
	};

	//
	// Create a mock dragging service.
	//
	var createMockDragging = function () {

		var mockDragging = {
			startDrag: function (evt, config) {
				mockDragging.evt = evt;
				mockDragging.config = config;
			},
		};

		return mockDragging;
	};

	//
	// Create a mock version of the SVG element.
	//
	var createMockSvgElement = function () {
		return {
			getScreenCTM: function () {
				return {
					inverse: function () {
						return this;
					},
				};
			},

			createSVGPoint: function () {
				return { 
					x: 0, 
					y: 0 ,
					matrixTransform: function () {
						return this;
					},
				};
			}



		};
	};

	it('searchUp returns null when at root 1', function () {

		expect(testObject.searchUp(null, "some-class")).toBe(null);
	});


	it('searchUp returns null when at root 2', function () {

		expect(testObject.searchUp([], "some-class")).toBe(null);
	});

	it('searchUp returns element when it has requested class', function () {

		var whichClass = "some-class";
		var mockElement = createMockElement(whichClass);

		expect(testObject.searchUp(mockElement, whichClass)).toBe(mockElement);
	});

	it('searchUp returns parent when it has requested class', function () {

		var whichClass = "some-class";
		var mockParent = createMockElement(whichClass);
		var mockElement = createMockElement('', mockParent);

		expect(testObject.searchUp(mockElement, whichClass)).toBe(mockParent);
	});

	it('hitTest returns result of elementFromPoint', function () {

		var mockElement = {};

		// Mock out the document.
		testObject.document = {
			elementFromPoint: function () {
				return mockElement;
			},
		};

		expect(testObject.hitTest(12, 30)).toBe(mockElement);
	});

	it('checkForHit returns null when the hit element has no parent with requested class', function () {

		var mockElement = createMockElement(null, null);

		testObject.jQuery = function (input) {
			return input;
		};

		expect(testObject.checkForHit(mockElement, "some-class")).toBe(null);
	});

	it('checkForHit returns the result of searchUp when found', function () {

		var mockConnectorScope = {};

		var whichClass = "some-class";
		var mockElement = createMockElement(whichClass, null, mockConnectorScope);

		testObject.jQuery = function (input) {
			return input;
		};

		expect(testObject.checkForHit(mockElement, whichClass)).toBe(mockConnectorScope);
	});	

	it('checkForHit returns null when searchUp fails', function () {

		var mockElement = createMockElement(null, null, null);

		testObject.jQuery = function (input) {
			return input;
		};

		expect(testObject.checkForHit(mockElement, "some-class")).toBe(null);
	});	

	it('test node dragging is started on node mouse down', function () {

		mockDragging.startDrag = jasmine.createSpy();

		var mockEvt = {};
		var mockNode = createMockNode();

		mockScope.nodeMouseDown(mockEvt, mockNode);

		expect(mockDragging.startDrag).toHaveBeenCalled();

	});

	it('test node click handling is forwarded to view model', function () {

		mockScope.chart = createMockChart([mockNode]);

		var mockEvt = {
			ctrlKey: false,
		};
		var mockNode = createMockNode();

		mockScope.nodeMouseDown(mockEvt, mockNode);

		mockDragging.config.clicked();

		expect(mockScope.chart.handleNodeClicked).toHaveBeenCalledWith(mockNode, false);
	});

	it('test control + node click handling is forwarded to view model', function () {

		var mockNode = createMockNode();

		mockScope.chart = createMockChart([mockNode]);

		var mockEvt = {
			ctrlKey: true,
		};

		mockScope.nodeMouseDown(mockEvt, mockNode);

		mockDragging.config.clicked();

		expect(mockScope.chart.handleNodeClicked).toHaveBeenCalledWith(mockNode, true);
	});

	it('test node dragging updates selected nodes location', function () {

		var mockEvt = {
			view: {
				pageXOffset: 0,
				pageYOffset: 0,
			},
		};

		mockScope.chart = createMockChart([createMockNode()]);

		mockScope.nodeMouseDown(mockEvt, mockScope.chart.nodes[0]);

		var xIncrement = 5;
		var yIncrement = 15;

		mockDragging.config.dragStarted(0, 0);
		mockDragging.config.dragging(xIncrement, yIncrement);

		expect(mockScope.chart.updateSelectedNodesLocation).toHaveBeenCalledWith(xIncrement, yIncrement);
	});

	it('test node dragging doesnt modify selection when node is already selected', function () {

		var mockNode1 = createMockNode();
		var mockNode2 = createMockNode();

		mockScope.chart = createMockChart([mockNode1, mockNode2]);

		mockNode2.selected = function () { return true; }

		var mockEvt = {
			view: {
				scrollX: 0,
				scrollY: 0,
			},
		};

		mockScope.nodeMouseDown(mockEvt, mockNode2);

		mockDragging.config.dragStarted(0, 0);

		expect(mockScope.chart.deselectAll).not.toHaveBeenCalled();
	});

	it('test node dragging selects node, when the node is not already selected', function () {

		var mockNode1 = createMockNode();
		var mockNode2 = createMockNode();

		mockScope.chart = createMockChart([mockNode1, mockNode2]);

		var mockEvt = {
			view: {
				scrollX: 0,
				scrollY: 0,
			},
		};

		mockScope.nodeMouseDown(mockEvt, mockNode2);

		mockDragging.config.dragStarted(0, 0);

		expect(mockScope.chart.deselectAll).toHaveBeenCalled();
		expect(mockNode2.select).toHaveBeenCalled();
	});

	it('test connection click handling is forwarded to view model', function () {

		var mockNode = createMockNode();

		var mockEvt = {
			stopPropagation: jasmine.createSpy(),
			preventDefault: jasmine.createSpy(),
			ctrlKey: false,
		};
		var mockConnection = {};

		mockScope.chart = createMockChart([mockNode]);

		mockScope.connectionMouseDown(mockEvt, mockConnection);

		expect(mockScope.chart.handleConnectionMouseDown).toHaveBeenCalledWith(mockConnection, false);
		expect(mockEvt.stopPropagation).toHaveBeenCalled();
		expect(mockEvt.preventDefault).toHaveBeenCalled();
	});

	it('test control + connection click handling is forwarded to view model', function () {

		var mockNode = createMockNode();

		var mockEvt = {
			stopPropagation: jasmine.createSpy(),
			preventDefault: jasmine.createSpy(),
			ctrlKey: true,
		};
		var mockConnection = {};

		mockScope.chart = createMockChart([mockNode]);

		mockScope.connectionMouseDown(mockEvt, mockConnection);

		expect(mockScope.chart.handleConnectionMouseDown).toHaveBeenCalledWith(mockConnection, true);
	});

	it('test selection is cleared when background is clicked', function () {

		var mockEvt = {};

		mockScope.chart = createMockChart([createMockNode()]);

		mockScope.chart.nodes[0].selected = true;

		mockScope.mouseDown(mockEvt);

		expect(mockScope.chart.deselectAll).toHaveBeenCalled();
	});	

	it('test background mouse down commences selection dragging', function () {

		var mockNode = createMockNode();
		var mockEvt = {
			view: {
				scrollX: 0,
				scrollY: 0,
			},
		};

		mockScope.chart = createMockChart([mockNode]);

		mockScope.mouseDown(mockEvt);

		mockDragging.config.dragStarted(0, 0);

		expect(mockScope.dragSelecting).toBe(true);
	});

	it('test can end selection dragging', function () {

		var mockNode = createMockNode();
		var mockEvt = {
			view: {
				scrollX: 0,
				scrollY: 0,
			},
		};

		mockScope.chart = createMockChart([mockNode]);

		mockScope.mouseDown(mockEvt);

 		mockDragging.config.dragStarted(0, 0, mockEvt);
 		mockDragging.config.dragging(0, 0, mockEvt);
 		mockDragging.config.dragEnded();

		expect(mockScope.dragSelecting).toBe(false);		
 	});

	it('test selection dragging ends by selecting nodes', function () {

		var mockNode = createMockNode();
		var mockEvt = {
			view: {
				scrollX: 0,
				scrollY: 0,
			},
		};

		mockScope.chart = createMockChart([mockNode]);

		mockScope.mouseDown(mockEvt);

 		mockDragging.config.dragStarted(0, 0, mockEvt);
 		mockDragging.config.dragging(0, 0, mockEvt);

 		var selectionRect = { 
 			x: 1,
 			y: 2,
 			width: 3,
 			height: 4,
 		};

 		mockScope.dragSelectionRect = selectionRect;

 		mockDragging.config.dragEnded();

		expect(mockScope.chart.applySelectionRect).toHaveBeenCalledWith(selectionRect);
 	});

	it('test mouse down commences connection dragging', function () {

		var mockNode = createMockNode();
		var mockEvt = {
			view: {
				scrollX: 0,
				scrollY: 0,
			},
		};

		mockScope.chart = createMockChart([mockNode]);

		mockScope.connectorMouseDown(mockEvt, mockScope.chart.nodes[0], mockScope.chart.nodes[0].inputConnectors[0], 0, false);

		mockDragging.config.dragStarted(0, 0);

		expect(mockScope.draggingConnection).toBe(true);		
	});

	it('test can end connection dragging', function () {

		var mockNode = createMockNode();
		var mockEvt = {
			view: {
				scrollX: 0,
				scrollY: 0,
			},
		};

		mockScope.chart = createMockChart([mockNode]);

		mockScope.connectorMouseDown(mockEvt, mockScope.chart.nodes[0], mockScope.chart.nodes[0].inputConnectors[0], 0, false);

 		mockDragging.config.dragStarted(0, 0, mockEvt);
 		mockDragging.config.dragging(0, 0, mockEvt);
 		mockDragging.config.dragEnded();

		expect(mockScope.draggingConnection).toBe(false);		
 	});

	it('test can make a connection by dragging', function () {

		var mockNode = createMockNode();
		var mockDraggingConnector = {};
		var mockDragOverConnector = {};
		var mockEvt = {
            view: {
                scrollX: 0,
                scrollY: 0,
            },
        };

		mockScope.chart = createMockChart([mockNode]);

		mockScope.connectorMouseDown(mockEvt, mockScope.chart.nodes[0], mockDraggingConnector, 0, false);

 		mockDragging.config.dragStarted(0, 0, mockEvt);
 		mockDragging.config.dragging(0, 0, mockEvt);

 		// Fake out the mouse over connector.
 		mockScope.mouseOverConnector = mockDragOverConnector;

 		mockDragging.config.dragEnded();

 		expect(mockScope.chart.createNewConnection).toHaveBeenCalledWith(mockDraggingConnector, mockDragOverConnector);
 	});

	it('test connection creation by dragging is cancelled when dragged over invalid connector', function () {

		var mockNode = createMockNode();
		var mockDraggingConnector = {};
		var mockEvt = {
			view: {
				scrollX: 0,
				scrollY: 0,
			},
		};

		mockScope.chart = createMockChart([mockNode]);

		mockScope.connectorMouseDown(mockEvt, mockScope.chart.nodes[0], mockDraggingConnector, 0, false);

 		mockDragging.config.dragStarted(0, 0, mockEvt);
 		mockDragging.config.dragging(0, 0, mockEvt);

 		// Fake out the invalid connector.
 		mockScope.mouseOverConnector = null;

 		mockDragging.config.dragEnded();

 		expect(mockScope.chart.createNewConnection).not.toHaveBeenCalled();
 	});

 	it('mouse move over connection caches the connection', function () {

 		var mockElement = {};
 		var mockConnection = {};
 		var mockConnectionScope = {
 			connection: mockConnection
 		};
 		var mockEvent = {};

 		//
 		// Fake out the function that check if a connection has been hit.
 		//
 		testObject.checkForHit = function (element, whichClass) {
 			if (whichClass === testObject.connectionClass) {
 				return mockConnectionScope;
 			}

 			return null;
 		};

 		testObject.hitTest = function () {
 			return mockElement;
 		};

 		mockScope.mouseMove(mockEvent);

 		expect(mockScope.mouseOverConnection).toBe(mockConnection);
 	});

 	it('test mouse over connection clears mouse over connector and node', function () {

		var mockElement = {};
 		var mockConnection = {};
 		var mockConnectionScope = {
 			connection: mockConnection
 		};
 		var mockEvent = {};

 		//
 		// Fake out the function that check if a connection has been hit.
 		//
 		testObject.checkForHit = function (element, whichClass) {
 			if (whichClass === testObject.connectionClass) {
 				return mockConnectionScope;
 			}

 			return null;
 		};

 		testObject.hitTest = function () {
 			return mockElement;
 		};


 		mockScope.mouseOverConnector = {};
 		mockScope.mouseOverNode = {};

 		mockScope.mouseMove(mockEvent);

 		expect(mockScope.mouseOverConnector).toBe(null);
 		expect(mockScope.mouseOverNode).toBe(null);
 	});

 	it('test mouseMove handles mouse over connector', function () {

		var mockElement = {};
 		var mockConnector = {};
 		var mockConnectorScope = {
 			connector: mockConnector
 		};
 		var mockEvent = {};

 		//
 		// Fake out the function that check if a connector has been hit.
 		//
 		testObject.checkForHit = function (element, whichClass) {
 			if (whichClass === testObject.connectorClass) {
 				return mockConnectorScope;
 			}

 			return null;
 		};

 		testObject.hitTest = function () {
 			return mockElement;
 		};

 		mockScope.mouseMove(mockEvent);

 		expect(mockScope.mouseOverConnector).toBe(mockConnector);
 	});

 	it('test mouseMove handles mouse over node', function () {

		var mockElement = {};
 		var mockNode = {};
 		var mockNodeScope = {
 			node: mockNode
 		};
 		var mockEvent = {};

 		//
 		// Fake out the function that check if a connector has been hit.
 		//
 		testObject.checkForHit = function (element, whichClass) {
 			if (whichClass === testObject.nodeClass) {
 				return mockNodeScope;
 			}

 			return null;
 		};

 		testObject.hitTest = function () {
 			return mockElement;
 		};

 		mockScope.mouseMove(mockEvent);

 		expect(mockScope.mouseOverNode).toBe(mockNode);
 	});
});
