'use strict';

angular.module('icestudio')
  .controller('MainCtrl', function($scope,
                                   gettextCatalog) {
 
    alertify.defaults.movable = false;
    alertify.defaults.closable = false;
    alertify.defaults.transition = 'fade';
    alertify.defaults.notifier.delay = 3;

    setTimeout(function() {
      var labels = {
        'ok': gettextCatalog.getString('OK'),
        'cancel': gettextCatalog.getString('Cancel')
      };
      alertify.set('alert', 'labels', labels);
      alertify.set('prompt', 'labels', labels);
      alertify.set('confirm', 'labels', labels);
    }, 100);

    /* Functions that checks if new version is available */
    function checkForNewVersion(){
      var notification = alertify.notify('<div class="new-version-notifier-box"><div class="new-version-notifier-box--icon"><img src="resources/images/confetti.svg"></div>\
                                          <div class="new-version-notifier-box--text">There is a new version available<br/><a href="">Click here to download it.</a></div></div>', 'notify',30, function(){  console.log('Notification hide'); });
    }

    setTimeout(function(){
    checkForNewVersion();

      },30000);

  });
