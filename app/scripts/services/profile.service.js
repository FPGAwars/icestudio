'use strict';

angular.module('icestudio')
  .service('profile', function(utils,
                               nodeFs) {

    this.data = {
      'language': '',
      'remoterHostname': '',
      'collection': '',
      'board': '',
      'boardRules': true
    };

    this.load = function(callback) {
      var self = this;
      utils.readFile(utils.PROFILE_PATH, function(data) {
        if (data) {
          self.data = _.merge(self.data, data);
        }
        if (callback) {
          callback();
        }
        // console.log('Profile loaded');
      });
    };

    this.save = function() {
      if (!nodeFs.existsSync(utils.ICESTUDIO_DIR)) {
        nodeFs.mkdirSync(utils.ICESTUDIO_DIR);
      }
      utils.saveFile(utils.PROFILE_PATH, this.data, function() {
        console.log('Profile saved');
      }, true);
    };

  });
