'use strict';

angular.module('icestudio')
    .service('profile', function(nodeFs, nodePath, utils) {

        const BASE_DIR = process.env.HOME || process.env.USERPROFILE;
        const ICESTUDIO_DIR = nodePath.join(BASE_DIR, '.icestudio');
        const PROFILE_PATH = nodePath.join(ICESTUDIO_DIR, 'profile.json');

        this.data = {
          'language': 'en',
          'remoterHostname': ''
        }

        this.load = function(callback) {
          utils.readFile(PROFILE_PATH, (function(_this) {
            return function(data) {
              if (data) {
                _this.data = data;
              }
              if (callback)
                callback()
              console.log('Profile loaded');
            };
          })(this));
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
