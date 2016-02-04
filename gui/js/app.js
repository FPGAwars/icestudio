
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
						'LGService',
						'MoreService',
						function AppCtrl ($scope,
										  $document,
										  BitService,
									  	  IOService,
									      LGService,
									      MoreService) {

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
		LGService.addNewNotNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};
	$scope.addNewAndNode = function () {
		LGService.addNewAndNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};
	$scope.addNewOrNode = function () {
		LGService.addNewOrNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};
	$scope.addNewXorNode = function () {
		LGService.addNewXorNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};

	//
	// More
	//
	$scope.addNewDivNode = function () {
		MoreService.addNewDivNode(nextNodeID++, function (node) {
			$scope.chartViewModel.addNode(node);
		});
	};

	// Delete selected nodes and connections.
	$scope.deleteSelected = function () {
		$scope.chartViewModel.deleteSelected();
	};

}]);
