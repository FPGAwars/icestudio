'use strict';

angular.module('icestudio')
  .service('boards', function(nodeFs,
                              nodePath) {
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
            boards.push({
              'name': content,
              'info': info,
              'pinout': pinout
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

    this.selectBoard = function(name) {
      for (var i in this.currentBoards) {
        if (name === this.currentBoards[i].name) {
          this.selectedBoard = this.currentBoards[i];
          this.pinoutHTML = generateHTMLOptions(this.selectedBoard.pinout);
          break;
        }
      }
    };

    // Set default board
    this.selectBoard('icezum');

    this.getBoards = function() {
      return this.currentBoards;
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
