'use strict';

angular.module('icestudio')
  .controller('ProjectCtrl', function ($scope,
                                       $rootScope,
                                       joint,
                                       nodeFs,
                                       nodeGlob,
                                       nodeRmdir,
                                       blocks,
                                       project,
                                       boards,
                                       utils) {

    $rootScope.project = {};
    $rootScope.breadcrumb = [ { id: '', name: '' }];

    // Initialize
    project.updateName('untitled');

    // Events

    $rootScope.$on('newProject', function(event, name) {
      project.updateName(name);
      clear();
      alertify.success('New project ' + name + ' created');
    });

    $rootScope.$on('loadProject', function(event, filepath) {
      $.getJSON(filepath, function(p) {
        var name = utils.basename(filepath);
        project.updateName(name);
        $rootScope.project = p;
        loadGraph(p, true, true);
        alertify.success('Project ' + name + ' loaded');
      });
    });

    $rootScope.$on('saveProject', function(event, filepath) {
      var name = utils.basename(filepath);
      project.updateName(name);
      refreshProject(null, true);
      save(filepath);
    });

    $rootScope.$on('loadCustomBlock', function(event, name) {
      var filepath = 'res/blocks/custom/' + name + '/' + name + '.json';
      $.getJSON(filepath, function(p) {
        project.updateName(name);
        $rootScope.project = p;
        loadGraph(project, true, true);
        alertify.success('Custom block ' + name + ' loaded');
      });
    });

    $rootScope.$on('saveCustomBlock', function(event, name) {
      var filepath = 'app/res/blocks/custom/' + name;
      try {
        nodeFs.mkdirSync(filepath);
      } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
      }
      project.updateName(name);
      save(filepath + '/' + name + '.json', false);
      blocks.loadBlocks(); // Refresh menu blocks
      alertify.success('Project ' + name + ' exported to custom blocks');
    });

    $rootScope.$on('removeCustomBlock', function(event, name) {
      var filepath = 'app/res/blocks/custom/' + name;
      nodeRmdir(filepath, function (err, dirs, files) {
        blocks.loadBlocks();
        alertify.success('Custom block ' + name + ' removed');
      });
    });

    $rootScope.$on('removeSelectedBlock', function(event) {
      if (paper.options.interactive) {
        if ($scope.selectedCell) {
          alertify.confirm('Do you want to remove the selected block?',
            function() {
              $scope.selectedCell.remove();
              delete $scope.selectedCell;
              refreshProject();
              alertify.success('Block removed');
          });
        }
      }
    });

    $(document).on('keydown', function(event) {
      if (event.keyCode == 46) { // Supr
        $rootScope.$emit('removeSelectedBlock');
      }
    });

    $rootScope.$on('clearGraph', function(event) {
      clear();
      alertify.success('Graph cleared');
    });



    $rootScope.$on('addBlock', function(event, data) {
      if (paper.options.interactive) {
        data.id = null;
        data.x = 100;
        data.y = 100;
        if (data.type == 'basic.code') {
          alertify.prompt('Insert the block i/o', '2 1',
            function(evt, io) {
              if (io) {
                var i = parseInt(io.split(' ')[0]);
                var o = parseInt(io.split(' ')[1]);
                data.block = { ports: {
                  in:  Array(i),
                  out: Array(o)
                  }
                };
                data.block.name = 'code';
                data.block.label = '';
                addBlock(data);
                alertify.success('Block ' + data.type + ' added');
              }
          });
        }
        else if (data.type == 'basic.input') {
          alertify.prompt('Insert the input block label', '',
            function(evt, label) {
              if (label) {
                data.block = { ports: {
                  in:  [],
                  out: [ { id: 'out' } ]
                  }
                };
                data.block.label = label;
                data.fpgaio = true;
                data.choices =  boards.getPinout($rootScope.selectedBoard);
                addBlock(data);
                alertify.success('Block ' + data.type + ' added');
              }
          });
        }
        else if (data.type == 'basic.output') {
          alertify.prompt('Insert the output block label', '',
            function(evt, label) {
              if (label) {
                data.block = { ports: {
                  in:  [ { id: 'in' } ],
                  out: []
                  }
                };
                data.block.label = label;
                data.fpgaio = true;
                data.choices =  boards.getPinout($rootScope.selectedBoard);
                addBlock(data);
                alertify.success('Block ' + data.type + ' added');
              }
          });
        }
        else {
          addBlock(data);
          alertify.success('Block ' + data.type + ' added');
        }
        refreshProject();
      }
    });


    $scope.breadcrumbNavitate = function(selectedItem) {
      var item;
      do {
        $rootScope.breadcrumb.pop();
        item = $rootScope.breadcrumb.slice(-1)[0];
      }
      while (selectedItem.name != item.name);

      if ($rootScope.breadcrumb.length == 1) {
        loadGraph($rootScope.project, true, true);
      }
      else {
        var type = selectedItem.type.split('.')
        loadGraph($rootScope.blocks[type[0]][type[1]], false, false);
      }
    }

    $rootScope.$on('boardChanged', function(event, board) {
      var cells = graph.getCells();
      for (var c in cells) {
        cells[c].attributes.choices = boards.getPinout(board);
        paper.findViewByModel(cells[c].id).renderChoices();
      }
    });

    $scope.selectedCell = null;

    // Graph
    var graph = new joint.dia.Graph();

    // Paper
    var paper = new joint.dia.Paper({
      el: $('#paper'),
      width: 900,
      height: 443,
      model: graph,
      gridSize: 1,
      snapLinks: { radius: 30 },
      defaultLink: new joint.shapes.ice.Wire(),
      validateConnection: function(cellViewS, magnetS,
                                   cellViewT, magnetT,
                                   end, linkView) {
        // Prevent loop linking
        return (magnetS !== magnetT);
      }
    });

    // Paper events

    paper.on('cell:pointerclick',
      function(cellView, evt, x, y) {
        if (paper.options.interactive) {
          if ($scope.selectedCell) {
            V(paper.findViewByModel($scope.selectedCell).el).removeClass('highlighted');
          }
          $scope.selectedCell = cellView.model;
          V(paper.findViewByModel($scope.selectedCell).el).addClass('highlighted');
        }
      }
    );

    paper.on('cell:pointerdblclick',
      function(cellView, evt, x, y) {
        var data = cellView.model.attributes;
        if (data.blockType == 'basic.input' || data.blockType == 'basic.output') {
          if (paper.options.interactive) {
            alertify.prompt('Insert the block label', '',
              function(evt, label) {
                if (label) {
                  data.attrs['.block-label'].text = label;
                  cellView.update();
                  alertify.success('Label updated');
                }
            });
          }
        }
        else {
          if (data.block.code.type == 'graph') {
            $rootScope.breadcrumb.push({ type: data.blockType, name: data.block.name });
            $rootScope.$apply();
            if ($rootScope.breadcrumb.length == 2) {
              refreshProject(function() {
                loadGraph(data.block, false, false);
              }, true);
            }
            else {
              loadGraph(data.block, false, false);
            }
          }
          else if (data.block.code.type == 'verilog') {
            var code = hljs.highlightAuto(data.block.code.data).value;
            alertify.alert('<pre><code class="verilog">' + code + '</code></pre>');
          }
        }
      }
    );

    paper.on('blank:pointerclick',
      function() {
        if (paper.options.interactive) {
          if ($scope.selectedCell) {
            V(paper.findViewByModel($scope.selectedCell).el).removeClass('highlighted');
          }
        }
      }
    );

    // Functions

    function paperEnable(value) {
      paper.options.interactive = value;
      if (value) {
        angular.element('#paper').css('opacity', '1.0');
      }
      else {
        angular.element('#paper').css('opacity', '0.5');
      }
    }

    function save(filepath) {
      var graphData = graph.toJSON();
      var name = utils.basename(filepath);

      nodeFs.writeFile(filepath, JSON.stringify($rootScope.project, null, 2),
        function(err) {
          if (!err) {
            console.log('File ' + name + ' saved');
          }
      });
    }

    function clear() {
      graph.clear();
      delete $scope.selectedCell;
      $rootScope.breadcrumb = [ { id: '', name: $rootScope.project.name }];
      $rootScope.$apply();
      paperEnable(true);
      refreshProject();
    }


    function loadGraph(data, interactive, fpgaio) {

      var ports = data.ports;
      var blocks = data.code.data.blocks;
      var wires = data.code.data.wires;

      paperEnable(interactive);

      if (data.code.type !== 'graph')
        return 0;

      graph.clear();
      delete $scope.selectedCell;

      // Blocks
      for (var i = 0; i < blocks.length; i++) {
        var data = {};
        data.type = blocks[i].type;
        var type = blocks[i].type.split('.')
        data.block = $rootScope.blocks[type[0]][type[1]];
        data.id = blocks[i].id;
        data.x = blocks[i].x;
        data.y = blocks[i].y;
        data.pinName = (blocks[i].value) ? blocks[i].value.name : '';
        data.fpgaio = fpgaio;

        // Set custom labels
        if (data.type === 'basic.input') {
          for (var _in = 0; _in < ports.in.length; _in++) {
            if (ports.in[_in].id == data.id) {
              data.block.label = ports.in[_in].label;
            }
          }
        }
        if (data.type === 'basic.output') {
          for (var _out = 0; _out < ports.out.length; _out++) {
            if (ports.out[_out].id == data.id) {
              data.block.label = ports.out[_out].label;
            }
          }
        }

        data.choices =  boards.getPinout($rootScope.selectedBoard);

        addBlock(data);
      }

      // Wires
      for (var i = 0; i < wires.length; i++) {
        var source = graph.getCell(wires[i].source.block);
        var target = graph.getCell(wires[i].target.block);

        // Find selectors
        var sourceSelector, targetSelector;

        for (var _out = 0; _out < source.attributes.outPorts.length; _out++) {
          if (source.attributes.outPorts[_out] == wires[i].source.port) {
            sourcePort = _out;
            break;
          }
        }

        for (var _in = 0; _in < source.attributes.inPorts.length; _in++) {
          if (target.attributes.inPorts[_in] == wires[i].target.port) {
            targetPort = _in;
            break;
          }
        }

        var wire = new joint.shapes.ice.Wire({
          source: { id: source.id, selector: sourceSelector, port: wires[i].source.port },
          target: { id: target.id, selector: targetSelector, port: wires[i].target.port },
        });
        graph.addCell(wire);
      }

      //paper.scale(1.5, 1.5);
    }

    function addBlock(data) {

      var width = 50;
      var numPorts = Math.max(data.block.ports.in.length, data.block.ports.out.length);

      if (data.block.ports.in.length) width += 50;
      if (data.block.ports.out.length) width += 50;

      var shape = joint.shapes.ice.Block;
      var height = 30 + 20 * numPorts;
      if (data.type === 'basic.input' || data.type == 'basic.output') {
        shape = joint.shapes.ice.IO;
        height = 50 + 20 * numPorts;
      }
      else if (data.type === 'basic.code') {
        shape = joint.shapes.ice.Code;
        width = 400;
        height = 200;
      }

      var block = new shape({
        id: data.id,
        block: data.block,
        blockType: data.type,
        pinName: data.pinName,
        fpgaio: data.fpgaio,
        choices: data.choices,
        inPorts: data.block.ports.in,
        outPorts: data.block.ports.out,
        position: { x: data.x, y: data.y },
        size: { width: width, height: height },
        attrs: { '.block-label': { text: data.block.label } }
      });

      graph.addCell(block);
    }

    function refreshProject(callback, fpgaio) {

      var graphData = graph.toJSON();

      // Header

      $rootScope.project.label = $rootScope.project.name.toUpperCase();

      // Ports

      var inPorts = [];
      var outPorts = [];

      for (var c = 0; c < graphData.cells.length; c++) {
        var cell = graphData.cells[c];
        if (cell.blockType) {
          if (cell.blockType == 'basic.input') {
            inPorts.push({id: cell.id, label: cell.attrs['.block-label'].text });
          }
          else if (cell.blockType == 'basic.output') {
            outPorts.push({id: cell.id, label: cell.attrs['.block-label'].text });
          }
        }
      }

      $rootScope.project.ports = { in: inPorts, out: outPorts };

      // Code

      var blocks = [];
      var wires = [];

      for (var c = 0; c < graphData.cells.length; c++) {
        var cell = graphData.cells[c];
        if (cell.type == 'ice.Block' || cell.type == 'ice.IO') {
          var block = {};
          block.id = cell.id;
          block.type = cell.blockType;
          if (fpgaio)
            block.value = { name: cell.pinName };
          block.x = cell.position.x;
          block.y = cell.position.y;
          blocks.push(block);
        }
        else if (cell.type == 'ice.Wire') {
          var wire = {};
          wire.source = { block: cell.source.id, port: cell.source.port };
          wire.target = { block: cell.target.id, port: cell.target.port };
          wires.push(wire);
        }
      }

      $rootScope.project.code = { type: 'graph', data: { blocks: blocks, wires: wires } };

      if (callback)
        callback();
    }

  });
