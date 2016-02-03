
//
// Define the 'app' module.
//
angular.module('app', ['flowChart', ])

//
// Application controller.
//
.controller('AppCtrl', ['$scope', '$document', 'BitService', function AppCtrl ($scope, $document, BitService) {

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
							//notie.alert(1, 'Build success!', 1.0);
							{};
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

	$scope.upload = function () {
		process.chdir('..');
		const result = child_process.spawnSync('platformio', ['run', '--target', 'upload']);
		if (result.stdout.length !== 0) {
			if (result.stdout.toString().indexOf("SUCCESS") !=-1) {
				//notie.alert(1, 'Run success!', 1.0);
				{};
			}
			else {
				notie.alert(3, 'Upload fail', 1.0);
			}
			console.log(result.stdout.toString());
		}
		else {
			notie.alert(3, 'Upload fail', 1.0);
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
	// TODO: move all blocks
	//

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
			width: 55,
			outputConnectors: [
				{
					name: "\"" + value.toString() + "\""
				}
			],
		};
	}

	$scope.addNewDriver0Node = function () {
		var newDriver0NodeDataModel = BitService.addNewDriverNode(0, nextNodeID++);
		$scope.chartViewModel.addNode(newDriver0NodeDataModel);
	};

	$scope.addNewDriver1Node = function () {
		var newDriver1NodeDataModel = BitService.addNewDriverNode(1, nextNodeID++);
		$scope.chartViewModel.addNode(newDriver1NodeDataModel);
	};

	//
	// Add a new input node to the chart.
	//
	$scope.addNewInputNode = function () {

		swal({
			title: "FPGA pin",
			text: "Enter the input pin:",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: true,
			animation: "none",
			inputPlaceholder: "44"
		},
		function(pinValue) {
			if (pinValue === false) return false;

			if (pinValue === "") {
				return false
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
		});
	};

	//
	// Add a new output node to the chart.
	//
	$scope.addNewOutputNode = function () {

		swal({
			title: "FPGA pin",
			text: "Enter the output pin:",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: true,
			animation: "none",
			inputPlaceholder: "95"
		},
		function(pinValue) {
			if (pinValue === false) return false;

			if (pinValue === "") {
				return false
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
		});
	};

	//
	// Add a new div node to the chart.
	//
	$scope.addNewDivNode = function () {

		swal({
			title: "Divider",
			text: "Enter the number of divisions",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: true,
			animation: "none",
			inputPlaceholder: "22"
		},
		function(divNumber) {
			if (divNumber === false) return false;

			if (divNumber === "") {
				return false
			}

			var newOutputNodeDataModel = {
				name: "DIV",
				type: "div" + divNumber.toString(),
				value: divNumber,
				id: nextNodeID++,
				x: 50,
				y: 100,
				width: 150,
				inline: "localparam N = " + divNumber.toString() + ";\nreg [N-1:0] c = 0;\nalways @(posedge i0)\nif (c == M - 1)\nc <= 0;\nelse \nc <= c + 1;\nassign o0 = c[N-1];",
				inputConnectors: [ { name: "clk" } ],
				outputConnectors: [ { name: divNumber.toString() } ]
			};

			$scope.chartViewModel.addNode(newOutputNodeDataModel);
		});
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

}]);
