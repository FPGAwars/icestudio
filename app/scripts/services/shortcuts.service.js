'use strict';

angular.module('icestudio')
  .filter('shortcut', function(shortcuts) {
    return function(action) {
      return shortcuts.label(action);
    };
  })
  .service('shortcuts', function(utils) {

    this.method = function(action, method) {
      // Configure shortcut method
      if (action in shortcuts) {
        shortcuts[action]['method'] = method;
      }
    };

    this.execute = function(event, opt) {
      // Execute shortcut method
      // Options:
      // - opt.prompt: allow shortcut when a prompt is shown
      // - opt.disable: allow shortcut when the graph is disabled

      var action = '';
      var method = null;
      var system = utils.DARWIN ? 'mac' : 'unix';
      var ret = { preventDefault: false };
      for (action in shortcuts) {
        var options = shortcuts[action].opt || {};
        var command = shortcuts[action][system];
        if (event.keyCode === command.key &&
            event.ctrlKey === (command.ctrl || false) &&
            event.metaKey === (command.meta || false) &&
            event.shiftKey === (command.shift || false) &&
            (!opt.prompt || (options.prompt || false)) &&
            (!opt.disabled || (options.disabled || false))) {

          method = shortcuts[action].method;
          ret.preventDefault = options.preventDefault || false;
          break;
        }
      }
      if (method) {
        method();
      }
      return ret;
    };

    this.label = function(action) {
      // Return shortcut label
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
        unix: { label: 'Ctrl+N', ctrl: true, key: 78 },
        mac: { label: '⌘+N', meta: true, key: 78 }
      },
      openProject: {
        unix: { label: 'Ctrl+O', ctrl: true, key: 79 },
        mac: { label: '⌘+O', meta: true, key: 79 }
      },
      saveProject: {
        unix: { label: 'Ctrl+S', ctrl: true, key: 83 }
      },
      saveProjectAs: {
        unix: { label: 'Ctrl+Shift+S', ctrl: true, shift: true, key: 83 }
      },
      quit: {
        unix: { label: 'Ctrl+Q', ctrl: true, key: 81 }
      },
      undoGraph: {
        unix: { label: 'Ctrl+Z', ctrl: true, key: 90 },
        opt: { preventDefault: true }
      },
      redoGraph: {
        unix: { label: 'Ctrl+Y', ctrl: true, key: 89 },
        opt: { preventDefault: true }
      },
      redoGraph2: {
        unix: { label: 'Ctrl+Shift+Z', ctrl: true, shift: true, key: 90 },
        opt: { preventDefault: true }
      },
      cutSelected: {
        unix: { label: 'Ctrl+X', ctrl: true, key: 88 }
      },
      copySelected: {
        unix: { label: 'Ctrl+C', ctrl: true, key: 67 }
      },
      pasteSelected: {
        unix: { label: 'Ctrl+V', ctrl: true, key: 86 }
      },
      selectAll: {
        unix: { label: 'Ctrl+A', ctrl: true, key: 65 }
      },
      resetView: {
        unix: { label: 'Ctrl+0', ctrl: true, key: 48 },
        opt: { disabled: true }
      },
      fitContent: {
        unix: { label: 'Ctrl+F', ctrl: true, key: 70 },
        opt: { disabled: true }
      },
      verifyCode: {
        unix: { label: 'Ctrl+R', ctrl: true, key: 82 }
      },
      buildCode: {
        unix: { label: 'Ctrl+B', ctrl: true, key: 66 }
      },
      uploadCode: {
        unix: { label: 'Ctrl+U', ctrl: true, key: 85 }
      },
      stepUp: {
        unix: { label: 'Arrow up', key: 38 }
      },
      stepDown: {
        unix: { label: 'Arrow down', key: 40 }
      },
      stepLeft: {
        unix: { label: 'Arrow left', key: 37 }
      },
      stepRight: {
        unix: { label: 'Arrow right', key: 39 }
      },
      removeSelected: {
        unix: { label: 'Supr', key: 46 }
      },
      breadcrumbsBack: {
        unix: { label: 'Back', key: 8 },
        opt: { disabled: true }
      },
      takeSnapshot: {
        unix: { label: 'Ctrl+P', ctrl: true, key: 80 },
        opt: { prompt: true, disabled: true }
      }
    };

  });
