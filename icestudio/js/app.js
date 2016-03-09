
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
                    if (file) {
                        scope.load(file.path);
                    }
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

    var os = require('os');
	var fs = require('fs');
    var path = require('path');
	var child_process = require('child_process');

    // Load native UI library
    var gui = require('nw.gui');
    var win = gui.Window.get();

    const WIN32 = Boolean(os.platform().indexOf('win32') > -1);
    const DARWIN = Boolean(os.platform().indexOf('darwin') > -1);

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
    $scope.showTerminal = false;

    alertify.set({ delay: 2000 });

    var home = process.env.HOME || process.env.USERPROFILE;
    if (WIN32) {
        var apio = path.join(home, '.icestudio', 'Scripts', 'apio ');
    }
    else {
        var apio = path.join(home, '.icestudio', 'bin', 'apio ');
    }
    var apioProfile = path.join(home, '.apio', 'profile.json');

    var _pythonExecutableCached = null;
    // Get the system executable
    function getPythonExecutable() {
        if (!_pythonExecutableCached) {
            var executables;
            if (WIN32) {
                executables = ['python.exe', 'C:\\Python27\\python.exe'];
            } else {
                executables = ['python2.7', 'python'];
            }

            const args = ['-c', 'import sys; print \'.\'.join(str(v) for v in sys.version_info[:2])'];
            for (var i = 0; i < executables.length; i++) {
                const result = child_process.spawnSync(executables[i], args);
                if (0 === result.status && ('' + result.output).indexOf('2.7') > -1) {
                    _pythonExecutableCached = executables[i];
                }
            }

            if (!_pythonExecutableCached) {
                var html = '<p>Download and install <a href="https://www.python.org/downloads/">Python 2.7</a></p>';
                if (WIN32) {
                    html += '</br><p>DON\'T FORGET to select Add python.exe to Path \
                             feature on the \"Customize\" stage, otherwise Python Package \
                             Manager pip command will not be available.</p>';
                }
                swal({
                  title: 'Python 2.7 is not installed',
                  text: html,
                  html: true,
                  type: 'error',
                });
                document.getElementById('build').className += ' disabled';
                document.getElementById('upload').className += ' disabled';
                return null;
            }
        }
      return _pythonExecutableCached;
    }

    function checkApioExecutable() {
        child_process.exec(apio, function(error, stdout, stderr) {
            if (error) {
                disableToolchainButtons();
            }
        });
    }

    function checkToolchainInstalled() {
        fs.exists(apioProfile, function(exists) {
            var result = false;
            if (exists) {
                var data = JSON.parse(fs.readFileSync(apioProfile));
                result = 'tool-scons' in data && 'toolchain-icestorm' in data;
            }

            if (result) {
                document.getElementById('install-toolchain').innerHTML = 'Upgrade toolchain';
            }
            else {
                disableToolchainButtons();
            }
        });
    }

    function disableToolchainButtons() {
        swal({
          title: 'Toolchain is not installed',
          text: 'Please go to Edit > Install toolchain',
          type: 'error'
        });
        document.getElementById('build').className += ' disabled';
        document.getElementById('upload').className += ' disabled';
    }

    // Check backend
    if (getPythonExecutable()) {
        checkApioExecutable();
        checkToolchainInstalled();
    }

    // Build Examples dropdown
    var examplesArray = [];
    child_process.exec('ls examples', function(error, stdout, stderr) {
        if (!error) {
            examplesArray = stdout.toString().split('.json\n');
        }
        else {
          examplesArray = ['blink', 'blinkdec', 'counter', 'flipflopt', 'setbit'];
        }
    });

    $scope.installToolchain = function () {
        if (getPythonExecutable()) {
            var html = '<p>Please, wait until the installation is complete. \
                        It should take less than a minute. \
                        This process requires internet connection</p>\
                        </br></br><div><img src="img/spinner.gif"></div></br>';
            swal({
              title: 'Installing toolchain',
              text: html,
              html: true,
              showCancelButton: false,
              showConfirmButton: false,
              animation: 'none',
            });

            child_process.exec(getPythonExecutable() + ' install/install.py', function(error, stdout, stderr) {
                if (stderr) {
                    swal({
                      title: 'Error',
                      text: stderr,
                      type: 'error'
                    });
                }
                else {
                    swal({
                      title: 'Success',
                      type: 'success'
                    });
                    document.getElementById('build').className = 'dropdown';
                    document.getElementById('upload').className = 'dropdown';
                    document.getElementById('install-toolchain').innerHTML = 'Upgrade toolchain';
                }
            });
        }

        win.on('close', function() {
            // TODO: process kill
            this.close(true);
        });
    }



    $scope.examples = function () {
        swal({
          title: 'Examples',
          text: examplesArray.join(', '),
          type: 'input',
          showCancelButton: true,
          closeOnConfirm: true,
          animation: 'none',
          inputPlaceholder: 'blink'
        },
        function (example) {
            if (!example) {
              return false;
            }
            if ((example === "") || (examplesArray.indexOf(example) === -1)) {
              alertify.error('Example ' + example + ' does not exist');
              return false;
            }
            $scope.load('examples/' + example + '.json');
        });
    }

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
            alertify.success('New file created');
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
        alertify.success('File ' + name + ' loaded');
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
                alertify.success('File ' + name + ' saved');
			}
		});
	};

	$scope.build = function () {
        alertify.log('Building...');
		$scope.chartViewModel.deselectAll();
        document.getElementById('build').className += ' disabled';
		fs.writeFile('gen/main.json', JSON.stringify($scope.chartDataModel, null, 2),  function(err) {
			if (!err) {
                child_process.exec(apio + 'build', function(error, stdout, stderr) {
                    if (error) {
                        alertify.error('Build fail');
                    }
                    else if (stdout) {
                        if (stdout.toString().indexOf('Error 1') != -1) {
                            alertify.error('Build fail');
                        }
                        else {
                            alertify.success('Build success');
                        }
                    }
                    document.getElementById('build').className = 'dropdown';
                });
			}
		});
	};

	$scope.upload = function () {
        alertify.log('Uploading...');
		$scope.chartViewModel.deselectAll();
        document.getElementById('upload').className += ' disabled';
        child_process.exec(apio + 'upload', function(error, stdout, stderr) {
            if (error) {
                alertify.error('Upload fail');
            }
            else if (stdout) {
                if (stdout.toString().indexOf('Error 1') != -1) {
                    alertify.error('Upload fail');
                }
                else {
                    alertify.success('Upload success');
                }
            }
            document.getElementById('upload').className = 'dropdown';
        });
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
            $scope.showTerminal = false;
            document.getElementById('terminal').style.height = '0px';
			document.getElementById('BQLogo').style.display = 'none';
			document.getElementById('warning').style.display = 'none';
			document.getElementById('editor').style.height = '280px';
		}
		else {
			document.getElementById('editor').style.height = '0px';
			document.getElementById('BQLogo').style.display = 'block';
			document.getElementById('warning').style.display = 'block';
		}
	};

    var SerialPort = require('serialport');

    // Add serial ports list
    $scope.serialdata = {
        ports: [],
        baudRates: [9600, 19200, 38400, 57600, 115200],
        selectedPort: null,
        selectedBaudRate: 115200
    };

    function onTerminalShow() {
        SerialPort.list(function (err, ports) {
            $scope.serialdata.ports = [];
            ports.forEach(function(port) {
                if ((port.productId == '0x6010') &&
                    (port.vendorId == '0x0403') &&
                    (port.pnpId.indexOf('if01') != -1)) {
                    $scope.serialdata.ports.push(port.comName);
                    $scope.serialdata.selectedPort = port.comName;
                }
            });
        });
    }

    var div_terminal = document.getElementById('terminal-content');

    $scope.port = null;
    $scope.serialInput = null;

    $scope.serialOpen = function () {
        if (!$scope.port) {
            var openOptions = {
              baudRate: $scope.serialdata.selectedBaudRate,
              dataBits: 8,
              parity: 'none',
              stopBits: 1
            };

            $scope.port = new SerialPort.SerialPort($scope.serialdata.selectedPort, openOptions, false);

            $scope.port.on('open', function (error) {
                if (!error) {
                    $scope.port.on('data', function (data) {
                        div_terminal.innerHTML += data.toString();
                    });

                    $scope.port.on('error', function (err) {
                        console.log(err);
                    });

                    $scope.serialClear();
                    $scope.port.set({rts:false, dtr:false}, function(err, results) { });
                    $scope.port.flush();

                    document.getElementById('serial-status').style.fill = '#3DD738';
                }
            });

            $scope.port.open();
        }
    }

    $scope.serialClose = function () {
        if ($scope.port) {
            $scope.port.close(function (err) {
                $scope.port = null;
                document.getElementById('serial-status').style.fill = '#D75C37';
            });
        }
    }

    $scope.serialClear = function () {
        div_terminal.innerHTML = '';
        $scope.serialInput = '';
    }

    $scope.serialSend = function () {
        if ($scope.port) {
            $scope.port.write($scope.serialInput.toString(), function(err, results) {
                // console.log('err ' + err);
                // console.log('results ' + results);
            });
        }
    }

    // Show/Hide terminal
	$scope.toggleTerminal = function () {
		$scope.showTerminal = !$scope.showTerminal;
		if ($scope.showTerminal) {
            onTerminalShow();
            $scope.showEditor = false;
            document.getElementById('editor').style.height = '0px';
            document.getElementById('terminal').style.display = 'block';
			document.getElementById('BQLogo').style.display = 'none';
			document.getElementById('warning').style.display = 'none';
		}
		else {
			document.getElementById('terminal').style.display = 'none';
			document.getElementById('BQLogo').style.display = 'block';
			document.getElementById('warning').style.display = 'block';
		}
	};

    win.on('close', function() {
        if ($scope.port && $scope.port.isOpen()) {
            $scope.port.close();
        }
        this.close(true);
    });
}]);
