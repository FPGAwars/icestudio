'use strict';

angular.module('icestudio')
  .controller('MainCtrl', function($scope, $rootScope) {
    console.log('echo main');

    $rootScope.blocks = {};
    $rootScope.projectName = 'untitled';

    alertify.defaults = {
      // dialogs defaults
      modal:true,
      basic:false,
      frameless:false,
      movable:true,
      moveBounded:false,
      resizable:true,
      closable:true,
      closableByDimmer:true,
      maximizable:true,
      startMaximized:false,
      pinnable:true,
      pinned:true,
      padding: true,
      overflow:true,
      maintainFocus:true,
      transition:'fade', // [ 'slide', 'zoom', 'flipx', 'flipy', 'fade', 'pulse' ]
      autoReset:true,

      // notifier defaults
      notifier:{
        // auto-dismiss wait time (in seconds)
        delay:2,
        // default position
        position:'bottom-right'
      },

      // language resources
      glossary:{
        // dialogs default title
        title:'Icestudio',
        // ok button text
        ok: 'OK',
        // cancel button text
        cancel: 'Cancel'
      },

      // theme settings
      theme:{
        // class name attached to prompt dialog input textbox.
        input:'ajs-input',
        // class name attached to ok button
        ok:'ajs-ok',
        // class name attached to cancel button
        cancel:'ajs-cancel'
      }
    };

  });
