'use strict';

angular.module('icestudio')
  .controller('GraphCtrl', function($scope, $rootScope, joint, nodeFs) {

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

    $rootScope.$on('load', function(event, filepath) {
      $.getJSON(filepath, function(data) {
        loadProject(data);
        console.log(graph.toJSON());
      });
    });

    $rootScope.$on('save', function(event, filepath) {
      saveProject(filepath)
    });

    // Functions

    function loadProject(data) {

      var deps = data.deps;
      var project = data.project;

      var nodes = project.code.data.nodes;
      var links = project.code.data.links;

      graph.clear();

      // Nodes
      for (var i = 0; i < nodes.length; i++) {

        var dep = findDep(deps, nodes[i].type);

        var inPorts = [];
        var outPorts = [];

        for (var _in = 0; _in < dep.ports.in.length; _in++) {
          inPorts.push(dep.ports.in[_in].id);
        }

        for (var _out = 0; _out < dep.ports.out.length; _out++) {
          outPorts.push(dep.ports.out[_out].id);
        }

        var numPorts = Math.max(inPorts.length, outPorts.length);
        var width = 50;
        if (inPorts.length) width += 40;
        if (outPorts.length) width += 40;

        var block = new joint.shapes.ice.Block({
          id: nodes[i].id,
          blockType: nodes[i].type,
          blockLabel: '',
          inPorts: inPorts,
          outPorts: outPorts,
          position: { x: nodes[i].x, y: nodes[i].y },
          size: { width: width, height: 30 + 20 * numPorts },
          attrs: { '.label': { text: dep.label + '\n' + nodes[i].id.toString() } }
        });
        graph.addCell(block);
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

      //paper.scale(1.5, 1.5);

      function findDep(deps, name) {
        for (var i = 0; i < deps.length; i++) {
          if (deps[i].name == name)
            return deps[i]
        }
      }
    }

    function saveProject(filepath) {

      var graphData = graph.toJSON();
      var name = filepath.replace(/^.*[\\\/]/, '').split('.')[0];

      var p = {};

      // Header

      p.name = name;
      p.label = name.toUpperCase();

      // Ports

      var inPorts = [];
      var outPorts = [];

      for (var c = 0; c < graphData.cells.length; c++) {
        var cell = graphData.cells[c];
        if (cell.blockType) {
          if (cell.blockType == 'input') {
            inPorts.push({id: cell.id, label: cell.blockLabel });
          }
          else if (cell.blockType == 'output') {
            outPorts.push({id: cell.id, label: cell.blockLabel });
          }
        }
      }

      p.ports = { in: inPorts, out: outPorts };

      // Code

      var nodes = [];
      var links = [];

      for (var c = 0; c < graphData.cells.length; c++) {
        var cell = graphData.cells[c];
        if (cell.type == 'ice.Block') {
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

      p.code = { type: "graph", data: { nodes: nodes, links: links } };

      // Data

      var data = { deps: [], project: p };

      nodeFs.writeFile(filepath, JSON.stringify(data, null, 2),
        function(err) {
          if (!err) {
            console.log('File ' + name + ' saved');
          }
      });
    }

  });
