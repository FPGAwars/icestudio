
//
// Define the 'app' module.
//
angular.module('app', ['flowChart', ])

//
// Application controller.
//
.controller('AppCtrl', ['$scope',
						'$document',
						'BitService',
						'IOService',
						'LogicService',
						'CombService',
						'SecService',
						'LabelService',
						function AppCtrl ($scope,
										  $document,
										  BitService,
									  	  IOService,
									      LogicService,
									      CombService,
									      SecService,
									      LabelService) {

	var fs = require('fs');
	var child_process = require('child_process');

	// Code for the delete key.
	var deleteKeyCode = 46;
	// Code for control key.
	var ctrlKeyCode = 17;
	// Set to true when the ctrl key is down.
	var ctrlDown = false;
	// Code for esc key.
	var escKeyCode = 27;
	// Selects the next node id.
	var nextNodeID = 10;

	$scope.showEditor = false;

	$scope.filepath = '../examples/example.json'

	$scope.reset = function () {
		nextNodeID = 10;
		data = { nodes: [], connections: [] }
		$scope.chartDataModel = data;
		$scope.chartViewModel = new flowchart.ChartViewModel(data);
	};

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
		fs.writeFile($scope.filepath, JSON.stringify($scope.chartDataModel, null, 2),  function(err) {
			if (!err) {
				return console.error(err);
			}
		});
	};

	$scope.build = function () {
		fs.writeFile($scope.filepath, JSON.stringify($scope.chartDataModel, null, 2),  function(err) {
			if (!err) {
				const pyresult = child_process.spawnSync('./build.py', [$scope.filepath]);
				if (pyresult.stdout.length !== 0) {
					process.chdir('..');
					const result = child_process.spawnSync('platformio', ['run']);
					if (result.stdout.length !== 0) {
						if (result.stdout.toString().indexOf('SUCCESS') != -1) {
							alertify.success("Build success");
						}
						else {
							alertify.error("Build fail");
						}
					}
					else {
						alertify.error("Compiler fail");
					}
					process.chdir('gui');
				}
				else {
					alertify.error("Compiler fail");
				}
			}
		});
	};

	$scope.upload = function () {
		process.chdir('..');
		const result = child_process.spawnSync('platformio', ['run', '--target', 'upload']);
		if (result.stdout.length !== 0) {
			if (result.stdout.toString().indexOf("SUCCESS") != -1) {
				alertify.success("Upload success");
			}
			else {
				alertify.error("Upload fail");
			}
		}
		else {
			alertify.error("Upload fail");
		}
		process.chdir('gui');
	};

	// Event handler for key-down on the flowchart.
	$scope.keyDown = function (evt) {

		if (evt.keyCode === ctrlKeyCode) {

			ctrlDown = true;
			evt.stopPropagation();
			evt.preventDefault();
		}
	};

	// Event handler for key-up on the flowchart.
	$scope.keyUp = function (evt) {

		if (evt.keyCode === deleteKeyCode) {
			// Delete key.
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
	// Bit
	//
	$scope.addNewDriver0Node = function () {
		BitService.addNewDriverNode(0, nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};
	$scope.addNewDriver1Node = function () {
		BitService.addNewDriverNode(1, nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};

	//
	// IO
	//
	$scope.addNewInputNode = function () {
		IOService.addNewInputNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};
	$scope.addNewOutputNode = function () {
		IOService.addNewOutputNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};

	//
	// Logic gates
	//
	$scope.addNewNotNode = function () {
		LogicService.addNewNotNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};
	$scope.addNewAndNode = function () {
		LogicService.addNewAndNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};
	$scope.addNewOrNode = function () {
		LogicService.addNewOrNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};
	$scope.addNewXorNode = function () {
		LogicService.addNewXorNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};

	//
	// Comb
	//
	$scope.addNewMuxNode = function () {
		CombService.addNewMuxNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};
	$scope.addNewDecNode = function () {
		CombService.addNewDecNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};
	$scope.addNewDivNode = function () {
		CombService.addNewDivNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};

	//
	// Sec
	//
	$scope.addNewFlipflopNode = function () {
		SecService.addNewFlipflopNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};
	$scope.addNewCounterNode = function () {
		SecService.addNewCounterNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};

	//
	// Label
	//
	$scope.addNewLabelInputNode = function () {
		LabelService.addNewLabelInputNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};
	$scope.addNewLabelOutputNode = function () {
		LabelService.addNewLabelOutputNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};

	// Delete selected nodes and connections.
	$scope.deleteSelected = function () {
		$scope.chartViewModel.deleteSelected();
	};

	// Show/Hide verilog editor
	$scope.toggleEditor = function () {
		document.getElementById('editor').style.opacity = '1.0';
		document.getElementById('editor').style.visibility = 'visible';
		$scope.showEditor = !$scope.showEditor;
		if ($scope.showEditor) {
			document.getElementById('BQLogo').style.opacity = '0.0';
			document.getElementById('warning').style.opacity = '0.0';
			document.getElementById('editor').style.height = '280px';
		}
		else {
			document.getElementById('editor').style.height = '0px';
			document.getElementById('BQLogo').style.opacity = '1.0';
			document.getElementById('warning').style.opacity = '1.0';
		}
	};
}]);
