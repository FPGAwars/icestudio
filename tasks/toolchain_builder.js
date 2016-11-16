// Toolchain builder

var fs = require('fs');
    path = require('path');
    childProcess = require('child_process');
    tarball = require('tarball-extract');
    _ = require('lodash');
    inherits = require('inherits');
    EventEmitter = require('events').EventEmitter;

// We inherit from EventEmitter for logging
inherits(ToolchainBuilder, EventEmitter);
module.exports = ToolchainBuilder;
function ToolchainBuilder(options) {
  var defaults = {
    apioMin: '0.1.9',
    apioMax: '0.2.0',
    buildDir: './build',
    cacheDir: './cache',
    platforms: ['linux64'],
  };

  // Assign options
  this.options = _.defaults(options, defaults);

  var venvRelease = 'virtualenv-15.0.1';

  // Prepare aux directories
  this.options.toolchainDir = path.join(this.options.cacheDir, 'toolchain');
  this.options.tmpDir = path.join(this.options.toolchainDir, 'tmp');
  this.options.apioDir = path.join(this.options.tmpDir, 'default-apio');
  this.options.apioPackagesDir = path.join(this.options.tmpDir, 'default-apio-packages');

  this.options.venvExtractDir = path.join(this.options.tmpDir, venvRelease);
  this.options.venvTarPath = path.join('app', 'resources', 'virtualenv', venvRelease + '.tar.gz');

  this.options.venvDir = path.join(this.options.tmpDir, 'venv');
  this.options.venvBinDir = path.join(this.options.venvDir, process.platform === 'win32' ? 'Scripts' : 'bin');
  this.options.venvPip = path.join(this.options.venvBinDir, 'pip');
  this.options.venvApio = path.join(this.options.venvBinDir, 'apio');
}


ToolchainBuilder.prototype.build = function (callback) {
  var hasCallback = (typeof callback === 'function'),
      done = Promise.defer();

  // Let's create the standalone toolchains
  this.ensurePythonIsAvailable()
      .then(this.extractVirtualenv.bind(this))
      .then(this.createVirtualenv.bind(this))
      .then(this.downloadApio.bind(this))
      .then(this.installApio.bind(this))
      .then(this.downloadApioPackages.bind(this))
      //.then(this.downloadApio.bind(this))
      .then(function (info) {
        var result = info || this;

        if(hasCallback) {
          callback(false, result);
        } else {
          done.resolve(result);
        }
      })
      .catch(function (error) {
        if(hasCallback) {
          callback(error);
        } else {
          done.reject(error);
        }
      });

    return hasCallback ? true : done.promise;
}

ToolchainBuilder.prototype.ensurePythonIsAvailable = function () {
  return new Promise(function(resolve, reject) {
    if (getPythonExecutable()) { resolve(); }
    else { reject('Python 2.7 is not available'); }
  });
}

ToolchainBuilder.prototype.extractVirtualenv = function () {
  var self = this;
  self.emit('log', '> Extract virtualenv tarball');
  return new Promise(function(resolve, reject) {
    /*if (!fs.existsSync(self.options.tmpDir)) {
      fs.mkdirSync(self.options.tmpDir);
    }*/
    tarball.extractTarball(self.options.venvTarPath, self.options.tmpDir, function(error) {
      if (error) { reject(error) }
      else { resolve(); }
    });
  });
}

ToolchainBuilder.prototype.createVirtualenv = function () {
  var self = this;
  self.emit('log', '> Create virtualenv');
  return new Promise(function(resolve, reject) {
    var command = [
      getPythonExecutable(),
      path.join(self.options.venvExtractDir, 'virtualenv.py'),
      self.options.venvDir
    ];
    childProcess.exec(command.join(' '),
      function (error, stdout, stderr) {
        if (error) { reject(error); }
        else { resolve(); }
      }
    );
  });
}

ToolchainBuilder.prototype.downloadApio = function () {
  var self = this;
  self.emit('log', '> Download apio');
  return new Promise(function(resolve, reject) {
    var command = [
      self.options.venvPip, 'download', '--dest', self.options.apioDir,
      'apio">=' + self.options.apioMin + ',<' + self.options.apioMax + '"'
    ];
    childProcess.exec(command.join(' '),
      function (error, stdout, stderr) {
        if (error) { reject(error); }
        else { resolve(); }
      }
    );
  });
}

ToolchainBuilder.prototype.installApio = function () {
  var self = this;
  self.emit('log', '> Install apio');
  return new Promise(function(resolve, reject) {
    var command = [
      self.options.venvPip, 'install', '--no-deps', path.join(self.options.apioDir, '*.*')
    ];
    childProcess.exec(command.join(' '),
      function (error, stdout, stderr) {
        if (error) { reject(error); }
        else { resolve(); }
      }
    );
  });
}

ToolchainBuilder.prototype.downloadApioPackages = function () {
  var self = this;
  self.emit('log', '> Download apio packages');
  self.emit('log', '>> linux64');
  return new Promise(function(resolve, reject) {
    var command = [
      'export', 'APIO_HOME_DIR=' + self.options.apioPackagesDir, ';',
      self.options.venvApio, 'install', 'system', '--platform', 'linux_x86_64' // TODO: use platforms
    ];
    childProcess.exec(command.join(' '),
      function (error, stdout, stderr) {
        if (error) { reject(error); }
        else { resolve(); }
      }
    );
  });
}



// Auxiliar functions

var _pythonExecutableCached = null;
// Get the system executable
function getPythonExecutable() {
  if (!_pythonExecutableCached) {
    const possibleExecutables = [];

    if (process.platform === 'win32') {
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
}

function isPython2(executable) {
  const args = ['-c', 'import sys; print \'.\'.join(str(v) for v in sys.version_info[:2])'];
  try {
    const result = childProcess.spawnSync(executable, args);
    return 0 === result.status && result.stdout.toString().startsWith('2.7');
  } catch(e) {
    return false;
  }
}
