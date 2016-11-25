'use strict';

angular.module('icestudio')
  .controller('MainCtrl', function($scope, gettextCatalog) {

    alertify.defaults.movable = false;
    alertify.defaults.notifier.delay = 2;
    alertify.defaults.glossary.title = 'Icestudio';

    setTimeout(function() {
      var ok = gettextCatalog.getString('OK');
      var cancel = gettextCatalog.getString('Cancel');
      alertify.set('alert', 'labels', { 'ok': ok, 'cancel': cancel });
      alertify.set('prompt', 'labels', { 'ok': ok, 'cancel': cancel });
      alertify.set('confirm', 'labels', { 'ok': ok, 'cancel': cancel });
    }, 100);

  });
