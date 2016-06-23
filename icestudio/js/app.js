

    var os = require('os');
	var fs = require('fs');
    var path = require('path');
	var child_process = require('child_process');

    const WIN32 = Boolean(os.platform().indexOf('win32') > -1);
    const DARWIN = Boolean(os.platform().indexOf('darwin') > -1);

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
