'use strict';

angular.module('icestudio')
  .service('profile', function(utils,
                               common,
                               nodeFs) {

    this.data = {
      'board': '',
      'boardRules': true,
      'collection': '',
      'externalCollections': '',
      'language': '',
      'remoteHostname': '',
      'showFPGAResources': false
    };

    if (common.DARWIN) {
      this.data['macosFTDIDrivers'] = false;
    }

    this.load = function(callback) {
      var self = this;
      utils.readFile(common.PROFILE_PATH)
      .then(function(data) {
        self.data = {
          'board': data.board || '',
          'boardRules': data.boardRules !== false,
          'collection': data.collection || '',
          'language': data.language || '',
          'externalCollections': data.externalCollections || '',
          'remoteHostname': data.remoteHostname || '',
          'showFPGAResources': data.showFPGAResources || false
        };
        if (common.DARWIN) {
          self.data['macosFTDIDrivers'] = data.macosFTDIDrivers || false;
        }
        if (callback) {
          callback();
        }
      })
      .catch(function(error) {
        console.warn(error);
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
