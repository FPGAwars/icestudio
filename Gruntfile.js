//------------------------------------------------------
//-- Grunt configuration file
//-- Grunt is a tool for Automating tasks
//-- More information: https://gruntjs.com/
//------------------------------------------------------

//------------------------------------------------------
//-- HOW to invoke the tasks defined in Grunt:
//--
//--  $ grunt serve -->   Start Icestudio
//--  $ grunt dist  -->   Create the Icestudio package for all
//--                      the architectures
//--  $ grunt jshint -->  Validate the Javascript files
//--  $ grunt clean  -->  Clean all the generated files from
//--                      the dist tasks (building packages)
//--  $ grunt gettext-->  Extract all the English strings and
//--       write them in the app/resources/locale/template.pot
//--       for being translated into other languages later
//--------------------------------------------------------------

//--------------------------------------------------------------------
//-- How the translation process works
//--
//-- * The text strings in the .js Javascript files are in English
//-- * When 'grunt gettext' is invoked, the English texts are extracted
//--   to the app/resources/locale/template.pot file
//--   (an additional step 'msgmerge' is provided externally, which is
//--   required to re-baseline all the language .po files to the latest
//--   template.pot structure & contents)
//-- * The human translator imports the template.pot file (in PoEdit) and
//--   writes the translation into their language, in the corresponding
//--   .po file
//-- * When 'grunt compiletext' is invoked, the .po files are converted into
//--   .json
//-- * When Icestudio starts ('grunt serve'), the .json files are read
//--
//-- Developer info on preptext, compiletext, update_translations.sh:
//--   https://github.com/FPGAwars/icestudio/wiki/Translating-Icestudio
//--
//--------------------------------------------------------------------

//--------------------------------------------------------------------
//-- How to upgrade to a new version of NW
//--
//-- Since NWjs >= 0.83 ARM Linux is officially supported, so the
//-- build for all the platforms (linux64, aarch64, win64, osx64,
//-- osxarm64) goes through the standard nw-builder pipeline.
//--
//--  1. Bump the NW version in the root package.json:
//--       "nw": "0.111.3-sdk"
//--     (keep the "-sdk" suffix for local dev; flavor is controlled
//--      independently in the Gruntfile, see below)
//--
//--  2. Remove the cache/ and dist/ folders and run `npm install` to
//--     pull the new NW binary.
//--
//--  3. Build for each platform:
//--       npm run buildLinux64
//--       npm run buildAarch64
//--       npm run buildWindows
//--       npm run buildOSX
//--       npm run buildOSXARM64
//--
//-- ----------------------------------------------------------------
//-- NW build FLAVOR (sdk vs normal)
//-- ----------------------------------------------------------------
//-- Two flavors are supported:
//--   - "sdk"    Includes the DevTools, larger binary. Used for WIP.
//--   - "normal" Smaller, used for stable releases.
//--
//-- Resolution order (first match wins):
//--   1. CLI option:        grunt dist --flavor=normal
//--   2. Environment var:   NW_FLAVOR=normal npm run buildLinux64
//--   3. WIP default:       WIP=true  -> "sdk"
//--                         WIP=false -> "normal"
//-- ----------------------------------------------------------------

'use strict';

// Disable Deprecation Warnings
// (node:18670) [DEP0022] DeprecationWarning: os.tmpDir() is deprecated.
// Use os.tmpdir() instead.
let os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
os.tmpDir = os.tmpdir;

