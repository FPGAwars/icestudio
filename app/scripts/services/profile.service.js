'use strict';

angular.module('icestudio')
  .service('profile', function(utils,
                               nodeFs,
                               nodePath) {

    const PROFILE_PATH = nodePath.join(utils.ICESTUDIO_DIR, 'profile.json');

    this.data = {
      'language': '',
      'remoterHostname': '',
      'collection': ''
    };

    this.load = function(callback) {
      var self = this;
      utils.readFile(PROFILE_PATH, function(data) {
        if (data) {
          self.data = data;
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
      utils.saveFile(PROFILE_PATH, this.data, function() {
        console.log('Profile saved');
      }, true);
    };

  });
