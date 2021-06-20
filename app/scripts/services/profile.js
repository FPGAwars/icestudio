'use strict';

angular.module('icestudio')
  .service('profile', function (utils,
    common,
    _package,
    nodeFs) {

    //-- Information stored in the profile file
    this.data = {

      'board': '',                  //-- Selected board
      'boardRules': true,           //-- Boardrules (active by default)
      'collection': '',             //-- Selected collection
      'externalCollections': '',    //-- Path for the external collections
      'externalPlugins': '',        //-- Path for the external paths
      'language': '',               //-- Current selected language
      'uiTheme': 'light',           //-- Theme
      'remoteHostname': '',
      'showFPGAResources': false,
      'loggingEnabled': false,
      'loggingFile':'',
      'displayVersionInfoWindow': 'yes',
      'pythonEnv':{'python':'','pip':''}
    };

    //-- Property added to the MACs
    if (common.DARWIN) {
      this.data['macosFTDIDrivers'] = false;
    }

    //-- Load the Profile file
    //-- The profile path is in the common.PROFILE_PATH global object
    this.load = function (callback) {

      var self = this;

      utils
        //-- Read the profile file....
        .readFile(common.PROFILE_PATH)

        //-- Store the values from the file into the common.data global object 
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
            'loggingEnabled':data.loggingEnabled || false,
            'loggingFile':data.loggingFile || '',
            'pythonEnv':data.pythonEnv || {'python':'','pip':''}
          };
          
          if(self.data.pythonEnv.python.length>0){
            common.PYTHON_ENV=self.data.pythonEnv.python;
            common.PYTHON_PIP_ENV=self.data.pythonEnv.pip;
          }

          //-- Custom Theme support
          //-- Select the dark theme by adding it to the HTML main file
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

    //-- Set the value of a profile property in the profile file
    this.set = function (key, value) {

      //-- The given property name is valid...
      if (this.data.hasOwnProperty(key)) {

        //-- Store the value
        this.data[key] = value;

        //-- Save into the profile file;
        this.save();
      }
    };

    //-- Read a value from the profile data structure
    this.get = function (key) {
      return this.data[key];
    };

    //------------------------------------------------
    //-- Save the current data to the profile file
    //--
    this.save = function () {

      //-- if no .icestudio folder, create a new one
      if (!nodeFs.existsSync(common.ICESTUDIO_DIR)) {
        nodeFs.mkdirSync(common.ICESTUDIO_DIR);
      }

      //-- Save the data to the profile file
      utils.saveFile(common.PROFILE_PATH, this.data)
        .then(function () {
          // Success
        })
        .catch(function (error) {
          alertify.error(error, 30);
        });
    };

  });
