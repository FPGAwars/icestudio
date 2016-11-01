'use strict';

angular.module('icestudio')
    .service('utils', ['nodeFs', 'nodeOs', 'nodePath', 'nodeChildProcess', 'nodeTarball', 'nodeZlib',
      function(nodeFs, nodeOs, nodePath, nodeChildProcess, nodeTarball, nodeZlib) {

        const WIN32 = Boolean(nodeOs.platform().indexOf('win32') > -1);
        const DARWIN = Boolean(nodeOs.platform().indexOf('darwin') > -1);

        const VENV = 'virtualenv-15.0.1';
        const VENV_DIR = nodePath.join('_build', VENV);
        const VENV_TARGZ = nodePath.join('resources', 'virtualenv', VENV + '.tar.gz');

        const BASE_DIR = process.env.HOME || process.env.USERPROFILE;
        const APIO_DIR = nodePath.join(BASE_DIR, '.apio');
        const ICESTUDIO_DIR = nodePath.join(BASE_DIR, '.icestudio');
        const ENV_DIR = _get_env_dir(nodePath.join(ICESTUDIO_DIR, 'venv'));
        const ENV_BIN_DIR = nodePath.join(ENV_DIR, WIN32 ? 'Scripts' : 'bin');

        const ENV_PIP = nodePath.join(ENV_BIN_DIR, 'pip');
        const ENV_APIO = nodePath.join(ENV_BIN_DIR, WIN32 ? 'apio.exe' : 'apio');
        const SYSTEM_APIO = '/usr/bin/apio';

        function _get_env_dir(defaultEnvDir) {
          if (WIN32) {
            // Put the env directory to the root of the current local disk when
            // default path contains non-ASCII characters. Virtualenv will fail to
            for (var i in defaultEnvDir) {
              var char = defaultEnvDir[i];
              if (char.charCodeAt(0) > 127) {
                var defaultEnvDirFormat = nodeOs.parse(defaultEnvDir);
                return nodeOs.format({
                  root: defaultEnvDirFormat.root,
                  dir: defaultEnvDirFormat.root,
                  base: '.icestudiovenv',
                  name: '.icestudiovenv',
                });
              }
            }
          }

          return defaultEnvDir;
        };

        var _pythonExecutableCached = null;
        // Get the system executable
        this.getPythonExecutable = function() {
          if (!_pythonExecutableCached) {
            const possibleExecutables = [];

            if (WIN32) {
              possibleExecutables.push('python.exe');
              possibleExecutables.push('C:\\Python27\\python.exe');
            } else {
              possibleExecutables.push('python2.7');
              possibleExecutables.push('python');
            }

            for (var i in possibleExecutables) {
              var executable = possibleExecutables[i];
              if (isPython2(executable)) {
                _pythonExecutableCached = executable;
                break;
              }
            }
          }
          return _pythonExecutableCached;
        };

        function isPython2(executable) {
          const args = ['-c', 'import sys; print \'.\'.join(str(v) for v in sys.version_info[:2])'];
          try {
            const result = nodeChildProcess.spawnSync(executable, args);
            return 0 === result.status && result.stdout.toString().startsWith('2.7');
          } catch(e) {
            return false;
          }
        };

        this.extractTargz = function(source, destination, callback) {
          nodeTarball.extractTarball(source, destination, function(err) {
            if(err) {
              //console.log(err);
              callback(true);
            }
            else {
              callback();
            }
          })
        }

        this.extractVirtualEnv = function(callback) {
          this.extractTargz(VENV_TARGZ, '_build', callback);
        }

        function disableClick(e) {
          e.stopPropagation();
          e.preventDefault();
        }

        function enableClickEvent() {
          document.removeEventListener('click', disableClick, true);
        }

        function disableClickEvent() {
          document.addEventListener('click', disableClick, true);
        }

        this.enableClickEvent = enableClickEvent;
        this.disableClickEvent = disableClickEvent;

        this.executeCommand = function(command, callback) {
          nodeChildProcess.exec(command.join(' '),
            function (error, stdout, stderr) {
              if (error) {
                //console.log(error, stdout, stderr);
                enableClickEvent();
                callback(true);
                angular.element('#progress-message')
                  .text('Remove the current toolchain');
                angular.element('#progress-bar')
                  .addClass('notransition progress-bar-danger')
                  .removeClass('progress-bar-info progress-bar-striped active')
                  .text('Error')
                  .attr('aria-valuenow', 100)
                  .css('width', '100%');
              }
              else {
                callback();
              }
            }
          );
        }

        this.makeVenvDirectory = function(callback) {
          if (!nodeFs.existsSync(ICESTUDIO_DIR))
            nodeFs.mkdirSync(ICESTUDIO_DIR);
          if (!nodeFs.existsSync(ENV_DIR)) {
            nodeFs.mkdirSync(ENV_DIR);
            this.executeCommand(
              [this.getPythonExecutable(), nodePath.join(VENV_DIR, 'virtualenv.py'), ENV_DIR], callback)
          }
          else {
            callback();
          }
        }

        this.installApio = function(callback) {
          this.executeCommand([ENV_PIP, 'install', '-U', 'apio'], callback);
        }

        this.apioInstall = function(_package, callback) {
          this.executeCommand([ENV_APIO, 'install', _package], callback);
        }

        this.getApioExecutable = function() {
          var exists = nodeFs.existsSync(process.env.ICESTUDIO_APIO ?
            process.env.ICESTUDIO_APIO : SYSTEM_APIO);
          if (exists) {
            alertify.notify('Using system wide apio', 'message', 5);
            return SYSTEM_APIO;
          }
          return ENV_APIO;
        }

        this.removeToolchain = function() {
          deleteFolderRecursive(APIO_DIR);
          deleteFolderRecursive(ICESTUDIO_DIR);
        }

        var deleteFolderRecursive = function(path) {
          if (nodeFs.existsSync(path)) {
            nodeFs.readdirSync(path).forEach(function(file,index){
              var curPath = nodePath.join(path, file);
              if (nodeFs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
              }
              else { // delete file
                nodeFs.unlinkSync(curPath);
              }
            });
            nodeFs.rmdirSync(path);
          }
        }

        this.sep = nodePath.sep;

        this.basename = basename;
        function basename(filepath) {
          return nodePath.basename(filepath).split('.')[0];
        }

        this.dirname = function(filepath) {
          return nodePath.dirname(filepath);
        }

        this.readFile = function(filepath, callback) {
          nodeFs.readFile(filepath,
            function(err, data) {
              if (!err && callback) {
                decompressJSON(data, callback);
              }
          });
        }

        var saveBin = false;

        this.saveFile = function(filepath, content, callback, compress) {
          if (compress) {
            compressJSON(content, function(compressed) {
              nodeFs.writeFile(filepath, compressed, saveBin ? 'binary' : null,
              function(err) {
                if (!err && callback) {
                  callback();
                }
              });
            });
          }
          else {
            nodeFs.writeFile(filepath, content, function(err) {
              if (!err && callback) {
                callback();
              }
            });
          }
        }

        function compressJSON(json, callback) {
          if (!saveBin) {
            if (callback)
              callback(JSON.stringify(json, null, 2));
          }
          else {
            var data = JSON.stringify(json);
            nodeZlib.gzip(data, function (_, result) {
              if (callback)
                callback(result);
            });
          }
        }

        function decompressJSON(json, callback) {
          var data = isJSON(json);
          if (data) {
            if (callback)
              callback(data);
          }
          else {
            nodeZlib.gunzip(json, function(_, uncompressed) {
              var result = JSON.parse(uncompressed);
              if (callback)
                callback(result);
            });
          }
        }

        function isJSON(str) {
          var result = false;
          try {
            result = JSON.parse(str);
          } catch (e) {
            return false;
          }
          return result;
        }

        this.getFilesRecursive = getFilesRecursive;

        function getFilesRecursive(folder, extension) {
          var fileContents = nodeFs.readdirSync(folder),
              fileTree = [],
              stats;

          fileContents.forEach(function (fileName) {
            var filePath = nodePath.join(folder, fileName);
            stats = nodeFs.lstatSync(filePath);

            if (stats.isDirectory()) {
              fileTree.push({
                name: fileName,
                children: getFilesRecursive(filePath, extension)
              });
            } else {
              if (fileName.endsWith(extension)) {
                var content = JSON.parse(nodeFs.readFileSync(filePath).toString());
                fileTree.push({
                  name: basename(fileName),
                  content: content
                });
              }
            }
          });

          return fileTree;
        };

    }]);
