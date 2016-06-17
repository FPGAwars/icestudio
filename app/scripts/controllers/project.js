'use strict';

angular.module('icestudio')
  .controller('ProjectCtrl', function ($scope, $rootScope, joint, nodeFs, window) {

    window.title = 'Icestudio - ' + $rootScope.projectName;

    $scope.project = { name: $rootScope.projectName, label: $rootScope.projectName.toUpperCase()};

    $scope.breadcrumb = [ $rootScope.projectName ];

    // Events

    $rootScope.$on('new', function(event) {
      alertify.prompt('Enter the project\'s title', 'untitled',
        function(evt, name) {
          if (name) {
            $rootScope.projectName = name;
            $scope.breadcrumb[0] = name;
            $scope.$apply();
            window.title = 'Icestudio - ' + name;
            clearGraph();
            alertify.success('New project created');
          }
        },
        function(){
        });
    });

    $rootScope.$on('load', function(event, filepath) {
      $.getJSON(filepath, function(data) {
        var name = filepath.replace(/^.*[\\\/]/, '').split('.')[0];
        $rootScope.projectName = name;
        $scope.breadcrumb[0] = name;
        $scope.$apply();
        window.title = 'Icestudio - ' + name;
        $scope.project = data;
        loadGraph(data);
        alertify.success('Project ' + name + ' loaded');
      });
    });

    $rootScope.$on('save', function(event, filepath) {
      var name = filepath.replace(/^.*[\\\/]/, '').split('.')[0];
      $rootScope.projectName = name;
      $scope.breadcrumb[0] = name;
      $scope.$apply();
      window.title = 'Icestudio - ' + name;
      saveProject(filepath);
      alertify.success('Project ' + name + ' saved');
    });

    $rootScope.$on('exportCustomBlock', function(event) {
      alertify.prompt('Do you want to export your custom block?', $rootScope.projectName,
        function(evt, name) {
          if (name) {
            $rootScope.projectName = name;
            $scope.breadcrumb[0] = name;
            $scope.$apply();
            window.title = 'Icestudio - ' + $rootScope.projectName;
            exportCustomBlock();
            $rootScope.loadBlocks();
            alertify.success('Project ' + $rootScope.projectName + ' exported to custom blocks');
          }
        },
        function(){
        });
    });

    $(document).on('keydown', function(event) {
      if (event.keyCode == 46) {
        // Supr
        removeBlock();
      }
    });

    $rootScope.$on('remove', function(event) {
      removeBlock()
    });

    $rootScope.$on('clear', function(event) {
      alertify.confirm('Do you want to clear the graph?',
      function(){
        clearGraph();
        alertify.success('Graph cleared');
      },
      function(){
      });
    });

    $rootScope.$on('addBlock', function(event, data) {
      data.id = null;
      data.x = 100;
      data.y = 100;
      if (data.type === 'io.input' || data.type == 'io.output') {
        alertify.prompt('Insert the block label', '',
          function(evt, label) {
            if (label) {
              data.block.label = label;
              addBlock(data);
              alertify.success('Block ' + data.type + ' added');
            }
          },
          function(){
          });
      }
      else {
        addBlock(data);
        alertify.success('Block ' + data.type + ' added');
      }

    });

    $scope.goto = function(selectedItem) {
      var item;
      do {
        $scope.breadcrumb.pop();
        item = $scope.breadcrumb.slice(-1)[0];
      }
      while (selectedItem != item);

      console.log($scope.project);

      loadGraph($scope.project);
    }

    $scope.selectedCell = null;

    // Graph
    var graph = new joint.dia.Graph();

    // Paper
    var paper = new joint.dia.Paper({
      el: $('#paper'),
      width: 850,
      height: 440,
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
        if ($scope.selectedCell) {
          V(paper.findViewByModel($scope.selectedCell).el).removeClass('highlighted');
        }
        $scope.selectedCell = cellView.model;
        V(paper.findViewByModel($scope.selectedCell).el).addClass('highlighted');
      }
    );

    paper.on('cell:pointerdblclick',
      function(cellView, evt, x, y) {
        var data = cellView.model.attributes;
        if (data.blockType == 'io.input' || data.blockType == 'io.output') {
          alertify.prompt('Insert the block label', '',
            function(evt, label) {
              if (label) {
                data.attrs['.block-label'].text = label;
                cellView.update();
                alertify.success('Label updated');
              }
            }
          );
        }
        else {
          if (data.block.code.type == 'graph') {
            $scope.breadcrumb.push(data.block.name);
            $scope.$apply();
            loadGraph(data.block);
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
        if ($scope.selectedCell) {
          V(paper.findViewByModel($scope.selectedCell).el).removeClass('highlighted');
        }
      }
    );


    // Functions

    function loadGraph(data) {

      var ports = data.ports;
      var blocks = data.code.data.blocks;
      var wires = data.code.data.wires;

      if (data.code.type !== 'graph')
        return 0;

      clearGraph();

      // Blocks
      for (var i = 0; i < blocks.length; i++) {
        var data = {};
        data.type = blocks[i].type;
        var type = blocks[i].type.split('.')
        data.block = $rootScope.blocks[type[0]][type[1]];
        data.id = blocks[i].id;
        data.x = blocks[i].x;
        data.y = blocks[i].y;

        // Set custom labels
        if (data.type === 'io.input') {
          for (var _in = 0; _in < ports.in.length; _in++) {
            if (ports.in[_in].id == data.id) {
              data.block.label = ports.in[_in].label;
            }
          }
        }
        if (data.type === 'io.output') {
          for (var _out = 0; _out < ports.out.length; _out++) {
            if (ports.out[_out].id == data.id) {
              data.block.label = ports.out[_out].label;
            }
          }
        }

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
      if (data.type === 'io.input' || data.type == 'io.output') {
        shape = joint.shapes.ice.IO;
      }

      var block = new shape({
        id: data.id,
        block: data.block,
        blockType: data.type,
        inPorts: data.block.ports.in,
        outPorts: data.block.ports.out,
        position: { x: data.x, y: data.y },
        size: { width: width, height: 30 + 20 * numPorts },
        attrs: { '.block-label': { text: data.block.label } }
      });

      graph.addCell(block);
    }

    function saveProject(filepath) {

      var graphData = graph.toJSON();
      var name = filepath.replace(/^.*[\\\/]/, '').split('.')[0];

      var project = {};

      // Header

      project.name = name;
      project.label = name.toUpperCase();

      // Ports

      var inPorts = [];
      var outPorts = [];

      for (var c = 0; c < graphData.cells.length; c++) {
        var cell = graphData.cells[c];
        if (cell.blockType) {
          if (cell.blockType == 'io.input') {
            inPorts.push({id: cell.id, label: cell.attrs['.block-label'].text });
          }
          else if (cell.blockType == 'io.output') {
            outPorts.push({id: cell.id, label: cell.attrs['.block-label'].text });
          }
        }
      }

      project.ports = { in: inPorts, out: outPorts };

      // Code

      var blocks = [];
      var wires = [];

      for (var c = 0; c < graphData.cells.length; c++) {
        var cell = graphData.cells[c];
        if (cell.type == 'ice.Block' || cell.type == 'ice.IO') {
          var block = {};
          block.id = cell.id;
          block.type = cell.blockType;
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

      project.code = { type: 'graph', data: { blocks: blocks, wires: wires } };

      // Data

      nodeFs.writeFile(filepath, JSON.stringify(project, null, 2),
        function(err) {
          if (!err) {
            console.log('File ' + name + ' saved');
          }
      });
    }

    function removeBlock() {
      if ($scope.selectedCell) {
        alertify.confirm('Do you want to remove the selected block?',
        function(){
          $scope.selectedCell.remove();
          delete $scope.selectedCell;
          alertify.success('Block removed');
        },
        function(){
        });
      }
    }

    function clearGraph() {
      graph.clear();
      delete $scope.selectedCell;
    }

    function exportCustomBlock() {
      var filepath = 'app/res/blocks/custom/' + $rootScope.projectName;
      try {
        nodeFs.mkdirSync(filepath);
      } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
      }
      saveProject(filepath + '/' + $rootScope.projectName + '.json');
    }

  });
