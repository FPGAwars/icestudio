
//
// Define the 'app' module.
//
angular.module('app', ['flowChart', ])

//
// Application 'action' directive.
//
.directive('action', function () {
    return {
        link: function (scope, elem, attr) {
			if (attr['action'] === 'load') {
				elem.bind('change', function (event) {
	                var file = event.target.files[0];
                    event.target.files.clear();
                    if (file) scope.load(file.path);
	            })
			}
			else if (attr['action'] === 'saveas') {
				elem.bind('change', function (event) {
	                var file = event.target.files[0];
                    event.target.files.clear();
                    if (file) {
                        var filepath = file.path;
                        if (! filepath.endsWith('.json')) {
                            filepath += '.json';
                        }
                        scope.saveas(filepath);
                    }
                })
            }
        }
	}
})

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

    // Load native UI library
    var gui = require('nw.gui');
    var win = gui.Window.get();

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

    alertify.set({ delay: 2000 });

    $scope.initialize = function () {
        nextNodeID = 10;
        win.title = 'Icestudio';
        $scope.filepath = '';
		$scope.chartDataModel = { nodes: [], connections: [] };
		$scope.chartViewModel = new flowchart.ChartViewModel($scope.chartDataModel);
    }

    $scope.initialize();

	$scope.new = function () {
        if ($scope.filepath !== '') {
            $scope.initialize();
            alertify.success("New file created");
            /*swal({
              title: "Open file",
              text: "There is an open file. Do you want to save it?",
              type: "warning",
              showCancelButton: true,
              confirmButtonText: "Yes",
              cancelButtonText: "No",
              closeOnConfirm: true,
              closeOnCancel: true
            },
            function(isConfirm){
                if (isConfirm) {
                    $scope.saveas($scope.filepath);
                }
            });*/
        }
	};

	$scope.load = function (filename) {
        $scope.filepath = filename;
        var name = filename.replace(/^.*[\\\/]/, '').split('.')[0];
        win.title = 'Icestudio - ' + name;
		var data = JSON.parse(fs.readFileSync(filename));
		var max = nextNodeID;
		for (var i = 0; i < data.nodes.length; i++) {
			if (data.nodes[i].id > max) {
				max = data.nodes[i].id;
			}
		}
		nextNodeID = max + 1;
		$scope.chartDataModel = data;
		$scope.chartViewModel = new flowchart.ChartViewModel(data);
        $scope.$digest();
        alertify.success("File " + name + " loaded");
	};

	$scope.save = function () {
        if ($scope.filepath === '') {
            document.getElementById('saveas').click();
        }
        else {
            $scope.saveas($scope.filepath);
        }
	};

    $scope.saveas = function (filename) {
        $scope.filepath = filename;
        var name = filename.replace(/^.*[\\\/]/, '').split('.')[0];
        win.title = 'Icestudio - ' + name;
		fs.writeFile(filename, JSON.stringify($scope.chartDataModel, null, 2),  function(err) {
			if (!err) {
                alertify.success("File " + name + " saved");
			}
		});
	};

	$scope.build = function () {
		$scope.chartViewModel.deselectAll();
		fs.writeFile('gen/main.json', JSON.stringify($scope.chartDataModel, null, 2),  function(err) {
			if (!err) {
				const result = child_process.spawnSync('apio', ['build']);
				if (result.stdout.length !== 0) {
					if (result.stdout.toString().indexOf('error') != -1) {
						alertify.error("Build fail");
					}
					else {
						alertify.success("Build success");
					}
				}
				else {
					alertify.error("Build fail");
				}
			}
		});
	};

	$scope.upload = function () {
		$scope.chartViewModel.deselectAll();
		const result = child_process.spawnSync('apio', ['upload']);
		if (result.stdout.length !== 0) {
			if (result.stdout.toString().indexOf("error") != -1) {
				alertify.error("Upload fail");
			}
			else {
				alertify.success("Upload success");
			}
		}
		else {
			alertify.error("Upload fail");
		}
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
	// Bit
	//
	$scope.addNewDriver0Node = function () {
		BitService.addNewDriverNode(0, nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};
	$scope.addNewDriver1Node = function () {
		BitService.addNewDriverNode(1, nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};

	//
	// IO
	//
	$scope.addNewInputNode = function () {
		IOService.addNewInputNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};
	$scope.addNewOutputNode = function () {
		IOService.addNewOutputNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};

	//
	// Logic gates
	//
	$scope.addNewNotNode = function () {
		LogicService.addNewNotNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};
	$scope.addNewAndNode = function () {
		LogicService.addNewAndNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};
	$scope.addNewOrNode = function () {
		LogicService.addNewOrNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};
	$scope.addNewXorNode = function () {
		LogicService.addNewXorNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};

	//
	// Comb
	//
	$scope.addNewMuxNode = function () {
		CombService.addNewMuxNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};
	$scope.addNewDecNode = function () {
		CombService.addNewDecNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};

	//
	// Sec
	//
	$scope.addNewDivNode = function () {
		SecService.addNewDivNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};
    $scope.addNewTimerNode = function () {
		SecService.addNewTimerNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};
	$scope.addNewCounterNode = function () {
		SecService.addNewCounterNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};
	$scope.addNewFlipflopNode = function () {
		SecService.addNewFlipflopNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};
	$scope.addNewNotesNode = function () {
		SecService.addNewNotesNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};

	//
	// Label
	//
	$scope.addNewLabelInputNode = function () {
		LabelService.addNewLabelInputNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
		});
	};
	$scope.addNewLabelOutputNode = function () {
		LabelService.addNewLabelOutputNode(nextNodeID, function (node, id) {
			$scope.chartViewModel.addNode(node);
			nextNodeID = id;
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
