"use strict";

module.exports = function (grunt) {

  const WIN32 = process.platform === "win32";
  const DARWIN = process.platform === "darwin";

  var pkg = grunt.file.readJSON("app/package.json");
  var timestamp=grunt.template.today('yyyymmddhhmm');
  
  grunt.file.write('app/buildinfo.json',JSON.stringify({ts:timestamp}));
  pkg.version=pkg.version.replace(/w/,'w'+timestamp );
  
  var platforms, options, distCommands, distTasks;
  
  // Common for all platforms
  distTasks = [
      "checksettings",
      "jshint",
      "clean:dist",
      "nggettext_compile",
      "useminPrepare",
      "concat",
      "copy:dist",
      "json-minify",
      "uglify",
      "cssmin",
      "usemin",
      "nwjs"
    ];


  if (DARWIN) {
    platforms = ["osx64"];
    options = { scope: ["devDependencies", "darwinDependencies"] };
    distCommands = ["exec:repairOSX", "compress:osx64", "appdmg"];
  } else {
    platforms = ["linux32", "linux64", "win32", "win64"];

    options = { scope: ["devDependencies"] };
    distCommands = [
      "compress:linux32",
      "compress:linux64",
      "appimage:linux32",
      "appimage:linux64",
      "compress:win32",
      "compress:win64",
      "wget:python32",
      "wget:python64",
      "exec:nsis32",
      "exec:nsis64"
    ];
        var onlyPlatform = grunt.option("platform") || "all";
    if (onlyPlatform === "linux64") {
      distCommands = ["compress:linux64", "appimage:linux64"];
      platforms = ["linux64"];
      distTasks = [
        "checksettings",
        "jshint",
        "clean:dist",
        "nggettext_compile",
        "useminPrepare",
        "concat",
        "copy:dist",
        "json-minify",
        "uglify",
        "cssmin",
        "usemin",
        "nwjs"
      ];

      console.log("\n");
      console.log("---------------------------");
      console.log("| BUILDING ONLY LINUX 64  |");
      console.log("---------------------------");
      console.log("\n");
    }
  }

  function all(dir) {
    return dir + "/**/*.*";
  }
  var appFiles = [
    "index.html",
    "package.json",
    all("fonts"),
    all("node_modules"),
    all("resources"),
    all("scripts"),
    all("styles"),
    all("views")
  ];

  require("load-grunt-tasks")(grunt, options);

  // Load custom tasks
  grunt.loadTasks("tasks");

  // Project configuration
  grunt.initConfig({
    pkg: pkg,

    // Automatically inject Bower components into the app
    wiredep: {
      task: {
        directory: "app/bower_components",
        bowerJson: grunt.file.readJSON("app/bower.json"),
        src: ["index.html"]
      }
    },

    // Execute nw application
    exec: {
      nw: "nw app" + (WIN32 ? "" : " 2>/dev/null"),
      stopNW:
        (WIN32 ? "taskkill /F /IM nw.exe >NUL 2>&1" : "killall nw 2>/dev/null || killall nwjs 2>/dev/null") + " || (exit 0)",
      nsis32:
        'makensis -DARCH=win32 -DPYTHON="python-3.8.2.exe" -DVERSION=<%=pkg.version%> -V3 scripts/windows_installer.nsi',
      nsis64:
        'makensis -DARCH=win64 -DPYTHON="python-3.8.2-amd64.exe" -DVERSION=<%=pkg.version%> -V3 scripts/windows_installer.nsi',
      repairOSX: "scripts/repairOSX.sh"
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: "app/index.html",
      options: {
        dest: "dist/tmp"
      }
    },

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
              "views/*.html"
            ]
          },
          {
            expand: true,
            cwd: "app/bower_components/bootstrap/fonts",
            dest: "dist/tmp/fonts",
            src: "*.*"
          }
        ]
      }
    },

    // JSON minification plugin without concatination
    "json-minify": {
      json: {
        files: "dist/tmp/resources/**/*.json"
      },
      ice: {
        files: "dist/tmp/resources/**/*.ice"
      }
    },

    // Uglify configuration options:
    uglify: {
      options: {
        mangle: false
      }
    },

    // Rewrite based on filerev and the useminPrepare configuration
    usemin: {
      html: ["dist/tmp/index.html"]
    },

    // Execute nw-build packaging
    nwjs: {
      options: {
        version: "0.35.5",
        //  flavor: 'normal', // For stable branch
        flavor: "sdk", // For development branch
        zip: false,
        buildDir: "dist/",
        winIco: "docs/resources/images/logo/icestudio-logo.ico",
        macIcns: "docs/resources/images/logo/nw.icns",
        macPlist: { CFBundleIconFile: "app" },
        platforms: platforms
      },
      src: ["dist/tmp/**"]
    },

    // Create standalone toolchains for each platform
    toolchain: {
      options: {
        apioMin: "<%=pkg.apio.min%>",
        apioMax: "<%=pkg.apio.max%>",
        buildDir: "dist/",
        extraPackages: "<%=pkg.apio.extras%>",
        platforms: platforms
      }
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
            height: 385
          }
        },
        contents: [
          {
            x: 345,
            y: 250,
            type: "link",
            path: "/Applications"
          },
          {
            x: 170,
            y: 250,
            type: "file",
            path: "dist/icestudio/osx64/icestudio.app"
          }
        ]
      },
      target: {
        dest: "dist/<%=pkg.name%>-<%=pkg.version%>-osx64.dmg"
      }
    },

    // ONLY LINUX: generate AppImage packages
    appimage: {
      linux32: {
        options: {
          name: "Icestudio",
          exec: "icestudio",
          arch: "32bit",
          icons: "docs/resources/icons",
          comment: "Visual editor for open FPGA boards",
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-linux32.AppImage"
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/linux32/",
            src: ["**"].concat(appFiles)
          }
        ]
      },
      linux64: {
        options: {
          name: "Icestudio",
          exec: "icestudio",
          arch: "64bit",
          icons: "docs/resources/icons",
          comment: "Visual editor for open FPGA boards",
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-linux64.AppImage"
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/linux64/",
            src: ["**"].concat(appFiles)
          }
        ]
      }
    },

    // Compress packages usin zip
    compress: {
      linux32: {
        options: {
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-linux32.zip"
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/linux32/",
            src: ["**"].concat(appFiles),
            dest: "<%=pkg.name%>-<%=pkg.version%>-linux32"
          }
        ]
      },
      linux64: {
        options: {
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-linux64.zip"
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/linux64/",
            src: ["**"].concat(appFiles),
            dest: "<%=pkg.name%>-<%=pkg.version%>-linux64"
          }
        ]
      },
      win32: {
        options: {
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-win32.zip"
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/win32/",
            src: ["**"].concat(appFiles),
            dest: "<%=pkg.name%>-<%=pkg.version%>-win32"
          }
        ]
      },
      win64: {
        options: {
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-win64.zip"
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/win64/",
            src: ["**"].concat(appFiles),
            dest: "<%=pkg.name%>-<%=pkg.version%>-win64"
          }
        ]
      },
      osx32: {
        options: {
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-osx32.zip"
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/osx32/",
            src: ["icestudio.app/**"],
            dest: "<%=pkg.name%>-<%=pkg.version%>-osx32"
          }
        ]
      },
      osx64: {
        options: {
          archive: "dist/<%=pkg.name%>-<%=pkg.version%>-osx64.zip"
        },
        files: [
          {
            expand: true,
            cwd: "dist/icestudio/osx64/",
            src: ["icestudio.app/**"],
            dest: "<%=pkg.name%>-<%=pkg.version%>-osx64"
          }
        ]
      }
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
          "app/views/**/*.*"
        ],
        tasks: ["wiredep", "exec:stopNW", "exec:nw"],
        options: {
          atBegin: true,
          interrupt: true
        }
      }
    },

    // Check all js files
    jshint: {
      all: ["app/scripts/**/*.js", "tasks/*.js", "gruntfile.js"],
      options: {
        jshintrc: ".jshintrc",
        esversion: 6
      }
    },

    // Wget: Python installer and Default collection
    wget: {
      python32: {
        options: {
          overwrite: false
        },
        src: "https://www.python.org/ftp/python/3.8.2/python-3.8.2.exe",
        dest: "cache/python/python-3.8.2.exe"
      },
      python64: {
        options: {
          overwrite: false
        },
        src: "https://www.python.org/ftp/python/3.8.2/python-3.8.2-amd64.exe",
        dest: "cache/python/python-3.8.2-amd64.exe"
      },
      collection: {
        options: {
          overwrite: false
        },
        src:
          "https://github.com/FPGAwars/collection-default/archive/v<%=pkg.collection%>.zip",
        dest: "cache/collection/collection-default-v<%=pkg.collection%>.zip"
      }
    },

    // Unzip Default collection
    unzip: {
      "using-router": {
        router: function (filepath) {
          return filepath.replace(/^collection-default-.*?\//g, "collection/");
        },
        src: "cache/collection/collection-default-v<%=pkg.collection%>.zip",
        dest: "app/resources/"
      }
    },

    // Empty folders to start fresh
    clean: {
      tmp: [".tmp", "dist/tmp"],
      dist: ["dist"],
      toolchain: [
        "cache/toolchain/default-python-packages",
        "cache/toolchain/default-apio",
        "cache/toolchain/*.zip"
      ],
      collection: ["app/resources/collection"]
    },

    // Generate POT file
   /*jshint camelcase: false */
    nggettext_extract: {
      pot: {
        files: {
          "app/resources/locale/template.pot": [
            "app/views/*.html",
            "app/scripts/**/*.js"
          ]
        }
      }
    },

    // Compile PO files into JSON
    /*jshint camelcase: false */
    nggettext_compile: {
      all: {
        options: {
          format: "json"
        },
        files: [
          {
            expand: true,
            cwd: "app/resources/locale",
            dest: "app/resources/locale",
            src: ["**/*.po"],
            ext: ".json"
          },
          {
            expand: true,
            cwd: "app/resources/collection/locale",
            dest: "app/resources/collection/locale",
            src: ["**/*.po"],
            ext: ".json"
          }
        ]
      }
    }
  });

  // Default tasks.
  grunt.registerTask("default", function () {
    console.log("Icestudio");
  });
  grunt.registerTask("gettext", ["nggettext_extract"]);
  grunt.registerTask("compiletext", ["nggettext_compile"]);
  grunt.registerTask("getcollection", [
    "clean:collection",
    "wget:collection",
    "unzip"
  ]);
  grunt.registerTask("serve", ["nggettext_compile", "watch:scripts"]);

  grunt.registerTask(
    "dist",
    distTasks.concat(distCommands).concat(["clean:tmp"])
  );
   grunt.registerTask("checksettings", function () {
    //    if (pkg.apio.external !== '' || pkg.apio.branch !== '') {
    //      grunt.fail.fatal('Apio settings are in debug mode');
    //   }
  });
};

// Disable Deprecation Warnings
var os = require("os");
os.tmpDir = os.tmpdir;
