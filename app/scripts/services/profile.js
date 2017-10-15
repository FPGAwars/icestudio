'use strict';

angular.module('icestudio')
  .service('profile', function(utils,
                               common,
                               nodeFs) {

    this.data = {
      'language': '',
      'remoteHostname': '',
      'collection': '',
      'board': '',
      'boardRules': true
    };

    if (common.DARWIN) {
      this.data['macosDrivers'] = false;
    }

    this.load = function(callback) {
      var self = this;
      utils.readFile(common.PROFILE_PATH)
      .then(function(data) {
        self.data = {
          'language': data.language || '',
          'remoteHostname': data.remoteHostname || '',
          'collection': data.collection || '',
          'board': data.board || '',
          'boardRules': data.boardRules !== false
        };
        if (common.DARWIN) {
          self.data['macosDrivers'] = data.macosDrivers || false;
        }
        if (callback) {
          callback();
        }
      })
      .catch(function(error) {
        alertify.error(error, 30);
        if (callback) {
          callback();
        }
      });
    };

    this.set = function(key, value) {
      if (this.data.hasOwnProperty(key)) {
        this.data[key] = value;
        this.save();
      }
    };

    this.get = function(key) {
      return this.data[key];
    };

    this.save = function() {
      if (!nodeFs.existsSync(common.ICESTUDIO_DIR)) {
        nodeFs.mkdirSync(common.ICESTUDIO_DIR);
      }
      utils.saveFile(common.PROFILE_PATH, this.data)
      .then(function() {
        // Success
      })
      .catch(function(error) {
        alertify.error(error, 30);
      });
    };

  });
