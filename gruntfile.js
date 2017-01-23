module.exports = function(grunt) {
  var os = require('os');
  // Load apio info
  var _package = require('./package.json');

  const DARWIN = Boolean(os.platform().indexOf('darwin') > -1);
  if (DARWIN) {
    var platforms = ['osx32', 'osx64'];
    var options = { scope: ['devDependencies', 'darwinDependencies'] };
    var distCommands = ['nwjs', 'toolchain', 'appdmg', 'compress:osx32', 'compress:osx64'];
  }
  else {
    var platforms = ['linux32', 'linux64', 'win32', 'win64'];
    var options = { scope: ['devDependencies'] };
    var distCommands = ['nwjs', 'toolchain', 'compress:linux32', 'compress:linux64', 'compress:win32', 'compress:win64'];
  }

  function all(dir) {
    return dir + '/**/*.*';
  }
  var appFiles = [
    'index.html',
    'package.json',
    all('fonts'),
    all('node_modules'),
    all('resources'),
    all('scripts'),
    all('styles'),
    all('views')
  ];

  require('load-grunt-tasks')(grunt, options);

  // Load custom tasks
  grunt.loadTasks('tasks');

  // Project configuration
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    // Automatically inject Bower components into the app
    wiredep: {
      task: {
        directory: 'app/bower_components',
        bowerJson: grunt.file.readJSON('app/bower.json'),
        src: ['index.html']
      }
    },

    // Executes nw application
    exec: {
      nw: 'nw app',
      stop_NW: 'killall nw || killall nwjs || taskkill /F /IM nw.exe || (exit 0)'
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: 'app/index.html',
      options: {
        dest: 'dist/tmp'
      }
    },

    // Copies dist files
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'app',
            dest: 'dist/tmp',
            src: [
              'index.html',
              'package.json',
              'resources/**',
              'node_modules/**',
              'views/*.html'
            ]
          },
          {
            expand: true,
            cwd: 'app/bower_components/bootstrap/fonts',
            dest: 'dist/tmp/fonts/',
            src: '*.*'
          }
        ]
      }
    },

    // JSON minification plugin without concatination
    'json-minify': {
      json: {
        files: 'dist/tmp/resources/**/*.json'
      },
      ice: {
        files: 'dist/tmp/resources/**/*.ice'
      }
    },

    // Uglify configuration options:
    uglify: {
      options: {
        mangle: false
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['dist/tmp/index.html']
    },

    // Executes nw-build packaging
    nwjs: {
      options: {
        version: '0.12.3',
        flavor: 'normal',
        zip: false,
        buildDir: 'dist/',
        winIco: 'doc/images/icestudio-logo.ico',
        macIcns: 'doc/images/icestudio-logo.icns',
        macPlist: { 'CFBundleIconFile': 'nw.icns' },
        platforms: platforms
      },
      src: ['dist/tmp/**']
    },

    // Creates standalone toolchains for each platform
    toolchain: {
      options: {
        apioMin: _package.apio.min,
        apioMax: _package.apio.max,
        buildDir: 'dist/',
        platforms: platforms
      }
    },

    // ONLY MAC: generates a dmg package
    appdmg: {
      options: {
        basepath: '.',
        title: 'Icestudio Installer',
        icon: 'doc/images/icestudio-logo.icns',
        background: 'doc/images/installer-background.png',
        window: {
          size: {
            width: 512,
            height: 385,
          }
        },
        contents: [
          {
            x: 345,
            y: 250,
            type: 'link',
            path: '/Applications'
          },
          {
            x: 170,
            y: 250,
            type: 'file',
            path: 'dist/icestudio/osx64/icestudio.app'
          }
        ]
      },
      target: {
        dest: 'dist/<%=pkg.name%>-<%=pkg.version%>-osx64.dmg'
      }
    },

    // Compress packages usin zip
    compress: {
      linux32: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-linux32.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/icestudio/linux32/',
          src: ['icestudio', 'icudtl.dat', 'nw.pak', 'toolchain/*.*', ].concat(appFiles),
          dest: '<%=pkg.name%>-<%=pkg.version%>-linux32'
        }]
      },
      linux64: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-linux64.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/icestudio/linux64/',
          src: ['icestudio', 'icudtl.dat', 'nw.pak', 'toolchain/*.*'].concat(appFiles),
          dest: '<%=pkg.name%>-<%=pkg.version%>-linux64'
        }]
      },
      win32: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-win32.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/icestudio/win32/',
          src: ['icestudio.exe', 'icudtl.dat', 'nw.pak', 'toolchain/*.*'].concat(appFiles),
          dest: '<%=pkg.name%>-<%=pkg.version%>-win32'
        }]
      },
      win64: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-win64.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/icestudio/win64/',
          src: ['icestudio.exe', 'icudtl.dat', 'nw.pak', 'toolchain/*.*'].concat(appFiles),
          dest: '<%=pkg.name%>-<%=pkg.version%>-win64'
        }]
      },
      osx32: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-osx32.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/icestudio/osx32/',
          src: ['icestudio.app/**'],
          dest: '<%=pkg.name%>-<%=pkg.version%>-osx32'
        }]
      },
      osx64: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-osx64.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/icestudio/osx64/',
          src: ['icestudio.app/**'],
          dest: '<%=pkg.name%>-<%=pkg.version%>-osx64'
        }]
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      scripts: {
        files: [
          'app/resources/**/*.*',
          'app/scripts/**/*.*',
          'app/styles/**/*.*',
          'app/views/**/*.*'
        ],
        tasks: [
          'wiredep',
          'exec:stop_NW',
          'exec:nw'
        ],
        options: {
          atBegin: true,
          interrupt: true
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      tmp: ['.tmp', 'dist/tmp'],
      dist: ['dist'],
      toolchain: ['cache/toolchain/default-apio', 'cache/toolchain/*.tar.gz'],
      // node: ['node_modules'],
      // appnode: ['app/node_modules'],
      // appbower: ['app/bower_components'],
      // cache: ['cache']
    },

    // Generate POT file
    nggettext_extract: {
      pot: {
        files: {
          'app/resources/locale/template.pot': [
            'app/views/*.html',
            'app/scripts/**/*.js',
            'app/resources/**/*.js'
          ]
        }
      },
    },

    // Compile PO files into JSON
    nggettext_compile: {
      all: {
        options: {
          format: 'json'
        },
        files: [
          {
            expand: true,
            dot: true,
            cwd: "app/resources/locale",
            dest: "app/resources/locale",
            src: ["**/*.po"],
            ext: ".json"
          }
        ]
      }
    }

  });

  // Default tasks.
  grunt.registerTask('default', function() {
    console.log('Icestudio');
  });
  grunt.registerTask('gettext', [
    'nggettext_extract'
  ]);
  grunt.registerTask('serve', [
    'nggettext_compile',
    'watch:scripts'
  ]);
  grunt.registerTask('dist', [
    'clean:dist',
    'clean:toolchain',
    'nggettext_compile',
    'useminPrepare',
    'concat',
    'copy:dist',
    'json-minify',
    'uglify',
    'cssmin',
    'usemin'
  ]
  .concat(distCommands)
  .concat([
    'clean:tmp'
  ]));
};
