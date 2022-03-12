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


"use strict";

// Disable Deprecation Warnings
// (node:18670) [DEP0022] DeprecationWarning: os.tmpDir() is deprecated. 
// Use os.tmpdir() instead.
let os = require("os");
os.tmpDir = os.tmpdir;

//-- This is for debuging...
console.log("Executing Gruntfile.js...");

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

//-- Source folder with the Fonts
const APP_FONTS = APPDIR + "/node_modules/bootstrap/fonts";

//-- Folder with the Icestudio Javascript files
const APP_SCRIPTS = APPDIR + "/scripts";

//-- Folder with the Icestudio resources
const APP_RESOURCES = APPDIR + "/resources";

//-- Folder with the Translations
const APP_LOCALE = APP_RESOURCES + "/locale";

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
const TARGET_ALL = "all";

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

//---------------------------------------------------------------------------
//-- Wrapper function. This function is called when the 'grunt' command is
//-- executed. Grunt exposes all of its methods and properties on the 
//-- grunt object passed as an argument
//-- Check the API here: https://gruntjs.com/api/grunt
module.exports = function (grunt) {

  //-- Debug
  console.log("-> Grunt Entry point");

  //-- Read the Package json and the timestamp
  let pkg = grunt.file.readJSON(APP_PACKAGE_JSON);
  let timestamp = grunt.template.today("yyyymmddhhmm");

  //-- In the Stables Releases there is NO timestamp
  if (!WIP) {
    timestamp = "";
  }

  //-- Write the timestamp information in a file
  //-- It will be read by icestudio to add the timestamp to the version
  grunt.file.write(APP_TIMESTAMP_FILE, JSON.stringify({ ts: timestamp }));

  //-- Create the version
  //-- Stable releases: No timestamp
  //-- WIP: with timestamp
  pkg.version = pkg.version.replace(/w/, "w" + timestamp);

  //-- Tasks to perform for the grunt dist task: Create the final packages
  //-- Task common to ALL Platforms
  let distTasks = [
    //-- Validate js files: grunt-contrib-jshint
    //-- https://www.npmjs.com/package/grunt-contrib-jshint
    "jshint",

    //-- Clean the temporary folders: grunt-contrib-clean
    //-- https://github.com/gruntjs/grunt-contrib-clean
    "clean:dist",

    //-- Extract/compile the English gettext strings: grunt-angular-gettext
    //-- https://www.npmjs.com/package/grunt-angular-gettext
    "nggettext_compile",

    //-- Copy files and folders: grunt-contrib-copy
    //-- https://github.com/gruntjs/grunt-contrib-copy
    "copy:dist",

    //-- Minify JSON files in grunt: grunt-json-minification
    //-- https://www.npmjs.com/package/grunt-json-minification
    "json-minify",
  ];

  //-- Variables to define what commands execute depending
  //-- on the platofm
  let platforms = []; //-- Define the platform
  let options; //-- Define options for that platform
  let distCommands = []; //-- Define the commands needed for building the package

  //---------------------------------------------------------------
  //-- Configure the platform variables for the current system
  //--

  //--- Building only for one platform
  //--- Set with the `platform` argument when calling grunt

  //--- Read if there is a platform argument set
  let onlyPlatform = grunt.option("platform") || TARGET_ALL;

  //-- MAC
  if (DARWIN) {
    platforms = [TARGET_OSX64];
    options = { scope: ["devDependencies", "darwinDependencies"] };

    //-- Aditional tasks for building the MAC packages
    distCommands = ["nwjs", "exec:repairOSX", "compress:osx64", "appdmg"];

    //-- Linux 64bits, linux ARM 64bits and Windows (64-bits)
  } else {
    if (onlyPlatform === TARGET_LINUX64 || onlyPlatform === TARGET_ALL) {
      platforms.push(TARGET_LINUX64);
      options = { scope: ["devDependencies"] };

      //-- Aditional tasks for building the Linux64 packages
      distCommands = distCommands.concat([
        "nwjs",
        "compress:linux64",
        "appimage:linux64",
      ]);
    }

    if (onlyPlatform === TARGET_WIN64 || onlyPlatform === TARGET_ALL) {
      platforms.push(TARGET_WIN64);
      options = { scope: ["devDependencies"] };

      //-- Aditional commands for building the Windows packages
      distCommands = distCommands.concat([
        "nwjs",
        "compress:win64",
        "wget:python64",
        "exec:nsis64",
      ]);
    }

    if (onlyPlatform === TARGET_AARCH64 || onlyPlatform === TARGET_ALL) {
      if (platforms.indexOf(TARGET_LINUX64) < 0) {
        platforms.push(TARGET_LINUX64);
      }
      options = { scope: ["devDependencies"] };

      //-- Aditional packages for building the AArch64 packages
      //-- Add "nwjs" if it was not added previously
      if (distCommands.indexOf("nwjs") < 0) {
        distCommands = distCommands.concat(["nwjs"]);
      }

      //-- Add more additional tasks
      distCommands = distCommands.concat([
        "wget:nwjsAarch64",
        "copy:aarch64",
        "exec:mergeAarch64",
        "compress:Aarch64"
      ]);
    }
  }

  //-- Add the "clean:tmp" command to the list of commands to execute
  distCommands = distCommands.concat(["clean:tmp"]);

  //-- Files to include in the Icestudio app
  let appFiles = [
    INDEX_HTML, //-- app/index.html: Main HTML file
    PACKAGE_JSON, //-- Package file
    "resources/**/*.*", //-- Folder APP_RESOURCES
    "scripts/**/*.*", //-- JS files
    "styles/**/*.*", //-- CSS files
    "views/**/*.*", //-- HTML files
    "fonts/**/*.*", //-- Fonts
    "node_modules/**/*.*",
  ];

  //-----------------------------------------------------------------------
  //  PROJECT CONFIGURATION
  //  All the TASKs used are defined here
  //-----------------------------------------------------------------------
  grunt.initConfig({

    //-- Information about the package (read from the app/package.json file)
    pkg: pkg,

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

    // EXEC TASK: Define the Commands and scripts that can be executed/invoked
    exec: {

      //-- Launch NWjs
      nw: "nw app" + (WIN32 ? "" : " 2>/dev/null"),

      //-- Stop NWjs. The command depends on the platform (Win or the others)
      stopNW:
        (WIN32 ? "taskkill /F /IM nw.exe >NUL 2>&1"
               : "killall nw 2>/dev/null || killall nwjs 2>/dev/null") +
                 " || (exit 0)",

      //-- Execute NSIS, for creating the Icestudio Window installer (.exe)
      //-- The installation script is located in scripts/windows_installer.nsi          
      nsis64:
        'makensis -DARCH=win64 -DPYTHON="python-3.9.9-amd64.exe" -DVERSION=<%=pkg.version%> -V3 scripts/windows_installer.nsi',

      repairOSX: "scripts/repairOSX.sh",
      mergeAarch64: "scripts/mergeAarch64.sh"
    },

    //-- TASK: Copy
    // Copy dist files
    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: APPDIR,
            dest: DIST_TMP,
            src: [
              INDEX_HTML,
              PACKAGE_JSON,
              BUILDINFO_JSON,
              "resources/**",
              "node_modules/**",
              "styles/**",
              "scripts/**",
              "views/*.html",
            ],
          },
          {
            expand: true,
            cwd: APP_FONTS,
            dest: DIST_TMP_FONTS,
            src: "*.*",
          },
        ],
      },
      aarch64: {
        files: [
          {
            expand: true,
            options: {
              mode: true,
            },
            cwd: DIST_ICESTUDIO_LINUX64,
            dest: DIST_ICESTUDIO_AARCH64,
            src: ["**"],
          },
        ],
      },
      aarch64ToLinux: {
        files: [
          {
            expand: true,
            options: {
              mode: true,
            },
            cwd: CACHE + "/nwjsAarch64/nwjs-v0.58.1-linux-arm64",
            dest: DIST_ICESTUDIO_AARCH64,
            src: ["**"],
          },
        ],
      },
    },

    //-- TASK: json-minify
    // JSON minification plugin without concatination
    "json-minify": {
      json: {
        files: DIST_TMP + "/resources/**/*.json",
      },
      ice: {
        files: DIST_TMP + "/resources/**/*.ice",
      },
    },

    //-- TASK: NWJS
    // Execute nw-build packaging
    nwjs: {
      options: {
        version: "0.58.0",
        //  flavor: 'normal', // For stable branch
        flavor: "sdk", // For development branch
        zip: false,
        buildDir: DIST + "/",
        winIco: "docs/resources/images/logo/icestudio-logo.ico",
        macIcns: "docs/resources/images/logo/icestudio-logo.icns",
        macPlist: { CFBundleIconFile: "app" },
        platforms: platforms,
      },
      src: [DIST_TMP + "/**"],
    },

    // ONLY MAC: generate a DMG package
    appdmg: {
      options: {
        basepath: ".",
        title: "Icestudio Installer",
        icon: "docs/resources/images/logo/icestudio-logo.icns",
        background:
          "docs/resources/images/installation/installer-background.png",
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
            type: "file",
            path: DIST_ICESTUDIO_OSX64 + "/icestudio.app",
          },
        ],
      },
      target: {
        dest: DIST + "/<%=pkg.name%>-<%=pkg.version%>-osx64.dmg",
      },
    },

    // ONLY LINUX: generate AppImage packages
    appimage: {
      linux64: {
        options: {
          name: "Icestudio",
          exec: "icestudio",
          arch: "64bit",
          icons: "docs/resources/icons",
          comment: "Visual editor for open FPGA boards",
          archive: DIST + "/<%=pkg.name%>-<%=pkg.version%>-linux64.AppImage",
        },
        files: [
          {
            expand: true,
            cwd: DIST_ICESTUDIO_LINUX64,
            src: ["**"].concat(appFiles),
          },
        ],
      },
    },

       // Compress packages using zip
    compress: {
      linux64: {
        options: {
          archive: DIST + "/<%=pkg.name%>-<%=pkg.version%>-linux64.zip",
        },
        files: [
          {
            expand: true,
            cwd: DIST_ICESTUDIO_LINUX64,
            src: ["**"].concat(appFiles),
            dest: "<%=pkg.name%>-<%=pkg.version%>-linux64",
          },
        ],
      },
        Aarch64: {
        options: {
          archive: DIST + "/<%=pkg.name%>-<%=pkg.version%>-Aarch64.zip",
        },
        files: [
          {
            expand: true,
            cwd: DIST_ICESTUDIO_AARCH64,
            src: ["**"].concat(appFiles),
            dest: "<%=pkg.name%>-<%=pkg.version%>-linux64",
          },
        ],
      },
      win64: {
        options: {
          archive: DIST + "/<%=pkg.name%>-<%=pkg.version%>-win64.zip",
        },
        files: [
          {
            expand: true,
            cwd: DIST_ICESTUDIO_WIN64,
            src: ["**"].concat(appFiles),
            dest: "<%=pkg.name%>-<%=pkg.version%>-win64",
          },
        ],
      },
      osx64: {
        options: {
          archive: DIST + "/<%=pkg.name%>-<%=pkg.version%>-osx64.zip",
        },
        files: [
          {
            expand: true,
            cwd: DIST_ICESTUDIO + "/osx64/",
            src: ["icestudio.app/**"],
            dest: "<%=pkg.name%>-<%=pkg.version%>-osx64",
          },
        ],
      },
    },

    // Watch files for changes and runs tasks based on the changed files
    watch: {
      scripts: {
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
        tasks: ["exec:stopNW", "exec:nw"],
        options: {
          atBegin: true,
          interrupt: true,
        },
      },
    },

    // TASK Wget: Download packages from internet
    // NWjs for ARM, Python installer, Default collection
    // More information: https://github.com/shootaroo/grunt-wget
    wget: {

      //-- Download NWjs for ARM arquitecture, as it is not part of the oficial NWjs project
      //-- It is downloaded during the ARM build process
      //-- Only ARM
      nwjsAarch64: {

        options: {

          //-- If the destination file already exists, it is not downloaded again
          overwrite: false,
        },

        //-- Download from
        src: "https://github.com/LeonardLaszlo/nw.js-armv7-binaries/releases/download/nw58-arm64_2021-12-10/nw58-arm64_2021-12-10.tar.gz",

        //-- Local destination file
        dest: CACHE + "/nwjsAarch64/nwjs.tar.gz",
      },

      //-- Download the python executable. It is used for generating the Windows installer
      //-- ONLY WINDOWS
      python64: {
        options: {
          overwrite: false,
        },
        src: "https://www.python.org/ftp/python/3.9.9/python-3.9.9-amd64.exe",
        dest: CACHE + "/python/python-3.9.9-amd64.exe",
      },

      //-- Download the Default collection from its github repo
      collection: {
        options: {
          overwrite: false,
        },
        src: "https://github.com/FPGAwars/collection-default/archive/v<%=pkg.collection%>.zip",
        dest: CACHE + "/collection/collection-default-v<%=pkg.collection%>.zip",
      },
    },

    // Unzip Default collection
    unzip: {
        "using-router": {
        router: function (filepath) {
          return filepath.replace(/^collection-default-.*?\//g, "collection/");
        },
        src: CACHE + "/collection/collection-default-v<%=pkg.collection%>.zip",
        dest: APP_RESOURCES,
      },
    },

    // TASK: Clean
    // Empty folders to start fresh
    clean: {
      tmp: [".tmp", DIST_TMP],
      dist: [DIST],
      collection: [APP_RESOURCES + "/collection"],
    },

    // Generate POT file
    /* jshint camelcase: false */
    nggettext_extract: {
      pot: {
        files: {
          "app/resources/locale/template.pot": [
            "app/views/*.html",
            APP_SCRIPTS + "/**/*.js",
          ],
        },
      },
    },

    //-- TASK: nggettext_compile
    // Compile PO files into JSON
    /* jshint camelcase: false */
    nggettext_compile: {
      all: {
        options: {
          format: "json",
        },
        files: [
          {
            expand: true,
            cwd: APP_LOCALE,
            dest: APP_LOCALE,
            src: ["**/*.po"],
            ext: ".json",
          },
          {
            expand: true,
            cwd: APP_RESOURCES + "/collection/locale",
            dest: APP_RESOURCES + "/collection/locale",
            src: ["**/*.po"],
            ext: ".json",
          },
        ],
      },
    },
  });

  //------------------------------------------------------------------
  //-- PROJECT CONFIGURATION: END
  //---------------------------------------------------------------------

  //-- Load all grunt tasks matching grunt-*
  //-- https://www.npmjs.com/package/load-grunt-tasks
  //--
  // grunt-contrib-jshint
  // grunt-contrib-clean
  // grunt-angular-gettext
  // grunt-contrib-copy
  // grunt-json-minification
  require("load-grunt-tasks")(grunt, options);

  //-- grunt gettext
  grunt.registerTask("gettext", ["nggettext_extract"]);

  //-- grunt compiletext
  grunt.registerTask("compiletext", ["nggettext_compile"]);

  //-- grunt getcollection
  //-- Download the default collection and install it
  //-- in the app/resources/collection folder
  //-- This task is called in the npm postinstallation
  //-- (after npm install is executed)
  grunt.registerTask("getcollection", [
    "clean:collection",
    "wget:collection",
    "unzip"
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

    //-- Execute the tasks given in the distTasks list + the commands
    distTasks.concat(distCommands)
  );
};