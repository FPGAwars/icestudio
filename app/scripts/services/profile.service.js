'use strict';

angular.module('icestudio')
    .service('profile', function(utils) {

      this.profilePath = './profile.json'

      this.data = {
        'language': 'en'
      }

      this.load = function(callback) {
        utils.readFile(this.profilePath, (function(_this) {
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
        utils.saveFile(this.profilePath, this.data, function() {
          console.log('Profile saved');
        }, true);
      }

  });
