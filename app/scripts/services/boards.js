'use strict';

angular.module('icestudio')
  .service('boards', function(utils,
                              common,
                              nodeFs,
                              nodePath) {
    const DEFAULT = 'icezum';

    this.currentBoards = loadBoards(nodePath.join('resources', 'boards'));

    function loadBoards(path) {
      var boards = [];
      var contents = nodeFs.readdirSync(path);
      contents.forEach(function (content) {
        var contentPath = nodePath.join(path, content);
        if (nodeFs.statSync(contentPath).isDirectory()) {
          if (!content.startsWith('_')) {
            var info = readJSONFile(contentPath, 'info.json');
            var pinout = readJSONFile(contentPath, 'pinout.json');
            var rules = readJSONFile(contentPath, 'rules.json');
            boards.push({
              'name': content,
              'info': info,
              'pinout': pinout,
              'rules': rules
            });
          }
        }
      });
      return _.sortBy(boards, 'info.label');
    }

    function readJSONFile(filepath, filename) {
      var ret = {};
      try {
        var data = nodeFs.readFileSync(nodePath.join(filepath, filename));
        ret = JSON.parse(data.toString());
      }
      catch (err) { }
      return ret;
    }

    var self = this;

    $(document).on('boardChanged', function(evt, name) {
      self.selectBoard(name);
    });

    this.selectBoard = function(name) {
      name = name || DEFAULT;
      var i;
      var selectedBoard = null;
      for (i in this.currentBoards) {
        if (this.currentBoards[i].name === name) {
          selectedBoard = this.currentBoards[i];
          break;
        }
      }
      if (selectedBoard === null) {
        // Board not found: select default board
        for (i in this.currentBoards) {
          if (this.currentBoards[i].name === DEFAULT) {
            selectedBoard = this.currentBoards[i];
            break;
          }
        }
      }
      common.selectedBoard = selectedBoard;
      common.pinoutInputHTML = generateHTMLOptions(common.selectedBoard.pinout, 'input');
      common.pinoutOutputHTML = generateHTMLOptions(common.selectedBoard.pinout, 'output');
      utils.rootScopeSafeApply();
      return common.selectedBoard.name;
    };

    this.boardLabel = function(name) {
      for (var i in this.currentBoards) {
        if (this.currentBoards[i].name === name) {
          return this.currentBoards[i].info.label;
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
