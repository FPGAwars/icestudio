'use strict';

angular.module('icestudio')
  .controller('GraphCtrl', function($scope, joint) {
    console.log('echo graph');

    $.getJSON('blocks/zero.json', function(data) {

      var deps = data.deps;
      var project = data.project;

      var nodes = project.code.data.nodes;
      var links = project.code.data.links;

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
          inPorts: inPorts,
          outPorts: outPorts,
          position: { x: nodes[i].x, y: nodes[i].y },
          size: { width: width, height: 30 + 20 * numPorts },
          attrs: { '.label': { text: dep.label + '\n' + nodes[i].id } }
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
          source: { id: source.id, selector: sourcePort },
          target: { id: target.id, selector: targetPort },
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

    });
  });
