'use strict';

angular.module('icestudio')
  .service('common', function(nodePath,
                              nodeTemp) {

    // Project version
    this.VERSION = '1.1';

    // All project dependencies
    this.allDependencies = {};

    // Selected board
    this.boards = [];
    this.selectedBoard = null;
    this.pinoutInputHTML = '';
    this.pinoutOutputHTML = '';

    // Selected collection
    this.collections = [];
    this.selectedCollection = null;

    // FPGA resources
    this.FPGAResources = {
      pios: {
        used: '-',
        total: 96
      },
      plbs: {
        used: '-',
        total: 160
      },
      brams: {
        used: '-',
        total: 16
      }
    };

    // OS
    this.LINUX = Boolean(process.platform.indexOf('linux') > -1);
    this.WIN32 = Boolean(process.platform.indexOf('win32') > -1);
    this.DARWIN = Boolean(process.platform.indexOf('darwin') > -1);

    // Paths
    this.LOCALE_DIR = nodePath.join('resources', 'locale');
    this.SAMPLE_DIR = nodePath.join('resources', 'sample');

    this.BASE_DIR = process.env.HOME || process.env.USERPROFILE;
    this.ICESTUDIO_DIR = safeDir(nodePath.join(this.BASE_DIR, '.icestudio'), this);
    this.COLLECTIONS_DIR = nodePath.join(this.ICESTUDIO_DIR, 'collections');
    this.APIO_HOME_DIR = nodePath.join(this.ICESTUDIO_DIR, 'apio');
    this.PROFILE_PATH = nodePath.join(this.ICESTUDIO_DIR, 'profile.json');
    this.CACHE_DIR = nodePath.join(this.ICESTUDIO_DIR, '.cache');
    this.OLD_BUILD_DIR = nodePath.join(this.ICESTUDIO_DIR, '.build');

    this.VENV = 'virtualenv-15.0.1';
    this.VENV_DIR = nodePath.join(this.CACHE_DIR, this.VENV);
    this.VENV_ZIP = nodePath.join('resources', 'virtualenv', this.VENV + '.zip');

    this.APP_DIR = nodePath.dirname(process.execPath);
    this.TOOLCHAIN_DIR = nodePath.join(this.APP_DIR, 'toolchain');

    this.DEFAULT_APIO = 'default-apio';
    this.DEFAULT_APIO_DIR = nodePath.join(this.CACHE_DIR, this.DEFAULT_APIO);
    this.DEFAULT_APIO_ZIP = nodePath.join(this.TOOLCHAIN_DIR, this.DEFAULT_APIO + '.zip');

    this.DEFAULT_APIO_PACKAGES = 'default-apio-packages';
    this.DEFAULT_APIO_PACKAGES_ZIP = nodePath.join(this.TOOLCHAIN_DIR, this.DEFAULT_APIO_PACKAGES + '.zip');

    this.ENV_DIR = nodePath.join(this.ICESTUDIO_DIR, 'venv');
    this.ENV_BIN_DIR = nodePath.join(this.ENV_DIR, this.WIN32 ? 'Scripts' : 'bin');
    this.ENV_PIP = nodePath.join(this.ENV_BIN_DIR, 'pip');
    this.ENV_APIO = nodePath.join(this.ENV_BIN_DIR, this.WIN32 ? 'apio.exe' : 'apio');
    this.APIO_CMD = (this.WIN32 ? 'set' : 'export') + ' APIO_HOME_DIR=' + this.APIO_HOME_DIR + (this.WIN32 ? '& ' : '; ') + '"' + this.ENV_APIO + '"';

    this.BUILD_DIR = new nodeTemp.Dir().path;

    function safeDir(_dir, self) {
      if (self.WIN32) {
        // Put the env directory to the root of the current local disk when
        // default path contains non-ASCII characters. Virtualenv will fail to
        for (var i in _dir) {
          if (_dir[i].charCodeAt(0) > 127) {
            const _dirFormat = nodePath.parse(_dir);
            return nodePath.format({
              root: _dirFormat.root,
              dir: _dirFormat.root,
              base: '.icestudio',
              name: '.icestudio',
            });
          }
        }
      }
      return _dir;
    }

  });
