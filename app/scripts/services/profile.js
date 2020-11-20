'use strict';

angular.module('icestudio')
  .service('profile', function (utils,
    common,
    _package,
    nodeFs) {

    this.data = {
      'board': '',
      'boardRules': true,
      'collection': '',
      'externalCollections': '',
      'externalPlugins': '',
      'language': '',
      'uiTheme': 'light',
      'remoteHostname': '',
      'showFPGAResources': false,
      'displayVersionInfoWindow': 'yes',
      'pythonEnv':{'python':'','pip':''}
    };

    if (common.DARWIN) {
      this.data['macosFTDIDrivers'] = false;
    }

    this.load = function (callback) {
      var self = this;
      utils.readFile(common.PROFILE_PATH)
        .then(function (data) {
          
          self.data = {
            'board': data.board || '',
            'boardRules': data.boardRules !== false,
            'collection': data.collection || '',
            'language': data.language || '',
            'uiTheme': data.uiTheme || 'dark',
            'externalCollections': data.externalCollections || '',
            'externalPlugins': data.externalPlugins || '',
            'remoteHostname': data.remoteHostname || '',
            'showFPGAResources': data.showFPGAResources || false,
            'displayVersionInfoWindow': data.displayVersionInfoWindow || 'yes',
            'lastVersionReview':data.lastVersionReview || false,
            'pythonEnv':data.pythonEnv || {'python':'','pip':''}

          };
          
          if(self.data.pythonEnv.python.length>0){
            common.PYTHON_ENV=self.data.pythonEnv.python;
            console.log('PYTHON',common.PYTHON_ENV);
          }

          //-- Custom Theme support
          if(self.data.uiTheme !== 'light'){
            let cssFile='<link  rel="stylesheet" href="resources/uiThemes/dark/dark.css">';
            let pHead = document.getElementsByTagName('head')[0];
            pHead.innerHTML = pHead.innerHTML + cssFile;
          }
          //-- End Custom Theme support 
          if (common.DARWIN) {
            self.data['macosFTDIDrivers'] = data.macosFTDIDrivers || false;
          }
          if (callback) {
            callback();
          }
        })
        .catch(function (error) {
          console.warn(error);
          if (callback) {
            callback();
          }
        });
    };

    this.set = function (key, value) {
      if (this.data.hasOwnProperty(key)) {
        this.data[key] = value;
        this.save();
      }
    };

    this.get = function (key) {
      return this.data[key];
    };

    this.save = function () {
      if (!nodeFs.existsSync(common.ICESTUDIO_DIR)) {
        nodeFs.mkdirSync(common.ICESTUDIO_DIR);
      }
      utils.saveFile(common.PROFILE_PATH, this.data)
        .then(function () {
          // Success
        })
        .catch(function (error) {
          alertify.error(error, 30);
        });
    };

  });
