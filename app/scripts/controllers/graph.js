'use strict';

angular.module('icestudio')
  .factory('joint', function($window) {
    return $window.joint;
  })
  .controller('GraphCtrl', function($scope, joint) {
    console.log('echo graph');

    $.getJSON('blocks/zero.json', function(data) {

      var deps = data.deps;
      var project = data.project;

      var nodes = project.code.data.nodes;
      var connections = project.code.data.connections;

      // Graph
      var graph = new joint.dia.Graph();

      // Paper
      var paper = new joint.dia.Paper({
          el: $('#paper'),
          width: 1000,
          height: 1000,
          model: graph,
          gridSize: 1,
          defaultLink: new joint.shapes.devs.Link({
            router: { name: 'manhattan' },
            connector: { name: 'rounded' }
          }),
          validateConnection: function(cellViewS, magnetS, cellViewT,
                                       magnetT, end, linkView) {
              // Prevent loop linking
              return (magnetS !== magnetT);
          },
          // Enable link snapping within 75px lookup radius
          snapLinks: { radius: 75 }
      });

      // Nodes
      for (var i = 0; i < nodes.length; i++) {

        var dep = findDep(deps, nodes[i].type);

        var inPorts = [];
        var outPorts = [];

        for (var _in = 0; _in < dep.connectors.input.length; _in++) {
          inPorts.push(dep.connectors.input[_in].id);
        }

        for (var _out = 0; _out < dep.connectors.output.length; _out++) {
          outPorts.push(dep.connectors.output[_out].id);
        }

        var block = new joint.shapes.devs.Model({
            id: nodes[i].id,
            position: { x: nodes[i].x, y: nodes[i].y },
            inPorts: inPorts,
            outPorts: outPorts,
            size: { width: 80, height: 50 },
            attrs: {
                rect: { fill: '#2ECC71' },
                '.label': { text: nodes[i].type, 'ref-x': .4, 'ref-y': .2 },
                '.inPorts circle': { fill: '#16A085', magnet: 'passive', type: 'input' },
                '.outPorts circle': { fill: '#E74C3C', type: 'output' }
            }
        });
        graph.addCell(block);
      }

      // Connections
      for (var i = 0; i < connections.length; i++) {
        var source = graph.getCell(connections[i].source.nodeId);
        var target = graph.getCell(connections[i].target.nodeId);
        var sourcePort = connections[i].source.connectorId;
        var targetPort = connections[i].target.connectorId;
        var link = new joint.shapes.devs.Link({
            router: { name: 'manhattan' },
            connector: { name: 'rounded' },
            source: { id: source.id, selector: source.getPortSelector(sourcePort) },
            target: { id: target.id, selector: target.getPortSelector(targetPort) },
        });
        graph.addCell(link);
      }

      paper.scale(1.5, 1.5);

      console.log(JSON.stringify(graph.toJSON()));

    });

    function findDep(deps, name) {
      for (var i = 0; i < deps.length; i++) {
        if (deps[i].name == name)
          return deps[i]
      }
    }

  });
