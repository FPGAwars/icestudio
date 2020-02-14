'use strict';

angular.module('icestudio')
  .controller('MainCtrl', function ($scope,
    gettextCatalog, tools, utils) {

    alertify.defaults.movable = false;
    alertify.defaults.closable = false;
    alertify.defaults.transition = 'fade';
    alertify.defaults.notifier.delay = 3;

    setTimeout(function () {
      var labels = {
        'ok': gettextCatalog.getString('OK'),
        'cancel': gettextCatalog.getString('Cancel')
      };
      alertify.set('alert', 'labels', labels);
      alertify.set('prompt', 'labels', labels);
      alertify.set('confirm', 'labels', labels);
    }, 100);

    /* If in package.json appears development:{mode:true}*/
    /* activate development tools */
    tools.ifDevelopmentMode();


    $(document).delegate('.action-open-url-external-browser', 'click', function (e) {
      e.preventDefault();
      utils.openUrlExternalBrowser($(this).prop('href'));
      return false;
    });

    /* Functions that checks if new version is available */
    setTimeout(function () {
      tools.checkForNewVersion();
    }, 30000);


    /* Plugin menu*/



    let icmBodyEl = $('body'),

      icmOpenbtn = document.getElementById('icm-open-button'),
      icmClosebtn = document.getElementById('icm-close-button'),
      icmIsOpen = false,
      icmMorphEl = document.getElementById('icm-morph-shape'),
      icmTempsnap = Snap(icmMorphEl.querySelector('svg')),
      icmPath = icmTempsnap.select('path'),
      icmInitialPath = icmPath.attr('d'),
      icmPathOpen = icmMorphEl.getAttribute('data-morph-open'),
      icmIsAnimating = false;

    function icmToggleMenu() {
      if (icmIsAnimating) {
        return false;
      }
      icmIsAnimating = true;
      if (icmIsOpen) {
        icmBodyEl.removeClass('icm-show-menu');
        // animate path
        setTimeout(function () {
          // reset path
          icmPath.attr('d', icmInitialPath);
          icmIsAnimating = false;
        }, 300);
      } else {
        icmBodyEl.addClass('icm-show-menu');
        // animate path
        icmPath.animate({
          'path': icmPathOpen
        }, 400, mina.easeinout, function () {
          icmIsAnimating = false;
        });
      }
      icmIsOpen = !icmIsOpen;
    }

    icmOpenbtn.addEventListener('click', icmToggleMenu);

    if (icmClosebtn) {
      icmClosebtn.addEventListener('click', icmToggleMenu);
    }

    tools.initializePluginManager(icmToggleMenu);


    /***************************** */
});