'use strict';

angular.module('icestudio')
  .service('boards', function(utils,
                              common,
                              nodeFs,
                              nodePath) {
    const DEFAULT = 'icezum';

    this.loadBoards = function() {
      var boards = [];
      var path = nodePath.join('resources', 'boards');
      var menu = nodeFs.readFileSync(nodePath.join(path, 'menu.json'));
      JSON.parse(menu).forEach(function(section) {
        section.boards.forEach(function(name) {
          var contentPath = nodePath.join(path, name);
          if (nodeFs.statSync(contentPath).isDirectory()) {
            var info = readJSONFile(contentPath, 'info.json');
            var pinout = readJSONFile(contentPath, 'pinout.json');
            var rules = readJSONFile(contentPath, 'rules.json');
            boards.push({
              name: name,
              info: info,
              pinout: pinout,
              rules: rules,
              type: section.type,
            });
          }
        });
      });
      common.boards = boards;
    };

    function readJSONFile(filepath, filename) {
      var ret = {};
      try {
        var data = nodeFs.readFileSync(nodePath.join(filepath, filename));
        ret = JSON.parse(data);
      }
      catch (err) { }
      return ret;
    }

    this.selectBoard = function(name) {
      name = name || DEFAULT;
      var i;
      var selectedBoard = null;
      for (i in common.boards) {
        if (common.boards[i].name === name) {
          selectedBoard = common.boards[i];
          break;
        }
      }
      if (selectedBoard === null) {
        // Board not found: select default board
        for (i in common.boards) {
          if (common.boards[i].name === DEFAULT) {
            selectedBoard = common.boards[i];
            break;
          }
        }
      }
      common.selectedBoard = selectedBoard;
      common.pinoutInputHTML = generateHTMLOptions(common.selectedBoard.pinout, 'input');
      common.pinoutOutputHTML = generateHTMLOptions(common.selectedBoard.pinout, 'output');
      utils.rootScopeSafeApply();
      return common.selectedBoard;
    };

    this.boardLabel = function(name) {
      for (var i in common.boards) {
        if (common.boards[i].name === name) {
          return common.boards[i].info.label;
        }
      }
      return name;
    };

    function generateHTMLOptions(pinout, type) {
      var code = '<option></option>';
      for (var i in pinout) {
        if (pinout[i].type === type || pinout[i].type === 'inout' ) {
          code += '<option value="' + pinout[i].value + '">' + pinout[i].name + '</option>';
        }
      }
      return code;
    }

  });
