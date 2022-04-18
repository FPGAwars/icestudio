'use strict';

//---------------------------------------------------------------------------
//-- Add the objects 'gui' and 'windows' to the Icestudio Module
//--   for accesing the graphical user interface and the windows
//--
//-- Add the object '_package' for accesing to the properties defined in 
//--   the app/package.json file
//---------------------------------------------------------------------------

angular.module('icestudio')

   //-- For the GUI, the NWjs package is used
  .factory('gui', function() {

    let gui = require('nw.gui');
    return gui;
  })

   //-- Windows are implemented through the nw.gui.Window object
  .factory('window', function() {

    let gui = require('nw.gui');
    return gui.Window;
  })

  //-- Acces to the package.json file
  //-- The special atribute .version is created. It uses the 
  //--  package.json version property and the timestamp located
  //--  in the buildinfo.json file
  .factory('_package', function() {

    //-- Acceso to the packgae.json file
    let _package = require('./package.json');

    //-- Access to the timetamp
    const _buildinfo = require('./buildinfo.json');

    //-- Build the final version: version + timestamp!
    _package.version=`${_package.version}${_buildinfo.ts}`;

    return _package;
  });
