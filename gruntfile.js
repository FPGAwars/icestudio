/* jshint laxbreak: true */

"use strict";
//-- Grunt configuration file
//-- https://gruntjs.com/
//-- Grunt is a tool for Automating tasks

// Disable Deprecation Warnings
// (node:18670) [DEP0022] DeprecationWarning: os.tmpDir() is deprecated. Use os.tmpdir() instead.
let os = require("os");
os.tmpDir = os.tmpdir;


module.exports = function (grunt) {

  //-- Constants for the platformws
  const WIN32 = process.platform === "win32";
  const DARWIN = process.platform === "darwin";

  //-- Is this a WIP release (Work in Progress) or
  //-- a stable release?
  //-- WIP = true --> Work in progress
  //-- WIP = false --> Stable release
  const WIP = true;

  //-- Read the Package json and the timestamp
  let pkg = grunt.file.readJSON("app/package.json");
  let timestamp = grunt.template.today("yyyymmddhhmm");

  //-- In the Stables Releases there is NO timestamp
  if (!WIP) {
    timestamp = "";
  }

  //-- Write the timestamp information in the buildinfo.json
  //-- It will be read by icestudio to add the timestamp to the version
  grunt.file.write("app/buildinfo.json", JSON.stringify({ ts: timestamp }));

  //-- Create the version
  //-- Stable releases: No timestamp
  //-- WIP: with timestamp
  pkg.version = pkg.version.replace(/w/, "w" + timestamp);

  //-- Tasks to perform. Common to ALL Platforms
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
  let onlyPlatform = grunt.option("platform") || "all";

  //-- MAC
  if (DARWIN) {
    platforms = ["osx64"];
    options = { scope: ["devDependencies", "darwinDependencies"] };
    distCommands = ["nwjs", "exec:repairOSX", "compress:osx64", "appdmg"];

    //-- Linux 64bits, linux ARM 64bits and Windows (64-bits)
  } else {
    if (onlyPlatform === "linux64" || onlyPlatform === "all") {
      platforms.push("linux64");
      options = { scope: ["devDependencies"] };
      distCommands = distCommands.concat([
        "nwjs",
        "compress:linux64",
        "appimage:linux64",
      ]);
    }

    if (onlyPlatform === "win64" || onlyPlatform === "all") {
      platforms.push("win64");
      options = { scope: ["devDependencies"] };
      distCommands = distCommands.concat([
        "nwjs",
        "compress:win64",
        "wget:python64",
        "exec:nsis64",
      ]);
    }

    if (onlyPlatform === "aarch64" || onlyPlatform === "all") {
      if (platforms.indexOf("linux64") < 0) {
        platforms.push("linux64");
      }
      options = { scope: ["devDependencies"] };
      if (distCommands.indexOf("nwjs") < 0) {
        distCommands = distCommands.concat(["nwjs"]);
      }
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
    "index.html", //-- app/index.html: Main HTML file
    "package.json", //-- Package file
    "resources/**/*.*", //-- Folder app/resources
    "scripts/**/*.*", //-- JS files
    "styles/**/*.*", //-- CSS files
    "views/**/*.*", //-- HTML files
    "fonts/**/*.*", //-- Fonts
    "node_modules/**/*.*",
  ];

  //-----------------------------------------------------------------------
  //  PROJECT CONFIGURATION
  //-----------------------------------------------------------------------
  grunt.initConfig({
    //-- Information about the package (read the package.json file)
    pkg: pkg,

    // Execute nw application
    exec: {
      nw: "nw app" + (WIN32 ? "" : " 2>/dev/null"),
      stopNW:
        (WIN32
          ? "taskkill /F /IM nw.exe >NUL 2>&1"
          : "killall nw 2>/dev/null || killall nwjs 2>/dev/null") +
        " || (exit 0)",
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
            cwd: "app",
            dest: "dist/tmp",
            src: [
              "index.html",
              "package.json",
              "buildinfo.json",
              "resources/**",
              "node_modules/**",
              "styles/**",
              "scripts/**",
              "views/*.html",
            ],
          },
          {
            expand: true,
            cwd: "app/node_modules/bootstrap/fonts",
            dest: "dist/tmp/fonts",
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
            cwd: "dist/icestudio/linux64",
            dest: "dist/icestudio/aarch64",
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
            cwd: "cache/nwjsAarch64/nwjs-v0.54.2-linux-arm64",
            dest: "dist/icestudio/aarch64",
            src: ["**"],
          },
        ],
      },
    },

    //-- TASK: json-minify
    // JSON minification plugin without concatination
    "json-minify": {
      json: {
        files: "dist/tmp/resources/**/*.json",
      },
      ice: {
        files: "dist/tmp/resources/**/*.ice",
      },
    },

    //-- TASK: NWJS
    // Execute nw-build packaging
    nwjs: {
      options: {
        version: "0.54.1",
        //  flavor: 'normal', // For stable branch
        flavor: "sdk", // For development branch
        zip: false,
        buildDir: "dist/",
        winIco: "docs/resources/images/logo/icestudio-logo.ico",
        macIcns: "docs/resources/images/logo/nw.icns",
        macPlist: { CFBundleIconFile: "app" },
        platforms: platforms,
      },
      src: ["dist/tmp/**"],
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
            path: "dist/icestudio/osx64/icestudio.app",
          },
        ],
      },
      target: {
        dest: "dist/<%=pkg.name%>-<%=pkg.version%>-osx64.dmg",
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
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-linux64.AppImage",
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/linux64/",
            src: ["**"].concat(appFiles),
          },
        ],
      },
    },

       // Compress packages using zip
    compress: {
      linux64: {
        options: {
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-linux64.zip",
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/linux64/",
            src: ["**"].concat(appFiles),
            dest: "<%=pkg.name%>-<%=pkg.version%>-linux64",
          },
        ],
      },
        Aarch64: {
        options: {
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-Aarch64.zip",
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/aarch64/",
            src: ["**"].concat(appFiles),
            dest: "<%=pkg.name%>-<%=pkg.version%>-linux64",
          },
        ],
      },
      win64: {
        options: {
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-win64.zip",
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/win64/",
            src: ["**"].concat(appFiles),
            dest: "<%=pkg.name%>-<%=pkg.version%>-win64",
          },
        ],
      },
      osx64: {
        options: {
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-osx64.zip",
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/osx64/",
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
          "app/resources/boards/**/*.*",
          "app/resources/fonts/**/*.*",
          "app/resources/images/**/*.*",
          "app/resources/locale/**/*.*",
          "app/resources/uiThemes/**/*.*",
          "app/resources/viewers/**/*.*",
          "app/scripts/**/*.*",
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

    //-- TASK: jshint
    // Check all js files
    jshint: {
      //-- This are the js files to check
      all: ["app/scripts/**/*.js", "gruntfile.js"],
      options: {
        //-- jshint configuration file
        jshintrc: ".jshintrc",
        esversion: 6,
      },
    },

    // Wget: Python installer and Default collection
    wget: {
      nwjsAarch64: {
        options: {
          overwrite: false,
        },
        src: "https://github.com/LeonardLaszlo/nw.js-armv7-binaries/releases/download/nw54-arm64_2021-07-10/nw54-arm64_2021-07-10.tar.gz",
        dest: "cache/nwjsAarch64/nwjs.tar.gz",
      },

      python64: {
        options: {
          overwrite: false,
        },
        src: "https://www.python.org/ftp/python/3.9.9/python-3.9.9-amd64.exe",
        dest: "cache/python/python-3.9.9-amd64.exe",
      },
      collection: {
        options: {
          overwrite: false,
        },
        src: "https://github.com/FPGAwars/collection-default/archive/v<%=pkg.collection%>.zip",
        dest: "cache/collection/collection-default-v<%=pkg.collection%>.zip",
      },
    },

    // Unzip Default collection
    unzip: {
        "using-router": {
        router: function (filepath) {
          return filepath.replace(/^collection-default-.*?\//g, "collection/");
        },
        src: "cache/collection/collection-default-v<%=pkg.collection%>.zip",
        dest: "app/resources/",
      },
    },

    // TASK: Clean
    // Empty folders to start fresh
    clean: {
      tmp: [".tmp", "dist/tmp"],
      dist: ["dist"],
      collection: ["app/resources/collection"],
    },

    // Generate POT file
    /* jshint camelcase: false */
    nggettext_extract: {
      pot: {
        files: {
          "app/resources/locale/template.pot": [
            "app/views/*.html",
            "app/scripts/**/*.js",
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
            cwd: "app/resources/locale",
            dest: "app/resources/locale",
            src: ["**/*.po"],
            ext: ".json",
          },
          {
            expand: true,
            cwd: "app/resources/collection/locale",
            dest: "app/resources/collection/locale",
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

  // Default task
  grunt.registerTask("default", function () {
    console.log("Icestudio");
  });
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