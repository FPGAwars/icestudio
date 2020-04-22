'use strict';

angular.module('icestudio')
  .service('common', function (nodePath,
    nodeTmp) {

    // Project version
    this.VERSION = '1.2';

    // Project status
    this.hasChangesSinceBuild = false;

    // All project dependencies
    this.allDependencies = {};

    // Selected board
    this.boards = [];
    this.selectedBoard = null;
    this.pinoutInputHTML = '';
    this.pinoutOutputHTML = '';

    // Selected collection
    this.defaultCollection = null;
    this.internalCollections = [];
    this.externalCollections = [];
    this.selectedCollection = null;

    // FPGA resources
    this.FPGAResources = {
      ffs: '-',
      luts: '-',
      pios: '-',
      plbs: '-',
      brams: '-'
    };

    // Debug mode (uncomment)
    // this.DEBUGMODE = 1;

    // Command output
    this.commandOutput = '';

    // Apio URL
    this.APIO_PIP_VCS = 'git+https://github.com/FPGAwars/apio.git@%BRANCH%#egg=apio';

    // OS
    this.LINUX = Boolean(process.platform.indexOf('linux') > -1);
    this.WIN32 = Boolean(process.platform.indexOf('win32') > -1);
    this.DARWIN = Boolean(process.platform.indexOf('darwin') > -1);

    // Paths
    this.LOCALE_DIR = nodePath.join('resources', 'locale');
    this.SAMPLE_DIR = nodePath.join('resources', 'sample');
    this.DEFAULT_COLLECTION_DIR = nodePath.resolve(nodePath.join('resources', 'collection'));
    this.DEFAULT_PLUGIN_DIR = nodePath.resolve(nodePath.join('resources', 'plugins'));


    this.BASE_DIR = process.env.HOME || process.env.USERPROFILE;
    this.LOGFILE = nodePath.join(this.BASE_DIR, 'icestudio.log');
    this.ICESTUDIO_DIR = safeDir(nodePath.join(this.BASE_DIR, '.icestudio'), this);
    this.INTERNAL_COLLECTIONS_DIR = nodePath.join(this.ICESTUDIO_DIR, 'collections');
    this.APIO_HOME_DIR = nodePath.join(this.ICESTUDIO_DIR, 'apio');
    this.PROFILE_PATH = nodePath.join(this.ICESTUDIO_DIR, 'profile.json');
    this.CACHE_DIR = nodePath.join(this.ICESTUDIO_DIR, '.cache');
    this.OLD_BUILD_DIR = nodePath.join(this.ICESTUDIO_DIR, '.build');

    this.VENV = 'virtualenv-16.7.10';
    this.VENV_DIR = nodePath.join(this.CACHE_DIR, this.VENV);
    this.VENV_ZIP = nodePath.join('resources', 'virtualenv', this.VENV + '.zip');

    this.APP_DIR = nodePath.dirname(process.execPath);
    this.TOOLCHAIN_DIR = nodePath.join(this.APP_DIR, 'toolchain');

    this.DEFAULT_PYTHON_PACKAGES = 'default-python-packages';
    this.DEFAULT_PYTHON_PACKAGES_DIR = nodePath.join(this.CACHE_DIR, this.DEFAULT_PYTHON_PACKAGES);
    this.DEFAULT_PYTHON_PACKAGES_ZIP = nodePath.join(this.TOOLCHAIN_DIR, this.DEFAULT_PYTHON_PACKAGES + '.zip');

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

    this.BUILD_DIR_OBJ = new nodeTmp.dirSync({
      prefix: 'icestudio-',
      unsafeCleanup: true
    });
    this.BUILD_DIR = this.BUILD_DIR_OBJ.name;

    this.PATTERN_PORT_LABEL = /^([A-Za-z_][A-Za-z_$0-9]*)?(\[([0-9]+):([0-9]+)\])?$/;
    this.PATTERN_PARAM_LABEL = /^([A-Za-z_][A-Za-z_$0-9]*)?$/;

    this.PATTERN_GLOBAL_PORT_LABEL = /^([^\[\]]+)?(\[([0-9]+):([0-9]+)\])?$/;
    this.PATTERN_GLOBAL_PARAM_LABEL = /^([^\[\]]+)?$/;

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

    this.showToolchain = function () {
      return (this.selectedBoard && this.selectedBoard.info.interface !== 'GPIO') || false;
    };

    this.showDrivers = function () {
      return (this.selectedBoard && (this.selectedBoard.info.interface === 'FTDI' || this.selectedBoard.info.interface === 'Serial')) || false;
    };
    this.isEditingSubmodule = false;
  });
