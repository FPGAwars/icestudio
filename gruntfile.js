module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

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
        //credits: 'app/Credits.html',
        //macIcns: 'icon.icns',
        platforms: ['linux32', 'linux64', 'win32', 'win64', 'osx64']
      },
      src: ['app/**']
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
          archive: 'dist/<%=pkg.name%>-v<%=pkg.version%>-linux64.zip'
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
          archive: 'dist/<%=pkg.name%>-v<%=pkg.version%>-win32.zip'
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
          archive: 'dist/<%=pkg.name%>-v<%=pkg.version%>-win64.zip'
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
          archive: 'dist/<%=pkg.name%>-v<%=pkg.version%>-osx64.zip'
        },
        files: [{
          expand: true,
          cwd: 'dist/Icestudio/osx64/',
          src: ['**'],
          dest: '.'
        }]
      }
    },
    watch: {
      scripts: {
        files: ['app/res/**/*.*',
                'app/scripts/**/*.*',
                'app/styles/**/*.*',
                'app/views/**/*.*',
                'app/*.*',
                '!app/a.out'],
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
  grunt.registerTask('dist', ['clean:dist', 'nwjs', 'compress']);

};
