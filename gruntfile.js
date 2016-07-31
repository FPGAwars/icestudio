module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  var os = require('os');

  const DARWIN = Boolean(os.platform().indexOf('darwin') > -1);
  if (DARWIN) {
    var platforms = ['osx64'];
    var distParams = ['clean:dist', 'nwjs', 'compress:osx64', 'appdmg'];
  }
  else {
    var platforms = ['linux32', 'linux64', 'win32', 'win64', 'osx64'];
    var distParams = ['clean:dist', 'nwjs', 'compress'];
  }

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    wiredep: {
      task: {
        directory: 'app/bower_components',
        bowerJson: grunt.file.readJSON('app/bower.json'),
        src: ['index.html']
      }
    },
    exec: {
      nw: 'node_modules/nw/bin/nw app',
      stop_NW: 'killall nw || killall nwjs || true'
    },
    nwjs: {
      options: {
        version: '0.12.3',
        buildDir: 'dist/',
        winIco: 'doc/images/icestudio-logo.ico',
        macIcns: 'doc/images/icestudio-logo.icns',
        macPlist: { 'CFBundleIconFile': 'app.icns' },
        platforms: platforms
      },
      src: ['app/**']
    },
    appdmg: {
      options: {
        basepath: '.',
        title: 'Icestudio Installer',
        icon: 'doc/images/icestudio-logo.icns',
        background: 'doc/images/installer-background.png',
        contents: [
          {x: 448, y: 244, type: 'link', path: '/Applications'},
          {x: 192, y: 244, type: 'file', path: 'dist/Icestudio/osx64/Icestudio.app'}
        ]
      },
      target: {
        dest: 'dist/<%=pkg.name%>-<%=pkg.version%>-osx64.dmg'
      }
    },
    compress: {
      linux32: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-linux32.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/Icestudio/linux32/',
          src: ['**'],
          dest: ''
        }]
      },
      linux64: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-linux64.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/Icestudio/linux64/',
          src: ['**'],
          dest: '.'
        }]
      },
      win32: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-win32.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/Icestudio/win32/',
          src: ['**'],
          dest: '.'
        }]
      },
      win64: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-win64.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/Icestudio/win64/',
          src: ['**'],
          dest: '.'
        }]
      },
      osx64: {
        options: {
          archive: 'dist/<%=pkg.name%>-<%=pkg.version%>-osx64.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/Icestudio/osx64/',
          src: ['Icestudio.app/**'],
          dest: '.'
        }]
      }
    },
    watch: {
      scripts: {
        files: ['app/resources/**/*.*',
                'app/scripts/**/*.*',
                'app/styles/**/*.*',
                'app/views/**/*.*',
                'app/*.*',
                '!app/a.out',
                '!app/_build'],
        tasks: ['wiredep', 'exec:stop_NW', 'exec:nw'],
        options: {
          atBegin: true,
          interrupt: true
        }
      }
    },
    clean: {
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
  grunt.registerTask('serve', ['watch:scripts']);
  grunt.registerTask('dist', distParams);
};
