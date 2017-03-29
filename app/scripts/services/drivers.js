'use strict';

angular.module('icestudio')
  .service('drivers', function(gettextCatalog,
                               profile,
                               common,
                               gui,
                               nodePath,
                               nodeSudo,
                               nodeChildProcess) {

    this.enable = function() {
      if (common.WIN32) {
        enableWindowsDrivers();
      }
      else if (common.DARWIN) {
        enableDarwinDrivers();
      }
      else {
        linuxDrivers(true);
      }
    };

    this.disable = function() {
      if (common.WIN32) {
        disableWindowsDrivers();
      }
      else if (common.DARWIN) {
        disableDarwinDrivers();
      }
      else {
        linuxDrivers(false);
      }
    };

    this.preUpload = function(callback) {
      if (common.DARWIN) {
        preUploadDarwin(callback);
      }
      else {
        if (callback) {
          callback();
        }
      }
    };

    this.postUpload = function() {
      if (common.DARWIN) {
        postUploadDarwin();
      }
   };

    function linuxDrivers(enable) {
      var commands;
      if (enable) {
        commands = [
          'cp ' + nodePath.resolve('resources/config/80-icestick.rules') + ' /etc/udev/rules.d/80-icestick.rules',
          'service udev restart'
        ];
      }
      else {
        commands = [
          'rm /etc/udev/rules.d/80-icestick.rules',
          'service udev restart'
        ];
      }
      var command = 'sh -c "' + commands.join('; ') + '"';

      beginLazyProcess();
      nodeSudo.exec(command, {name: 'Icestudio'}, function(error/*, stdout, stderr*/) {
        // console.log(error, stdout, stderr);
        endLazyProcess();
        if (!error) {
          if (enable) {
            alertify.success(gettextCatalog.getString('Drivers enabled'));
          }
          else {
            alertify.warning(gettextCatalog.getString('Drivers disabled'));
          }
          setTimeout(function() {
            alertify.message(gettextCatalog.getString('<b>Unplug</b> and <b>reconnect</b> the board'), 5);
          }, 1000);
        }
      });
    }

    function enableDarwinDrivers() {
      var brewCommands = [
        '/usr/local/bin/brew update',
        '/usr/local/bin/brew install --force libftdi',
        '/usr/local/bin/brew unlink libftdi',
        '/usr/local/bin/brew link --force libftdi',
        '/usr/local/bin/brew install --force libffi',
        '/usr/local/bin/brew unlink libffi',
        '/usr/local/bin/brew link --force libffi'
      ];
      beginLazyProcess();
      nodeChildProcess.exec(brewCommands.join('; '), function(error, stdout, stderr) {
        // console.log(error, stdout, stderr);
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
        endLazyProcess();
      });
    }

    function disableDarwinDrivers() {
      profile.set('macosDrivers', false);
      alertify.warning(gettextCatalog.getString('Drivers disabled'));
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
      else {
        if (callback) {
          callback();
        }
      }
    }

    function enableWindowsDrivers() {
      alertify.confirm(gettextCatalog.getString('<h4>FTDI driver installation instructions</h4><ol><li>Connect the FPGA board</li><li>Replace the <b>(Interface 0)</b> driver of the board by <b>libusbK</b></li><li>Unplug and reconnect the board</li></ol>') +
                       gettextCatalog.getString('It is recommended to use <b>USB 2.0</b> ports'),
      function() {
        beginLazyProcess();
        nodeSudo.exec([common.APIO_CMD, 'drivers', '--enable'].join(' '),  {name: 'Icestudio'}, function(error, stdout, stderr) {
          // console.log(error, stdout, stderr);
          endLazyProcess();
          if (stderr) {
            alertify.error(gettextCatalog.getString('Toolchain not installed. Please, install the toolchain'), 30);
          }
          else if (!error) {
            alertify.message(gettextCatalog.getString('<b>Unplug</b> and <b>reconnect</b> the board'), 5);
          }
        });
      });
    }

    function disableWindowsDrivers() {
      alertify.confirm(gettextCatalog.getString('<h4>FTDI driver uninstallation instructions</h4><ol><li>Find the FPGA USB Device</li><li>Select the board interface and uninstall the driver</li></ol>'), function() {
        beginLazyProcess();
        nodeChildProcess.exec([common.APIO_CMD, 'drivers', '--disable'].join(' '), function(error, stdout, stderr) {
          // console.log(error, stdout, stderr);
          endLazyProcess();
          if (stderr) {
            alertify.error(gettextCatalog.getString('Toolchain not installed. Please, install the toolchain'), 30);
          }
        });
      });
    }

    function beginLazyProcess() {
      $('body').addClass('waiting');
      angular.element('#menu').addClass('disable-menu');
    }

    function endLazyProcess() {
      $('body').removeClass('waiting');
      angular.element('#menu').removeClass('disable-menu');
    }

  });
