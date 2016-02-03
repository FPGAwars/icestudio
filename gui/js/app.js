
//
// Define the 'app' module.
//
angular.module('app', ['flowChart', ])

//
// Simple service to create a prompt.
//
.factory('prompt', function () {

	// Return the browsers prompt function.
	return prompt;
})

//
// Application controller.
//
.controller('AppCtrl', ['$scope', '$document', 'prompt', function AppCtrl ($scope, $document, prompt) {

	var fs = require('fs');
	//var notie = require('notie');
	var child_process = require('child_process');

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

	$scope.filepath = '../examples/example.ice'

	$scope.reset = function () {
		nextNodeID = 10;
		data = { nodes: [], connections: [] }
		$scope.chartDataModel = data;
		$scope.chartViewModel = new flowchart.ChartViewModel(data);
	}

	$scope.reset()

	$scope.load = function () {
		var data = JSON.parse(fs.readFileSync($scope.filepath));
		var max = nextNodeID;
		for (var i = 0; i < data.nodes.length; i++) {
			if (data.nodes[i].id > max) {
				max = data.nodes[i].id;
			}
		}
		nextNodeID = max + 1;
		$scope.chartDataModel = data;
		$scope.chartViewModel = new flowchart.ChartViewModel(data);
	};

	$scope.save = function () {
		fs.writeFile($scope.filepath, JSON.stringify($scope.chartDataModel),  function(err) {
			if (!err) {
				return console.error(err);
			}
		});
	};

	$scope.build = function () {
		fs.writeFile($scope.filepath, JSON.stringify($scope.chartDataModel),  function(err) {
			if (!err) {
				const pyresult = child_process.spawnSync('./build.py', [$scope.filepath]);
				if (pyresult.stdout.length !== 0) {
					console.log(pyresult.stdout.toString());
					process.chdir('..');
					const result = child_process.spawnSync('platformio', ['run']);
					if (result.stdout.length !== 0) {
						if (result.stdout.toString().indexOf('SUCCESS') !=-1) {
							notie.alert(1, 'Build success!', 1.0);
						}
						else {
							notie.alert(3, 'Build fail', 1.0);
						}
						console.log(result.stdout.toString());
					}
					else {
						notie.alert(3, 'Compiler fail', 1.0);
						console.log(result.stderr.toString());
					}
					process.chdir('gui');
				}
				else {
					notie.alert(3, 'Compiler fail', 1.0);
					console.log(pyresult.stderr.toString());
				}
			}
		});
	};

	$scope.run = function () {
		process.chdir('..');
		const result = child_process.spawnSync('platformio', ['run', '--target', 'upload']);
		if (result.stdout.length !== 0) {
			if (result.stdout.toString().indexOf("SUCCESS") !=-1) {
				notie.alert(1, 'Run success!', 1.0);
			}
			else {
				notie.alert(3, 'Run fail', 1.0);
			}
			console.log(result.stdout.toString());
		}
		else {
			notie.alert(3, 'Run fail', 1.0);
			console.log(result.stderr.toString());
		}
		process.chdir('gui');
	};

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
	// Add a new driver node to the chart.
	//
	$scope.addNewDriverNode = function (value) {
		return {
			name: "",
			type: "driver"+ value.toString(),
			value: value,
			inline: "assign o0 = 1'b" + value.toString() + ";",
			id: nextNodeID++,
			x: 50,
			y: 100,
			width: 50,
			outputConnectors: [
				{
					name: "\"" + value.toString() + "\""
				}
			],
		};
	}

	$scope.addNewDriver0Node = function () {

		//
		// Template for a new input node.
		//
		var newDriver0NodeDataModel = $scope.addNewDriverNode(0);
		$scope.chartViewModel.addNode(newDriver0NodeDataModel);
	};

	$scope.addNewDriver1Node = function () {

		//
		// Template for a new input node.
		//
		var newDriver1NodeDataModel = $scope.addNewDriverNode(1);
		$scope.chartViewModel.addNode(newDriver1NodeDataModel);
	};

	//
	// Add a new input node to the chart.
	//
	$scope.addNewInputNode = function () {

		var pinValue = prompt("Enter the input pin:", "44");
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
			x: 50,
			y: 100,
			width: 60,
			outputConnectors: [ { name: pinValue } ],
		};

		$scope.chartViewModel.addNode(newInputNodeDataModel);
	};

	//
	// Add a new output node to the chart.
	//
	$scope.addNewOutputNode = function () {

		var pinValue = prompt("Enter the output pin:", "95");
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
			x: 50,
			y: 100,
			width: 60,
			inputConnectors: [ { name: pinValue } ],
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
			x: 50,
			y: 100,
			width: 100,
			inline: "assign o0 = ! i0;",
			inputConnectors: [ { name: "" } ],
			outputConnectors: [ { name: "" } ],
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
			x: 50,
			y: 100,
			width: 100,
			inline: "assign o0 = i0 & i1;",
			inputConnectors: [ { name: "" }, { name: "" } ],
			outputConnectors: [ { name: "" } ],
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
			x: 50,
			y: 100,
			width: 100,
			inline: "assign o0 = i0 | i1;",
			inputConnectors: [ { name: "" }, { name: "" } ],
			outputConnectors: [ { name: "" } ],
		};

		$scope.chartViewModel.addNode(newOrGateNodeDataModel);
	};

	//
	// Add a new xor gate node to the chart.
	//
	$scope.addNewXorGateNode = function () {

		//
		// Template for a new output node.
		//
		var newXorGateNodeDataModel = {
			name: "XOR",
			type: "xor",
			id: nextNodeID++,
			x: 50,
			y: 100,
			width: 100,
			inline: "assign o0 = i0 ^ i1;",
			inputConnectors: [ { name: "" }, { name: "" } ],
			outputConnectors: [ { name: "" } ],
		};

		$scope.chartViewModel.addNode(newXorGateNodeDataModel);
	};

	//
	// Delete selected nodes and connections.
	//
	$scope.deleteSelected = function () {

		$scope.chartViewModel.deleteSelected();
	};

}])
;
