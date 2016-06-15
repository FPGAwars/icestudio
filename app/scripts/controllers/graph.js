'use strict';

angular.module('icestudio')
  .controller('GraphCtrl', function($scope, $rootScope, joint, nodeFs, window) {

    // Variables

    $scope.projectName = 'Untitled';
    window.title = 'Icestudio - ' + $scope.projectName;

    // Graph
    var graph = new joint.dia.Graph();

    // Paper
    var paper = new joint.dia.Paper({
      el: $('#paper'),
      width: 850,
      height: 480,
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


    // Events

    $rootScope.$on('new', function(event) {
      alertify.prompt("Enter the project's title", function (name, e) {
          if (e) {
            if (name) {
              $scope.projectName = name;
              window.title = 'Icestudio - ' + name;
              graph.clear();
              alertify.success('New project created');
            }
          }
      }, "Untitled");

    });

    $rootScope.$on('load', function(event, filepath) {
      $.getJSON(filepath, function(data) {
        var name = filepath.replace(/^.*[\\\/]/, '').split('.')[0];
        window.title = 'Icestudio - ' + name;
        loadProject(data);
        alertify.success('File ' + name + ' loaded');
      });
    });

    $rootScope.$on('save', function(event, filepath) {
      saveProject(filepath);
      alertify.success('File ' + name + ' saved');
    });

    $rootScope.$on('addBlock', function(event, data) {
      data.id = null;
      data.x = 100;
      data.y = 100;
      addBlock(data);
      alertify.success('Block ' + data.type + ' added');
    });


    // Functions

    function loadProject(data) {

      var nodes = data.code.data.nodes;
      var links = data.code.data.links;

      if (data.code.type !== 'graph')
        return 0;

      graph.clear();

      // Nodes
      for (var i = 0; i < nodes.length; i++) {
        var data = {};
        data.type = nodes[i].type;
        var type = nodes[i].type.split('.')
        data.block = $rootScope.blocks[type[0]][type[1]];
        data.id = nodes[i].id;
        data.x = nodes[i].x;
        data.y = nodes[i].y;
        addBlock(data);
      }

      // Links
      for (var i = 0; i < links.length; i++) {
        var source = graph.getCell(links[i].source.node);
        var target = graph.getCell(links[i].target.node);
        var sourcePort = source.getPortSelector(links[i].source.port);
        var targetPort = target.getPortSelector(links[i].target.port);

        var link = new joint.shapes.ice.Wire({
          source: { id: source.id, selector: sourcePort, port: links[i].source.port },
          target: { id: target.id, selector: targetPort, port: links[i].target.port },
        });
        graph.addCell(link);
      }

      function findDep(deps, name) {
        for (var i = 0; i < deps.length; i++) {
          if (deps[i].name == name)
            return deps[i]
        }
      }

      //paper.scale(1.5, 1.5);
    }

    function addBlock(data) {

      var inPorts = [];
      var outPorts = [];

      for (var _in = 0; _in < data.block.ports.in.length; _in++) {
        inPorts.push(data.block.ports.in[_in].id);
      }

      for (var _out = 0; _out < data.block.ports.out.length; _out++) {
        outPorts.push(data.block.ports.out[_out].id);
      }

      var numPorts = Math.max(inPorts.length, outPorts.length);
      var width = 50;

      if (inPorts.length) width += 40;
      if (outPorts.length) width += 40;

      var shape = joint.shapes.ice.Block;

      if (data.type === 'io.input' || data.type == 'io.output') {
        shape = joint.shapes.ice.IO;
      }

      var block = new shape({
        id: data.id,
        blockType: data.type,
        blockLabel: data.block.label,
        inPorts: inPorts,
        outPorts: outPorts,
        position: { x: data.x, y: data.y },
        size: { width: width, height: 30 + 20 * numPorts },
        attrs: { '.label': { text: data.block.label } }
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
            inPorts.push({id: cell.id, label: cell.blockLabel });
          }
          else if (cell.blockType == 'io.output') {
            outPorts.push({id: cell.id, label: cell.blockLabel });
          }
        }
      }

      project.ports = { in: inPorts, out: outPorts };

      // Code

      var nodes = [];
      var links = [];

      for (var c = 0; c < graphData.cells.length; c++) {
        var cell = graphData.cells[c];
        if (cell.type == 'ice.Block' || cell.type == 'ice.IO') {
          var node = {};
          node.id = cell.id;
          node.type = cell.blockType;
          node.x = cell.position.x;
          node.y = cell.position.y;
          nodes.push(node);
        }
        else if (cell.type == 'ice.Wire') {
          var link = {};
          link.source = { node: cell.source.id, port: cell.source.port };
          link.target = { node: cell.target.id, port: cell.target.port };
          links.push(link);
        }
      }

      project.code = { type: "graph", data: { nodes: nodes, links: links } };

      // Data

      nodeFs.writeFile(filepath, JSON.stringify(project, null, 2),
        function(err) {
          if (!err) {
            console.log('File ' + name + ' saved');
          }
      });
    }

  });
