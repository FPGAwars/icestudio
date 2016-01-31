describe('flowchart-viewmodel', function () {

	//
	// Create a mock data model from a simple definition.
	//
	var createMockDataModel = function (nodeIds, connections) {

		var nodeDataModels = null;

		if (nodeIds) {
			nodeDataModels = [];

			for (var i = 0; i < nodeIds.length; ++i) {
				nodeDataModels.push({
					id: nodeIds[i],
					x: 0,
					y: 0,
					inputConnectors: [ {}, {}, {} ],
					outputConnectors: [ {}, {}, {} ],
				});
			}
		}

		var connectionDataModels = null;

		if (connections) {
			connectionDataModels = [];

			for (var i = 0; i < connections.length; ++i) {
				connectionDataModels.push({
					source: {
						nodeID: connections[i][0][0],
						connectorIndex: connections[i][0][1],
					},
					dest: {
						nodeID: connections[i][1][0],
						connectorIndex: connections[i][1][1],
					},
				});
			}
		}

		var dataModel = {};

		if (nodeDataModels) {
			dataModel.nodes = nodeDataModels;
		}

		if (connectionDataModels) {
			dataModel.connections = connectionDataModels;
		}

 		return dataModel;
	};

	it('compute input connector pos', function () {

		var mockNode = {
			x: function () { return 10 },
			y: function () { return 15 },
		};

		flowchart.computeConnectorPos(mockNode, 0, true);
		flowchart.computeConnectorPos(mockNode, 1, true);
		flowchart.computeConnectorPos(mockNode, 2, true);
	});

	it('compute output connector pos', function () {

		var mockNode = {
			x: function () { return 10 },
			y: function () { return 15 },
		};

		flowchart.computeConnectorPos(mockNode, 0, false);
		flowchart.computeConnectorPos(mockNode, 1, false);
		flowchart.computeConnectorPos(mockNode, 2, false);
	});

	it('construct ConnectorViewModel', function () {

		var mockDataModel = {
			name: "Fooey",
		};

		new flowchart.ConnectorViewModel(mockDataModel, 0, 10, 0);
		new flowchart.ConnectorViewModel(mockDataModel, 0, 10, 1);
		new flowchart.ConnectorViewModel(mockDataModel, 0, 10, 2);

	});

	it('ConnectorViewModel has reference to parent node', function () {

		var mockDataModel = {
			name: "Fooey",
		};
		var mockParentNodeViewModel = {};

		var testObject = new flowchart.ConnectorViewModel(mockDataModel, 0, 10, mockParentNodeViewModel);

		expect(testObject.parentNode()).toBe(mockParentNodeViewModel);
	});

		it('construct NodeViewModel with no connectors', function () {

		var mockDataModel = {
			x: 10,
			y: 12,
			name: "Woot",
		};

		new flowchart.NodeViewModel(mockDataModel);
	});

	it('construct NodeViewModel with empty connectors', function () {

		var mockDataModel = {
			x: 10,
			y: 12,
			name: "Woot",
			inputConnectors: [],
			outputConnectors: [],
		};

		new flowchart.NodeViewModel(mockDataModel);
	});

	it('construct NodeViewModel with connectors', function () {

		var mockInputConnector = {
			name: "Input",
		};		

		var mockOutputConnector = {
			name: "Output",
		};		

		var mockDataModel = {
			x: 10,
			y: 12,
			name: "Woot",
			inputConnectors: [
				mockInputConnector
			],
			outputConnectors: [
				mockOutputConnector
			],
		};

		new flowchart.NodeViewModel(mockDataModel);
	});

	it('test name of NodeViewModel', function () {

		var mockDataModel = {
			name: "Woot",
		};

		var testObject = new flowchart.NodeViewModel(mockDataModel);

		expect(testObject.name()).toBe(mockDataModel.name);
	});

	it('test name of NodeViewModel defaults to empty string', function () {

		var mockDataModel = {};

		var testObject = new flowchart.NodeViewModel(mockDataModel);

		expect(testObject.name()).toBe("");
	});

	it('test node is deselected by default', function () {

		var mockDataModel = {};

		var testObject = new flowchart.NodeViewModel(mockDataModel);

		expect(testObject.selected()).toBe(false);
	});

	it('test node width is set by default', function () {

		var mockDataModel = {};

		var testObject = new flowchart.NodeViewModel(mockDataModel);

		expect(testObject.width() === flowchart.defaultNodeWidth).toBe(true);
	});

	it('test node width is used', function () {

		var mockDataModel = {"width": 900 };

		var testObject = new flowchart.NodeViewModel(mockDataModel);

		expect(testObject.width()).toBe(900);
	});

	it('test computeConnectorPos uses node width', function () {

		var mockDataModel = {
			x: function () {
				return 10;
			},
			y: function () {
				return 15;
			},
			width: function () {
				return 900;
			},
		};

		var testObject = flowchart.computeConnectorPos(mockDataModel, 1, false);

		expect(testObject.x).toBe(910);
	});

	it('test computeConnectorPos uses default node width', function () {

		var mockDataModel = {
			x: function () {
				return 10
			},
			y: function () {
				return 15
			},
		};

		var testObject = flowchart.computeConnectorPos(mockDataModel, 1, false);

		expect(testObject.x).toBe(flowchart.defaultNodeWidth + 10);
	});

	it('test node can be selected', function () {

		var mockDataModel = {};

		var testObject = new flowchart.NodeViewModel(mockDataModel);

		testObject.select();

		expect(testObject.selected()).toBe(true);
	});

	it('test node can be deselected', function () {

		var mockDataModel = {};

		var testObject = new flowchart.NodeViewModel(mockDataModel);

		testObject.select();

		testObject.deselect();

		expect(testObject.selected()).toBe(false);
	});

	it('test node can be selection can be toggled', function () {

		var mockDataModel = {};

		var testObject = new flowchart.NodeViewModel(mockDataModel);

		testObject.toggleSelected();

		expect(testObject.selected()).toBe(true);

		testObject.toggleSelected();

		expect(testObject.selected()).toBe(false);
	});

	it('test can add input connector to node', function () {

		var mockDataModel = {};

		var testObject = new flowchart.NodeViewModel(mockDataModel);

		var name1 = "Connector1";
		var name2 = "Connector2";
		var data1 = {
			name: name1
		};
		var data2 = {
			name: name2
		}
		testObject.addInputConnector(data1);
		testObject.addInputConnector(data2);

		expect(testObject.inputConnectors.length).toBe(2);
		expect(testObject.inputConnectors[0].data).toBe(data1);
		expect(testObject.inputConnectors[1].data).toBe(data2);

		expect(testObject.data.inputConnectors.length).toBe(2);
		expect(testObject.data.inputConnectors[0]).toBe(data1);
		expect(testObject.data.inputConnectors[1]).toBe(data2);
	});

	it('test can add output connector to node', function () {

		var mockDataModel = {};

		var testObject = new flowchart.NodeViewModel(mockDataModel);

		var name1 = "Connector1";
		var name2 = "Connector2";
		var data1 = {
			name: name1
		};
		var data2 = {
			name: name2
		}
		testObject.addOutputConnector(data1);
		testObject.addOutputConnector(data2);

		expect(testObject.outputConnectors.length).toBe(2);
		expect(testObject.outputConnectors[0].data).toBe(data1);
		expect(testObject.outputConnectors[1].data).toBe(data2);

		expect(testObject.data.outputConnectors.length).toBe(2);
		expect(testObject.data.outputConnectors[0]).toBe(data1);
		expect(testObject.data.outputConnectors[1]).toBe(data2);
	});

	it('construct ChartViewModel with no nodes or connections', function () {

		var mockDataModel = {};

		new flowchart.ChartViewModel(mockDataModel);

	});

	it('construct ChartViewModel with empty nodes and connections', function () {

		var mockDataModel = {
			nodes: [],
			connections: [],
		};

		new flowchart.ChartViewModel(mockDataModel);

	});

	it('construct ConnectionViewModel', function () {

		var mockDataModel = {};
		var mockSourceConnector = {};
		var mockDestConnector = {};

		new flowchart.ConnectionViewModel(mockDataModel, mockSourceConnector, mockDestConnector);
	});

	it('retreive source and dest coordinates', function () {

		var mockDataModel = {
		};

		var mockSourceParentNode = {
			x: function () { return 5 },
			y: function () { return 10 },
		};

		var mockSourceConnector = {
			parentNode: function () {
				return mockSourceParentNode;
			},

			x: function() {
				return 5;
			},

			y: function() {
				return 15;
			},
		};

		var mockDestParentNode = {
			x: function () { return 50 },
			y: function () { return 30 },
		};

		var mockDestConnector = {
			parentNode: function () {
				return mockDestParentNode;
			},

			x: function() {
				return 25;
			},

			y: function() {
				return 35;
			},
		};

		var testObject = new flowchart.ConnectionViewModel(mockDataModel, mockSourceConnector, mockDestConnector);

		testObject.sourceCoord();
		expect(testObject.sourceCoordX()).toBe(10);
		expect(testObject.sourceCoordY()).toBe(25);
		testObject.sourceTangentX();
		testObject.sourceTangentY();
		
		testObject.destCoord();
		expect(testObject.destCoordX()).toBe(75);
		expect(testObject.destCoordY()).toBe(65);
		testObject.destTangentX();
		testObject.destTangentY();
	});

	it('test connection is deselected by default', function () {

		var mockDataModel = {};

		var testObject = new flowchart.ConnectionViewModel(mockDataModel);

		expect(testObject.selected()).toBe(false);
	});

	it('test connection can be selected', function () {

		var mockDataModel = {};

		var testObject = new flowchart.ConnectionViewModel(mockDataModel);

		testObject.select();

		expect(testObject.selected()).toBe(true);
	});

	it('test connection can be deselected', function () {

		var mockDataModel = {};

		var testObject = new flowchart.ConnectionViewModel(mockDataModel);

		testObject.select();

		testObject.deselect();

		expect(testObject.selected()).toBe(false);
	});

	it('test connection can be selection can be toggled', function () {

		var mockDataModel = {};

		var testObject = new flowchart.ConnectionViewModel(mockDataModel);

		testObject.toggleSelected();

		expect(testObject.selected()).toBe(true);

		testObject.toggleSelected();

		expect(testObject.selected()).toBe(false);
	});

	it('construct ChartViewModel with a node', function () {

		var mockDataModel = createMockDataModel([1]);

		var testObject = new flowchart.ChartViewModel(mockDataModel);
		expect(testObject.nodes.length).toBe(1);
		expect(testObject.nodes[0].data).toBe(mockDataModel.nodes[0]);

	});

	it('data model with existing connection creates a connection view model', function () {

		var mockDataModel = createMockDataModel(
			[ 5, 12 ],
			[
				[[ 5, 0 ], [ 12, 1 ]],
			]
		);

		var testObject = new flowchart.ChartViewModel(mockDataModel);

		expect(testObject.connections.length).toBe(1);
		expect(testObject.connections[0].data).toBe(mockDataModel.connections[0]);
		expect(testObject.connections[0].source.data).toBe(mockDataModel.nodes[0].outputConnectors[0]);
		expect(testObject.connections[0].dest.data).toBe(mockDataModel.nodes[1].inputConnectors[1]);
	});

	it('test can add new node', function () {

		var mockDataModel = createMockDataModel();

		var testObject = new flowchart.ChartViewModel(mockDataModel);

		var nodeDataModel = {};
		testObject.addNode(nodeDataModel);

		expect(testObject.nodes.length).toBe(1);
		expect(testObject.nodes[0].data).toBe(nodeDataModel);

		expect(testObject.data.nodes.length).toBe(1);
		expect(testObject.data.nodes[0]).toBe(nodeDataModel);
	});

	it('test can select all', function () {

		var mockDataModel = createMockDataModel([1, 2], [[[1, 0], [2, 1]]]);

		var testObject = new flowchart.ChartViewModel(mockDataModel);

		var node1 = testObject.nodes[0];
		var node2 = testObject.nodes[1];
		var connection = testObject.connections[0];

		testObject.selectAll();

		expect(node1.selected()).toBe(true);
		expect(node2.selected()).toBe(true);
		expect(connection.selected()).toBe(true);
	});

	it('test can deselect all nodes', function () {

		var mockDataModel = createMockDataModel([1, 2]);

		var testObject = new flowchart.ChartViewModel(mockDataModel);

		var node1 = testObject.nodes[0];
		var node2 = testObject.nodes[1];

		node1.select();
		node2.select();

		testObject.deselectAll();

		expect(node1.selected()).toBe(false);
		expect(node2.selected()).toBe(false);
	});

	it('test can deselect all connections', function () {

		var mockDataModel = createMockDataModel(
			[ 5, 12 ],
			[
				[[ 5, 0 ], [ 12, 1 ]],
				[[ 5, 0 ], [ 12, 1 ]],
			]
		);

		var testObject = new flowchart.ChartViewModel(mockDataModel);

		var connection1 = testObject.connections[0];
		var connection2 = testObject.connections[1];

		connection1.select();
		connection2.select();

		testObject.deselectAll();

		expect(connection1.selected()).toBe(false);
		expect(connection2.selected()).toBe(false);
	});

	it('test mouse down deselects nodes other than the one clicked', function () {

		var mockDataModel = createMockDataModel([ 1, 2, 3 ]);

		var testObject = new flowchart.ChartViewModel(mockDataModel);

		var node1 = testObject.nodes[0];
		var node2 = testObject.nodes[1];
		var node3 = testObject.nodes[2];

		// Fake out the nodes as selected.
		node1.select();
		node2.select();
		node3.select();

		testObject.handleNodeClicked(node2); // Doesn't matter which node is actually clicked.

		expect(node1.selected()).toBe(false);
		expect(node2.selected()).toBe(true);
		expect(node3.selected()).toBe(false);
	});

	it('test mouse down selects the clicked node', function () {

		var mockDataModel = createMockDataModel([ 1, 2, 3 ]);

		var testObject = new flowchart.ChartViewModel(mockDataModel);
		
		var node1 = testObject.nodes[0];
		var node2 = testObject.nodes[1];
		var node3 = testObject.nodes[2];

		testObject.handleNodeClicked(node3); // Doesn't matter which node is actually clicked.

		expect(node1.selected()).toBe(false);
		expect(node2.selected()).toBe(false);
		expect(node3.selected()).toBe(true);
	});

	it('test mouse down brings node to front', function () {

		var mockDataModel = createMockDataModel([ 1, 2 ]);

		var testObject = new flowchart.ChartViewModel(mockDataModel);

		var node1 = testObject.nodes[0];
		var node2 = testObject.nodes[1];

		testObject.handleNodeClicked(node1);

		expect(testObject.nodes[0]).toBe(node2); // Mock node 2 should be bought to front.
		expect(testObject.nodes[1]).toBe(node1);
	});

	it('test control + mouse down toggles node selection', function () {

		var mockDataModel = createMockDataModel([ 1, 2, 3 ]);

		var testObject = new flowchart.ChartViewModel(mockDataModel);

		var node1 = testObject.nodes[0];
		var node2 = testObject.nodes[1];
		var node3 = testObject.nodes[2];

		node1.select(); // Mark node 1 as already selected.

		testObject.handleNodeClicked(node2, true);

		expect(node1.selected()).toBe(true);  // This node remains selected.
		expect(node2.selected()).toBe(true);  // This node is being toggled.
		expect(node3.selected()).toBe(false); // This node remains unselected.

		testObject.handleNodeClicked(node2, true);

		expect(node1.selected()).toBe(true);  // This node remains selected.
		expect(node2.selected()).toBe(false); // This node is being toggled.
		expect(node3.selected()).toBe(false); // This node remains unselected.

		testObject.handleNodeClicked(node2, true);

		expect(node1.selected()).toBe(true);  // This node remains selected.
		expect(node2.selected()).toBe(true);  // This node is being toggled.
		expect(node3.selected()).toBe(false); // This node remains unselected.
	});

	it('test mouse down deselects connections other than the one clicked', function () {

		var mockDataModel = createMockDataModel(
			[ 1, 2, 3 ],
			[
				[[ 1, 0 ], [ 3, 0 ]],
				[[ 2, 1 ], [ 3, 2 ]],
				[[ 1, 2 ], [ 3, 0 ]]
			]
		);

		var testObject = new flowchart.ChartViewModel(mockDataModel);

		var connection1 = testObject.connections[0];
		var connection2 = testObject.connections[1];
		var connection3 = testObject.connections[2];

		// Fake out the connections as selected.
		connection1.select();
		connection2.select();
		connection3.select();

		testObject.handleConnectionMouseDown(connection2);

		expect(connection1.selected()).toBe(false);
		expect(connection2.selected()).toBe(true);
		expect(connection3.selected()).toBe(false);
	});

	it('test node mouse down selects the clicked connection', function () {

		var mockDataModel = createMockDataModel(
			[ 1, 2, 3 ],
			[
				[[ 1, 0 ], [ 3, 0 ]],
				[[ 2, 1 ], [ 3, 2 ]],
				[[ 1, 2 ], [ 3, 0 ]]
			]
		);

		var testObject = new flowchart.ChartViewModel(mockDataModel);
		
		var connection1 = testObject.connections[0];
		var connection2 = testObject.connections[1];
		var connection3 = testObject.connections[2];

		testObject.handleConnectionMouseDown(connection3);

		expect(connection1.selected()).toBe(false);
		expect(connection2.selected()).toBe(false);
		expect(connection3.selected()).toBe(true);
	});	

	it('test control + mouse down toggles connection selection', function () {

		var mockDataModel = createMockDataModel(
			[ 1, 2, 3 ],
			[
				[[ 1, 0 ], [ 3, 0 ]],
				[[ 2, 1 ], [ 3, 2 ]],
				[[ 1, 2 ], [ 3, 0 ]]
			]
		);

		var testObject = new flowchart.ChartViewModel(mockDataModel);

		var connection1 = testObject.connections[0];
		var connection2 = testObject.connections[1];
		var connection3 = testObject.connections[2];

		connection1.select(); // Mark connection 1 as already selected.

		testObject.handleConnectionMouseDown(connection2, true);

		expect(connection1.selected()).toBe(true);  // This connection remains selected.
		expect(connection2.selected()).toBe(true);  // This connection is being toggle.
		expect(connection3.selected()).toBe(false); // This connection remains unselected.

		testObject.handleConnectionMouseDown(connection2, true);

		expect(connection1.selected()).toBe(true);  // This connection remains selected.
		expect(connection2.selected()).toBe(false); // This connection is being toggle.
		expect(connection3.selected()).toBe(false); // This connection remains unselected.

		testObject.handleConnectionMouseDown(connection2, true);

		expect(connection1.selected()).toBe(true);  // This connection remains selected.
		expect(connection2.selected()).toBe(true);  // This connection is being toggle.
		expect(connection3.selected()).toBe(false); // This connection remains unselected.
	});

 	it('test data-model is wrapped in view-model', function () {

		var mockDataModel = createMockDataModel([ 1, 2 ], [[[1, 0], [2, 0]]]);
		var mockNode = mockDataModel.nodes[0];
		var mockInputConnector = mockNode.inputConnectors[0];
		var mockOutputConnector = mockNode.outputConnectors[0];

		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		// Chart

		expect(testObject).toBeDefined();
		expect(testObject).toNotBe(mockDataModel);
		expect(testObject.data).toBe(mockDataModel);
		expect(testObject.nodes).toBeDefined();
		expect(testObject.nodes.length).toBe(2);

		// Node

		var node = testObject.nodes[0];

		expect(node).toNotBe(mockNode);
		expect(node.data).toBe(mockNode);

		// Connectors

		expect(node.inputConnectors.length).toBe(3);
		expect(node.inputConnectors[0].data).toBe(mockInputConnector);

		expect(node.outputConnectors.length).toBe(3);		
		expect(node.outputConnectors[0].data).toBe(mockOutputConnector);

		// Connection
 	
		expect(testObject.connections.length).toBe(1);
		expect(testObject.connections[0].source).toBe(testObject.nodes[0].outputConnectors[0]);
		expect(testObject.connections[0].dest).toBe(testObject.nodes[1].inputConnectors[0]);
 	});

	it('test can delete 1st selected node', function () {

		var mockDataModel = createMockDataModel([ 1, 2 ]);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		expect(testObject.nodes.length).toBe(2);

		testObject.nodes[0].select();

		var mockNode2 = mockDataModel.nodes[1];

		testObject.deleteSelected();

		expect(testObject.nodes.length).toBe(1);
		expect(mockDataModel.nodes.length).toBe(1);
		expect(testObject.nodes[0].data).toBe(mockNode2);
	});

	it('test can delete 2nd selected nodes', function () {

		var mockDataModel = createMockDataModel([ 1, 2 ]);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		expect(testObject.nodes.length).toBe(2);

		testObject.nodes[1].select();

		var mockNode1 = mockDataModel.nodes[0];

		testObject.deleteSelected();

		expect(testObject.nodes.length).toBe(1);
		expect(mockDataModel.nodes.length).toBe(1);
		expect(testObject.nodes[0].data).toBe(mockNode1);
	});

	it('test can delete multiple selected nodes', function () {

		var mockDataModel = createMockDataModel([ 1, 2, 3, 4 ]);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		expect(testObject.nodes.length).toBe(4);

		testObject.nodes[1].select();
		testObject.nodes[2].select();

		var mockNode1 = mockDataModel.nodes[0];
		var mockNode4 = mockDataModel.nodes[3];

		testObject.deleteSelected();

		expect(testObject.nodes.length).toBe(2);
		expect(mockDataModel.nodes.length).toBe(2);
		expect(testObject.nodes[0].data).toBe(mockNode1);
		expect(testObject.nodes[1].data).toBe(mockNode4);
	});
	
	it('deleting a node also deletes its connections', function () {

		var mockDataModel = createMockDataModel(
			[ 1, 2, 3 ],
			[
				[[ 1, 0 ], [ 2, 0 ]],
				[[ 2, 0 ], [ 3, 0 ]],
			]
		);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		expect(testObject.connections.length).toBe(2);

		// Select the middle node.
		testObject.nodes[1].select();

		testObject.deleteSelected();

		expect(testObject.connections.length).toBe(0);
	});

	it('deleting a node doesnt delete other connections', function () {

		var mockDataModel = createMockDataModel(
			[ 1, 2, 3 ],
			[
				[[ 1, 0 ], [ 3, 0 ],]
			]
		);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		expect(testObject.connections.length).toBe(1);

		// Select the middle node.
		testObject.nodes[1].select();

		testObject.deleteSelected();

		expect(testObject.connections.length).toBe(1);
	});

	it('test can delete 1st selected connection', function () {

		var mockDataModel = createMockDataModel(
			[ 1, 2 ],
			[
				[[ 1, 0 ], [ 2, 0 ]],
				[[ 2, 1 ], [ 1, 2 ]]
			]
		);

		var mockRemainingConnectionDataModel = mockDataModel.connections[1];

		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		expect(testObject.connections.length).toBe(2);

		testObject.connections[0].select();

		testObject.deleteSelected();

		expect(testObject.connections.length).toBe(1);
		expect(mockDataModel.connections.length).toBe(1);
		expect(testObject.connections[0].data).toBe(mockRemainingConnectionDataModel);
	});

	it('test can delete 2nd selected connection', function () {

		var mockDataModel = createMockDataModel(
			[ 1, 2 ],
			[
				[[ 1, 0 ], [ 2, 0 ]],
				[[ 2, 1 ], [ 1, 2 ]]
			]
		);

		var mockRemainingConnectionDataModel = mockDataModel.connections[0];

		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		expect(testObject.connections.length).toBe(2);

		testObject.connections[1].select();

		testObject.deleteSelected();

		expect(testObject.connections.length).toBe(1);
		expect(mockDataModel.connections.length).toBe(1);
		expect(testObject.connections[0].data).toBe(mockRemainingConnectionDataModel);
	});


	it('test can delete multiple selected connections', function () {

		var mockDataModel = createMockDataModel(
			[ 1, 2, 3 ],
			[
				[[ 1, 0 ], [ 2, 0 ]],
				[[ 2, 1 ], [ 1, 2 ]],
				[[ 1, 1 ], [ 3, 0 ]],
				[[ 3, 2 ], [ 2, 1 ]]
			]
		);

		var mockRemainingConnectionDataModel1 = mockDataModel.connections[0];
		var mockRemainingConnectionDataModel2 = mockDataModel.connections[3];

		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		expect(testObject.connections.length).toBe(4);

		testObject.connections[1].select();
		testObject.connections[2].select();

		testObject.deleteSelected();

		expect(testObject.connections.length).toBe(2);
		expect(mockDataModel.connections.length).toBe(2);
		expect(testObject.connections[0].data).toBe(mockRemainingConnectionDataModel1);
		expect(testObject.connections[1].data).toBe(mockRemainingConnectionDataModel2);
	});

	it('can select nodes via selection rect', function () {

		var mockDataModel = createMockDataModel([ 1, 2, 3 ]);
		mockDataModel.nodes[0].x = 0;
		mockDataModel.nodes[0].y = 0;
		mockDataModel.nodes[1].x = 1020;
		mockDataModel.nodes[1].y = 1020;
		mockDataModel.nodes[2].x = 3000;
		mockDataModel.nodes[2].y = 3000;

		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		testObject.nodes[0].select(); // Select a nodes, to ensure it is correctly deselected.

		testObject.applySelectionRect({ x: 1000, y: 1000, width: 1000, height: 1000 });

		expect(testObject.nodes[0].selected()).toBe(false);
		expect(testObject.nodes[1].selected()).toBe(true);
		expect(testObject.nodes[2].selected()).toBe(false);
	});

	it('can select connections via selection rect', function () {

		var mockDataModel = createMockDataModel(
			[ 1, 2, 3, 4 ],
			[
				[[ 1, 0 ], [ 2, 0 ]],
				[[ 2, 1 ], [ 3, 2 ]],
				[[ 3, 2 ], [ 4, 1 ]]
			]
		);
		mockDataModel.nodes[0].x = 0;
		mockDataModel.nodes[0].y = 0;
		mockDataModel.nodes[1].x = 1020;
		mockDataModel.nodes[1].y = 1020;
		mockDataModel.nodes[2].x = 1500;
		mockDataModel.nodes[2].y = 1500;
		mockDataModel.nodes[3].x = 3000;
		mockDataModel.nodes[3].y = 3000;

		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		testObject.connections[0].select(); // Select a connection, to ensure it is correctly deselected.

		testObject.applySelectionRect({ x: 1000, y: 1000, width: 1000, height: 1000 });

		expect(testObject.connections[0].selected()).toBe(false);
		expect(testObject.connections[1].selected()).toBe(true);
		expect(testObject.connections[2].selected()).toBe(false);
	});

	it('test update selected nodes location', function () {
		var mockDataModel = createMockDataModel([1]);
		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		var node = testObject.nodes[0];
		node.select();

		var xInc = 5;
		var yInc = 15;

		testObject.updateSelectedNodesLocation(xInc, yInc);

		expect(node.x()).toBe(xInc);
		expect(node.y()).toBe(yInc);
	});

	it('test update selected nodes location, ignores unselected nodes', function () {
		var mockDataModel = createMockDataModel([1]);
		var testObject = new flowchart.ChartViewModel(mockDataModel); 

		var node = testObject.nodes[0];

		var xInc = 5;
		var yInc = 15;

		testObject.updateSelectedNodesLocation(xInc, yInc);

		expect(node.x()).toBe(0);
		expect(node.y()).toBe(0);
	});

	it('test find node throws when there are no nodes', function () {
		var mockDataModel = createMockDataModel();

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(function () { testObject.findNode(150); }).toThrow();
	});

	it('test find node throws when node is not found', function () {
		var mockDataModel = createMockDataModel([5, 25, 15, 30]);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(function () { testObject.findNode(150); }).toThrow();
	});

	it('test find node retreives correct node', function () {
		var mockDataModel = createMockDataModel([5, 25, 15, 30]);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(testObject.findNode(15)).toBe(testObject.nodes[2]);
	});

	it('test find input connector throws when there are no nodes', function () {
		var mockDataModel = createMockDataModel();

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(function () { testObject.findInputConnector(150, 1); }).toThrow();
	});

	it('test find input connector throws when the node is not found', function () {
		var mockDataModel = createMockDataModel([ 1, 2, 3]);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(function () { testObject.findInputConnector(150, 1); }).toThrow();
	});

	it('test find input connector throws when there are no connectors', function () {
		var mockDataModel = createMockDataModel([ 1 ]);

		mockDataModel.nodes[0].inputConnectors = [];

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(function () { testObject.findInputConnector(1, 1); }).toThrow();
	});

	it('test find input connector throws when connector is not found', function () {
		var mockDataModel = createMockDataModel([5]);

		mockDataModel.nodes[0].inputConnectors = [ 
			{} // Only 1 input connector.
		];

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(function () { testObject.findInputConnector(5, 1); }).toThrow();
	});

	it('test find input connector retreives correct connector', function () {
		var mockDataModel = createMockDataModel([5, 25, 15, 30]);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(testObject.findInputConnector(15, 1)).toBe(testObject.nodes[2].inputConnectors[1]);
	});

	it('test find output connector throws when there are no nodes', function () {
		var mockDataModel = createMockDataModel();

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(function () { testObject.findOutputConnector(150, 1); }).toThrow();
	});

	it('test find output connector throws when the node is not found', function () {
		var mockDataModel = createMockDataModel([ 1, 2, 3]);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(function () { testObject.findOutputConnector(150, 1); }).toThrow();
	});

	it('test find output connector throws when there are no connectors', function () {
		var mockDataModel = createMockDataModel([ 1 ]);

		mockDataModel.nodes[0].outputConnectors = [];

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(function () { testObject.findOutputConnector(1, 1); }).toThrow();
	});

	it('test find output connector throws when connector is not found', function () {
		var mockDataModel = createMockDataModel([5]);

		mockDataModel.nodes[0].outputConnectors = [ 
			{} // Only 1 input connector.
		];

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(function () { testObject.findOutputConnector(5, 1); }).toThrow();
	});

	it('test find output connector retreives correct connector', function () {
		var mockDataModel = createMockDataModel([5, 25, 15, 30]);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		expect(testObject.findOutputConnector(15, 1)).toBe(testObject.nodes[2].outputConnectors[1]);
	});


	it('test create new connection', function () {

		var mockDataModel = createMockDataModel([5, 25]);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		var startConnector = testObject.nodes[0].outputConnectors[0];
		var endConnector = testObject.nodes[1].inputConnectors[1];

		testObject.createNewConnection(startConnector, endConnector);

		expect(testObject.connections.length).toBe(1);
		var connection = testObject.connections[0];
		expect(connection.source).toBe(startConnector);
		expect(connection.dest).toBe(endConnector);

		expect(testObject.data.connections.length).toBe(1);
		var connectionData = testObject.data.connections[0];
		expect(connection.data).toBe(connectionData);

		expect(connectionData.source.nodeID).toBe(5);
		expect(connectionData.source.connectorIndex).toBe(0);
		expect(connectionData.dest.nodeID).toBe(25);
		expect(connectionData.dest.connectorIndex).toBe(1);
	});

	it('test create new connection from input to output', function () {

		var mockDataModel = createMockDataModel([5, 25]);

		var testObject = new flowchart.ChartViewModel(mockDataModel);

		var startConnector = testObject.nodes[1].inputConnectors[1];
		var endConnector = testObject.nodes[0].outputConnectors[0];

		testObject.createNewConnection(startConnector, endConnector);

		expect(testObject.connections.length).toBe(1);
		var connection = testObject.connections[0];
		expect(connection.source).toBe(endConnector);
		expect(connection.dest).toBe(startConnector);

		expect(testObject.data.connections.length).toBe(1);
		var connectionData = testObject.data.connections[0];
		expect(connection.data).toBe(connectionData);

		expect(connectionData.source.nodeID).toBe(5);
		expect(connectionData.source.connectorIndex).toBe(0);
		expect(connectionData.dest.nodeID).toBe(25);
		expect(connectionData.dest.connectorIndex).toBe(1);
	});

	it('test get selected nodes results in empty array when there are no nodes', function () {

		var mockDataModel = createMockDataModel();

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		var selectedNodes = testObject.getSelectedNodes();

		expect(selectedNodes.length).toBe(0);
	});

	it('test get selected nodes results in empty array when none selected', function () {

		var mockDataModel = createMockDataModel([1, 2, 3, 4]);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		var selectedNodes = testObject.getSelectedNodes();

		expect(selectedNodes.length).toBe(0);
	});

	it('test can get selected nodes', function () {

		var mockDataModel = createMockDataModel([1, 2, 3, 4]);

		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		var node1 = testObject.nodes[0];
		var node2 = testObject.nodes[1];
		var node3 = testObject.nodes[2];
		var node4 = testObject.nodes[3];

		node2.select();
		node3.select();

		var selectedNodes = testObject.getSelectedNodes();

		expect(selectedNodes.length).toBe(2);
		expect(selectedNodes[0]).toBe(node2);
		expect(selectedNodes[1]).toBe(node3);	
	});

	it('test can get selected connections', function () {

		var mockDataModel = createMockDataModel(
			[ 1, 2, 3 ],
			[
				[[ 1, 0 ], [ 2, 0 ]],
				[[ 2, 1 ], [ 1, 2 ]],
				[[ 1, 1 ], [ 3, 0 ]],
				[[ 3, 2 ], [ 2, 1 ]]
			]
		);
		var testObject = new flowchart.ChartViewModel(mockDataModel); 		

		var connection1 = testObject.connections[0];
		var connection2 = testObject.connections[1];
		var connection3 = testObject.connections[2];
		var connection4 = testObject.connections[3];

		connection2.select();
		connection3.select();

		var selectedConnections = testObject.getSelectedConnections();

		expect(selectedConnections.length).toBe(2);
		expect(selectedConnections[0]).toBe(connection2);
		expect(selectedConnections[1]).toBe(connection3);	
	});
});
