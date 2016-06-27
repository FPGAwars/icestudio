'use strict';

angular.module('icestudio')
    .service('utils', ['nodeFs', 'nodeOs', 'nodePath', 'nodeChildProcess', 'nodeTarball',
      function(nodeFs, nodeOs, nodePath, nodeChildProcess, nodeTarball) {

        const WIN32 = Boolean(nodeOs.platform().indexOf('win32') > -1);
        const DARWIN = Boolean(nodeOs.platform().indexOf('darwin') > -1);

        const VENV = 'virtualenv-15.0.1';
        const VENVPATH = nodePath.join('_build', VENV);
        const VENVTARGZ = nodePath.join('res', 'virtualenv', VENV + '.tar.gz');

        const BASE_DIR = process.env.HOME || process.env.USERPROFILE;
        const ICESTUDIO_DIR = nodePath.join(BASE_DIR, '.icestudio');
        const ENV_DIR = _get_env_dir(nodePath.join(ICESTUDIO_DIR, 'venv'));
        const ENV_BIN_DIR = nodePath.join(ENV_DIR, WIN32 ? 'Scripts' : 'bin');

        function _get_env_dir(defaultEnvDir) {
          if (WIN32) {
            // Put the env directory to the root of the current local disk when
            // default path contains non-ASCII characters. Virtualenv will fail to
            for (const char of defaultEnvDir) {
              if (char.charCodeAt(0) > 127) {
                const defaultEnvDirFormat = nodeOs.parse(defaultEnvDir);
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

            for (const executable of possibleExecutables) {
              if (isPython2(executable)) {
                _pythonExecutableCached = executable;
                break;
              }
            }

            if (!_pythonExecutableCached) {
              throw new Error('Python 2.7 could not be found.');
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
            if(err)
              console.log(err)
            if (callback)
              callback();
          })
        }

        this.extractVirtualEnv = function(callback) {
          this.extractTargz(VENVTARGZ, '_build', callback);
        }

        this.ensureEnvDirExists = function(callback) {
          if (!nodeFs.existsSync(ICESTUDIO_DIR))
            nodeFs.mkdirSync(ICESTUDIO_DIR);
          if (!nodeFs.existsSync(ENV_DIR))
            nodeFs.mkdirSync(ENV_DIR);
          if (callback)
            callback();
        }

        this.executePythonCommand = function(args, callback) {
          nodeChildProcess.exec([this.getPythonExecutable(), args].join(' '),
            function (error, stdout, stderr) {
              if (callback)
                callback();
            }
          );
        }

        this.makeVenvDirectory = function(callback) {
          this.executePythonCommand([nodePath.join(VENVPATH, 'virtualenv.py'), ENV_DIR].join(' '), callback)
        }

        this.basename = function(filepath) {
          return filepath.replace(/^.*[\\\/]/, '').split('.')[0];
        };

    }]);
