'use strict';

angular.module('icestudio')
  .factory('fastCopy', function() {

    //-- Package for creating deep copies very fast
    //-- More info: https://www.npmjs.com/package/fast-copy
    return require('fast-copy');
  })

  .factory('sparkMD5', function() {
    return require('spark-md5');
  })
   .factory('fsLock',function(){
       return require ('proper-lockfile');
   })
  
  .factory('nodeFs', function() {
    return require('fs');
  })
  .factory('nodeFse', function() {
    return require('fs-extra');
  })
  .factory('nodeRmdir', function() {
    return require('rmdir');
  })
  .factory('nodeSha1', function() {
    return require('sha1');
  })

  //-- Node Path module
  //-- More info: https://nodejs.org/docs/latest-v17.x/api/path.html
  .factory('nodePath', function() {
    return require('path');
  })

  .factory('nodeChildProcess', function() {
    return require('child_process');
  })
  .factory('nodeZlib', function() {
    return require('zlib');
  })
  .factory('nodeSSHexec', function() {
    return require('ssh-exec');
  })
  .factory('nodeRSync', function() {
    return require('rsyncwrapper');
  })
  .factory('nodeSudo', function() {
    return require('sudo-prompt');
  })
  .factory('nodeGlob', function() {
    return require('glob');
  })
  .factory('nodeLangInfo', function() {
    return require('node-lang-info');
  })
  .factory('nodeAdmZip', function() {
    return require('adm-zip');
  })
  .factory('nodeExtract', function() {
    return require('extract-zip');
  })
  .factory('nodeGettext', function() {
    return require('angular-gettext-tools');
  })
  .factory('nodeCP', function() {
    return require('copy-paste');
  })
  .factory('nodeGetOS', function() {
    return require('getos');
  })

  //-- Create temporary files and directories
  //-- More info: https://www.npmjs.com/package/tmp
  .factory('nodeTmp', function() {
    return require('tmp');
  })
  
  .factory('nodeDebounce', function() {
    return require('lodash.debounce');
  })
  .factory('shelljs', function() {
    return require('shelljs');
  })
  .factory('SVGO', function() {
    var config = {
      full: true,
      plugins: [
        'removeDoctype',
        'removeXMLProcInst',
        'removeComments',
        'removeMetadata',
        'removeXMLNS',
        'removeEditorsNSData',
        'cleanupAttrs',
        'minifyStyles',
        'convertStyleToAttrs',
        'cleanupIDs',
        'removeRasterImages',
        'removeUselessDefs',
        'cleanupNumericValues',
        'cleanupListOfValues',
        'convertColors',
        'removeUnknownsAndDefaults',
        'removeNonInheritableGroupAttrs',
        'removeUselessStrokeAndFill',
        'removeViewBox',
        'cleanupEnableBackground',
        'removeHiddenElems',
        'removeEmptyText',
        'convertShapeToPath',
        'moveElemsAttrsToGroup',
        'moveGroupAttrsToElems',
        'collapseGroups',
        'convertPathData',
        'convertTransform',
        'removeEmptyAttrs',
        'removeEmptyContainers',
        'mergePaths',
        'removeUnusedNS',
        'transformsWithOnePath',
        'sortAttrs',
        'removeTitle',
        'removeDesc',
        'removeDimensions',
        'removeAttrs',
        'removeElementsByAttr',
        'addClassesToSVGElement',
        'removeStyleElement',
        'removeStyleElement'
      ]
    };
    var SVGO = require('svgo');
    return new SVGO(config);
  });