//-- This is for debugging...
console.log('Executing Gruntfile.js...');
//---------------------------------------------------------------------------
//-- Wrapper function. This function is called when the 'grunt' command is
//-- executed. Grunt exposes all of its methods and properties on the
//-- grunt object passed as an argument
//-- Check the API here: https://gruntjs.com/api/grunt
//----------------------------------------------------------------------------
module.exports = function (grunt) {
  //----------------------------------------------------------
  //-- GLOBAL constants used
  //----------------------------------------------------------

  //-- Is this a WIP release (Work in Progress) or
  //-- a stable release?
  //-- WIP = true --> Work in progress
  //-- WIP = false --> Stable release
  const WIP = true;

  //-- Icestudio App dir
  const APPDIR = 'app';

  //-- Icestudio package.json
  const PACKAGE_JSON = 'package.json';

  //-- Icestudio package.json with PATH
  const APP_PACKAGE_JSON = APPDIR + '/' + PACKAGE_JSON;

  //-- Timestamp JSON file
  const BUILDINFO_JSON = 'buildinfo.json';

  //-- Timestamp file. This file is created everytime grunt
  //-- is executed. Icestudio reads this file
  const APP_TIMESTAMP_FILE = APPDIR + '/' + BUILDINFO_JSON;

  //-- Folder with the Icestudio Javascript files
  const APP_SCRIPTS = APPDIR + '/scripts';

  //-- Folder with the Icestudio resources
  const APP_RESOURCES = APPDIR + '/resources';

  //-- Folder to store the default collection
  const DEFAULT_COLLECTION_FOLDER = APP_RESOURCES + '/collection';

  //-- Folder with the Default collection translations
  const DEFAULT_COLLECTION_LOCALE = DEFAULT_COLLECTION_FOLDER + '/locale';

  //-- Folder with the Translations
  const APP_LOCALE = APP_RESOURCES + '/locale';

  //-- Folder for the HTML files
  const APP_HTML = APPDIR + '/views';

  //-- Cache folder for downloading NW
  const CACHE = 'cache';

  //-- Icestudio HTML mail file
  const INDEX_HTML = 'index.html';

  //-- Grunt configuration file
  const GRUNT_FILE = 'Gruntfile.js';

  //-- jshint configuration file
  const JSHINT_CONFIG_FILE = '.jshintrc';

  //-- Constants for the host architecture (where grunt is run)
  const WIN32 = process.platform === 'win32';
  const DARWIN = process.platform === 'darwin';

  //-- Constants for the TARGET architectures
  const TARGET_OSX64 = 'osx64';
  const TARGET_OSXARM64 = 'osxarm64';
  const TARGET_LINUX64 = 'linux64';
  const TARGET_WIN64 = 'win64';
  const TARGET_AARCH64 = 'aarch64';

  //-------------------------------------------------------------
  //-- Constants for the EXEC TASK
  //-------------------------------------------------------------

  //-- Command for executing NW. You should add the folder where
  //-- your app (index.html) is placed
  //-- Ej. nw app
  const NWJS_EXEC_CMD = [
    'nw',
    '--enable-usermedia-screen-capturing',
    '--disable-backgrounding-occluded-windows',
    APPDIR,
  ].join(' ');

  //-- Command for stopping NWjs on Windows
  const NWJS_WIN_STOP = `cmd /c "taskkill /F /IM nw.exe >NUL 2>&1 || exit 0"`;

  //-- command for stopping NWjs on Unix like systems (Linux, Mac)
  const NWJS_UNIX_STOP =
    'killall nw 2>/dev/null || ' + 'killall nwjs 2>/dev/null ||' + '(exit 0)';

  //-- Final command for stopping NWjs
  const NWJS_STOP = WIN32 ? NWJS_WIN_STOP : NWJS_UNIX_STOP;

  //-- Script for cleaning the dist/icestudio/osx64 folder in MAC
  //-- before creating the OSX package
  const SCRIPT_OSX = 'scripts/repairOSX.sh';
  const SCRIPT_OSXARM64 = 'scripts/repairOSXarm64.sh';
  //-- after creating the OSX package
  const SCRIPT_OSX_DMG = 'scripts/repairOSXdmg.sh';
  const SCRIPT_OSXARM64_DMG = 'scripts/repairOSXarm64dmg.sh';

  //----------------------------------------------------------------
  //-- BUILD DIR. Folder where all the packages for the different
  //-- platforms are stored
  //------------------------------------------------------------------
  const DIST = './dist';

  //-- Temp folder for building the packages
  const DIST_TMP = DIST + '/tmp';

  //-- Temp folder for storing the fonts
  const DIST_TMP_FONTS = DIST_TMP + '/fonts';

  //-- Icestudio Build dir: Final files for the given architecture are placed
  //-- here before building the package
  const DIST_ICESTUDIO = DIST + '/icestudio';

  //-- Folder for the AARCH build package
  const DIST_ICESTUDIO_AARCH64 = DIST_ICESTUDIO + '/' + TARGET_AARCH64;

  //-- Folder for the LINUX64 build package
  const DIST_ICESTUDIO_LINUX64 = DIST_ICESTUDIO + '/' + TARGET_LINUX64;

  //-- Folder for the Win64 build package
  const DIST_ICESTUDIO_WIN64 = DIST_ICESTUDIO + '/' + TARGET_WIN64;

  //-- Folder for the OSX64 build package
  const DIST_ICESTUDIO_OSX64 = DIST_ICESTUDIO + '/' + TARGET_OSX64;

  //-- Folder for the OSX64 build package
  const DIST_ICESTUDIO_OSXARM64 = DIST_ICESTUDIO + '/' + TARGET_OSXARM64;

  //---------------------------------------------------------------
  //-- Define the ICESTUDIO_PKG_NAME: ICESTUDIO PACKAGE NAME that
  //-- is created as target, for the DIST TASK
  //---------------------------------------------------------------

  //-- Read the Icestudio json package
  let pkg = grunt.file.readJSON(APP_PACKAGE_JSON);

  //-- Read the timestamp. It is added to the Icestudio package version
  let timestamp = grunt.template.today('yyyymmddhhmm');

  //-- In the Stable Releases there is NO timestamp
  if (!WIP) {
    timestamp = '';
  }

  //-- Create the version
  //-- Stable releases: No timestamp
  //-- WIP: with timestamp
  pkg.version = pkg.version.replace(/w/, 'w' + timestamp);

  //-- Icestudio package name (with version)
  //-- Ex. icestudio-0.9.1w202203161003
  const ICESTUDIO_PKG_NAME = `${pkg.name}-${pkg.version}`;

  //-------------------------------------------------------------
  //-- Default collection
  //-------------------------------------------------------------
  //-- The default collection is downloaded from the LATEST GitHub release of
  //-- FPGAwars/collection-default by scripts/getCollection.js (the
  //-- "getcollection" task). The version is no longer pinned in package.json.

  //-- Cached collection file location (kept for the clean:collectionFile task)
  const CACHE_DEFAULT_COLLECTION_FILE =
    CACHE + '/collection/collection-default.zip';

  //-------------------------------------------------------------------------
  //-- NSIS TASK
  //-------------------------------------------------------------------------

  //-- Command for making the Windows installer
  //-- Execute NSIS, for creating the Icestudio Windows installer (.exe)
  //-- The installation script is located in scripts/windows_installer.nsi
  const MAKE_INSTALLER = `makensis -DARCH=win64 \
    -DVERSION=${pkg.version} \
    -V3 scripts/windows_installer.nsi`;

  //---------------------------------------------------------------
  //-- NW TASK: Build the app
  //---------------------------------------------------------------

  //-- Read the top level package.json
  //-- (**not** the Icestudio package, but the one in the top level)
  let topPkg = grunt.file.readJSON(PACKAGE_JSON);

  //-- Get the NW version from the package (the one that is installed)
  //-- Strip the "-sdk" suffix if present (flavor is set separately)
  const NW_VERSION = topPkg.devDependencies['nw'].replace(/-sdk$/, '');

  //-- Select the NW build flavor: "sdk" or "normal".
  //-- See the FLAVOR section at the top of this file for the contract.
  const FLAVOR_CLI = grunt.option('flavor');
  const FLAVOR_ENV = process.env.NW_FLAVOR;
  const NW_FLAVOR = FLAVOR_CLI || FLAVOR_ENV || (WIP ? 'sdk' : 'normal');

  if (NW_FLAVOR !== 'sdk' && NW_FLAVOR !== 'normal') {
    grunt.fail.fatal(
      `Invalid NW flavor "${NW_FLAVOR}". Use "sdk" or "normal".`
    );
  }

  //-- Path to the Windows ICO icon file for Icestudio
  const WIN_ICON = 'docs/resources/images/logo/icestudio-logo.ico';

  //-- Path to the MAC ICNS icon file for Icestudio
  const MAC_ICON = 'docs/resources/images/logo/icestudio-logo.icns';

  //----------------------------------------------------------------------
  //-- COPY TASK
  //----------------------------------------------------------------------

  //-- SRC files to include in the Release
  //-- They are copied to the TMP folder, were more files are added before
  //-- compressing into the final .zip file
  const APP_SRC_FILES = [
    INDEX_HTML, //-- Main html file
    PACKAGE_JSON, //-- Package.json file
    BUILDINFO_JSON, //-- Timestamp
    'resources/**', //-- APP_RESOURCES folder
    'scripts/**', //-- JS Files
    'styles/**', //-- CSS files
    'views/*.html', //-- HTML files
    'node_modules/**', //-- Node modules files
  ];

  //-- Source folder with the Fonts
  const APP_FONTS = APPDIR + '/node_modules/bootstrap/fonts';

  //-- ALL files and directories
  const ALL = ['**'];

  //----------------------------------------------------------------------
  //-- COMPRESS TASK: Build the release package. Constants
  //----------------------------------------------------------------------

  //-- Package name for the different platforms
  //-- Syntax:  icestudio-{version}-{platform}

  //-- Linux
  const ICESTUDIO_PKG_NAME_LINUX64 = ICESTUDIO_PKG_NAME + '-' + TARGET_LINUX64;

  //-- Windows
  const ICESTUDIO_PKG_NAME_WIN64 = ICESTUDIO_PKG_NAME + '-' + TARGET_WIN64;

  //-- MAC
  const ICESTUDIO_PKG_NAME_OSX64 = ICESTUDIO_PKG_NAME + '-' + TARGET_OSX64;

  //-- MAC
  const ICESTUDIO_PKG_NAME_OSXARM64 =
    ICESTUDIO_PKG_NAME + '-' + TARGET_OSXARM64;

  //-- ARM
  const ICESTUDIO_PKG_NAME_AARCH64 = ICESTUDIO_PKG_NAME + '-' + TARGET_AARCH64;

  //-- Full Packages names (with the local path + .zip) for the
  //-- different platforms

  //-- Linux
  const DIST_TARGET_LINUX64_ZIP =
    DIST + '/' + ICESTUDIO_PKG_NAME_LINUX64 + '.zip';

  //-- Windows
  const DIST_TARGET_WIN64_ZIP = DIST + '/' + ICESTUDIO_PKG_NAME_WIN64 + '.zip';

  //-- MAC
  const DIST_TARGET_OSX64_ZIP = DIST + '/' + ICESTUDIO_PKG_NAME_OSX64 + '.zip';

  //-- MAC ARM64
  const DIST_TARGET_OSXARM64_ZIP =
    DIST + '/' + ICESTUDIO_PKG_NAME_OSXARM64 + '.zip';

  //-- Linux ARM64
  const DIST_TARGET_AARCH64_ZIP =
    DIST + '/' + ICESTUDIO_PKG_NAME_AARCH64 + '.zip';

  //----------------------------------------------------------------------
  //-- APPIMAGE TASK: Build the appimage Linux executable. Constants
  //----------------------------------------------------------------------

  //-- Linux final APPIMAGE_FILENAME
  const LINUX_APPIMAGE_FILE =
    DIST + '/' + ICESTUDIO_PKG_NAME_LINUX64 + '.AppImage';

  //----------------------------------------------------------------------
  //-- APPDMG TASK: Build the dmg MAC executable. Constants
  //----------------------------------------------------------------------

  //-- Background image for the installer
  const MAC_DMG_BACKGROUND_IMAGE =
    'docs/resources/images/installation/installer-background.png';

  //-- MAC executable filename (inside the DMG image folder)
  let MAC_EXEC_FILE = DIST_ICESTUDIO_OSX64 + '/icestudio.app';

  //-- MAC final DMG image
  let MAC_DMG_IMAGE = DIST + '/' + ICESTUDIO_PKG_NAME_OSX64 + '.dmg';

  //----------------------------------------------------------------------
  //-- Create the TIMESTAMP FILE
  //----------------------------------------------------------------------
  //-- Write the timestamp information in a file
  //-- It will be read by Icestudio to add the timestamp to the version
  grunt.file.write(APP_TIMESTAMP_FILE, JSON.stringify({ ts: timestamp }));

  //-----------------------------------------------------------------------
  //-- TASK DIST: Define the task to execute for creating the executable
  //--   final package for all the platforms
  //-----------------------------------------------------------------------

  //-- Tasks to perform for the grunt dist task: Create the final packages
  //-- Task common to ALL Platforms
  let DIST_COMMON_TASKS = [
    'checkData', //-- Check the data files (JSON, boards, plugins, translations)
    'jshint', //-- Check the js files
    'clean:dist', //-- Delete the DIST folder, with all the generated packages
    'nggettext_compile', //-- Extract English texts to the template file
    'copy:dist', //-- Copy the files to be included in the build package
    'json-minify', //-- Minify JSON files

    //-- Build the executable package with nwjs by default, and skip this task
    //-- when the flag --dont-build-nwjs is passed
    ...(grunt.option('dont-build-nwjs') ? [] : ['nwjs']),

    //-- The clean:tmp task is also a common task, but it is
    //-- executed after the specific platform task
    //-- So it is added later
  ];

  //-- Specific tasks to be executed depending on the target architecture
  //-- They are executed after the COMMON tasks
  const DIST_PLATFORM_TASKS = {
    //-- TARGET_LINUX64
    linux64: [
      'compress:linux64', //-- Create the Icestudio .zip package
      'shell:appImageLinux64', //-- Create the Icestudio appimage package
    ],

    //-- TARGET_WIN64
    win64: [
      'shell:winico',
      'compress:win64', //-- Create the Icestudio .zip package
      'exec:nsis64', //-- Build the Windows installer
    ],

    //-- TARGET_OSX64
    osx64: [
      'exec:repairOSX', //-- Execute a script for MAC
      'compress:osx64', //-- Create the Icestudio .zip package
      'appdmg', //-- Build the Icestudio appmdg package
      'exec:repairOSXdmg', //-- Execute a script for MAC
    ],

    //-- TARGET_OSX64
    osxarm64: [
      'exec:repairOSXARM64', //-- Execute a script for MAC
      'compress:osxarm64', //-- Create the Icestudio .zip package
      'appdmg', //-- Build the Icestudio appmdg package
      'exec:repairOSXARM64dmg', //-- Execute a script for MAC
    ],

    //-- TARGET_AARCH64
    //-- Since NWjs 0.83, Linux ARM64 is an official target, so the
    //-- regular nwjs task (in DIST_COMMON_TASKS) handles the build
    //-- and we just package it.
    aarch64: [
      'compress:Aarch64', //-- Create the Icestudio .zip package
    ],

    //-- NO TARGET
    //-- Use this to skip running platform-specific tasks
    none: [],
  };

  //---------------------------------------------------------------
  //-- Configure the platform variables for the current system
  //--

  //--- Building only for one platform
  //--- Set with the `platform` argument when calling grunt

  //--- Read if there is a platform argument set
  //--- If not, the default target is Linux64

  // Verifica el script npm que se está ejecutando
  const npmLifecycleEvent = process.env.npmLifecycleEvent;

  let platform = grunt.option('platform') || false;
  let ocpu = grunt.option('cpu');
  let cpu =
    typeof ocpu !== 'undefined' && ocpu !== false && ocpu !== ''
      ? ocpu
      : process.arch;
  const cpuIsARM = cpu === 'arm64';
  //-- Additional options for the platforms
  let options = { scope: ['devDependencies'] };

  //-- If it is run from MACOS, the target is set to OSX64
  //-- Additional options are needed
  if ((platform === false && DARWIN) || platform === 'darwin') {
    if (cpuIsARM) {
      platform = TARGET_OSXARM64;
      options['scope'].push('darwinDependencies');
      //-- MAC executable filename (inside the DMG image folder)
      MAC_EXEC_FILE = DIST_ICESTUDIO_OSXARM64 + '/icestudio.app';

      //-- MAC final DMG image
      MAC_DMG_IMAGE = DIST + '/' + ICESTUDIO_PKG_NAME_OSXARM64 + '.dmg';
    } else {
      platform = TARGET_OSX64;
      options['scope'].push('darwinDependencies');
    }
  }

  if (platform === false) {
    platform = TARGET_LINUX64;
  }

  //-- Get the specific task to perform for the current platform
  let distPlatformTasks = DIST_PLATFORM_TASKS[platform];

  //-- Special case: For the AARCH64, the platform is set to Linux64
  /*if (platform === TARGET_AARCH64) {
    platform = TARGET_LINUX64;
  }*/

  let NWJS_PLATFORM = 'linux';
  let NWJS_ARCH = 'x64';

  let DIST_BUILD = false;

  switch (platform) {
    case TARGET_AARCH64:
      NWJS_PLATFORM = 'linux';
      NWJS_ARCH = 'arm64';
      DIST_BUILD = DIST_ICESTUDIO_AARCH64;
      break;

    case TARGET_LINUX64:
      NWJS_PLATFORM = 'linux';
      NWJS_ARCH = 'x64';
      DIST_BUILD = DIST_ICESTUDIO_LINUX64;
      break;

    case TARGET_OSX64:
      NWJS_PLATFORM = 'osx';
      NWJS_ARCH = 'x64';
      DIST_BUILD = DIST_ICESTUDIO_OSX64;
      break;

    case TARGET_OSXARM64:
      NWJS_PLATFORM = 'osx';
      NWJS_ARCH = 'arm64';
      DIST_BUILD = DIST_ICESTUDIO_OSXARM64;
      break;

    case TARGET_WIN64:
      NWJS_PLATFORM = 'win';
      NWJS_ARCH = 'x64';
      DIST_BUILD = DIST_ICESTUDIO_WIN64;
      break;
  }
  //------------------------------------------------------------------
  //-- CLEAN:tmp
  //-- Add the "clean:tmp" command to the list of commands to execute
  //-- It will be the last task
  //------------------------------------------------------------------
  distPlatformTasks = distPlatformTasks.concat(['clean:tmp']);

  //------------------------------------------------------------------
  //-- Task to perform for the DIST target
  //-- There are common task that should be
  //-- executed for ALL the platforms, and tasks specific for
  //-- every platform
  //------------------------------------------------------------------
  const DIST_TASKS = DIST_COMMON_TASKS.concat(distPlatformTasks);

  //--------------------------------------------------------------------------
  //-- Configure the grunt TASK
  //--------------------------------------------------------------------------

  //-- Load all grunt tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-angular-gettext');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-wget');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-json-minify');
  grunt.loadNpmTasks('grunt-nw-builder');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-zip');

  //-- Load an additional task for MAC
  if (platform === TARGET_OSX64) {
    grunt.loadNpmTasks('grunt-appdmg');
  }

  //-- Load an additional task for MAC ARM64
  if (platform === TARGET_OSXARM64) {
    grunt.loadNpmTasks('grunt-appdmg');
  }

  //-- grunt gettext
  //-- Extract the English text and write them into the
  //-- template file (app/resources/localte/template.pot)
  //-- More information: https://www.npmjs.com/package/grunt-angular-gettext
  grunt.registerTask('gettext', ['nggettext_extract']);

  //-- grunt compiletext
  grunt.registerTask('compiletext', ['nggettext_compile']);

  //-- grunt getcollection
  //-- Download the default collection and install it
  //-- in the app/resources/collection folder
  //-- This task is called in the npm postinstallation
  //-- (after npm install is executed)
  grunt.registerTask('getcollection', [
    //-- Download + install the default collection from the latest GitHub
    //-- release of FPGAwars/collection-default (scripts/getCollection.js)
    'exec:getcollection',
  ]);

  //-- grunt server
  //-- Start Icestudio
  grunt.registerTask('serve', [
    'nggettext_compile', //-- Get the translation in json files
    'watch:scripts', //-- Watch the given files. When there is change
    //-- Icestudio is restarted
  ]);

  // grunt dist: Create the app package
  grunt.registerTask(
    'dist',
    DIST_TASKS //-- Tasks to perform
  );

  //-- grunt checkData
  //-- The data check of the hooks and the CI (scripts/checkData.js), so a
  //-- local build does not package a broken board, plugin or translation
  grunt.registerTask('checkData', 'Check the data files', function () {
    const result = spawnSync(
      process.execPath,
      [path.join(__dirname, 'scripts', 'checkData.js')],
      { cwd: __dirname, stdio: 'inherit' }
    );
    if (result.status !== 0) {
      grunt.log.error(
        'Data check failed: fix the files above and build again.'
      );
      return false;
    }
  });

  //------------------------------------------------------------
  //-- debugInfo task, called with npm run debugInfo
  //-- Display information on the console, for debugging
  //-- purposes
  //------------------------------------------------------------

  grunt.registerTask('debugInfo', 'Displays debug information', function () {
    console.log('------------ INFORMATION FOR DEBUGGING -------------------');
    console.log('* Package name: ' + ICESTUDIO_PKG_NAME);
    console.log('* NW Version: ' + NW_VERSION);
    console.log('* APPIMAGE: ' + LINUX_APPIMAGE_FILE);
    console.log('* DMGIMAGE: ' + MAC_DMG_IMAGE);
    console.log('* DMGARM64IMAGE: ' + MAC_DMG_IMAGE);
    console.log('* Target platform: ' + platform);

    console.log('* Variables:');
    let gruntVars = [
      { Name: 'cpu', Value: cpu },
      { Name: 'npmLifecycleEvent', Value: npmLifecycleEvent },
    ];
    console.table(gruntVars);

    console.log('* SubTASK for the DIST task:');
    if (Array.isArray(DIST_TASKS) && DIST_TASKS.length > 0) {
      console.table(DIST_TASKS);
    } else {
      console.log('No tasks found in DIST_TASKS.');
    }
    console.log('---------------------------------------------------------');
  });

  //------------------------------------------------------------
  //-- setupDevEnv task
  //-- install and configure scripts of user config files to
  //-- help and standarize iceStudio development.
  //-- Add here each needed environment setup
  //------------------------------------------------------------

  grunt.registerTask('setupDevEnv', 'Set up Git hooks', function () {
    const { MSGFMT_HELP, hasMsgfmt } = require('./scripts/checkData.js');

    //-- In a worktree .git is a file: ask git where the hooks folder is
    let hooksDir;
    try {
      hooksDir = path.resolve(
        __dirname,
        execSync('git rev-parse --git-path hooks', { cwd: __dirname })
          .toString()
          .trim()
      );
      fs.mkdirSync(hooksDir, { recursive: true });
    } catch (err) {
      grunt.log.error(
        '❌ Git hooks folder not found, check that you are in icestudio cloned repository'
      );
      return false;
    }

    for (const hook of ['pre-commit', 'pre-merge-commit', 'pre-push']) {
      const destHook = path.join(hooksDir, hook);
      try {
        fs.copyFileSync(path.join(__dirname, 'scripts', 'git', hook), destHook);
        fs.chmodSync(destHook, 0o755);
      } catch (err) {
        grunt.log.error(`❌ Error installing the hook ${hook}: ${err.message}`);
        return false;
      }
      grunt.log.writeln(`✅ Hook ${hook} installed`);
    }

    //-- The hooks check the translations with msgfmt: warn now rather than
    //-- at the first commit or push
    if (!hasMsgfmt()) {
      grunt.log.writeln(
        '⚠️  msgfmt not found. Until gettext is installed, a commit with a ' +
          '.po or .pot file and every push fail the data check.'
      );
      grunt.log.writeln(MSGFMT_HELP);
    }
  });

  grunt.registerTask(
    'preparePackageJson',
    'Prepare package.json for committing',
    function () {
      const { execSync } = require('child_process');

      grunt.log.writeln('🛠 Prepare package.json for commit...');

      const jsonCmd = 'npx json';

      // Remove OSX dependencies
      execSync(
        `${jsonCmd} -I -f package.json -e "if (this.dependencies) { delete this.dependencies['fs-xattr']; delete this.dependencies['grunt-appdmg']; }" 2>/dev/null`
      );

      grunt.log.writeln('');
      grunt.log.writeln('✅ package.json ready for commit');
    }
  );

  //-----------------------------------------------------------------------
  //  PROJECT CONFIGURATION
  //  All the TASKs used are defined here
  //-----------------------------------------------------------------------
  grunt.initConfig({
    //-- Information about the package (read from the app/package.json file)
    'pkg': pkg,

    // TASK: Clean
    //-- Clean the temporary folders: grunt-contrib-clean
    //-- https://github.com/gruntjs/grunt-contrib-clean
    'clean': {
      //-- Remove temporary folder
      tmp: {
        src: ['.tmp', DIST_TMP],
        options: {
          'no-write': grunt.option('dont-clean-tmp'),
        },
      },

      //-- Remove folder with generated executable packages
      dist: [DIST],

      //-- Remove the default collection (which is installed when
      //-- npm install is executed initially
      collection: [DEFAULT_COLLECTION_FOLDER],

      //-- Remove the downloaded collection file
      //-- that is fetched with wget:collection
      collectionFile: [CACHE_DEFAULT_COLLECTION_FILE],
    },

    //-- Get the English texts from the .js and .html files
    //-- and write them in the template (.pot) file
    //-- https://www.npmjs.com/package/grunt-angular-gettext
    /* jshint camelcase: false */
    'nggettext_extract': {
      pot: {
        files: {
          //-- Target template file
          'app/resources/locale/template.pot': [
            //-- Src files
            APP_HTML + '/*.html',
            APP_SCRIPTS + '/**/*.js',
            //-- Plugins whose UI strings use gettextCatalog.getString()
            APP_RESOURCES + '/plugins/setupWizard/js/*.js',
            APP_RESOURCES + '/plugins/iceHub/js/*.js',
            APP_RESOURCES + '/plugins/iceTutorial/js/*.js',
            APP_RESOURCES + '/plugins/boardEditor/js/*.js',
            APP_RESOURCES + '/plugins/apioShell/js/*.js',
          ],
        },
      },
    },

    //-- TASK: nggettext_compile
    // Convert all the .po files (with the translations)
    // to JSON format. The json file is the one read by Icestudio when
    // it is started
    /* jshint camelcase: false */
    'nggettext_compile': {
      all: {
        options: {
          format: 'json',
        },
        files: [
          //-- Icestudio .po files to be converted to json
          {
            expand: true,
            cwd: APP_LOCALE,
            dest: APP_LOCALE,
            src: ['**/*.po'],
            ext: '.json',
          },

          //-- Default collection .po files to be converted to json
          {
            expand: true,
            cwd: DEFAULT_COLLECTION_LOCALE,
            dest: DEFAULT_COLLECTION_LOCALE,
            src: ['**/*.po'],
            ext: '.json',
          },
        ],
      },
    },

    //-- NOTE: the default collection is no longer fetched via grunt-wget /
    //-- grunt-zip. It is downloaded from the latest GitHub release and
    //-- installed by scripts/getCollection.js (the "getcollection" task /
    //-- exec:getcollection).

    //-- Execute shell commands
    //-- More info: https://github.com/sindresorhus/grunt-shell#readme
    'shell': {
      winico: {
        command: [
          //-- Create a temp DIR
          `mkdir -p "${DIST_ICESTUDIO_WIN64}/resources/images"`,

          //-- Uncompress the NW-dist package
          `cp ${WIN_ICON} ${DIST_ICESTUDIO_WIN64}/resources/images`,
        ].join(' && '),
      },

      //-- TASK: APPIMAGE
      //-- ONLY LINUX: generate AppImage package
      appImageLinux64: {
        command: [
          `sync`,
          `ICESTUDIO_BUILD_ID=${pkg.version} scripts/appImageBuild.sh`,
        ].join(' && '),
      },
    },

    //-- TASK EXEC: Define the Commands and scripts that can be executed
    //-- More information: https://www.npmjs.com/package/grunt-exec
    'exec': {
      nw: NWJS_EXEC_CMD, //-- Launch NWjs
      stopNW: NWJS_STOP, //-- Stop NWjs
      getcollection: 'node scripts/getCollection.js', //-- Default collection
      nsis64: MAKE_INSTALLER, //-- Create Icestudio Windows installer
      repairOSX: SCRIPT_OSX, //-- Shell script for Mac
      repairOSXARM64: SCRIPT_OSXARM64, //-- Shell script for Mac
      repairOSXdmg: SCRIPT_OSX_DMG, //-- Shell script for Mac
      repairOSXARM64dmg: SCRIPT_OSXARM64_DMG, //-- Shell script for Mac
    },

    //-- TASK: jshint: Check the .js files
    //-- More information: https://www.npmjs.com/package/grunt-contrib-jshint
    'jshint': {
      //-- These are the js files to check
      all: [APP_SCRIPTS + '/**/*.js', GRUNT_FILE],

      options: {
        //-- jshint configuration file
        //-- See: https://jshint.com/docs/
        jshintrc: JSHINT_CONFIG_FILE,

        //-- Javascript version to check
        //-- See: https://jshint.com/docs/options/#esversion
        esversion: 11,
      },
    },

    //-- TASK: Copy. Copy the Icestudio files needed for building
    //-- the executable package
    //-- More information: https://www.npmjs.com/package/grunt-contrib-copy
    'copy': {
      //-- Copy files to the DIST folder for building the executable package
      dist: {
        files: [
          //-- Copy the Icestudio files
          {
            expand: true,
            cwd: APPDIR, //-- working folder
            dest: DIST_TMP, //-- Target folder
            src: APP_SRC_FILES, //-- Src files to copy
          },

          //-- Copy the Fonts
          {
            expand: true,
            cwd: APP_FONTS, //-- Working folder
            dest: DIST_TMP_FONTS, //-- Target folder
            src: ALL, //-- Src files to copy
          },
        ],
      },
    },

    //-- TASK: json-minify
    //-- Minify JSON files in grunt: grunt-json-minification
    //-- More info: https://www.npmjs.com/package/grunt-json-minification
    'json-minify': {
      json: {
        files: DIST_TMP + '/resources/**/*.json',
      },
      ice: {
        files: DIST_TMP + '/resources/**/*.ice',
      },
    },

    //-- TASK: NWJS
    //-- Build the Icestudio NWjs app (Executable) for different platforms
    //-- It will download the pre-built binaries and create a release folder
    //-- The downloaded binaries are stored in the 'icestudio/cache' folder
    //-- The release folder is DIST/icestudio/{platform}
    //-- where platform could be "linux64", "aarch64", "win64", "osx64",
    //-- "osxarm64".
    //-- More information: https://www.npmjs.com/package/grunt-nw-builder
    //--                   https://www.npmjs.com/package/nw-builder
    //--------------------------------------------------------------------
    'nwjs': {
      options: {
        version: NW_VERSION,

        //-- Only one platform at a time (defined by the argument
        //-- passed to grunt when invoked)

        //platforms: [platform],
        platform: NWJS_PLATFORM,
        arch: NWJS_ARCH,
        //-- Use "sdk" for development and "normal" for stable release
        flavor: NW_FLAVOR,

        //-- Do not zip the application
        zip: false,

        //-- Release folder where to place the final target release
        outDir: DIST_BUILD,

        mode: 'build',

        //-- Only Windows Path to the ICO icon file
        //-- (It needs wine installed if building from Linux)

        //-- Only MAC: Path to the ICNS icon file
        icon: MAC_ICON,
        winico: WIN_ICON,
        app: {
          name: 'icestudio',
          icon: MAC_ICON,
          CFBundleIconFile: 'app',
          LSApplicationCategoryType: 'public.app-category.developer-tools',
          CFBundleIdentifier: 'com.fpgawars.icestudio',
          NSHumanReadableCopyright: 'Copyright FPGAwars',
          NSLocalNetworkUsageDescription:
            'Icestudio needs local network access to communicate with FPGA boards.',
        },

        //-- Where the Icestudio NW app is located
        //-- It was previously copied from APPDIR
        srcDir: DIST_TMP,
        glob: false,
      },

      src: '',
    },

    //-- TASK: COMPRESS. Compress the Release dir into a .zip file
    //-- It will create the file DIST/icestudio-{version}-{platform}.zip
    //-- More information: https://www.npmjs.com/package/grunt-contrib-compress
    'compress': {
      //-- TARGET: LINUX64
      linux64: {
        options: {
          //-- Target .zip file
          archive: DIST_TARGET_LINUX64_ZIP,
        },

        //-- Files and folders to include in the ZIP file
        files: [
          {
            expand: true,

            //-- Working directory. Path relative to this folder
            cwd: DIST_ICESTUDIO_LINUX64,

            //-- Files to include in the ZIP file
            //-- All the files and folder from the cwd directory
            src: ALL,

            //-- Folder name inside the ZIP archive
            dest: ICESTUDIO_PKG_NAME_LINUX64,
          },
        ],
      },

      //-- TARGET: WIN64
      win64: {
        options: {
          //-- Target .zip file
          archive: DIST_TARGET_WIN64_ZIP,
        },

        //-- Files and folders to include in the ZIP file
        files: [
          {
            expand: true,

            //-- Working directory. Path relative to this folder
            cwd: DIST_ICESTUDIO_WIN64,

            //-- Files to include in the ZIP file
            //-- All the files and folder from the cwd directory
            src: ALL,

            //-- Folder name inside the ZIP archive
            dest: ICESTUDIO_PKG_NAME_WIN64,
          },
        ],
      },

      //-- TARGET OSX64:
      osx64: {
        options: {
          //-- Target .zip file
          archive: DIST_TARGET_OSX64_ZIP,
        },

        //-- Files and folders to include in the ZIP file
        files: [
          {
            expand: true,

            //-- Working directory. Path relative to this folder
            cwd: DIST_ICESTUDIO_OSX64,

            //-- Files to include in the ZIP file
            //-- All the files and folders inside icestudio.app
            src: ['icestudio.app/**'],

            //-- Folder name inside the ZIP archive
            dest: ICESTUDIO_PKG_NAME_OSX64,
          },
        ],
      },

      //-- TARGET OSXARM64:
      osxarm64: {
        options: {
          //-- Target .zip file
          archive: DIST_TARGET_OSXARM64_ZIP,
        },

        //-- Files and folders to include in the ZIP file
        files: [
          {
            expand: true,

            //-- Working directory. Path relative to this folder
            cwd: DIST_ICESTUDIO_OSXARM64,

            //-- Files to include in the ZIP file
            //-- All the files and folders inside icestudio.app
            src: ['icestudio.app/**'],

            //-- Folder name inside the ZIP archive
            dest: ICESTUDIO_PKG_NAME_OSXARM64,
          },
        ],
      },

      //-- TARGET AARCH64 ( ARM64 )
      Aarch64: {
        options: {
          //-- Target .zip file
          archive: DIST_TARGET_AARCH64_ZIP,
        },

        //-- Files and folders to include in the ZIP file
        files: [
          {
            expand: true,

            //-- Working directory. Path relative to this folder
            cwd: DIST_ICESTUDIO_AARCH64,

            //-- Files to include in the ZIP file
            //-- All the files and folder from the cwd directory
            src: ALL,

            //-- Folder name inside the ZIP archive
            dest: ICESTUDIO_PKG_NAME_AARCH64,
          },
        ],
      },
    },

    //-- TASK: APPDMG
    //-- ONLY MAC: generate a DMG package
    //-- More information: https://www.npmjs.com/package/grunt-appdmg
    'appdmg': {
      //-- Information to be included in the DMG image
      options: {
        basepath: '.',
        title: 'Icestudio Installer',
        icon: MAC_ICON,
        background: MAC_DMG_BACKGROUND_IMAGE,
        window: {
          size: {
            width: 640,
            height: 480,
          },
        },
        contents: [
          {
            x: 430,
            y: 320,
            type: 'link',
            path: '/Applications',
          },
          {
            x: 200,
            y: 320,

            //-- Executable file
            type: 'file',
            path: MAC_EXEC_FILE,
          },
        ],
        /* -- For code official packages of Icestudio, for developers maintain commented
        "code-sign": {
          "signing-identity": "XXXX",
        }
        -- */
      },

      //-- Final DMG image
      target: {
        dest: MAC_DMG_IMAGE,
      },
    },

    //-- TASK: WATCH
    //-- Watch files for changes and run tasks based on the changed files
    //-- More info: https://www.npmjs.com/package/grunt-contrib-watch
    'watch': {
      scripts: {
        //-- Watch these files for changes...
        //-- NOTE: resources/boards is intentionally NOT watched. The boardEditor
        //-- plugin writes there at runtime (menu.json, board files); watching it
        //-- would restart nwjs mid-write and can corrupt the running process.
        files: [
          APP_RESOURCES + '/fonts/**/*.*',
          APP_RESOURCES + '/images/**/*.*',
          APP_LOCALE + '/locale/**/*.*',
          APP_RESOURCES + '/uiThemes/**/*.*',
          APP_RESOURCES + '/viewers/**/*.*',
          APP_SCRIPTS + '/**/*.*',
          'app/styles/**/*.*',
          'app/views/**/*.*',
        ],

        //-- Task to execute: Stop nw and restart it
        tasks: ['exec:stopNW', 'exec:nw'],

        options: {
          //-- Run the tasks at startup
          atBegin: true,

          //-- Stop the current process and start a new one when
          //-- there is a change on the files
          interrupt: true,
        },
      },
    },
  });
};
