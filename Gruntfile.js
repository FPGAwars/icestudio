//------------------------------------------------------
//-- Grunt configuration file
//-- Grunt is a tool for Automating tasks
//-- More information: https://gruntjs.com/
//------------------------------------------------------

//------------------------------------------------------
//-- HOW to invoke the tasks defined in Grunt:
//--
//--  $ grunt serve -->   Start icestudio
//--  $ grunt dist  -->   Create the Icestudio package for all
//--                      the architectures
//--  $ grunt jshint -->  Validate the Javascript files
//--  $ grunt clean  -->  Clean all the generated files during
//--                      the dist TASK (building packages)
//--  $ grunt gettext-->  Extract all the English strings and  
//--       write them in the  app/resources/locale/template.pot
//--       for being translated into other languajes later
//--------------------------------------------------------------

//--------------------------------------------------------------------
//-- How the translation process works
//--
//-- * The texts in the .js Javascript files are in English
//-- * When 'grunt gettext' is invoked, the English texts are extracted  
//--   to the app/resources/locale/template.pot file
//-- * The human translator imports the template.pot file (in PoEdit) and
//--   write the translation into their language, in the corresponding
//--   .po file
//-- * When 'grunt serve' is invoked, the .po files are converted into
//--   .json
//-- * When icestudio starts, the .json files are read
//--------------------------------------------------------------------

//--------------------------------------------------------------------
//-- How to upgrade to a new version of NW
//--
//-- NOTE: The building process is done by the nw-builder. But it is
//-- only implemented for Linux64, Win64 and OXS64, but NOT for ARM
//-- So it has to be done "manually"
//
//-- 1. Set the new NW version in the package.json and package-lock.json
//--    files:
//--    Ex.
//--    [...]
//--      "nw": "0.58.0",
//--    [...]
//--
//--  2. Execute the command "npm install" for installing the updated
//--     version
//--
//--  3. It is enough for building for Linux, Win and Mac.. 
//       You can test it by generating the packages for these platformas
//--      Ex. npm run buildLinux64
//--
//--  4. More steps are needed for ARM:
//--     -Open this link and check the name of the NW ARM release
//--       It will be something like: "nw60-arm64_2022-01-08"
//--     -https://github.com/LeonardLaszlo/nw.js-armv7-binaries/releases
//--
//--  5. Copy that name and place it on the NWJS_ARM_RELEASE_NAME
//--      constant
//--   
//--  6. Edit the file "scripts/mergeAarch64.sh". Change the brandingDir
//--      and distBundle variables so that it have valid names with the
//--      correct NW version
//--       Ex: brandingDir="$binaryBundleDir/nwjs-v0.58.1-linux-arm64"
//--           distBundle="cache/nwjsAarch64/usr/docker/dist/nwjs-chromium-
//--                       ffmpeg-branding/nwjs-v0.58.1-linux-arm64.tar.gz"
//--  
//--  7. Check that it works ok: "npm run buildAarch64"
//--
//-------------------------------------------------------------------------


"use strict";

// Disable Deprecation Warnings
// (node:18670) [DEP0022] DeprecationWarning: os.tmpDir() is deprecated. 
// Use os.tmpdir() instead.
let os = require("os");
os.tmpDir = os.tmpdir;

