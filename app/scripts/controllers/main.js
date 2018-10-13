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

  });
