'use strict';

angular.module('icestudio')
  .controller('MainCtrl', function($scope,
                                   gettextCatalog) {

    alertify.defaults.movable = false;
    alertify.defaults.closable = false;
    alertify.defaults.transition = 'fade';
    alertify.defaults.notifier.delay = 3;
    alertify.defaults.glossary.title = 'Icestudio';

    setTimeout(function() {
      var labels = {
        'ok': gettextCatalog.getString('OK'),
        'cancel': gettextCatalog.getString('Cancel')
      };
      alertify.set('alert', 'labels', labels);
      alertify.set('prompt', 'labels', labels);
      alertify.set('confirm', 'labels', labels);
    }, 100);

    /*var FS = require('fs'),
    PATH = require('path'),
    SVGO = require('svgo'),
    filepath = PATH.resolve('resources', 'images', '1.svg'),
    svgo = new SVGO();

    FS.readFile(filepath, 'utf8', function(err, data) {

        if (err) {
            throw err;
        }

        svgo.optimize(data, function(result) {

            console.log(result);

            FS.writeFile('image.json', JSON.stringify({'image': encodeURI(result.data)}), function(err) {
              if (err) throw err;
              console.log('It\'s saved!');
            });

            // {
            //     // optimized SVG data string
            //     data: '<svg width="10" height="20">test</svg>'
            //     // additional info such as width/height
            //     info: {
            //         width: '10',
            //         height: '20'
            //     }
            // }

        });

    });*/

  });