//-- This is for debuging...
console.log("Executing Gruntfile.js...");

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
  
  //-- ICestudio App dir
  const APPDIR = "app";
  
  //-- Icestudio package.json
  const PACKAGE_JSON = "package.json";
  
  //-- Icestudio package.json with PATH
  const APP_PACKAGE_JSON = APPDIR + '/' + PACKAGE_JSON;
  
  //-- Timestamp JSON file
  const BUILDINFO_JSON = "buildinfo.json";
  
  //-- Timestamp file. This file is created everytime grunt
  //-- is executed. Icestudio reads this file
  const APP_TIMESTAMP_FILE = APPDIR + '/' + BUILDINFO_JSON;
  
  //-- Folder with the Icestudio Javascript files
  const APP_SCRIPTS = APPDIR + "/scripts";
  
  //-- Folder with the Icestudio resources
  const APP_RESOURCES = APPDIR + "/resources";

  //-- Folder to store the default collection
  const DEFAULT_COLLECTION_FOLDER = APP_RESOURCES + "/collection";

  //-- Folder with the Default collection translations
  const DEFAULT_COLLECTION_LOCALE = DEFAULT_COLLECTION_FOLDER + "/locale";
  
  //-- Folder with the Translations
  const APP_LOCALE = APP_RESOURCES + "/locale";

  //-- Folder for the HTML files
  const APP_HTML = APPDIR + "/views";

  //-- Cache folder for downloading NW
  const CACHE = "cache";
  
  //-- Icestudio HTML mail file
  const INDEX_HTML = "index.html";
  
  //-- Grunt configuration file
  const GRUNT_FILE = "Gruntfile.js";
  
  //-- jshint configuration file
  const JSHINT_CONFIG_FILE = ".jshintrc";
  
  //-- Constants for the host architecture (Where grunt is run)
  const WIN32 = process.platform === "win32";
  const DARWIN = process.platform === "darwin";
  
  //-- Constant for the TARGET architectures
  const TARGET_OSX64 = "osx64";
  const TARGET_LINUX64 = "linux64";
  const TARGET_WIN64 = "win64";
  const TARGET_AARCH64 ="aarch64";

  //-------------------------------------------------------------
  //-- Constants for the EXEC TASK
  //-------------------------------------------------------------

  //-- Command for executing the NW. You should add the folder where
  //-- your app (index.html) is placed
  //-- Ej. nw app
  const NWJS_EXEC_CMD =  ["nw", APPDIR].join(" ");

  //-- Command for stoping NWjs on Windows
  const NWJS_WIN_STOP = "taskkill /F /IM nw.exe >NUL 2>&1";

  //-- command for stoping NWjs on Unix like systems (Linux, Mac)
  const NWJS_UNIX_STOP =  "killall nw   2>/dev/null || " + 
                          "killall nwjs 2>/dev/null ||" + 
                          "(exit 0)";

  //-- Final command for stoping NWjs
  const NWJS_STOP = WIN32 ? NWJS_WIN_STOP : NWJS_UNIX_STOP;
  
  //--------------------------------------------------------------------------
  //-- Python executable. Used for generating the Windows installer
  //--------------------------------------------------------------------------
  const PYTHON_EXE = "python-3.9.9-amd64.exe";
  const PYTHON_URL = "https://www.python.org/ftp/python/3.9.9/" + PYTHON_EXE;

  //-- Destination folder where to download the python executable
  const CACHE_PYTHON_EXE = CACHE + "/python/" + PYTHON_EXE;
  
  //-- Script for cleaning the dist/icestudio/osx64 folder in MAC
  //-- before creating the MAC package
  const SCRIPT_OSX = "scripts/repairOSX.sh";
  const SCRIPT_ARM = "scripts/mergeAarch64.sh";
  
  //----------------------------------------------------------------
  //-- BUILD DIR. Folder where all the packages for the different
  //-- platforms are stored
  //------------------------------------------------------------------
  const DIST = "dist";
  
  //-- Temp folder for building the packages
  const DIST_TMP = DIST + "/tmp";
  
  //-- Temp folder for storing the fonts
  const DIST_TMP_FONTS = DIST_TMP + "/fonts";
  
  //-- Icestudio Build dir: Final files for the given architecture are placed
  //-- here before building the package
  const DIST_ICESTUDIO = DIST + "/icestudio";
  
  //-- Folder for the AARCH build package
  const DIST_ICESTUDIO_AARCH64 = DIST_ICESTUDIO + "/" + TARGET_AARCH64;
  
  //-- Folder for the LINUX64 build package
  const DIST_ICESTUDIO_LINUX64 = DIST_ICESTUDIO + "/" + TARGET_LINUX64;
  
  //-- Folder for the Win64 build package
  const DIST_ICESTUDIO_WIN64 = DIST_ICESTUDIO + "/" + TARGET_WIN64;
  
  //-- Folder for the OSX64 build package
  const DIST_ICESTUDIO_OSX64 = DIST_ICESTUDIO + "/" + TARGET_OSX64;

  //---------------------------------------------------------------
  //-- Define the ICESTUDIO_PKG_NAME: ICESTUDIO PACKAGE NAME that
  //-- is created as target, for the DIST TASK
  //---------------------------------------------------------------

  //-- Read the icestudio json package 
  let pkg = grunt.file.readJSON(APP_PACKAGE_JSON);

  //-- Read the timestamp. It is added to the icestudio package version
  let timestamp = grunt.template.today("yyyymmddhhmm");

  //-- In the Stables Releases there is NO timestamp
  if (!WIP) {
    timestamp = "";
  }

  //-- Create the version
  //-- Stable releases: No timestamp
  //-- WIP: with timestamp
  pkg.version = pkg.version.replace(/w/, "w" + timestamp);

  //-- Icestudio package name: (with version)
  //-- Ex. icestudio-0.9.1w202203161003
  const ICESTUDIO_PKG_NAME = `${pkg.name}-${pkg.version}`;

  //-------------------------------------------------------------
  //-- Constants for the WGET TASK
  //-------------------------------------------------------------

  //-- Default collection source zip filename (Ej. v0.3.3.zip)
  const DEFAULT_COLLECTION_ZIP_FILE = `v${pkg.collection}.zip`;

  //-- The collection .zip file contains all the files in 
  //-- this folder name:
  const DEFAULT_COLLECTION_SRC_DIR = `collection-default-${pkg.collection}`;

  //-- Destination folder and filename for the default collection
  //-- The collection version is removed from the .zip file
  const CACHE_DEFAULT_COLLECTION_FILE = 
    CACHE + "/collection/collection-default.zip";

  //-- URL for downloading the .zip file of the Default collection
  const DEFAULT_COLLECTION_URL_FILE = 
    "https://github.com/FPGAwars/collection-default/archive/" + 
     DEFAULT_COLLECTION_ZIP_FILE; 

  //-- The NW for ARM is not included in the nw-build, so all the prrocess
  //-- of generating the target binary should de done manually
  //-- NWJS URL FOR downloading NW for ARM
  const NWJS_ARM_BASE_URL = 
    "https://github.com/LeonardLaszlo/nw.js-armv7-binaries/releases/download/";

  //-- You should copy & paste the release ID from Github:
  //-- https://github.com/LeonardLaszlo/nw.js-armv7-binaries/releases
  //-- Ej: nw60-arm64_2022-01-08 
  const NWJS_ARM_RELEASE_NAME = "nw58-arm64_2021-12-10";

  //-- Folder and filename for the NW ARM
  const NWJS_ARM_FILENAME = 
    NWJS_ARM_RELEASE_NAME + "/" + NWJS_ARM_RELEASE_NAME + ".tar.gz";

  //-- NW FOR ARM. Final binary to download
  const NWJS_ARM_BINARY = NWJS_ARM_BASE_URL + NWJS_ARM_FILENAME;

   //-- NW for ARM. Local destination file
   const NWJS_ARM_PACKAGE = CACHE + "/nwjsAarch64/nwjs.tar.gz";

  //-------------------------------------------------------------------------
  //-- EXEC TASK: 
  //-------------------------------------------------------------------------
  //-- Command for making the Windows installer
  //-- Execute NSIS, for creating the Icestudio Window installer (.exe)
  //-- The installation script is located in scripts/windows_installer.nsi   
  const MAKE_INSTALLER = `makensis -DARCH=win64 -DPYTHON=${PYTHON_EXE} \
    -DVERSION=${pkg.version} \
    -V3 scripts/windows_installer.nsi`;

  //---------------------------------------------------------------
  //-- NW TASK: Build the app
  //---------------------------------------------------------------

  //-- Read the top level package.json 
  //-- (**not** the icestudio package, but the one in the top level)
  let topPkg = grunt.file.readJSON(PACKAGE_JSON);

  //-- Get the NW version from the package (the one that is installed)
  const NW_VERSION = topPkg.devDependencies["nw"];

 

  //-- They have been previsouly copied from APPDIR to DIST_TMP
  //-- SRC files used for building the app
  const DIST_SRC_FILES = DIST_TMP + "/**";
  
  //-- Select the NW build flavor
  //-- For the develpment (WIP) the flavor is set to "sdk"
  //-- For the stable the flavor is set to "normal"
  const NW_FLAVOR = (WIP) ? "sdk" : "nomal";

  //-- Path to the Windows ICO icon file for Icestudio
  const WIN_ICON = "docs/resources/images/logo/icestudio-logo.ico";
  
  //-- Path to the MAC ICNS icon file for Icestudio
  const MAC_ICON = "docs/resources/images/logo/icestudio-logo.icns";

  //----------------------------------------------------------------------
  //-- COPY TASK
  //----------------------------------------------------------------------
  //-- SRC files to include in the Release
  //-- They are copied to the TMP folder, were more files are added before
  //-- compressing into the final .zip file
  const APP_SRC_FILES = [ 
    INDEX_HTML,          //-- Main html file
    PACKAGE_JSON,        //-- Package.json file
    BUILDINFO_JSON,      //-- Timestamp
    "resources/**",      //-- APP_RESOURCES folder
    "scripts/**",        //-- JS Files
    "styles/**",         //-- CSS files
    "views/*.html",      //-- HTML files
    "node_modules/**",   //-- Node modules files
  ];

   //-- Source folder with the Fonts
   const APP_FONTS = APPDIR + "/node_modules/bootstrap/fonts";

   //-- ALL files and directories
   const ALL = ["**"];

  //----------------------------------------------------------------------
  //-- COMPRESS TASK: Build the release package. Constants
  //----------------------------------------------------------------------

  //-- Package name for the different platforms
  //-- Sintax:  icestudio-{version}-{platform}

  //-- Linux
  const ICESTUDIO_PKG_NAME_LINUX64 =  ICESTUDIO_PKG_NAME + "-" + 
        TARGET_LINUX64;

  //-- windows
  const ICESTUDIO_PKG_NAME_WIN64 = ICESTUDIO_PKG_NAME + "-" +  
        TARGET_WIN64;
        
  //-- MAC
  const ICESTUDIO_PKG_NAME_OSX64 = ICESTUDIO_PKG_NAME + "-" +  
        TARGET_OSX64;

  //-- ARM
  const ICESTUDIO_PKG_NAME_AARCH64 = ICESTUDIO_PKG_NAME + "-" +  
        TARGET_AARCH64;


  //-- Full Packages names (with the local path + .zip) for the  
  //-- diferent platforms

  //-- Linux
  const DIST_TARGET_LINUX64_ZIP = DIST + "/" + ICESTUDIO_PKG_NAME_LINUX64 + 
        ".zip";

  //-- Windows
  const DIST_TARGET_WIN64_ZIP = DIST + "/" + ICESTUDIO_PKG_NAME_WIN64 + 
        ".zip";

  //-- MAC
  const DIST_TARGET_OSX64_ZIP = DIST + "/" + ICESTUDIO_PKG_NAME_OSX64 + 
        ".zip";

  //-- MAC
  const DIST_TARGET_AARCH64_ZIP = DIST + "/" + ICESTUDIO_PKG_NAME_AARCH64 + 
        ".zip";  

  //----------------------------------------------------------------------
  //-- APPIMAGE TASK: Build the appimage Linux executable. Constants
  //----------------------------------------------------------------------
  //-- Path to the Linux icon files
  const LINUX_ICONS = "docs/resources/icons";

  //-- Linux Executable filename
  const LINUX_EXEC_FILE = pkg.name;

  //-- Linux final APPIMAGE_FILENAME
  const LINUX_APPIMAGE_FILE = DIST + "/" + ICESTUDIO_PKG_NAME_LINUX64 + 
        ".AppImage";

  //----------------------------------------------------------------------
  //-- APPDMG TASK: Build the dmg MAC executable. Constants
  //----------------------------------------------------------------------

  //-- Background image for the installer
  const MAC_DMG_BACKGROUND_IMAGE =  
    "docs/resources/images/installation/installer-background.png";

  //-- MAC executable filename (inside the DMG image folder)
  const MAC_EXEC_FILE = DIST_ICESTUDIO_OSX64 + "/icestudio.app";

  //-- MAC final DMG image
  const MAC_DMG_IMAGE = DIST + "/" + ICESTUDIO_PKG_NAME_OSX64 + ".dmg";

  //----------------------------------------------------------------------
  //-- Create the TIMESTAMP FILE
  //----------------------------------------------------------------------
  //-- Write the timestamp information in a file
  //-- It will be read by icestudio to add the timestamp to the version
  grunt.file.write(APP_TIMESTAMP_FILE, JSON.stringify({ ts: timestamp }));

  //-----------------------------------------------------------------------
  //-- TASK DIST: Define the task to execute for creating the executable  
  //--   final package for all the platforms
  //-----------------------------------------------------------------------

  //-- Tasks to perform for the grunt dist task: Create the final packages
  //-- Task common to ALL Platforms
  let DIST_COMMON_TASKS = [
    "jshint",     //-- Check the js files
    "clean:dist", //-- Delete the DIST folder, with all the generated packages 
    "nggettext_compile",  //-- Extract English texts to the template file
    "copy:dist",    //-- Copy the files to be included in the build package
    "json-minify",  //-- Minify JSON files
    "nwjs",         //-- Build the executable package

    //-- The clean:tmp task is also a common task, but it is
    //-- executed after the specific platform task
    //-- So it is added later
  ];

  //-- Specific tasks to be executed depending on the target architecture
  //-- They are exectuted after the COMMON tasks
  const DIST_PLATFORM_TASKS = {

    //-- TARGET_LINUX64
    "linux64": [
      "compress:linux64",  //-- Create the Icestudio zip package
      "appimage:linux64",  //-- Create the Icestudio appimage package
    ],

    //-- TARGET_WIN64
    "win64": [
      "compress:win64",  //-- Create the Icestudio zip package
      "wget:python64",   //-- Download the python package for windows
      "exec:nsis64",     //-- Build the Windows installer
    ],

    //-- TARGET_OSX64
    "osx64": [ 
      "exec:repairOSX",  //-- Execute a script for MAC
      "compress:osx64",  //-- Create the Icestudio .zip package
      "appdmg"           //-- Build the Icestudio appmdg package
    ],  


    //-- TARGET_AARCH64
    "aarch64": [
      "wget:nwjsAarch64",  //-- Download the ARM NW dist Tarball
      "copy:aarch64",
      "exec:mergeAarch64",
      "compress:Aarch64"
    ]
  };

  //---------------------------------------------------------------
  //-- Configure the platform variables for the current system
  //--

  //--- Building only for one platform
  //--- Set with the `platform` argument when calling grunt

  //--- Read if there is a platform argument set
  //--- If not, the default target is Linux64
  let platform = grunt.option("platform") || TARGET_LINUX64;

  //-- Aditional options for the platforms
  let options = { scope: ["devDependencies"] };

  //-- If it is run from MACOS, the target is set to OSX64
  //-- Aditional options are needed
  if (DARWIN  || platform === "darwin") {
    platform = TARGET_OSX64;
    options["scope"].push("darwinDependencies");
  }

  //-- Get the specific task to perform for the current platform
  let distPlatformTasks = DIST_PLATFORM_TASKS[platform];

  //-- Special case: For the AARCH64, the platform is set to Linux64
  if (platform === TARGET_AARCH64) {
    platform = TARGET_LINUX64;
  }
 
  //------------------------------------------------------------------
  //-- CLEAN:tmp
  //-- Add the "clean:tmp" command to the list of commands to execute
  //-- It will be the last taks
  //------------------------------------------------------------------
  distPlatformTasks = distPlatformTasks.concat(["clean:tmp"]);
 
  //------------------------------------------------------------------
  //-- Task to perform for the DIST target
  //-- There are common task that should be
  //-- executed for ALL the platforms, and tasks specific for 
  //-- every platform
  //------------------------------------------------------------------
  const DIST_TASKS = DIST_COMMON_TASKS.concat(distPlatformTasks);

  //------------------------------------------------------------
  //-- DEBUG
  //-- Display information on the console, for debuging 
  //-- purposes
  //------------------------------------------------------------
  console.log();
  console.log("------------ INFORMATION FOR DEBUGING -------------------");
  console.log("* Package name: " + ICESTUDIO_PKG_NAME);
  console.log("* NW Version: " + NW_VERSION);
  console.log("* APPIMAGE: " + LINUX_APPIMAGE_FILE);
  console.log("* DMGIMAGE: " + MAC_DMG_IMAGE);
  console.log("* Target platform: " + platform);
  console.log("* SubTASK for the DIST task:");
  console.table(DIST_TASKS);
  console.log("---------------------------------------------------------");


  //--------------------------------------------------------------------------
  //-- Configure the grunt TASK
  //--------------------------------------------------------------------------

  //-- Load all grunt tasks matching grunt-*
  //-- https://www.npmjs.com/package/load-grunt-tasks
  //--
  // grunt-contrib-jshint
  // grunt-contrib-clean
  // grunt-angular-gettext
  // grunt-contrib-copy
  // grunt-json-minification
  // grunt-wget
  // grunt-zip
  // grunt-exec
  require("load-grunt-tasks")(grunt, options);

  //-- grunt gettext
  //-- Extract the English text and write them into the
  //-- template file (app/resources/localte/template.pot)
  //-- Moreinformation: https://www.npmjs.com/package/grunt-angular-gettext
  grunt.registerTask("gettext", [
    "nggettext_extract"
  ]);

  //-- grunt compiletext
 
  grunt.registerTask("compiletext", [
    "nggettext_compile"
  ]);

  //-- grunt getcollection
  //-- Download the default collection and install it
  //-- in the app/resources/collection folder
  //-- This task is called in the npm postinstallation
  //-- (after npm install is executed)
  grunt.registerTask("getcollection", [
    "clean:collection",  //-- Remove previous collection downloaded
    "wget:collection",   //-- Download the collection
    "unzip"              //-- Unzip the collection (install it)
  ]);
 
  //-- grunt server
  //-- Start icestudio
  grunt.registerTask("serve", [
    "nggettext_compile", //-- Get the translation in json files
    "watch:scripts", //-- Watch the given files. When there is change
                     //-- icestudio is restarted
  ]);

  // grunt dist: Create the app package
  grunt.registerTask(
    "dist",
    DIST_TASKS  //-- Tasks to perform
  );

  //-----------------------------------------------------------------------
  //  PROJECT CONFIGURATION
  //  All the TASKs used are defined here
  //-----------------------------------------------------------------------
  grunt.initConfig({

    //-- Information about the package (read from the app/package.json file)
    pkg: pkg,

    // TASK: Clean 
    //-- Clean the temporary folders: grunt-contrib-clean
    //-- https://github.com/gruntjs/grunt-contrib-clean
    clean: {
      //-- Remove temporary folder
      tmp: [".tmp", DIST_TMP],

      //-- Remove folder with generated executable packages
      dist: [DIST],

      //-- Remove the default collection (which is installed when 
      //-- npm install is executed initially
      collection: [DEFAULT_COLLECTION_FOLDER],
    },

    //-- Get the English texts from the .js and .html files
    //-- and write them in the template (.pot) file
    //-- https://www.npmjs.com/package/grunt-angular-gettext
    //-- Disable jshint warning: 
    /* jshint camelcase: false */
    nggettext_extract: {
      pot: {
        files: {
          //-- Target template file
          "app/resources/locale/template.pot": [

            //-- Src files
            APP_HTML + "/*.html",
            APP_SCRIPTS + "/**/*.js",
          ],
        },
      },
    },

    //-- TASK: nggettext_compile
    // Convert all the .po files (with the translations)
    // to JSON format. The json file is the one read by Icestudio when
    // it is started
    //-- Disable jshint Warning:
    /* jshint camelcase: false */
    nggettext_compile: {
      all: {
        options: {
          format: "json",
        },
        files: [

          //-- Icestudio .po files to be converted to json
          {
            expand: true,
            cwd: APP_LOCALE,
            dest: APP_LOCALE,
            src: ["**/*.po"],
            ext: ".json",
          },

          //-- Default collection .po files to be converted to json
          {
            expand: true,
            cwd: DEFAULT_COLLECTION_LOCALE,
            dest: DEFAULT_COLLECTION_LOCALE,
            src: ["**/*.po"],
            ext: ".json",
          },
        ],
      },
    },

    // TASK Wget: Download packages from internet
    // NWjs for ARM, Python installer, Default collection
    // More information: https://github.com/shootaroo/grunt-wget
    wget: {

      //-- Download the Default collection from its github repo
      collection: {
        options: {
          overwrite: false,
        },

        //-- URL where the src file is located
        src: DEFAULT_COLLECTION_URL_FILE,

        //-- Write to this new folder with a new name
        dest: CACHE_DEFAULT_COLLECTION_FILE,
      },

      //-- Download the python executable. It is used for generating 
      //-- the Windows installer
      //-- ONLY WINDOWS
      python64: {
        options: {
          overwrite: false,
        },

        //-- URL where the file is localted
        src:  PYTHON_URL,

        //-- Write the file to this folder
        dest: CACHE_PYTHON_EXE,
      },

      //-- Download NWjs for ARM arquitecture, as it is not part of the
      //-- oficial NWjs project
      //-- It is downloaded during the ARM build process
      //-- Only ARM
      nwjsAarch64: {

        options: {

          //-- If the destination file already exists,it is not downloaded
          overwrite: false,
        },

        //-- Download the NW ARM binary from the github repo
        src: NWJS_ARM_BINARY,

        //-- Local destination file. It is stored in the cache folder
        dest: NWJS_ARM_PACKAGE,
      },
    },

    //-- Install the Default collection
    //-- The .zip file is unzip in the destination folder
    //-  https://www.npmjs.com/package/grunt-zip
    unzip: {
      
      'using-router': {
        router : function (filepath) {
          //-- Change the folder name of the compress files to 'collection'
          //-- (The original name contains a folder with the version. We want
          //--  it to be removed)
          return filepath.replace(DEFAULT_COLLECTION_SRC_DIR, "collection");
        },

        //-- Original .zip file, previously downloaded
        src: CACHE_DEFAULT_COLLECTION_FILE,

        //-- Destination folder for its installation
        //-- The collection is unzip on the folder APP_RESOURCES/collection
        dest: APP_RESOURCES
      }
    },

    //-- TASK EXEC: Define the Commands and scripts that can be executed
    //-- More information: https://www.npmjs.com/package/grunt-exec
    exec: {
      nw: NWJS_EXEC_CMD,        //-- Launch NWjs
      stopNW: NWJS_STOP,        //-- Stop NWjs       
      nsis64: MAKE_INSTALLER,   //-- Create the Icestudio Windows installer
      repairOSX: SCRIPT_OSX,    //-- Shell script for mac
      mergeAarch64: SCRIPT_ARM, //-- Shell script for ARM
    },

    //-- TASK: jshint: Check the .js files
    //-- More information: https://www.npmjs.com/package/grunt-contrib-jshint
    jshint: {

      //-- These are the js files to check
      all: [APP_SCRIPTS + "/**/*.js", GRUNT_FILE],

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
    copy: {

      //-- Copy files to the DIST folder for building the executable package
      dist: {
        files: [

          //-- Copy the Icestudio files
          {
            expand: true, 
            cwd: APPDIR,        //-- working folder
            dest: DIST_TMP,     //-- Target folder
            src: APP_SRC_FILES  //-- Src files to copy
          },

          //-- Copy the Fonts
          {
            expand: true,
            cwd: APP_FONTS,        //-- Working folder
            dest: DIST_TMP_FONTS,  //-- Target folder
            src: ALL,           //-- Src files to copy
          },
        ],
      },


      //-- Copy the Linux Dist folder (with the build for Linux64)
      //-- to the a new one for ARM. It will be its base build
      //-- Then, the binaries for NW ARM will be downloaded and
      //-- copied there
      aarch64: {
        files: [
          {
            expand: true,
            options: {

              //-- Copy the files and directory permissions
              mode: true,
            },

            //-- Current working directory (Linux)
            cwd: DIST_ICESTUDIO_LINUX64,

            //-- Set the destination folder (Arm64)
            dest: DIST_ICESTUDIO_AARCH64,

            //-- Copy all the files in the working directory
            src: ALL,
          },
        ],
      },
    },

    //-- TASK: json-minify
    //-- Minify JSON files in grunt: grunt-json-minification
    //-- More info: https://www.npmjs.com/package/grunt-json-minification
    "json-minify": {
      json: {
        files: DIST_TMP + "/resources/**/*.json",
      },
      ice: {
        files: DIST_TMP + "/resources/**/*.ice",
      },
    },

    //-- TASK: NWJS
    //-- Build the icestudio NWjs app (Executable) for different platforms
    //-- It will download the pre-build binaries and create a release folder
    //-- The downloaded binaries are stored in the 'icestudio/cache' folder
    //-- The release folder is DIST/icestudio/{platform} 
    //-- where platform could be "linux64", "win64", "osx64"...
    //-- More information: https://www.npmjs.com/package/grunt-nw-builder
    //--                   https://www.npmjs.com/package/nw-builder 
    //--------------------------------------------------------------------
    //-- WARNING! It only builds the target for LINUX, MAC or WINDOWS
    //--   NOT for AARCH64. Building for ARM is done "Manually"
    //--   in other grunt TASKs 
    //--------------------------------------------------------------------
    nwjs: {
      options: {
        version: NW_VERSION,

        //-- Only one platform at a time (defined by the argument  
        //-- passed to grunt when invoked)
        platforms: [platform],

        //-- Use "sdk" for development and "normal" for stable release
        flavor: NW_FLAVOR,

        //-- Do not zip the application
        zip: false,

        //-- Release folder where to place the final target release
        buildDir: DIST,

        //-- Only windows Path to the ICO icon file
        //-- (It needs wine installed if building from Linux)
        winIco: WIN_ICON,

        //-- Only MAC: Path to the ICNS icon file
        macIcns: MAC_ICON,
        macPlist: { CFBundleIconFile: "app" },
      },

      //-- Where the Icestudio NW app is located
      //-- It was previously copied from APPDIR
      src: [DIST_SRC_FILES],
    },

    //-- TASK: COMPRESS. Compress the Release dir into a .zip file
    //-- It will create the file DIST/icestudio-{version}-{platform}.zip
    //-- More information: https://www.npmjs.com/package/grunt-contrib-compress
    compress: {

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
            dest:  ICESTUDIO_PKG_NAME_WIN64,
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
            src: ["icestudio.app/**"],

            //-- Folder name inside the ZIP archive
            dest: ICESTUDIO_PKG_NAME_OSX64,
          },
        ],
      },

      //-- TARGET AARCH64 (ARM64)
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
            dest:  ICESTUDIO_PKG_NAME_AARCH64 
          },
        ],
      },

    },

    //-- TASK: APPIMAGE
    //-- ONLY LINUX: generate AppImage package
    //-- More information: https://www.npmjs.com/package/grunt-appimage
    appimage: {
      linux64: {

        //-- Information to be included in the appimage
        options: {
          name: "Icestudio",

          //-- Executable file
          exec: LINUX_EXEC_FILE,
          arch: "64bit",
          icons: LINUX_ICONS,
          comment: "Visual editor for open FPGA boards",

          //-- Final APPIMAGE filename
          archive: LINUX_APPIMAGE_FILE,
        },

        //-- Files to include in the appimage
        files: [
          {
            expand: true,

            //-- Working directory
            cwd: DIST_ICESTUDIO_LINUX64,

            //-- Include all the files and folder from the
            //-- working directory
            src: ALL,
          },
        ],
      },
    },


    //-- TASK: APPIMAGE
    //-- ONLY MAC: generate a DMG package
    //-- More information: https://www.npmjs.com/package/grunt-appdmg
    appdmg: {

      //-- Information to be included in the DMG image
      options: {
        basepath: ".",
        title: "Icestudio Installer",
        icon: MAC_ICON,
        background: MAC_DMG_BACKGROUND_IMAGE,
        window: {
          size: {
            width: 512,
            height: 385,
          },
        },
        contents: [
          {
            x: 345,
            y: 250,
            type: "link",
            path: "/Applications",
          },
          {
            x: 170,
            y: 250,

            //-- Executable file
            type: "file",
            path: MAC_EXEC_FILE,
          },
        ],
      },

      //-- Final DMG image
      target: {
        dest: MAC_DMG_IMAGE
      },
    },

    //-- TASK: WATCH
    //-- Watch files for changes and run tasks based on the changed files
    //-- More info: https://www.npmjs.com/package/grunt-contrib-watch
    watch: {
      scripts: {

        //-- Watch these files for changes...
        files: [
          APP_RESOURCES + "/boards/**/*.*",
          APP_RESOURCES + "/fonts/**/*.*",
          APP_RESOURCES + "/images/**/*.*",
          APP_LOCALE + "/locale/**/*.*",
          APP_RESOURCES + "/uiThemes/**/*.*",
          APP_RESOURCES + "/viewers/**/*.*",
          APP_SCRIPTS + "/**/*.*",
          "app/styles/**/*.*",
          "app/views/**/*.*",
        ],

        //-- Task to execute: Stop nw and restart it
        tasks: ["exec:stopNW", "exec:nw"],


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
