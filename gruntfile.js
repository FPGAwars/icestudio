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
      stop_NW: 'killall nw || killall nwjs || true',
      npmInstall: {
        command: 'npm install --prefix app',
        stdout: true,
        stderr: true
      },
      bowerInstall: {
        command: 'bower install',
        stdout: true,
        stderr: true
      },
    },
    nwjs: {
      options: {
        version: '0.12.3',
        buildDir: 'dist',
        //credits: 'app/Credits.html',
        //macIcns: 'icon.icns',
        platforms: ['linux', 'osx', 'win']
      },
      src: 'app/**/*'
    },
    watch: {
      scripts: {
        files: ['app/**/*.*'],
        tasks: ['wiredep', 'exec:stop_NW', 'exec:nw'],
        options: {
          atBegin: true,
          interrupt: true
        }
      }
    }
  });

  // Default tasks.
  grunt.registerTask('default', function() {
    console.log('Icestudio');
  });
  grunt.registerTask('install', ['exec:npmInstall', 'exec:bowerInstall']);
  grunt.registerTask('serve', ['watch:scripts']);
  grunt.registerTask('dist', ['nwjs']);

};
