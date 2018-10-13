'use strict';

// Task to build a standalone toolchain for each OS

var ToolchainBuilder = require('./toolchain_builder.js');

module.exports = function(grunt) {

  grunt.registerTask('toolchain', 'Packaging the current toolchain', function() {
    var done = this.async();
    var options = this.options();

    // create and run toolchainBuilder
    var tb = new ToolchainBuilder(options);

    tb.on('log',function (log) {
      grunt.log.writeln(log);
    });

    tb.build()
      .then(function() {
        grunt.log.ok('Standalone toolchain created!');
        done();
      })
      .catch(function(error) {
        grunt.fail.fatal(error);
        done();
      });

  });

};
