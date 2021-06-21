"use strict";

angular
  .module("icestudio")
  .service(
    "tools",
    function (
      project,
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
      $rootScope
    ) {
      //-- Flag that indicates if there is an apio command already running
      var taskRunning = false;

      var resources = [];
      var startAlert = null;
      var infoAlert = null;
      var resultAlert = null;
      var toolchainAlert = null;


      //-- tools.toolchain Global Object
      //-- tools.toolchain.apio -> Apio version
      //-- tools.toolchain.installed -> Boolean. 
      //--    True if the toolchains is installed
      //-- tools.toolchain.disable -> Boolean.
      //--    True if the toolchain is disabled
      var toolchain = {
        apio: "-",
        installed: false,
        disabled: false
      };
      this.toolchain = toolchain;

      // Remove old build directory on start
      //-- TODO: Check if it can be removed, as now another
      //-- build dir is used
      nodeFse.removeSync(common.OLD_BUILD_DIR);

      //-- Execute the apio verify command. It checks the syntax of the current
      //-- circuit
      this.verifyCode = function (startMessage, endMessage) {
        return apioRun(
          ["verify", "--board", common.selectedBoard.name],
          startMessage,
          endMessage
        );
      };

      //-- Execute the apio build command. It builds the current circuit
      this.buildCode = function (startMessage, endMessage) {
        return apioRun(
          ["build", "--board", common.selectedBoard.name],
          startMessage,
          endMessage
        );
      };

      //-- Execute the apio upload command. It uploads the bitstream to the  
      //-- current board
      this.uploadCode = function (startMessage, endMessage) {
        return apioRun(
          ["upload", "--board", common.selectedBoard.name],
          startMessage,
          endMessage
        );
      };


      //----------------------------------------------------------------
      //-- Execute an apio command: build, verify, upload
      function apioRun(commands, startMessage, endMessage) {
        return new Promise(function (resolve) {

          //-- Variable for storing the verilog source code of 
          //-- the current circuit
          let sourceCode = "";

          //-- The command can only be executed if there is no other
          //-- command already running
          if (!taskRunning) {

            //-- Flag that there is a command running
            taskRunning = true;

            if (infoAlert) {
              infoAlert.dismiss(false);
            }

            if (resultAlert) {
              resultAlert.dismiss(false);
            }

            graph
              .resetCodeErrors()
              .then(function () {
                return checkToolchainInstalled();
              })
              .then(function () {
                utils.beginBlockingTask();
                if (startMessage) {
                  startAlert = alertify.message(startMessage, 100000);
                }

                return generateCode(commands);
              })
              .then(function (output) {
                sourceCode = output.code;

                return syncResources(output.code, output.internalResources);
              })
              .then(function () {
                var hostname = profile.get("remoteHostname");
                var command = commands[0];
                if (command === "build" || command === "upload") {
                  if (profile.get("showFPGAResources")) {
                    commands = commands.concat("--verbose-pnr");
                  }
                }
                if (hostname) {
                  return executeRemote(commands, hostname);
                } else {
                  return executeLocal(commands);
                }
              })
              .then(function (result) {
                return processResult(result, sourceCode);
              })
              .then(function () {
                // Success
                if (endMessage) {
                  resultAlert = alertify.success(
                    gettextCatalog.getString(endMessage)
                  );
                }
                utils.endBlockingTask();
                restoreTask();
                resolve();
              })
              .catch(function (/* e */) {
                // Error
                utils.endBlockingTask();
                restoreTask();
              });
          }
        });
      }
      //----------------------------------------------------------------------------

      function restoreTask() {
        setTimeout(function () {
          // Wait 1s before run a task again
          if (startAlert) {
            startAlert.dismiss(false);
          }
          taskRunning = false;
        }, 1000);
      }

      //------------------------------------------------------------------------
      //-- Check if the toolchain has been installed
      //-- We know it it has been already installed by watching the   
      //-- toolchain.installed flag.
      //-- If it is not installed an Alert windows is shown
      function checkToolchainInstalled() {
        return new Promise(function (resolve, reject) {

          //-- Check the installation flag
          if (toolchain.installed) {
            resolve();

          } //-- Toolchain Not installed. Show an alert window
          else {
            toolchainNotInstalledAlert(
              gettextCatalog.getString("Toolchain not installed")
            );
            reject();
          }
        });
      }
      //-----------------------------------------------------------------------


      function generateCode(cmd) {
        return new Promise(function (resolve) {
          project.snapshot();
          project.update();
          var opt = {
            datetime: false,
            boardRules: profile.get("boardRules")
          };
          if (opt.boardRules) {
            opt.initPorts = compiler.getInitPorts(project.get());
            opt.initPins = compiler.getInitPins(project.get());
          }

          // Verilog file
          var verilogFile = compiler.generate("verilog", project.get(), opt)[0];
          nodeFs.writeFileSync(
            nodePath.join(common.BUILD_DIR, verilogFile.name),
            verilogFile.content,
            "utf8"
          );

          if (
            cmd.indexOf("verify") > -1 &&
            cmd.indexOf("--board") > -1 &&
            cmd.length === 3
          ) {
            //only verification
          } else {
            var archName = common.selectedBoard.info.arch;
            if (archName === "ecp5") {
              // LPF file
              var lpfFile = compiler.generate("lpf", project.get(), opt)[0];
              nodeFs.writeFileSync(
                nodePath.join(common.BUILD_DIR, lpfFile.name),
                lpfFile.content,
                "utf8"
              );
            } else {
              // PCF file
              var pcfFile = compiler.generate("pcf", project.get(), opt)[0];
              nodeFs.writeFileSync(
                nodePath.join(common.BUILD_DIR, pcfFile.name),
                pcfFile.content,
                "utf8"
              );
            }
          }
          // List files
          var listFiles = compiler.generate("list", project.get());
          for (var i in listFiles) {
            var listFile = listFiles[i];

            nodeFs.writeFileSync(
              nodePath.join(common.BUILD_DIR, listFile.name),
              listFile.content,
              "utf8"
            );
          }

          project.restoreSnapshot();
          resolve({
            code: verilogFile.content,
            internalResources: listFiles.map(function (res) {
              return res.name;
            })
          });
        });
      }

      function syncResources(code, internalResources) {
        return new Promise(function (resolve, reject) {
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
        _.each(files, function (file) {
          var filepath = nodePath.join(common.BUILD_DIR, file);
          nodeFse.removeSync(filepath);
        });
      }

      function findIncludedFiles(code) {
        return findFiles(
          /[\n|\s]\/\/\s*@include\s+([^\s]*\.(v|vh|list))(\n|\s)/g,
          code
        );
      }

      function findInlineFiles(code) {
        return findFiles(/[\n|\s][^\/]?\"(.*\.list?)\"/g, code);
      }

      // TODO: duplicated: utils findIncludedFiles
      function findFiles(pattern, code) {
        var match;
        var files = [];
        while ((match = pattern.exec(code))) {
          files.push(match[1]);
        }
        return files;
      }

      function syncFiles(files, reject) {
        _.each(files, function (file) {
          var destPath = nodePath.join(common.BUILD_DIR, file);
          var origPath = nodePath.join(utils.dirname(project.filepath), file);

          // Copy file
          var copySuccess = utils.copySync(origPath, destPath);
          if (!copySuccess) {
            resultAlert = alertify.error(
              gettextCatalog.getString("File {{file}} does not exist", {
                file: file
              }),
              30
            );
            reject();
          }
        });
      }

      this.checkToolchain = checkToolchain;

      //----------------------------------------------------------------------------------
      //-- Check if APIO is available. The apio version is read and stored in the
      //-- toolchain.apio global object
      //-- It is also checked if the version is correct (with the version given in the  
      //-- package.json package)
      function checkToolchain(callback) {

        //-- Get the apio cmd to execute
        var apio = utils.getApioExecutable();

        //-- Execute the command apio --version
        //-- It returns the apio version
        //-- Ej:
        //-- $ apio --version
        //-- apio, version 0.7.dev1
        nodeChildProcess.exec([apio, "--version"].join(" "), function (
          error,
          stdout /*, stderr*/
        ) {

          //-- Toolchain not installed (or error executing it)
          if (error) {
            toolchain.apio = "";
            toolchain.installed = false;
            // Apio not installed
            toolchainNotInstalledAlert(
              gettextCatalog.getString("Toolchain not installed")
            );
            if (callback) {
              callback();
            }
          }

          //-- Toolchain installed  
          else {

            //-- Get the version number
            toolchain.apio = stdout.match(/apio,\sversion\s(.+)/i)[1];

            //-- Check if the apio version if the ok with the specification
            //-- in the package.json file
            toolchain.installed =
              toolchain.apio >= _package.apio.min &&
              toolchain.apio < _package.apio.max;

            //-- The correct version of apio is installed
            if (toolchain.installed) {

              //-- Execute the command apio clean -p resource/sample
              //-- just to test if apio is correctly installed
              nodeChildProcess.exec(
                [apio, "clean", "-p", common.SAMPLE_DIR].join(" "),

                //-- callback:
                function (error /*, stdout, stderr*/) {

                  //-- Update the toolchain.installed flag with the result
                  toolchain.installed = !error;

                  //-- There was an error executing the test command
                  //-- Something is wrong... apio not correctly executed
                  if (error) {
                    toolchain.apio = "";
                    // Toolchain not properly installed
                    toolchainNotInstalledAlert(
                      gettextCatalog.getString("Toolchain not installed")
                    );
                  }
                  if (callback) {
                    callback();
                  }
                }
              );
            } 
            //-- An old version of apio is intalled
            else {
              toolchainNotInstalledAlert(
                gettextCatalog.getString("Toolchain version does not match")
              );
              if (callback) {
                callback();
              }
            }
          }
        });
      }
      //----------------------------------------------------------------------------------


      function toolchainNotInstalledAlert(message) {
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        resultAlert = alertify.warning(
          message +
            ".<br>" +
            gettextCatalog.getString("Click here to install it"),
          100000
        );
        resultAlert.callback = function (isClicked) {
          if (isClicked) {
            // Install the new toolchain
            $rootScope.$broadcast("installToolchain");
          }
        };
      }

      //-- TODO: Think about removing this function in future versions....
      function executeRemote(commands, hostname) {
        return new Promise(function (resolve) {
          startAlert.setContent(
            gettextCatalog.getString("Synchronize remote files ...")
          );
          nodeRSync(
            {
              src: common.BUILD_DIR + "/",
              dest: hostname + ":.build/",
              ssh: true,
              recursive: true,
              delete: true,
              include: ["*.v", "*.pcf", "*.lpf", "*.list"],
              exclude: [
                ".sconsign.dblite",
                "*.out",
                "*.blif",
                "*.asc",
                "*.bin",
                "*.config",
                "*.json"
              ]
            },
            function (error, stdout, stderr /*, cmd*/) {
              if (!error) {
                startAlert.setContent(
                  gettextCatalog.getString("Execute remote {{label}} ...", {
                    label: ""
                  })
                );
                nodeSSHexec(
                  ["apio"]
                    .concat(commands)
                    .concat(["--project-dir", ".build"])
                    .join(" "),
                  hostname,
                  function (error, stdout, stderr) {
                    resolve({
                      error: error,
                      stdout: stdout,
                      stderr: stderr
                    });
                  }
                );
              } else {
                resolve({
                  error: error,
                  stdout: stdout,
                  stderr: stderr
                });
              }
            }
          );
        });
      }

      function shellEscape(arrayArgs) {
        return arrayArgs.map(function (c) {
          if (c.indexOf("(") >= 0){
             c = `"${c}"`;
          }
          return c;
        });
      }
      function executeLocal(commands) {
        return new Promise(function (resolve) {
          if (commands[0] === "upload") {
            // Upload command requires drivers setup (Mac OS)
            drivers.preUpload(function () {
              _executeLocal();
            });
          } else {
            // Other !upload commands
            _executeLocal();
          }

          function _executeLocal() {
            var apio = utils.getApioExecutable();

            commands = shellEscape(commands);

            var command = [apio]
              .concat(commands)
              .concat(["-p", utils.coverPath(common.BUILD_DIR)])
              .join(" ");
            if (
              typeof common.DEBUGMODE !== "undefined" &&
              common.DEBUGMODE === 1
            ) {
              const fs = require("fs");
              fs.appendFileSync(
                common.LOGFILE,
                "tools._executeLocal>" + command + "\n"
              );
            }
            nodeChildProcess.exec(
              command,
              {
                maxBuffer: 5000 * 1024
              }, // To avoid buffer overflow
              function (error, stdout, stderr) {
                if (commands[0] === "upload") {
                  // Upload command requires to restore the drivers (Mac OS)
                  drivers.postUpload();
                }
                common.commandOutput = command + "\n\n" + stdout + stderr;
                $(document).trigger("commandOutputChanged", [
                  common.commandOutput
                ]);
                resolve({
                  error: error,
                  stdout: stdout,
                  stderr: stderr
                });
              }
            );
          }
        });
      }

      function processResult(result, code) {
        result = result || {};
        var _error = result.error;
        var stdout = result.stdout;
        var stderr = result.stderr;

        return new Promise(function (resolve, reject) {
          if (_error || stderr) {
            // -- Process errors
            reject();
            if (stdout) {
              var boardName = common.selectedBoard.name;
              var boardLabel = common.selectedBoard.info.label;
              // - Apio errors
              if (
                stdout.indexOf(
                  "Error: board " + boardName + " not connected"
                ) !== -1 ||
                stdout.indexOf("USBError") !== -1 ||
                stdout.indexOf("Activate bootloader") !== -1
              ) {
                var errorMessage = gettextCatalog.getString(
                  "Board {{name}} not connected",
                  {
                    name: utils.bold(boardLabel)
                  }
                );
                if (stdout.indexOf("Activate bootloader") !== -1) {
                  if (common.selectedBoard.name.startsWith("TinyFPGA-B")) {
                    // TinyFPGA bootloader notification
                    errorMessage +=
                      "</br>(" +
                      gettextCatalog.getString("Bootloader not active") +
                      ")";
                  }
                }
                resultAlert = alertify.error(errorMessage, 30);
              } else if (
                stdout.indexOf(
                  "Error: board " + boardName + " not available"
                ) !== -1
              ) {
                resultAlert = alertify.error(
                  gettextCatalog.getString("Board {{name}} not available", {
                    name: utils.bold(boardLabel)
                  }),
                  30
                );
                setupDriversAlert();
              } else if (stdout.indexOf("Error: unknown board") !== -1) {
                resultAlert = alertify.error(
                  gettextCatalog.getString("Unknown board"),
                  30
                );
              } else if (stdout.indexOf("[upload] Error") !== -1) {
                switch (common.selectedBoard.name) {
                  // TinyFPGA-B2 programmer errors
                  case "TinyFPGA-B2":
                  case "TinyFPGA-BX":
                    var match = stdout.match(/Bootloader\snot\sactive/g);
                    if (match && match.length === 3) {
                      resultAlert = alertify.error(
                        gettextCatalog.getString("Bootloader not active"),
                        30
                      );
                    } else if (
                      stdout.indexOf("Device or resource busy") !== -1
                    ) {
                      resultAlert = alertify.error(
                        gettextCatalog.getString(
                          "Board {{name}} not available",
                          {
                            name: utils.bold(boardLabel)
                          }
                        ),
                        30
                      );
                      setupDriversAlert();
                    } else if (
                      stdout.indexOf(
                        "device disconnected or multiple access on port"
                      ) !== -1
                    ) {
                      resultAlert = alertify.error(
                        gettextCatalog.getString(
                          "Board {{name}} disconnected",
                          {
                            name: utils.bold(boardLabel)
                          }
                        ),
                        30
                      );
                    } else {
                      resultAlert = alertify.error(
                        gettextCatalog.getString(stdout),
                        30
                      );
                    }
                    break;
                  default:
                    resultAlert = alertify.error(
                      gettextCatalog.getString(stdout),
                      30
                    );
                }
              }
              // Yosys error (Mac OS)
              else if (
                stdout.indexOf("Library not loaded:") !== -1 &&
                stdout.indexOf("libffi") !== -1
              ) {
                resultAlert = alertify.error(
                  gettextCatalog.getString("Configuration not completed"),
                  30
                );
                setupDriversAlert();
              }
              // - Arachne-pnr errors
              else if (
                stdout.indexOf("set_io: too few arguments") !== -1 ||
                stdout.indexOf("fatal error: unknown pin") !== -1
              ) {
                resultAlert = alertify.error(
                  gettextCatalog.getString("FPGA I/O ports not defined"),
                  30
                );
              } else if (
                stdout.indexOf("fatal error: duplicate pin constraints") !== -1
              ) {
                resultAlert = alertify.error(
                  gettextCatalog.getString("Duplicated FPGA I/O ports"),
                  30
                );
              } else {
                var re,
                  matchError,
                  codeErrors = [];

                // - Iverilog errors & warnings
                // main.v:#: error: ...
                // main.v:#: warning: ...
                // main.v:#: syntax error
                re = /main.v:([0-9]+):\s(error|warning):\s(.*?)[\r|\n]/g;
                while ((matchError = re.exec(stdout))) {
                  codeErrors.push({
                    line: parseInt(matchError[1]),
                    msg: matchError[3].replace(/\sin\smain\..*$/, ""),
                    type: matchError[2]
                  });
                }
                re = /main.v:([0-9]+):\ssyntax\serror[\r|\n]/g;
                while ((matchError = re.exec(stdout))) {
                  codeErrors.push({
                    line: parseInt(matchError[1]),
                    msg: "Syntax error",
                    type: "error"
                  });
                }
                // - Yosys errors
                // ERROR: ... main.v:#...
                // Warning: ... main.v:#...
                re = /(ERROR|Warning):\s(.*?)\smain\.v:([0-9]+)(.*?)[\r|\n]/g;
                var msg = "";
                var line = -1;
                var type = false;
                var preContent = false;
                var postContent = false;

                while ((matchError = re.exec(stdout))) {
                  msg = "";
                  line = parseInt(matchError[3]);
                  type = matchError[1].toLowerCase();
                  preContent = matchError[2];
                  postContent = matchError[4];
                  // Process error
                  if (preContent === "Parser error in line") {
                    postContent = postContent.substring(2); // remove :\s
                    if (postContent.startsWith("syntax error")) {
                      postContent = "Syntax error";
                    }
                    msg = postContent;
                  } else if (preContent.endsWith(" in line ")) {
                    msg =
                      preContent.replace(/\sin\sline\s$/, " ") + postContent;
                  } else {
                    preContent = preContent.replace(/\sat\s$/, "");
                    preContent = preContent.replace(/\sin\s$/, "");
                    msg = preContent;
                  }
                  codeErrors.push({
                    line: line,
                    msg: msg,
                    type: type
                  });
                }

                // - Yosys syntax errors
                // - main.v:31: ERROR: #...
                re = /\smain\.v:([0-9]+):\s(.*?)(ERROR):\s(.*?)[\r|\n]/g;
                while ((matchError = re.exec(stdout))) {
                  msg = "";
                  line = parseInt(matchError[1]);
                  type = matchError[3].toLowerCase();
                  preContent = matchError[4];

                  // If the error is about an unexpected token, the error is not
                  // deterministic, therefore we indicate that "the error
                  //is around this line ..."
                  if (preContent.indexOf("unexpected TOK_") >= 0) {
                    msg = "Syntax error arround this line";
                  } else {
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
                    $(document).trigger("codeError", [codeError]);
                    hasErrors = hasErrors || codeError.type === "error";
                    hasWarnings = hasWarnings || codeError.type === "warning";
                  }
                }

                if (hasErrors) {
                  resultAlert = alertify.error(
                    gettextCatalog.getString("Errors detected in the design"),
                    5
                  );
                } else {
                  if (hasWarnings) {
                    resultAlert = alertify.warning(
                      gettextCatalog.getString(
                        "Warnings detected in the design"
                      ),
                      5
                    );
                  }

                  // var stdoutWarning = stdout.split('\n').filter(function (line) {
                  //   line = line.toLowerCase();
                  //   return (line.indexOf('warning: ') !== -1);
                  // });
                  var stdoutError = stdout.split("\n").filter(function (line) {
                    line = line.toLowerCase();
                    return (
                      line.indexOf("error: ") !== -1 ||
                      line.indexOf("not installed") !== -1 ||
                      line.indexOf("already declared") !== -1
                    );
                  });
                  // stdoutWarning.forEach(function (warning) {
                  //   alertify.warning(warning, 20);
                  // });
                  if (stdoutError.length > 0) {
                    // Show first error
                    var error = "There are errors in the Design...";
                    // hardware.blif:#: fatal error: ...
                    re = /hardware\.blif:([0-9]+):\sfatal\serror:\s(.*)/g;

                    // ERROR: Cell xxx cannot be bound to ..... since it is already bound
                    var re2 = /ERROR:\s(.*)\scannot\sbe\sbound\sto\s(.*)since\sit\sis\salready\sbound/g;

                    // ERROR: package does not have a pin named 'NULL' (on line 3)
                    var re3 = /ERROR:\spackage\sdoes\snot\shave\sa\spin\snamed\s'NULL/g;

                    if ((matchError = re.exec(stdoutError[0]))) {
                      error = matchError[2];
                    } else if ((matchError = re2.exec(stdoutError[0]))) {
                      error = "Duplicated pins";
                    } else if ((matchError = re3.exec(stdoutError[0]))) {
                      error = "Pin not assigned (NULL)";
                    } else {
                      error += "\n" + stdoutError[0];
                    }
                    resultAlert = alertify.error(error, 30);
                  } else {
                    resultAlert = alertify.error(stdout, 30);
                  }
                }
              }
            } else if (stderr) {
              // Remote hostname errors
              if (
                stderr.indexOf("Could not resolve hostname") !== -1 ||
                stderr.indexOf("Connection refused") !== -1
              ) {
                resultAlert = alertify.error(
                  gettextCatalog.getString("Wrong remote hostname {{name}}", {
                    name: profile.get("remoteHostname")
                  }),
                  30
                );
              } else if (stderr.indexOf("No route to host") !== -1) {
                resultAlert = alertify.error(
                  gettextCatalog.getString(
                    "Remote host {{name}} not connected",
                    {
                      name: profile.get("remoteHostname")
                    }
                  ),
                  30
                );
              } else {
                resultAlert = alertify.error(stderr, 30);
              }
            }
          } else {
            //-- Process output
            resolve();

            if (stdout) {
              // Show used resources in the FPGA
              if (typeof common.FPGAResources.nextpnr === "undefined") {
                common.FPGAResources.nextpnr = {
                  LC: {
                    used: "-",
                    total: "-",
                    percentage: "-"
                  },
                  RAM: {
                    used: "-",
                    total: "-",
                    percentage: "-"
                  },
                  IO: {
                    used: "-",
                    total: "-",
                    percentage: "-"
                  },
                  GB: {
                    used: "-",
                    total: "-",
                    percentage: "-"
                  },
                  PLL: {
                    used: "-",
                    total: "-",
                    percentage: "-"
                  },
                  WB: {
                    used: "-",
                    total: "-",
                    percentage: "-"
                  },
                  MF: {
                    value: 0
                  }
                };
              }
              common.FPGAResources.nextpnr.LC = findValueNPNR(
                /_LC:\s{1,}(\d+)\/\s{1,}(\d+)\s{1,}(\d+)%/g,
                stdout,
                common.FPGAResources.nextpnr.LC
              );
              common.FPGAResources.nextpnr.RAM = findValueNPNR(
                /_RAM:\s{1,}(\d+)\/\s{1,}(\d+)\s{1,}(\d+)%/g,
                stdout,
                common.FPGAResources.nextpnr.RAM
              );
              common.FPGAResources.nextpnr.IO = findValueNPNR(
                /SB_IO:\s{1,}(\d+)\/\s{1,}(\d+)\s{1,}(\d+)%/g,
                stdout,
                common.FPGAResources.nextpnr.IO
              );
              common.FPGAResources.nextpnr.GB = findValueNPNR(
                /SB_GB:\s{1,}(\d+)\/\s{1,}(\d+)\s{1,}(\d+)%/g,
                stdout,
                common.FPGAResources.nextpnr.GB
              );
              common.FPGAResources.nextpnr.PLL = findValueNPNR(
                /_PLL:\s{1,}(\d+)\/\s{1,}(\d+)\s{1,}(\d+)%/g,
                stdout,
                common.FPGAResources.nextpnr.PLL
              );
              common.FPGAResources.nextpnr.WB = findValueNPNR(
                /_WARMBOOT:\s{1,}(\d+)\/\s{1,}(\d+)\s{1,}(\d+)%/g,
                stdout,
                common.FPGAResources.nextpnr.WB
              );
              common.FPGAResources.nextpnr.MF = findMaxFreq(
                /Max frequency for clock '[\w\W]+': ([\d\.]+) MHz/g,
                stdout,
                common.FPGAResources.nextpnr.MF
              );
              utils.rootScopeSafeApply();
            }
          }
        });
      }

      function findValueNPNR(pattern, output, previousValue) {
        var match = pattern.exec(output);
        return match && match[1] && match[2] && match[3]? {
              used: match[1],
              total: match[2],
              percentage: match[3]
        } : previousValue;
      }

      function findMaxFreq(pattern, output, previousValue) {
        var match = pattern.exec(output);
        return match && match[1] ? {
              value: match[1]
            } : previousValue;
      }

      /*    function findValue(pattern, output, previousValue) {
          var match = pattern.exec(output);
          return (match && match[1]) ? match[1] : previousValue;
        }
    */
      function mapCodeModules(code) {
        var codelines = code.split("\n");
        var match,
          module = {
            params: []
          },
          modules = [];
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
              module = {
                params: []
              };
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
              if (module.name.startsWith("main_")) {
                // Code block
                newCodeError.blockId = module.name.split("_")[1];
                newCodeError.blockType = "code";
                newCodeError.line =
                  codeError.line -
                  module.begin -
                  (codeError.line === module.end ? 1 : 0);
              } else {
                // Generic block

                newCodeError.blockId = module.name.split("_")[0];
                newCodeError.blockType = "generic";
              }
              break;
            } else {
              if (module.name === "main") {
                // Constant block
                for (var j in module.params) {
                  var param = module.params[j];
                  if (
                    codeError.line === param.line ||
                    (matchConstant && param.name === matchConstant[1])
                  ) {
                    newCodeError.blockId = param.name;
                    newCodeError.blockType = "constant";
                    break;
                  }
                }
              } else {
                // Generic block
                newCodeError.blockId = module.name;
                newCodeError.blockType = "generic";
              }
              break;
            }
          }
        }
        return newCodeError;
      }

      //-----------------------------------------------------------------------
      // Toolchain methods
      //-----------------------------------------------------------------------

      $rootScope.$on(
        "installToolchain",
        function (/*event*/) {
          this.installToolchain();
        }.bind(this)
      );


      //----------------------------------------------------------------
      //-- Install the STABLE toolchain
      //-- It displays a messages and if the user click on ok it will
      //-- download the toolchain
      //--
      this.installToolchain = function () {

        iceConsole.log("------> MENU ENTRY POINT: Install Toolchain");
        if (resultAlert) {
          resultAlert.dismiss(false);
        }

        alertify.confirm(
          gettextCatalog.getString(
            "Install the STABLE Toolchain. It will be downloaded. This operation requires Internet connection. Do you want to continue?"
          ),
          function () {
            //-- Remove the toolchain for starting a fresh installation
            utils.removeToolchain();

            //-- Install APIO STABLE version
            installOnlineToolchain(common.APIO_VERSION_STABLE);
          }
        );
      };


      //--------------------------------------------------------------------
      //-- Install the DEVELOPMENT toolchain
      //--
      this.installToolchainDev = function () {

        console.log("Install toolchain-DEV!!!");
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        alertify.confirm(
          gettextCatalog.getString(
            "Install the DEVELOPMENT toolchain. It will be downloaded. This operation requires Internet connection. Do you want to continue?"
          ),
          function () {
            installOnlineToolchain(common.APIO_VERSION_DEV);
          }
        );
      };


      //--------------------------------------------------------------
      //-- Install the LATEST STABLE toolchain
      //--
      this.updateToolchain = function () {

        iceConsole.log("------------------------------------------");
        iceConsole.log("------> MENU ENTRY POINT: Update Toolchain");
        iceConsole.log("------------------------------------------");
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        alertify.confirm(
          gettextCatalog.getString(
            "Install the LATEST STABLE toolchain. It will be downloaded. This operation requires Internet connection. Do you want to continue?"
          ),
          function () {
            installOnlineToolchain(common.APIO_VERSION_LATEST_STABLE);
          }
        );
      };


      //---------------------------------------------------------
      //-- Remove the Toolchain
      //--
      this.removeToolchain = function () {
        if (resultAlert) {
          resultAlert.dismiss(false);
        }
        alertify.confirm(
          gettextCatalog.getString(
            "The toolchain will be removed. Do you want to continue?"
          ),
          function () {
            //-- Remove the toolchain
            utils.removeToolchain();

            //-- Init the related flags
            toolchain.apio = "";
            toolchain.installed = false;
            alertify.success(gettextCatalog.getString("Toolchain removed"));
          }
        );
      };


      $rootScope.$on(
        "enableDrivers",
        function (/*event*/) {
          this.enableDrivers();
        }.bind(this)
      );

      //--------------------------------------------
      //-- Enable the drivers
      //--
      this.enableDrivers = function () {
        checkToolchain(function () {
          if (toolchain.installed) {
            drivers.enable();
          }
        });
      };

      //---------------------------------------------
      //-- Disable the drivers
      //--
      this.disableDrivers = function () {
        checkToolchain(function () {
          if (toolchain.installed) {
            drivers.disable();
          }
        });
      };

      //---------------------------------------------------------
      //-- Install the toolchain according to the given version  
      //-- Values for the version parameter:
      //--  * common.APIO_VERSION_STABLE
      //--  * common.APIO_VERSION_LATEST_STABLE
      //--  * common.APIO_VERSION_DEV
      //--
      function installOnlineToolchain(version) {

        //-- Waiting state: Spinner on
        installationStatus();

        //-- Progress bar
        const content = [
          "<div>",
          '  <p id="progress-message">' +
            gettextCatalog.getString("Installing " + utils.printApioVersion(version)) +
            "</p>",
          "  </br>",
          '  <div class="progress">',
          '    <div id="progress-bar" class="progress-bar progress-bar-info progress-bar-striped active" role="progressbar"',
          '    aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%">',
          "    </div>",
          "  </div>",
          "</div>"
        ].join("\n");

        toolchainAlert = alertify.alert(content, function () {
          setTimeout(function () {
            initProgress();
            // Restore OK button
            $(toolchainAlert.__internal.buttons[0].element).removeClass(
              "hidden"
            );
          }, 200);
        });

        // Hide OK button
        $(toolchainAlert.__internal.buttons[0].element).addClass("hidden");

        //-- Toolchain not yet installed
        toolchain.installed = false;

        //-- Store the apio version to install in the global object common.APIO_VERSION
        //-- The functions that need to know the apio version can read it from there
        common.APIO_VERSION = version;

        // Steps for installing the toolchains
        // These functions are called one by one, secuentially
        // When one function is done, the next one is called
        async.series([

          //-- Internet connection is needed: check it
          checkInternetConnection,

          //-- Python3 is needed: Check it
          ensurePythonIsAvailable,

          //-- Create the virtual python environment
          createVirtualenv,

          //-- Install apio through pip
          installOnlineApio,

          //-- Install the apio packages
          //-- apio install <pkg>
          apioInstallSystem,
          apioInstallYosys,
          apioInstallIce40,
          apioInstallECP5,
          apioInstallFujprog,
          apioInstallIcesprog,
          apioInstallDfu,
          apioInstallIverilog,
          apioInstallDrivers,
          apioInstallScons,

          //-- Finish installation!
          installationCompleted
        ]);
      }

      //---------------------------------------------------------------
      //-- Check if there is internet connection
      //--
      function checkInternetConnection(callback) {

        iceConsole.log("**** STEP: Check internet connection");

        //-- Update the progress bar
        updateProgress(
          gettextCatalog.getString("Check Internet connection..."),
          0
        );

        //-- Check the connection
        utils.isOnline(callback, function () {

          //-- This code is executed if the internet connection
          //-- has not been detected

          //-- Close the window
          closeToolchainAlert();

          //-- Stop the spinner
          restoreStatus();

          //-- Show a notification
          resultAlert = alertify.error(
            gettextCatalog.getString("Internet connection required"),
            30
          );
          callback(true);
        });
      }


      //-------------------------------------------------------
      //-- Check if python is available
      //--
      function ensurePythonIsAvailable(callback) {

        iceConsole.log("**** STEP: Check Python");

        //-- Update the progress bar
        updateProgress(gettextCatalog.getString("Check Python..."), 0);

        //-- Read the python executable (if it exists...)
        if (utils.getPythonExecutable()) {
          callback();

        } //-- No python3 detected
          else {
            closeToolchainAlert();
            restoreStatus();
            resultAlert = alertify.error(
              gettextCatalog.getString("At least Python 3.5 is required"),
              30
            );
            callback(true);
        }
      }


      //---------------------------------------------------
      //-- Create the Python virtual environment
      //-- Apio and other python packages are installed in the virtual env
      //-- so that they do not interfere with the rest of the packages  
      //-- installed in your system
      //--
      function createVirtualenv(callback) {

        iceConsole.log("**** STEP: Create virtualenv");

        //-- Update the progress bar
        updateProgress(gettextCatalog.getString("Create virtualenv..."), 10);

        //-- Create the virtual env
        utils.createVirtualenv(callback);
      }


      //------------------------------------------
      //-- Install the apio toolchain
      //--
      function installOnlineApio(callback) {

        iceConsole.log("**** STEP: Install APIO");

        //-- Get the apio package with params
        let apio = utils.getApioParameters();

        //-- Show the installing command in the progres bar windows
        updateProgress("pip " + apio, 30);

        //-- Perform the real installation
        utils.installOnlineApio(callback);
      }


      //-------------------------------------------
      //-- Install the apio system package
      //-- It contains the lsusb and lsftdi tools
      //--
      function apioInstallSystem(callback) {

        iceConsole.log("**** STEP: APIO install system");

        updateProgress("apio install system", 40);
        utils.apioInstall("system", callback);
      }

      //------------------------------------------------------------
      //-- Install the apio Yosys package: 
      //-- It contains the opensource hardware sinthesizer
      //--
      function apioInstallYosys(callback) {

        iceConsole.log("**** STEP: APIO install yosys");

        updateProgress("apio install yosys", 50);
        utils.apioInstall("yosys", callback);
      }

      //-------------------------------------------------------------
      //-- Install the toolchains for the ice40 FPGA family
      //--
      function apioInstallIce40(callback) {

        iceConsole.log("**** STEP: APIO install ice40");

        updateProgress("apio install ice40", 50);
        utils.apioInstall("ice40", callback);
      }

      //--------------------------------------------------------------
      //-- Install the toolchain for the ECP5 FPGA family
      //--
      function apioInstallECP5(callback) {

        iceConsole.log("**** STEP: APIO install ecp5");

        updateProgress("apio install ecp5", 50);
        utils.apioInstall("ecp5", callback);
      }

      //------------------------------------------------------------
      //--  Install the Fujprog programmer
      //--
      function apioInstallFujprog(callback) {

        iceConsole.log("**** STEP: APIO install fujprog");

        updateProgress("apio install fujprog", 50);
        utils.apioInstall("fujprog", callback);
      }

      //-------------------------------------------------------------
      //--  Install the iverilog tool
      //--  It is used for checking the generated verilog
      function apioInstallIverilog(callback) {

        iceConsole.log("**** STEP: APIO install iverilog");

        updateProgress("apio install iverilog", 70);
        utils.apioInstall("iverilog", callback);
      }

      //--------------------------------------------------------------
      //--  Install the Icesprog programer
      //--
      function apioInstallIcesprog(callback) {

        iceConsole.log("**** STEP: APIO install icesprog");

        updateProgress("apio install icesprog", 50);
        utils.apioInstall("icesprog", callback);
      }

      //----------------------------------------------
      //-- Install the DFU programmer
      //--
      function apioInstallDfu(callback) {

        iceConsole.log("**** STEP: APIO install duf");

        updateProgress("apio install dfu", 50);
        utils.apioInstall("dfu", callback);
      }

      //---------------------------------------------
      //-- Install the Drivers
      //--
      function apioInstallDrivers(callback) {
        if (common.WIN32) {

          iceConsole.log("**** STEP: APIO install drivers");

          updateProgress("apio install drivers", 80);
          utils.apioInstall("drivers", callback);
        } else {
          callback();
        }
      }

      //----------------------------------------------
      //-- Install Scons: a building tool, similar to
      //-- make, but in python
      //--
      function apioInstallScons(callback) {

        iceConsole.log("**** STEP: APIO install scons");

        updateProgress("apio install scons", 90);
        utils.apioInstall("scons", callback);
      }

      //---------------------------------------------------
      //--
      function installationCompleted(callback) {

        iceConsole.log("****************** INSTALLATION COMPLETED! **************");
        iceConsole.log("\n\n");

        //-- Check that the toolchain has been installed
        checkToolchain(function () {

          //-- It is installed!
          if (toolchain.installed) {

            //-- Close the notification window
            closeToolchainAlert();

            //-- Update the progress bar
            updateProgress(
              gettextCatalog.getString("Installation completed"),
              100
            );

            //-- Notification: Installed!
            alertify.success(gettextCatalog.getString("Toolchain installed"));
            setupDriversAlert();
          }

          restoreStatus();
          callback();
        });
      }

      function setupDriversAlert() {
        if (common.showDrivers()) {
          var message = gettextCatalog.getString(
            "Click here to <b>setup the drivers</b>"
          );
          if (!infoAlert) {
            setTimeout(function () {
              infoAlert = alertify.message(message, 30);
              infoAlert.callback = function (isClicked) {
                infoAlert = null;
                if (isClicked) {
                  if (resultAlert) {
                    resultAlert.dismiss(false);
                  }
                  $rootScope.$broadcast("enableDrivers");
                }
              };
            }, 1000);
          }
        }
      }

      function updateProgress(message, value) {
        $("#progress-message").text(message);
        var bar = $("#progress-bar");
        if (value === 100) {
          bar.removeClass("progress-bar-striped active");
        }
        bar.text(value + "%");
        bar.attr("aria-valuenow", value);
        bar.css("width", value + "%");
      }

      function initProgress() {
        $("#progress-bar")
          .addClass(
            "notransition progress-bar-info progress-bar-striped active"
          )
          .removeClass("progress-bar-danger")
          .text("0%")
          .attr("aria-valuenow", 0)
          .css("width", "0%")
          .removeClass("notransition");
      }

      function closeToolchainAlert() {
        toolchainAlert.callback();
        toolchainAlert.close();
      }

      //-- The interface is changed to the waiting state
      //-- The spinner is activated
      function installationStatus() {

        // Disable user events
        utils.disableKeyEvents();
        utils.disableClickEvents();

        //-- Spiner on!
        $("body").addClass("waiting");
      }

      //-- The interface is changed to the normal state
      //-- The spinner is stoped
      function restoreStatus() {

        // Enable user events
        utils.enableKeyEvents();
        utils.enableClickEvents();

        //-- Spinner off!
        $("body").removeClass("waiting");
      }

      // Collections management

      this.addCollections = function (filepaths) {
        // Load zip file
        async.eachSeries(filepaths, function (filepath, nextzip) {
          //alertify.message(gettextCatalog.getString('Load {{name}} ...', { name: utils.bold(utils.basename(filepath)) }));
          var zipData = nodeAdmZip(filepath);
          var _collections = getCollections(zipData);

          async.eachSeries(
            _collections,
            function (collection, next) {
              setTimeout(function () {
                if (
                  collection.package &&
                  (collection.blocks || collection.examples)
                ) {
                  alertify.prompt(
                    gettextCatalog.getString("Edit the collection name"),
                    collection.origName,
                    function (evt, name) {
                      if (!name) {
                        return false;
                      }
                      collection.name = name;

                      var destPath = nodePath.join(
                        common.INTERNAL_COLLECTIONS_DIR,
                        name
                      );
                      if (nodeFs.existsSync(destPath)) {
                        alertify.confirm(
                          gettextCatalog.getString(
                            "The collection {{name}} already exists.",
                            {
                              name: utils.bold(name)
                            }
                          ) +
                            "<br>" +
                            gettextCatalog.getString(
                              "Do you want to replace it?"
                            ),
                          function () {
                            utils.deleteFolderRecursive(destPath);
                            installCollection(collection, zipData);
                            alertify.success(
                              gettextCatalog.getString(
                                "Collection {{name}} replaced",
                                {
                                  name: utils.bold(name)
                                }
                              )
                            );
                            next(name);
                          },
                          function () {
                            alertify.warning(
                              gettextCatalog.getString(
                                "Collection {{name}} not replaced",
                                {
                                  name: utils.bold(name)
                                }
                              )
                            );
                            next(name);
                          }
                        );
                      } else {
                        installCollection(collection, zipData);
                        alertify.success(
                          gettextCatalog.getString(
                            "Collection {{name}} added",
                            {
                              name: utils.bold(name)
                            }
                          )
                        );
                        next(name);
                      }
                    }
                  );
                } else {
                  alertify.warning(
                    gettextCatalog.getString("Invalid collection {{name}}", {
                      name: utils.bold(name)
                    })
                  );
                }
              }, 0);
            },
            function (name) {
              collections.loadInternalCollections();
              // If the selected collection is replaced, load it again
              if (common.selectedCollection.name === name) {
                collections.selectCollection(name);
              }
              utils.rootScopeSafeApply();
              nextzip();
            }
          );
        });
      };

      function getCollections(zipData) {
        var data = "";
        var _collections = {};
        var zipEntries = zipData.getEntries();

        // Validate collections
        zipEntries.forEach(function (zipEntry) {
          data = zipEntry.entryName.match(/^([^\/]+)\/$/);
          if (data) {
            _collections[data[1]] = {
              origName: data[1],
              blocks: [],
              examples: [],
              locale: [],
              package: ""
            };
          }

          addCollectionItem("blocks", "ice", _collections, zipEntry);
          addCollectionItem("blocks", "v", _collections, zipEntry);
          addCollectionItem("blocks", "vh", _collections, zipEntry);
          addCollectionItem("blocks", "list", _collections, zipEntry);
          addCollectionItem("examples", "ice", _collections, zipEntry);
          addCollectionItem("examples", "v", _collections, zipEntry);
          addCollectionItem("examples", "vh", _collections, zipEntry);
          addCollectionItem("examples", "list", _collections, zipEntry);
          addCollectionItem("locale", "po", _collections, zipEntry);

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
        var data = zipEntry.entryName.match(
          RegExp("^([^/]+)/" + key + "/.*." + ext + "$")
        );
        if (data) {
          collections[data[1]][key].push(zipEntry.entryName);
        }
      }

      function installCollection(collection, zip) {
        var i,
          dest = "";
        var pattern = RegExp("^" + collection.origName);
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
          var compiler = new nodeGettext.Compiler({
            format: "json"
          });
          var sourcePath = nodePath.join(common.INTERNAL_COLLECTIONS_DIR, dest);
          var targetPath = nodePath.join(
            common.INTERNAL_COLLECTIONS_DIR,
            dest.replace(/\.po$/, ".json")
          );
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
          zip.extractEntryTo(
            entry,
            utils.dirname(newPath),
            /*maintainEntryPath*/ false
          );
        } catch (e) {}
      }

      this.removeCollection = function (collection) {
        utils.deleteFolderRecursive(collection.path);
        collections.loadInternalCollections();
        alertify.success(
          gettextCatalog.getString("Collection {{name}} removed", {
            name: utils.bold(collection.name)
          })
        );
      };

      this.removeAllCollections = function () {
        utils.removeCollections();
        collections.loadInternalCollections();
        alertify.success(gettextCatalog.getString("All collections removed"));
      };
      this.checkForNewVersion = function () {
        if (typeof _package.updatecheck !== "undefined") {
          $.getJSON(
            _package.updatecheck + "?_tsi=" + new Date().getTime(),
            function (result) {
              var hasNewVersion = false;
              if (result !== false) {
                if (
                  typeof result.version !== "undefined" &&
                  _package.version < result.version
                ) {
                  hasNewVersion = "stable";
                }
                if (
                  typeof result.nightly !== "undefined" &&
                  _package.version < result.nightly
                ) {
                  hasNewVersion = "nightly";
                }
                if (hasNewVersion !== false) {
                  var msg = "";
                  if (hasNewVersion === "stable") {
                    msg =
                      '<div class="new-version-notifier-box"><div class="new-version-notifier-box--icon"><img src="resources/images/confetti.svg"></div>\
                                          <div class="new-version-notifier-box--text">' +
                      gettextCatalog.getString(
                        "There is a new stable version available"
                      ) +
                      '<br/><a class="action-open-url-external-browser" href="https://icestudio.io" target="_blank">Click here to download it.</a></div></div>';
                  } else {
                    msg =
                      '<div class="new-version-notifier-box"><div class="new-version-notifier-box--icon"><img src="resources/images/confetti.svg"></div>\
                                          <div class="new-version-notifier-box--text">' +
                      gettextCatalog.getString(
                        "There is a new nightly version available"
                      ) +
                      '<br/><a class="action-open-url-external-browser" href="https://icestudio.io" target="_blank">Click here to download it.</a></div></div>';
                  }
                  alertify.notify(msg, "notify", 30);
                }
              }
            }
          );
        }
      };
      this.ifDevelopmentMode = function () {
        if (
          typeof _package.development !== "undefined" &&
          typeof _package.development.mode !== "undefined" &&
          _package.development.mode === true
        ) {
          utils.openDevToolsUI();
        }
      };

      this.initializePluginManager = function (callbackOnRun) {
        if (typeof ICEpm !== "undefined") {
          ICEpm.setEnvironment(common);
          ICEpm.setPluginDir(common.DEFAULT_PLUGIN_DIR, function () {
            let plist = ICEpm.getAll();
            let uri = ICEpm.getBaseUri();
            let t = $(".icm-icon-list");
            t.empty();
            let html = "";
            for (let prop in plist) {
              if (
                typeof plist[prop].manifest.type === "undefined" ||
                plist[prop].manifest.type === "app"
              ) {
                html +=
                  '<a href="#" data-action="icm-plugin-run" data-plugin="' +
                  prop +
                  '"><img class="icm-plugin-icon" src="' +
                  uri +
                  "/" +
                  prop +
                  "/" +
                  plist[prop].manifest.icon +
                  '"><span>' +
                  plist[prop].manifest.name +
                  "</span></a>";
              }
            }
            t.append(html);

            $('[data-action="icm-plugin-run"]').off();
            $('[data-action="icm-plugin-run"]').on("click", function (e) {
              e.preventDefault();
              let ptarget = $(this).data("plugin");
              if (typeof callbackOnRun !== "undefined") {
                callbackOnRun();
              }
              ICEpm.run(ptarget);
              return false;
            });
          });
        }
      };
    }
  );
