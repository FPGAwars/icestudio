'use strict';

angular.module('icestudio')
  .filter('shortcut', function(shortcuts) {
    return function(action) {
      return shortcuts.label(action);
    };
  })
  .service('shortcuts', function(utils) {

    this.method = function(action, method) {
      if (action in shortcuts) {
        shortcuts[action].method = method;
      }
    };

    this.execute = function(event) {
      var method = null;
      var system = utils.DARWIN ? 'mac' : 'unix';
      for (var action in shortcuts) {
        var command = shortcuts[action][system];
        if (event.keyCode === command.key &&
            event.ctrlKey === (command.ctrl || false) &&
            event.metaKey === (command.meta || false)) {

          method = shortcuts[action].method;
          break;
        }
      }
      if (method) {
        method();
      }
    };

    this.label = function(action) {
      var label = '';
      if (action in shortcuts) {
        if (utils.DARWIN) {
          label = shortcuts[action].mac.label;
        }
        else {
          label = shortcuts[action].unix.label;
        }
      }
      return label;
    };

    var shortcuts = {
      newProject: {
        method: null,
        unix: {
          label: 'Ctrl+N',
          ctrl: true,
          key: 78
        },
        mac: {
          label: '⌘+N',
          meta: true,
          key: 78
        }
      },
      openProject: {
        method: null,
        unix: {
          label: 'Ctrl+O',
          ctrl: true,
          key: 79
        },
        mac: {
          label: '⌘+O',
          meta: true,
          key: 79
        }
      },
    };

  });
