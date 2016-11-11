module.exports = function(grunt) {
  var os = require('os');

  const DARWIN = Boolean(os.platform().indexOf('darwin') > -1);
  if (DARWIN) {
    var platforms = ['osx64'];
    var options = { scope: ['devDependencies', 'optionalDependencies'] };
    var distCommands = ['nwjs', 'appdmg', 'compress:osx64'];
  }
  else {
    var platforms = ['linux32', 'linux64', 'win32', 'win64', 'osx64'];
    var options = { scope: ['devDependencies'] };
    var distCommands = ['nwjs', 'compress'];
  }

  require('load-grunt-tasks')(grunt, options);

  // Project configuration.
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
      },
      ideb: {
        files: 'dist/tmp/resources/**/*.iceb'
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
        buildDir: 'dist/',
        winIco: 'doc/images/icestudio-logo.ico',
        macIcns: 'doc/images/icestudio-logo.icns',
        macPlist: { 'CFBundleIconFile': 'app.icns' },
        platforms: platforms
      },
      src: ['dist/tmp/**']
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
          src: ['icestudio', 'icudtl.dat', 'nw.pak', '*.so'],
          dest: ''
        }]
      },
      linux64: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-linux64.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/icestudio/linux64/',
          src: ['icestudio', 'icudtl.dat', 'nw.pak', '*.so'],
          dest: '.'
        }]
      },
      win32: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-win32.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/icestudio/win32/',
          src: ['icestudio.exe', 'icudtl.dat', 'nw.pak', '*.dll'],
          dest: '.'
        }]
      },
      win64: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-win64.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/icestudio/win64/',
          src: ['icestudio.exe', 'icudtl.dat', 'nw.pak', '*.dll'],
          dest: '.'
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
          dest: '.'
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
          'app/views/**/*.*',
          'app/*.*',
          '!app/*.out',
          '!app/_build',
          '!app/zadig.ini'
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
      // node: ['node_modules'],
      // appnode: ['app/node_modules'],
      // appbower: ['app/bower_components'],
      // cache: ['cache']
    }
  });

  // Default tasks.
  grunt.registerTask('default', function() {
    console.log('Icestudio');
  });
  grunt.registerTask('serve', [
    'watch:scripts'
  ]);
  grunt.registerTask('dist', [
    'clean:dist',
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
