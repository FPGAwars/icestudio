'use strict';

angular.module('icestudio')
  .service('drivers', function(gettextCatalog,
                               profile,
                               common,
                               gui,
                               utils,
                               nodePath,
                               nodeSudo,
                               nodeChildProcess,
                               $rootScope) {

    this.enable = function() {
      switch (common.selectedBoard.info.interface) {
        case 'FTDI':
          enableDriversFTDI();
          break;
        case 'Serial':
          enableDriversSerial();
          break;
        default:
          console.warn('No valid selected board interface');
      }
    };

    this.disable = function() {
      switch (common.selectedBoard.info.interface) {
        case 'FTDI':
          disableDriversFTDI();
          break;
        case 'Serial':
          disableDriversSerial();
          break;
        default:
          console.warn('No valid selected board interface');
      }
    };

    function enableDriversFTDI() {
      if (common.WIN32) {
        enableWindowsDriversFTDI();
      }
      else if (common.DARWIN) {
        enableDarwinDriversFTDI();
      }
      else {
        enableLinuxDriversFTDI();
      }
    }

    function enableDriversSerial() {
      if (common.WIN32) {
        enableWindowsDriversSerial();
      }
      else if (common.DARWIN) {
        enableDarwinDriversSerial();
      }
      else {
        enableLinuxDriversSerial();
      }
    }

    function disableDriversFTDI() {
      if (common.WIN32) {
        disableWindowsDriversFTDI();
      }
      else if (common.DARWIN) {
        disableDarwinDriversFTDI();
      }
      else {
        disableLinuxDriversFTDI();
      }
    }

    function disableDriversSerial() {
      if (common.WIN32) {
        disableWindowsDriversSerial();
      }
      else if (common.DARWIN) {
        disableDarwinDriversSerial();
      }
      else {
        disableLinuxDriversSerial();
      }
    }

    this.preUpload = function(callback) {
      if (common.DARWIN) {
        preUploadDarwin(callback);
      }
      else if (callback) {
        callback();
      }
    };

    this.postUpload = function() {
      if (common.DARWIN) {
        postUploadDarwin();
      }
   };

   /*
    * Linux drivers
    */

   function enableLinuxDriversFTDI() {
     var rules = '';
     rules += 'ATTRS{idVendor}==\\"0403\\", ATTRS{idProduct}==\\"6010\\", ';
     rules += 'MODE=\\"0660\\", GROUP=\\"plugdev\\", TAG+=\\"uaccess\\"';
     configureLinuxDrivers([
       'echo \'' + rules + '\' > /etc/udev/rules.d/80-fpga-ftdi.rules'
     ].concat(reloadRules()), function() {
       alertify.success(gettextCatalog.getString('Drivers enabled'));
     });
   }

   function disableLinuxDriversFTDI() {
     configureLinuxDrivers([
       'rm -f /etc/udev/rules.d/80-icestick.rules',
       'rm -f /etc/udev/rules.d/80-fpga-ftdi.rules'
     ].concat(reloadRules()), function() {
       alertify.warning(gettextCatalog.getString('Drivers disabled'));
     });
   }

   function enableLinuxDriversSerial() {
     var rules = '';
     rules += '# Disable ModemManager for BlackIce\n';
     rules += 'ATTRS{idVendor}==\\"0483\\", ATTRS{idProduct}==\\"5740\\", ENV{ID_MM_DEVICE_IGNORE}=\\"1\\"\n';
     rules += '# Disable ModemManager for TinyFPGA B2\n';
     rules += 'ATTRS{idVendor}==\\"1209\\", ATTRS{idProduct}==\\"2100\\", ENV{ID_MM_DEVICE_IGNORE}=\\"1\\"';
     configureLinuxDrivers([
       'echo \'' + rules + '\' > /etc/udev/rules.d/80-fpga-serial.rules'
     ].concat(reloadRules()), function() {
       alertify.success(gettextCatalog.getString('Drivers enabled'));
     });
   }

   function disableLinuxDriversSerial() {
     configureLinuxDrivers([
       'rm -f /etc/udev/rules.d/80-fpga-serial.rules'
     ].concat(reloadRules()), function() {
       alertify.warning(gettextCatalog.getString('Drivers disabled'));
     });
   }

   function reloadRules() {
     return [
       'udevadm control --reload-rules',
       'udevadm trigger',
       'service udev restart'
     ];
   }

   function configureLinuxDrivers(commands, callback) {
     var command = 'sh -c "' + commands.join('; ') + '"';
     utils.beginBlockingTask();
     nodeSudo.exec(command, {name: 'Icestudio'}, function(error/*, stdout, stderr*/) {
      // console.log(error, stdout, stderr);
      utils.endBlockingTask();
      if (!error) {
        if (callback) {
          callback();
        }
        setTimeout(function() {
            alertify.message(gettextCatalog.getString('<b>Unplug</b> and <b>reconnect</b> the board'), 5);
          }, 1000);
        }
      });
    }

    /*
     * Darwin drivers
     */

    function enableDarwinDriversFTDI() {
      var brewCommands = [
        '/usr/local/bin/brew update',
        '/usr/local/bin/brew install --force libftdi',
        '/usr/local/bin/brew unlink libftdi',
        '/usr/local/bin/brew link --force libftdi',
        '/usr/local/bin/brew install --force libffi',
        '/usr/local/bin/brew unlink libffi',
        '/usr/local/bin/brew link --force libffi'
      ];
      utils.beginBlockingTask();
      nodeChildProcess.exec(brewCommands.join('; '), function(error, stdout, stderr) {
        if (error) {
          if ((stderr.indexOf('brew: command not found') !== -1) ||
              (stderr.indexOf('brew: No such file or directory') !== -1)) {
            alertify.warning(gettextCatalog.getString('{{app}} is required.', { app: '<b>Homebrew</b>' }) + '<br>' +
                             '<u>' + gettextCatalog.getString('Click here to install it') + '</u>', 30)
            .callback = function(isClicked) {
              if (isClicked) {
                gui.Shell.openExternal('https://brew.sh');
              }
            };
          }
          else if (stderr.indexOf('Error: Failed to download') !== -1) {
            alertify.error(gettextCatalog.getString('Internet connection required'), 30);
          }
          else {
            alertify.error(stderr, 30);
          }
        }
        else {
          profile.set('macosDrivers', true);
          alertify.success(gettextCatalog.getString('Drivers enabled'));
        }
        utils.endBlockingTask();
      });
    }

    function disableDarwinDriversFTDI() {
      profile.set('macosDrivers', false);
      alertify.warning(gettextCatalog.getString('Drivers disabled'));
    }

    function enableDarwinDriversSerial() {
      // TODO
    }

    function disableDarwinDriversSerial() {
      // TODO
    }

    var driverC = '';

    function preUploadDarwin(callback) {
      if (profile.get('macosDrivers')) {
        // Check and unload the Drivers
        var driverA = 'com.FTDI.driver.FTDIUSBSerialDriver';
        var driverB = 'com.apple.driver.AppleUSBFTDI';
        if (checkDriverDarwin(driverA)) {
          driverC = driverA;
          processDriverDarwin(driverA, false, callback);
        }
        else if (checkDriverDarwin(driverB)) {
          driverC = driverB;
          processDriverDarwin(driverB, false, callback);
        }
        else {
          driverC = '';
          if (callback) {
            callback();
          }
        }
      }
      else {
        if (callback) {
          callback();
        }
      }
    }

    function postUploadDarwin() {
      if (profile.get('macosDrivers')) {
        processDriverDarwin(driverC, true);
      }
    }

    function checkDriverDarwin(driver) {
      var output = nodeChildProcess.execSync('kextstat').toString();
      return output.indexOf(driver) > -1;
    }

    function processDriverDarwin(driver, load, callback) {
      if (driver) {
        var command = (load ? 'kextload' : 'kextunload') + ' -b ' + driver;
        nodeSudo.exec(command, {name: 'Icestudio'}, function(/*error, stdout, stderr*/) {
          //console.log(error, stdout, stderr);
          if (callback) {
            callback();
          }
        });
      }
      else if (callback) {
        callback();
      }
    }

    /*
     * Windows drivers
     */

    function enableWindowsDriversFTDI() {
      alertify.confirm(gettextCatalog.getString('<h4>FTDI driver installation instructions</h4><ol><li>Connect the FPGA board</li><li>Replace the <b>(Interface 0)</b> driver of the board by <b>libusbK</b></li><li>Unplug and reconnect the board</li></ol>') +
                       gettextCatalog.getString('It is recommended to use <b>USB 2.0</b> ports'),
      function() {
        utils.beginBlockingTask();
        nodeSudo.exec([common.APIO_CMD, 'drivers', '--enable'].join(' '),  {name: 'Icestudio'}, function(error, stdout, stderr) {
          // console.log(error, stdout, stderr);
          utils.endBlockingTask();
          if (stderr) {
            alertify.error(gettextCatalog.getString('Toolchain not installed') + '.<br>' + gettextCatalog.getString('Click here to install it'), 30)
            .callback = function(isClicked) {
              if (isClicked) {
                $rootScope.$broadcast('installToolchain');
              }
            };
          }
          else if (!error) {
            alertify.message(gettextCatalog.getString('<b>Unplug</b> and <b>reconnect</b> the board'), 5);
          }
        });
      });
    }

    function disableWindowsDriversFTDI() {
      alertify.confirm(gettextCatalog.getString('<h4>FTDI driver uninstallation instructions</h4><ol><li>Find the FPGA USB Device</li><li>Select the board interface and uninstall the driver</li></ol>'),
      function() {
        utils.beginBlockingTask();
        nodeChildProcess.exec([common.APIO_CMD, 'drivers', '--disable'].join(' '), function(error, stdout, stderr) {
          // console.log(error, stdout, stderr);
          utils.endBlockingTask();
          if (stderr) {
            alertify.error(gettextCatalog.getString('Toolchain not installed') + '.<br>' + gettextCatalog.getString('Click here to install it'), 30)
            .callback = function(isClicked) {
              if (isClicked) {
                $rootScope.$broadcast('installToolchain');
              }
            };
          }
        });
      });
    }

    function enableWindowsDriversSerial() {
      // TODO
    }

    function disableWindowsDriversSerial() {
      // TODO
    }

  });
