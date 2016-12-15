'use strict';

angular.module('icestudio')
    .service('profile', function(utils,
                                 nodeFs,
                                 nodePath) {

        const BASE_DIR = process.env.HOME || process.env.USERPROFILE;
        const ICESTUDIO_DIR = nodePath.join(BASE_DIR, '.icestudio');
        const PROFILE_PATH = nodePath.join(ICESTUDIO_DIR, 'profile.json');

        this.data = {
          'language': '',
          'remoterHostname': ''
        }

        this.load = function(callback) {
          var self = this;
          utils.readFile(PROFILE_PATH, function(data) {
            if (data) {
              self.data = data;
            }
            if (callback)
              callback();
            // console.log('Profile loaded');
          });
        }

        this.save = function() {
          if (!nodeFs.existsSync(ICESTUDIO_DIR))
            nodeFs.mkdirSync(ICESTUDIO_DIR);
          utils.saveFile(PROFILE_PATH, this.data, function() {
            console.log('Profile saved');
          }, true);
        }
      }
  );
