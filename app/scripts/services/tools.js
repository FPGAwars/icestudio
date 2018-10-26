'use strict';

angular.module('icestudio')
  .service('tools', function(project,
                             compiler,
                             profile,
                             collections,
                             drivers,
                             graph,
                             utils,
                             common,
                             gettextCatalog,
                             gettext,
                             nodeGettext,
                             nodeFs,
                             nodeFse,
                             nodePath,
                             nodeChildProcess,
                             nodeSSHexec,
                             nodeRSync,
                             nodeAdmZip,
                             _package,
                             $rootScope) {

    var taskRunning = false;
    var resources = [];
    var startAlert = null;
    var infoAlert = null;
    var resultAlert = null;
    var toolchainAlert = null;
    var toolchain = { apio: '-', installed: false, disabled: false };

    this.toolchain = toolchain;

    // Remove old build directory on start
    nodeFse.removeSync(common.OLD_BUILD_DIR);

    this.verifyCode = function(startMessage, endMessage) {
      return apioRun(['verify'], startMessage, endMessage);
    };

    this.buildCode = function(startMessage, endMessage) {
      return apioRun(['build', '--board', common.selectedBoard.name], startMessage, endMessage);
    };

    this.uploadCode = function(startMessage, endMessage) {
      return apioRun(['upload', '--board', common.selectedBoard.name], startMessage, endMessage);
    };

    function apioRun(commands, startMessage, endMessage) {
      return new Promise(function(resolve) {
        var sourceCode = '';

        if (!taskRunning) {
          taskRunning = true;

          if (infoAlert) {
            infoAlert.dismiss(false);
          }

          if (resultAlert) {
            resultAlert.dismiss(false);
          }

          graph.resetCodeErrors()
          .then(function() {
            return checkToolchainInstalled();
          })
          .then(function() {
            utils.beginBlockingTask();
            if (startMessage) {
              startAlert = alertify.message(startMessage, 100000);
            }
            return generateCode();
          })
          .then(function(output) {
            sourceCode = output.code;
            return syncResources(output.code, output.internalResources);
          })
          .then(function() {
            var hostname = profile.get('remoteHostname');
            var command = commands[0];
            if (command === 'build' || command === 'upload') {
              if (profile.get('showFPGAResources')) {
                commands = commands.concat('--verbose-arachne');
              }
            }
            if (hostname) {
              return executeRemote(commands, hostname);
            }
            else {
              return executeLocal(commands);
            }
          })
          .then(function(result) {
            return processResult(result, sourceCode);
          })
          .then(function() {
            // Success
            if (endMessage) {
              resultAlert = alertify.success(gettextCatalog.getString(endMessage));
            }
            utils.endBlockingTask();
            restoreTask();
            resolve();
          })
          .catch(function() {
            // Error
            utils.endBlockingTask();
            restoreTask();
          });
        }
      });
    }

    function restoreTask() {
      setTimeout(function() {
        // Wait 1s before run a task again
        if (startAlert) {
          startAlert.dismiss(false);
        }
        taskRunning = false;
      }, 1000);
    }

    function checkToolchainInstalled() {
      return new Promise(function(resolve, reject) {
        if (toolchain.installed) {
          resolve();
        }
        else {
          toolchainNotInstalledAlert(gettextCatalog.getString('Toolchain not installed'));
          reject();
        }
      });
    }

    function generateCode() {
      return new Promise(function(resolve) {
        project.update();
        var opt = {
          datetime: false,
          boardRules: profile.get('boardRules')
        };
        if (opt.boardRules) {
          opt.initPorts = compiler.getInitPorts(project.get());
          opt.initPins = compiler.getInitPins(project.get());
        }

        // Verilog file
        var verilogFile = compiler.generate('verilog', project.get(), opt)[0];
        nodeFs.writeFileSync(nodePath.join(common.BUILD_DIR, verilogFile.name), verilogFile.content, 'utf8');

        // PCF file
        var pcfFile = compiler.generate('pcf', project.get(), opt)[0];
        nodeFs.writeFileSync(nodePath.join(common.BUILD_DIR, pcfFile.name), pcfFile.content, 'utf8');

        // List files
        var listFiles = compiler.generate('list', project.get());
        for (var i in listFiles) {
          var listFile = listFiles[i];
          nodeFs.writeFileSync(nodePath.join(common.BUILD_DIR, listFile.name), listFile.content, 'utf8');
        }
        resolve({
          code: verilogFile.content,
          internalResources: listFiles.map(function (res) { return res.name; })
        });
      });
    }

    function syncResources(code, internalResources) {
      return new Promise(function(resolve, reject) {
        // Remove resources
        removeFiles(resources);
        resources = [];
        // Find included files
        resources = resources.concat(findIncludedFiles(code));
        // Find list files
        resources = resources.concat(findInlineFiles(code));
        // Sync resources
        resources = _.uniq(resources);
        // Remove internal files
        resources = _.difference(resources, internalResources);
        syncFiles(resources, reject);
        resolve();
      });
    }

    function removeFiles(files) {
      _.each(files, function(file) {
        var filepath = nodePath.join(common.BUILD_DIR, file);
        nodeFse.removeSync(filepath);
      });
    }

    function findIncludedFiles(code) {
      return findFiles(/[\n|\s]\/\/\s*@include\s+([^\s]*\.(v|vh|list))(\n|\s)/g, code);
    }

    function findInlineFiles(code) {
      return findFiles(/[\n|\s][^\/]?\"(.*\.list?)\"/g, code);
    }

    // TODO: duplicated: utils findIncludedFiles
    function findFiles(pattern, code) {
      var match;
      var files = [];
      while (match = pattern.exec(code)) {
        files.push(match[1]);
      }
      return files;
    }

    function syncFiles(files, reject) {
      _.each(files, function(file) {
        var destPath = nodePath.join(common.BUILD_DIR, file);
        var origPath = nodePath.join(utils.dirname(project.filepath), file);

        // Copy file
        var copySuccess = utils.copySync(origPath, destPath);
        if (!copySuccess) {
          resultAlert = alertify.error(gettextCatalog.getString('File {{file}} does not exist', { file: file }), 30);
          reject();
        }
      });
    }

    this.checkToolchain = checkToolchain;

    function checkToolchain(callback) {
      var apio = utils.getApioExecutable();
      nodeChildProcess.exec([apio, '--version'].join(' '), function(error, stdout/*, stderr*/) {
        if (error) {
          toolchain.apio = '';
          toolchain.installed = false;
          // Apio not installed
          toolchainNotInstalledAlert(gettextCatalog.getString('Toolchain not installed'));
          if (callback) {
            callback();
          }
        }
        else {
          toolchain.apio = stdout.match(/apio,\sversion\s(.+)/i)[1];
          toolchain.installed = toolchain.apio >= _package.apio.min &&
                                toolchain.apio < _package.apio.max;
          if (toolchain.installed) {
            nodeChildProcess.exec([apio, 'clean', '-p', common.SAMPLE_DIR].join(' '), function(error/*, stdout, stderr*/) {
              toolchain.installed = !error;
              if (error) {
                toolchain.apio = '';
                // Toolchain not properly installed
                toolchainNotInstalledAlert(gettextCatalog.getString('Toolchain not installed'));
              }
              if (callback) {
                callback();
              }
            });
          }
          else {
            // An old version is installed
            toolchainNotInstalledAlert(gettextCatalog.getString('Toolchain version does not match'));
            if (callback) {
              callback();
            }
          }
        }
      });
    }

    function toolchainNotInstalledAlert(message) {
      if (resultAlert) {
        resultAlert.dismiss(false);
      }
      resultAlert = alertify.warning(message + '.<br>' + gettextCatalog.getString('Click here to install it'), 100000);
      resultAlert.callback = function(isClicked) {
        if (isClicked) {
          // Install the new toolchain
          $rootScope.$broadcast('installToolchain');
        }
      };
    }

    function executeRemote(commands, hostname) {
      return new Promise(function(resolve) {
        startAlert.setContent(gettextCatalog.getString('Synchronize remote files ...'));
        nodeRSync({
          src: common.BUILD_DIR + '/',
          dest: hostname + ':.build/',
          ssh: true,
          recursive: true,
          delete: true,
          include: ['*.v', '*.pcf', '*.list'],
          exclude: ['.sconsign.dblite', '*.out', '*.blif', '*.asc', '*.bin']
        }, function (error, stdout, stderr/*, cmd*/) {
          if (!error) {
            startAlert.setContent(gettextCatalog.getString('Execute remote {{label}} ...', { label: '' }));
            nodeSSHexec((['apio'].concat(commands).concat(['--project-dir', '.build'])).join(' '), hostname,
              function (error, stdout, stderr) {
                resolve({ error: error, stdout: stdout, stderr: stderr });
              });
          }
          else {
            resolve({ error: error, stdout: stdout, stderr: stderr });
          }
        });
      });
    }

    function executeLocal(commands) {
      return new Promise(function(resolve) {
        if (commands[0] === 'upload') {
          // Upload command requires drivers setup (Mac OS)
          drivers.preUpload(function() {
            _executeLocal();
          });
        }
        else {
          // Other !upload commands
          _executeLocal();
        }

        function _executeLocal() {
          var apio = utils.getApioExecutable();
          var command = ([apio].concat(commands).concat(['-p', utils.coverPath(common.BUILD_DIR)])).join(' ');
          nodeChildProcess.exec(command,
            { maxBuffer: 5000 * 1024 },  // To avoid buffer overflow
            function(error, stdout, stderr) {
              if (commands[0] === 'upload') {
                // Upload command requires to restore the drivers (Mac OS)
                drivers.postUpload();
              }
              common.commandOutput = command + '\n\n' + stdout + stderr;
              $(document).trigger('commandOutputChanged', [common.commandOutput]);
              resolve({ error: error, stdout: stdout, stderr: stderr });
            });
        }
      });
    }

    function processResult(result, code) {
      result = result || {};
      var _error = result.error;
      var stdout = result.stdout;
      var stderr = result.stderr;

      return new Promise(function(resolve, reject) {
        if (_error || stderr) {
          // -- Process errors
          reject();

          if (stdout) {
            var boardName = common.selectedBoard.name;
            var boardLabel = common.selectedBoard.info.label;
            // - Apio errors
            if ((stdout.indexOf('Error: board ' + boardName + ' not connected') !== -1) ||
                (stdout.indexOf('USBError') !== -1) ||
                (stdout.indexOf('Activate bootloader') !== -1)) {
              var errorMessage = gettextCatalog.getString('Board {{name}} not connected', { name: utils.bold(boardLabel) });
              if (stdout.indexOf('Activate bootloader') !== -1) {
                if (common.selectedBoard.name.startsWith('TinyFPGA-B')) {
                  // TinyFPGA bootloader notification
                  errorMessage += '</br>(' + gettextCatalog.getString('Bootloader not active') + ')';
                }
              }
              resultAlert = alertify.error(errorMessage, 30);
            }
            else if (stdout.indexOf('Error: board ' + boardName + ' not available') !== -1) {
              resultAlert = alertify.error(gettextCatalog.getString('Board {{name}} not available', { name: utils.bold(boardLabel) }), 30);
              setupDriversAlert();
            }
            else if (stdout.indexOf('Error: unknown board') !== -1) {
              resultAlert = alertify.error(gettextCatalog.getString('Unknown board'), 30);
            }
            else if (stdout.indexOf('[upload] Error') !== -1) {
              switch (common.selectedBoard.name) {
                // TinyFPGA-B2 programmer errors
                case 'TinyFPGA-B2':
                case 'TinyFPGA-BX':
                  var match = stdout.match(/Bootloader\snot\sactive/g);
                  if (match && match.length === 3) {
                    resultAlert = alertify.error(gettextCatalog.getString('Bootloader not active'), 30);
                  }
                  else if (stdout.indexOf('Device or resource busy') !== -1) {
                    resultAlert = alertify.error(gettextCatalog.getString('Board {{name}} not available', { name: utils.bold(boardLabel) }), 30);
                    setupDriversAlert();
                  }
                  else if (stdout.indexOf('device disconnected or multiple access on port') !== -1) {
                    resultAlert = alertify.error(gettextCatalog.getString('Board {{name}} disconnected', { name: utils.bold(boardLabel) }), 30);
                  }
                  else {
                    resultAlert = alertify.error(gettextCatalog.getString(stdout), 30);
                  }
                  break;
                default:
                  resultAlert = alertify.error(gettextCatalog.getString(stdout), 30);
              }
              console.warn(stdout);
            }
            // Yosys error (Mac OS)
            else if (stdout.indexOf('Library not loaded:') !== -1 &&
                     stdout.indexOf('libffi') !== -1) {
              resultAlert = alertify.error(gettextCatalog.getString('Configuration not completed'), 30);
              setupDriversAlert();
            }
            // - Arachne-pnr errors
            else if (stdout.indexOf('set_io: too few arguments') !== -1 ||
                     stdout.indexOf('fatal error: unknown pin') !== -1) {
              resultAlert = alertify.error(gettextCatalog.getString('FPGA I/O ports not defined'), 30);
            }
            else if (stdout.indexOf('fatal error: duplicate pin constraints') !== -1) {
              resultAlert = alertify.error(gettextCatalog.getString('Duplicated FPGA I/O ports'), 30);
            }
            else {
              var re, matchError, codeErrors = [];

              // - Iverilog errors & warnings
              // main.v:#: error: ...
              // main.v:#: warning: ...
              // main.v:#: syntax error
              re = /main.v:([0-9]+):\s(error|warning):\s(.*?)[\r|\n]/g;
              while (matchError = re.exec(stdout)) {
                codeErrors.push({
                  line: parseInt(matchError[1]),
                  msg: matchError[3].replace(/\sin\smain\..*$/, ''),
                  type: matchError[2]
                });
              }
              re = /main.v:([0-9]+):\ssyntax\serror[\r|\n]/g;
              while (matchError = re.exec(stdout)) {
                codeErrors.push({
                  line: parseInt(matchError[1]),
                  msg: 'Syntax error',
                  type: 'error'
                });
              }

              // - Yosys errors
              // ERROR: ... main.v:#...
              // Warning: ... main.v:#...
              re = /(ERROR|Warning):\s(.*?)\smain\.v:([0-9]+)(.*?)[\r|\n]/g;
              while (matchError = re.exec(stdout)) {
                var msg = '';
                var line = parseInt(matchError[3]);
                var type = matchError[1].toLowerCase();
                var preContent = matchError[2];
                var postContent = matchError[4];
                // Process error
                if (preContent === 'Parser error in line') {
                  postContent = postContent.substring(2); // remove :\s
                  if (postContent.startsWith('syntax error')) {
                    postContent = 'Syntax error';
                  }
                  msg = postContent;
                }
                else if (preContent.endsWith(' in line ')) {
                  msg = preContent.replace(/\sin\sline\s$/, ' ') + postContent;
                }
                else {
                  preContent = preContent.replace(/\sat\s$/, '');
                  preContent = preContent.replace(/\sin\s$/, '');
                  msg = preContent;
                }
                codeErrors.push({
                  line: line,
                  msg: msg,
                  type: type
                });
              }

              // Extract modules map from code
              var modules = mapCodeModules(code);
              var hasErrors = false;
              var hasWarnings = false;
              for (var i in codeErrors) {
                var codeError = normalizeCodeError(codeErrors[i], modules);
                if (codeError) {
                  // Launch codeError event
                  $(document).trigger('codeError', [codeError]);
                  hasErrors = hasErrors || codeError.type === 'error';
                  hasWarnings = hasWarnings || codeError.type === 'warning';
                }
              }

              if (hasErrors) {
                resultAlert = alertify.error(gettextCatalog.getString('Errors detected in the design'), 5);
              }
              else {
                if (hasWarnings) {
                  resultAlert = alertify.warning(gettextCatalog.getString('Warnings detected in the design'), 5);
                }

                // var stdoutWarning = stdout.split('\n').filter(function (line) {
                //   line = line.toLowerCase();
                //   return (line.indexOf('warning: ') !== -1);
                // });
                var stdoutError = stdout.split('\n').filter(function (line) {
                  line = line.toLowerCase();
                  return (line.indexOf('error: ') !== -1 ||
                          line.indexOf('not installed') !== -1 ||
                          line.indexOf('already declared') !== -1);
                });
                // stdoutWarning.forEach(function (warning) {
                //   alertify.warning(warning, 20);
                // });
                if (stdoutError.length > 0) {
                  // Show first error
                  var error = '';
                  // hardware.blif:#: fatal error: ...
                  re = /hardware\.blif:([0-9]+):\sfatal\serror:\s(.*)/g;
                  if (matchError = re.exec(stdoutError[0])) {
                    error = matchError[2];
                  }
                  resultAlert = alertify.error(error, 30);
                }
                else {
                  resultAlert = alertify.error(stdout, 30);
                }
              }
            }
          }
          else if (stderr) {
            // Remote hostname errors
            if (stderr.indexOf('Could not resolve hostname') !== -1 ||
                stderr.indexOf('Connection refused') !== -1) {
              resultAlert = alertify.error(gettextCatalog.getString('Wrong remote hostname {{name}}', { name: profile.get('remoteHostname') }), 30);
            }
            else if (stderr.indexOf('No route to host') !== -1) {
              resultAlert = alertify.error(gettextCatalog.getString('Remote host {{name}} not connected', { name: profile.get('remoteHostname') }), 30);
            }
            else {
              resultAlert = alertify.error(stderr, 30);
            }
          }
        }
        else {
          //-- Process output
          resolve();

          if (stdout) {
            // Show used resources in the FPGA
            common.FPGAResources.ffs = findValue(/DFF\s+([0-9]+)\s/g, stdout, common.FPGAResources.ffs);
            common.FPGAResources.luts = findValue(/LCs\s+([0-9]+)\s/g, stdout, common.FPGAResources.luts);
            common.FPGAResources.pios = findValue(/PIOs\s+([0-9]+)\s/g, stdout, common.FPGAResources.pios);
            common.FPGAResources.plbs = findValue(/PLBs\s+([0-9]+)\s/g, stdout, common.FPGAResources.plbs);
            common.FPGAResources.brams = findValue(/BRAMs\s+([0-9]+)\s/g, stdout, common.FPGAResources.brams);
            utils.rootScopeSafeApply();
          }
        }
      });
    }

    function findValue(pattern, output, previousValue) {
      var match = pattern.exec(output);
      return (match && match[1]) ? match[1] : previousValue;
    }

    function mapCodeModules(code) {
      var codelines = code.split('\n');
      var match, module = { params: [] }, modules = [];
      // Find begin/end lines of the modules
      for (var i in codelines) {
        var codeline = codelines[i];
        // Get the module name
        if (!module.name) {
          match = /^module\s(.*?)[\s|;]/.exec(codeline);
          if (match) {
            module.name = match[1];
            continue;
          }
        }
        // Get the module parameters
        if (!module.begin) {
          match = /^\sparameter\s(.*?)\s/.exec(codeline);
          if (match) {
            module.params.push({
              name: match[1],
              line: parseInt(i) + 1
            });
            continue;
          }
        }
        // Get the begin of the module code
        if (!module.begin) {
          match = /;$/.exec(codeline);
          if (match) {
            module.begin = parseInt(i) + 1;
            continue;
          }
        }
        // Get the end of the module code
        if (!module.end) {
          match = /^endmodule$/.exec(codeline);
          if (match) {
            module.end = parseInt(i) + 1;
            modules.push(module);
            module = { params: [] };
          }
        }
      }
      return modules;
    }

    function normalizeCodeError(codeError, modules) {
      var newCodeError;
      // Find the module with the error
      for (var i in modules) {
        var module = modules[i];
        if (codeError.line <= module.end) {
          newCodeError = {
            type: codeError.type,
            msg: codeError.msg
          };
          // Find constant blocks in Yosys error:
          //  The error comes from the generated code
          //  but the origin is the constant block value
          var re = /Failed\sto\sdetect\swidth\sfor\sparameter\s\\(.*?)\sat/g;
          var matchConstant = re.exec(newCodeError.msg);

          if (codeError.line > module.begin && !matchConstant) {
            if (module.name.startsWith('main_')) {
              // Code block
              newCodeError.blockId = module.name.split('_')[1];
              newCodeError.blockType = 'code';
              newCodeError.line = codeError.line - module.begin - ((codeError.line === module.end) ? 1 : 0);
            }
            else {
              // Generic block
              newCodeError.blockId = module.name.split('_')[0];
              newCodeError.blockType = 'generic';
            }
            break;
          }
          else {
            if (module.name === 'main') {
              // Constant block
              for (var j in module.params) {
                var param = module.params[j];
                if ((codeError.line === param.line) ||
                    (matchConstant && param.name === matchConstant[1]))
                {
                  newCodeError.blockId = param.name;
                  newCodeError.blockType = 'constant';
                  break;
                }
              }
            }
            else {
              // Generic block
              newCodeError.blockId = module.name;
              newCodeError.blockType = 'generic';
            }
            break;
          }
        }
      }
      return newCodeError;
    }

    // Toolchain methods

    $rootScope.$on('installToolchain', function(/*event*/) {
      this.installToolchain();
    }.bind(this));

    this.installToolchain = function() {
      if (resultAlert) {
        resultAlert.dismiss(false);
      }
      if (utils.checkDefaultToolchain()) {
        utils.removeToolchain();
        installDefaultToolchain();
      }
      else {
        alertify.confirm(gettextCatalog.getString('Default toolchain not found. Toolchain will be downloaded. This operation requires Internet connection. Do you want to continue?'),
          function() {
            utils.removeToolchain();
            installOnlineToolchain();
        });
      }
    };

    this.updateToolchain = function() {
      if (resultAlert) {
        resultAlert.dismiss(false);
      }
      alertify.confirm(gettextCatalog.getString('The toolchain will be updated. This operation requires Internet connection. Do you want to continue?'),
        function() {
          installOnlineToolchain();
      });
    };

    this.resetToolchain = function() {
      if (resultAlert) {
        resultAlert.dismiss(false);
      }
      if (utils.checkDefaultToolchain()) {
        alertify.confirm(gettextCatalog.getString('The toolchain will be restored to default. Do you want to continue?'),
          function() {
            utils.removeToolchain();
            installDefaultToolchain();
        });
      }
      else {
        alertify.alert(gettextCatalog.getString('Error: default toolchain not found in \'{{dir}}\'', { dir: common.TOOLCHAIN_DIR}));
      }
    };

    this.removeToolchain = function() {
      if (resultAlert) {
        resultAlert.dismiss(false);
      }
      alertify.confirm(gettextCatalog.getString('The toolchain will be removed. Do you want to continue?'),
        function() {
          utils.removeToolchain();
          toolchain.apio = '';
          toolchain.installed = false;
          alertify.success(gettextCatalog.getString('Toolchain removed'));
      });
    };

    $rootScope.$on('enableDrivers', function(/*event*/) {
      this.enableDrivers();
    }.bind(this));

    this.enableDrivers = function() {
      checkToolchain(function() {
        if (toolchain.installed) {
          drivers.enable();
        }
      });
    };

    this.disableDrivers = function() {
      checkToolchain(function() {
        if (toolchain.installed) {
          drivers.disable();
        }
      });
    };

    function installDefaultToolchain() {
      installationStatus();

      var content = [
        '<div>',
        '  <p id="progress-message">' + gettextCatalog.getString('Installing toolchain') + '</p>',
        '  </br>',
        '  <div class="progress">',
        '    <div id="progress-bar" class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar"',
        '    aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%">',
        '    </div>',
        '  </div>',
        '</div>'].join('\n');
      toolchainAlert = alertify.alert(content, function() {
        setTimeout(function() {
          initProgress();
          // Restore OK button
          $(toolchainAlert.__internal.buttons[0].element).removeClass('hidden');
        }, 200);
      });
      // Hide OK button
      $(toolchainAlert.__internal.buttons[0].element).addClass('hidden');

      toolchain.installed = false;

      // Reset toolchain
      async.series([
        ensurePythonIsAvailable,
        extractVirtualenv,
        createVirtualenv,
        extractDefaultApio,
        installDefaultApio,
        extractDefaultApioPackages,
        installationCompleted
      ]);
    }

    function installOnlineToolchain() {
      installationStatus();

      var content = [
        '<div>',
        '  <p id="progress-message">' + gettextCatalog.getString('Installing toolchain') + '</p>',
        '  </br>',
        '  <div class="progress">',
        '    <div id="progress-bar" class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar"',
        '    aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%">',
        '    </div>',
        '  </div>',
        '</div>'].join('\n');
      toolchainAlert = alertify.alert(content, function() {
        setTimeout(function() {
          initProgress();
          // Restore OK button
          $(toolchainAlert.__internal.buttons[0].element).removeClass('hidden');
        }, 200);
      });
      // Hide OK button
      $(toolchainAlert.__internal.buttons[0].element).addClass('hidden');

      toolchain.installed = false;

      // Install toolchain
      async.series([
        checkInternetConnection,
        ensurePythonIsAvailable,
        extractVirtualenv,
        createVirtualenv,
        installOnlineApio,
        apioInstallSystem,
        apioInstallIcestorm,
        apioInstallIverilog,
        apioInstallDrivers,
        apioInstallScons,
        installationCompleted
      ]);
    }

    function checkInternetConnection(callback) {
      updateProgress(gettextCatalog.getString('Check Internet connection...'), 0);
      utils.isOnline(callback, function() {
        closeToolchainAlert();
        restoreStatus();
        resultAlert = alertify.error(gettextCatalog.getString('Internet connection required'), 30);
        callback(true);
      });
    }

    function ensurePythonIsAvailable(callback) {
      updateProgress(gettextCatalog.getString('Check Python...'), 0);
      if (utils.getPythonExecutable()) {
        callback();
      }
      else {
        closeToolchainAlert();
        restoreStatus();
        resultAlert = alertify.error(gettextCatalog.getString('Python 2.7 is required'), 30);
        callback(true);
      }
    }

    function extractVirtualenv(callback) {
      updateProgress(gettextCatalog.getString('Extract virtualenv files...'), 5);
      utils.extractVirtualenv(callback);
    }

    function createVirtualenv(callback) {
      updateProgress(gettextCatalog.getString('Create virtualenv...'), 10);
      utils.createVirtualenv(callback);
    }

    // Local installation

    function extractDefaultApio(callback) {
      updateProgress(gettextCatalog.getString('Extract default apio files...'), 30);
      utils.extractDefaultApio(callback);
    }

    function installDefaultApio(callback) {
      updateProgress(gettextCatalog.getString('Install default apio...'), 50);
      utils.installDefaultApio(callback);
    }

    function extractDefaultApioPackages(callback) {
      updateProgress(gettextCatalog.getString('Extract default apio packages...'), 70);
      utils.extractDefaultApioPackages(callback);
    }

    // Remote installation

    function installOnlineApio(callback) {
      var extraPackages = _package.apio.extras || [];
      var apio = utils.getApioInstallable();
      updateProgress('pip install -U ' + apio + '[' + extraPackages.toString() + ']', 30);
      utils.installOnlineApio(callback);
    }

    function apioInstallSystem(callback) {
      updateProgress('apio install system', 40);
      utils.apioInstall('system', callback);
    }

    function apioInstallIcestorm(callback) {
      updateProgress('apio install icestorm', 50);
      utils.apioInstall('icestorm', callback);
    }

    function apioInstallIverilog(callback) {
      updateProgress('apio install iverilog', 70);
      utils.apioInstall('iverilog', callback);
    }

    function apioInstallDrivers(callback) {
      if (common.WIN32) {
        updateProgress('apio install drivers', 80);
        utils.apioInstall('drivers', callback);
      }
      else {
        callback();
      }
    }

    function apioInstallScons(callback) {
      updateProgress('apio install scons', 90);
      utils.apioInstall('scons', callback);
    }

    function installationCompleted(callback) {
      checkToolchain(function() {
        if (toolchain.installed) {
          closeToolchainAlert();
          updateProgress(gettextCatalog.getString('Installation completed'), 100);
          alertify.success(gettextCatalog.getString('Toolchain installed'));
          setupDriversAlert();
        }
        restoreStatus();
        callback();
      });
    }

    function setupDriversAlert() {
      if (common.showDrivers()) {
        var message = gettextCatalog.getString('Click here to <b>setup the drivers</b>');
        if (!infoAlert) {
          setTimeout(function() {
            infoAlert = alertify.message(message, 30);
            infoAlert.callback = function(isClicked) {
              infoAlert = null;
              if (isClicked) {
                if (resultAlert) {
                  resultAlert.dismiss(false);
                }
                $rootScope.$broadcast('enableDrivers');
              }
            };
          }, 1000);
        }
      }
    }

    function updateProgress(message, value) {
      angular.element('#progress-message')
        .text(message);
      var bar = angular.element('#progress-bar');
      if (value === 100) {
        bar.removeClass('progress-bar-striped active');
      }
      bar.text(value + '%');
      bar.attr('aria-valuenow', value);
      bar.css('width', value + '%');
    }

    function initProgress() {
      angular.element('#progress-bar')
        .addClass('notransition progress-bar-info progress-bar-striped active')
        .removeClass('progress-bar-danger')
        .text('0%')
        .attr('aria-valuenow', 0)
        .css('width', '0%')
        .removeClass('notransition');
    }

    function closeToolchainAlert() {
      toolchainAlert.callback();
      toolchainAlert.close();
    }

    function installationStatus() {
      // Disable user events
      utils.disableKeyEvents();
      utils.disableClickEvents();
      $('body').addClass('waiting');
    }

    function restoreStatus() {
      // Enable user events
      utils.enableKeyEvents();
      utils.enableClickEvents();
      $('body').removeClass('waiting');
    }

    // Collections management

    this.addCollections = function(filepaths) {
      // Load zip file
      async.eachSeries(filepaths, function(filepath, nextzip) {
        //alertify.message(gettextCatalog.getString('Load {{name}} ...', { name: utils.bold(utils.basename(filepath)) }));
        var zipData = nodeAdmZip(filepath);
        var _collections = getCollections(zipData);

        async.eachSeries(_collections, function(collection, next) {
          setTimeout(function() {
            if (collection.package && (collection.blocks || collection.examples)) {

              alertify.prompt(gettextCatalog.getString('Edit the collection name'), collection.origName,
                function(evt, name) {
                  if (!name) {
                    return false;
                  }
                  collection.name = name;

                  var destPath = nodePath.join(common.INTERNAL_COLLECTIONS_DIR, name);
                  if (nodeFs.existsSync(destPath)) {
                    alertify.confirm(
                      gettextCatalog.getString('The collection {{name}} already exists.', { name: utils.bold(name) }) + '<br>' +
                      gettextCatalog.getString('Do you want to replace it?'),
                      function() {
                        utils.deleteFolderRecursive(destPath);
                        installCollection(collection, zipData);
                        alertify.success(gettextCatalog.getString('Collection {{name}} replaced', { name: utils.bold(name) }));
                        next(name);
                      },
                      function() {
                        alertify.warning(gettextCatalog.getString('Collection {{name}} not replaced', { name: utils.bold(name) }));
                        next(name);
                      });
                    }
                    else {
                      installCollection(collection, zipData);
                      alertify.success(gettextCatalog.getString('Collection {{name}} added', { name: utils.bold(name) }));
                      next(name);
                    }
                });
              }
              else {
                alertify.warning(gettextCatalog.getString('Invalid collection {{name}}', { name: utils.bold(name) }));
              }
            }, 0);
          }, function(name) {
            collections.loadInternalCollections();
            // If the selected collection is replaced, load it again
            if (common.selectedCollection.name === name) {
              collections.selectCollection(name);
            }
            utils.rootScopeSafeApply();
            nextzip();
        });
      });
    };

    function getCollections(zipData) {
      var data = '';
      var _collections = {};
      var zipEntries = zipData.getEntries();

      // Validate collections
      zipEntries.forEach(function(zipEntry) {
        data = zipEntry.entryName.match(/^([^\/]+)\/$/);
        if (data) {
          _collections[data[1]] = {
            origName: data[1], blocks: [], examples: [], locale: [], package: ''
          };
        }

        addCollectionItem('blocks', 'ice', _collections, zipEntry);
        addCollectionItem('blocks', 'v', _collections, zipEntry);
        addCollectionItem('blocks', 'vh', _collections, zipEntry);
        addCollectionItem('blocks', 'list', _collections, zipEntry);
        addCollectionItem('examples', 'ice', _collections, zipEntry);
        addCollectionItem('examples', 'v', _collections, zipEntry);
        addCollectionItem('examples', 'vh', _collections, zipEntry);
        addCollectionItem('examples', 'list', _collections, zipEntry);
        addCollectionItem('locale', 'po', _collections, zipEntry);

        data = zipEntry.entryName.match(/^([^\/]+)\/package\.json$/);
        if (data) {
          _collections[data[1]].package = zipEntry.entryName;
        }
        data = zipEntry.entryName.match(/^([^\/]+)\/README\.md$/);
        if (data) {
          _collections[data[1]].readme = zipEntry.entryName;
        }
      });

      return _collections;
    }

    function addCollectionItem(key, ext, collections, zipEntry) {
      var data = zipEntry.entryName.match(RegExp('^([^\/]+)\/' + key + '\/.*\.' + ext + '$'));
      if (data) {
        collections[data[1]][key].push(zipEntry.entryName);
      }
    }

    function installCollection(collection, zip) {
      var i, dest = '';
      var pattern = RegExp('^' + collection.origName);
      for (i in collection.blocks) {
        dest = collection.blocks[i].replace(pattern, collection.name);
        safeExtract(collection.blocks[i], dest, zip);
      }
      for (i in collection.examples) {
        dest = collection.examples[i].replace(pattern, collection.name);
        safeExtract(collection.examples[i], dest, zip);
      }
      for (i in collection.locale) {
        dest = collection.locale[i].replace(pattern, collection.name);
        safeExtract(collection.locale[i], dest, zip);
        // Generate locale JSON files
        var compiler = new nodeGettext.Compiler({ format: 'json' });
        var sourcePath = nodePath.join(common.INTERNAL_COLLECTIONS_DIR, dest);
        var targetPath = nodePath.join(common.INTERNAL_COLLECTIONS_DIR, dest.replace(/\.po$/, '.json'));
        var content = nodeFs.readFileSync(sourcePath).toString();
        var json = compiler.convertPo([content]);
        nodeFs.writeFileSync(targetPath, json);
        // Add strings to gettext
        gettextCatalog.loadRemote(targetPath);
      }
      if (collection.package) {
        dest = collection.package.replace(pattern, collection.name);
        safeExtract(collection.package, dest, zip);
      }
      if (collection.readme) {
        dest = collection.readme.replace(pattern, collection.name);
        safeExtract(collection.readme, dest, zip);
      }
    }

    function safeExtract(entry, dest, zip) {
      try {
        var newPath = nodePath.join(common.INTERNAL_COLLECTIONS_DIR, dest);
        zip.extractEntryTo(entry, utils.dirname(newPath), /*maintainEntryPath*/false);
      }
      catch(e) {}
    }

    this.removeCollection = function(collection) {
      utils.deleteFolderRecursive(collection.path);
      collections.loadInternalCollections();
      alertify.success(gettextCatalog.getString('Collection {{name}} removed', { name: utils.bold(collection.name) }));
    };

    this.removeAllCollections = function() {
      utils.removeCollections();
      collections.loadInternalCollections();
      alertify.success(gettextCatalog.getString('All collections removed'));
    };

  });
