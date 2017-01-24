'use strict';

angular.module('icestudio')
  .service('boards', function(utils,
                              nodeFs,
                              nodePath) {
    const DEFAULT = 'icezum';

    this.pinoutHTML = '';
    this.selectedBoard = null;
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
      return boards;
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
      this.selectedBoard = selectedBoard;
      this.pinoutHTML = generateHTMLOptions(this.selectedBoard.pinout);
      utils.rootScopeSafeApply();
      return this.selectedBoard.name;
    };

    this.getPinoutHTML = function() {
      return this.pinoutHTML;
    };

    function generateHTMLOptions(pinout) {
      var code = '<option></option>';
      for (var i in pinout) {
        code += '<option value="' + pinout[i].value + '">' + pinout[i].name + '</option>';
      }
      return code;
    }

  });
