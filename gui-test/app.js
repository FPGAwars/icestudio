
//
// Define the 'app' module.
//
angular.module('app', ['flowChart', ])

//
// Simple service to create a prompt.
//
.factory('prompt', function () {

	/* Uncomment the following to test that the prompt service is working as expected.
	return function () {
		return "Test!";
	}
	*/

	// Return the browsers prompt function.
	return prompt;
})

//
// Application controller.
//
.controller('AppCtrl', ['$scope', '$http', 'prompt', function AppCtrl ($scope, $http, prompt) {

	//
	// Code for the delete key.
	//
	var deleteKeyCode = 46;

	//
	// Code for control key.
	//
	var ctrlKeyCode = 17;

	//
	// Set to true when the ctrl key is down.
	//
	var ctrlDown = false;

	//
	// Code for A key.
	//
	var aKeyCode = 65;

	//
	// Code for esc key.
	//
	var escKeyCode = 27;

	//
	// Selects the next node id.
	//
	var nextNodeID = 10;

	$scope.saveToPc = function () {

		var data = $scope.chartDataModel
		var filename = 'data.json'

		if (!data) {
			console.error('No data');
			return;
		}

		if (typeof data === 'object') {
			data = JSON.stringify(data, undefined, 2);
		}

		var blob = new Blob([data], {type: 'text/json'}),
		e = document.createEvent('MouseEvents'),
		a = document.createElement('a');

		a.download = filename;
		a.href = window.URL.createObjectURL(blob);
		a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
		e.initMouseEvent('click', true, false, window,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);
	};

	//
	// Setup the data-model for the chart.
	//
	$http.get('data.json').success (function(data) {

		$scope.chartDataModel = data
		$scope.chartViewModel = new flowchart.ChartViewModel(data);
	});

	//
	// Event handler for key-down on the flowchart.
	//
	$scope.keyDown = function (evt) {

		if (evt.keyCode === ctrlKeyCode) {

			ctrlDown = true;
			evt.stopPropagation();
			evt.preventDefault();
		}
	};

	//
	// Event handler for key-up on the flowchart.
	//
	$scope.keyUp = function (evt) {

		if (evt.keyCode === deleteKeyCode) {
			//
			// Delete key.
			//
			$scope.chartViewModel.deleteSelected();
		}

		if (evt.keyCode == aKeyCode && ctrlDown) {
			//
			// Ctrl + A
			//
			$scope.chartViewModel.selectAll();
		}

		if (evt.keyCode == escKeyCode) {
			// Escape.
			$scope.chartViewModel.deselectAll();
		}

		if (evt.keyCode === ctrlKeyCode) {
			ctrlDown = false;

			evt.stopPropagation();
			evt.preventDefault();
		}
	};

	//
	// Add a new input node to the chart.
	//
	$scope.addNewInputNode = function () {

		var pinValue = prompt("Enter the input pin:", "99");
		if (!pinValue) {
			return;
		}

		//
		// Template for a new input node.
		//
		var newInputNodeDataModel = {
			name: "",
			type: "input",
			value: pinValue,
			id: nextNodeID++,
			x: 0,
			y: 0,
			width: 60,
			outputConnectors: [
				{
					name: pinValue
				}
			],
		};

		$scope.chartViewModel.addNode(newInputNodeDataModel);
	};

	//
	// Add a new output node to the chart.
	//
	$scope.addNewOutputNode = function () {

		var pinValue = prompt("Enter the output pin:", "97");
		if (!pinValue) {
			return;
		}

		//
		// Template for a new output node.
		//
		var newOutputNodeDataModel = {
			name: "",
			type: "output",
			value: pinValue,
			id: nextNodeID++,
			x: 0,
			y: 0,
			width: 60,
			inputConnectors: [
				{
					name: pinValue
				}
			],
		};

		$scope.chartViewModel.addNode(newOutputNodeDataModel);
	};

	//
	// Add a new not gate node to the chart.
	//
	$scope.addNewNotGateNode = function () {

		//
		// Template for a new output node.
		//
		var newNotGateNodeDataModel = {
			name: "NOT",
			type: "not",
			id: nextNodeID++,
			x: 0,
			y: 0,
			width: 100,
			inline: "assign o0 = ! i0;",
			inputConnectors: [
				{
					name: ""
				}
			],
			outputConnectors: [
				{
					name: ""
				}
			],
		};

		$scope.chartViewModel.addNode(newNotGateNodeDataModel);
	};

	//
	// Add a new not gate node to the chart.
	//
	$scope.addNewAndGateNode = function () {

		//
		// Template for a new output node.
		//
		var newAndGateNodeDataModel = {
			name: "AND",
			type: "and",
			id: nextNodeID++,
			x: 0,
			y: 0,
			width: 100,
			inline: "assign o0 = i0 & i1;",
			inputConnectors: [
				{
					name: ""
				},
				{
					name: ""
				}
			],
			outputConnectors: [
				{
					name: ""
				}
			],
		};

		$scope.chartViewModel.addNode(newAndGateNodeDataModel);
	};

	//
	// Add a new not gate node to the chart.
	//
	$scope.addNewOrGateNode = function () {

		//
		// Template for a new output node.
		//
		var newOrGateNodeDataModel = {
			name: "OR",
			type: "or",
			id: nextNodeID++,
			x: 0,
			y: 0,
			width: 100,
			inline: "assign o0 = i0 | i1;",
			inputConnectors: [
				{
					name: ""
				},
				{
					name: ""
				}
			],
			outputConnectors: [
				{
					name: ""
				}
			],
		};

		$scope.chartViewModel.addNode(newOrGateNodeDataModel);
	};

	//
	// Add a new node to the chart.
	//
	$scope.addNewNode = function () {

		//var mydata = JSON.parse(data);
		//alert(mydata);

		var nodeName = prompt("Enter a node name:", "New node");
		if (!nodeName) {
			return;
		}

		//
		// Template for a new node.
		//
		var newNodeDataModel = {
			name: nodeName,
			id: nextNodeID++,
			x: 0,
			y: 0,
			inputConnectors: [
				{
					name: "X"
				},
				{
					name: "Y"
				},
				{
					name: "Z"
				}
			],
			outputConnectors: [
				{
					name: "1"
				},
				{
					name: "2"
				},
				{
					name: "3"
				}
			],
		};

		$scope.chartViewModel.addNode(newNodeDataModel);
	};

	//
	// Add an input connector to selected nodes.
	//
	$scope.addNewInputConnector = function () {
		var connectorName = prompt("Enter a connector name:", "New connector");
		if (!connectorName) {
			return;
		}

		var selectedNodes = $scope.chartViewModel.getSelectedNodes();
		for (var i = 0; i < selectedNodes.length; ++i) {
			var node = selectedNodes[i];
			node.addInputConnector({
				name: connectorName,
			});
		}
	};

	//
	// Add an output connector to selected nodes.
	//
	$scope.addNewOutputConnector = function () {
		var connectorName = prompt("Enter a connector name:", "New connector");
		if (!connectorName) {
			return;
		}

		var selectedNodes = $scope.chartViewModel.getSelectedNodes();
		for (var i = 0; i < selectedNodes.length; ++i) {
			var node = selectedNodes[i];
			node.addOutputConnector({
				name: connectorName,
			});
		}
	};

	//
	// Delete selected nodes and connections.
	//
	$scope.deleteSelected = function () {

		$scope.chartViewModel.deleteSelected();
	};

	//
	// Create the view-model for the chart and attach to the scope.
	//
	//$scope.chartViewModel = new flowchart.ChartViewModel(chartDataModel);
}])
;
