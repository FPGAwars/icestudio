module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        wiredep: {
            task: {
                src: ['app/index.html']
            }
        },
        exec: {
            nw: 'nw .',
            stop_NW: 'killall nw || killall nwjs || true'
        },
        watch: {
            scripts: {
                files: ['app/**/*.*', 'bower.json'],
                tasks: ['wiredep', 'exec:stop_NW', 'exec:nw'],
                options: {
                    atBegin: true,
                    interrupt: true
                }
            }
        },
    });

    // Default task(s).
    grunt.registerTask('default', function() {
        console.log('echo');
    });
    grunt.registerTask('serve', ['watch:scripts']);

};