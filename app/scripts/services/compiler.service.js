'use strict';

angular.module('icestudio')
    .service('compiler', ['nodeSha1',
      function(nodeSha1) {

        this.generateVerilog = function(project) {
          return verilogCompiler('main', project);
        };

        this.generatePCF = function(project) {
          return pcfCompiler(project);
        };

        function digestId(id, force) {
          if (id.indexOf('-') != -1) {
            return 'v' + nodeSha1(id).toString().substring(0, 6);
          }
          else {
            return id.replace('.', '_');
          }
          return id;
        }

        function module(data) {
          var code = '';

          if (data &&
              data.name &&
              data.ports &&
              data.content) {

            // Header

            code += 'module ';
            code += data.name;
            code += ' (';

            var params = [];

            for (var i in data.ports.in) {
              params.push('input ' + data.ports.in[i]);
            }
            for (var o in data.ports.out) {
              params.push('output ' + data.ports.out[o]);
            }

            code += params.join(', ');

            code += ');\n';

            // Content

            var content = data.content.replace('\n\n', '\n').split('\n');

            content.forEach(function (element, index, array) {
              array[index] = ' ' + element;
            });

            code += content.join('\n');

            // Footer

            code += '\nendmodule\n';
          }

          return code;
        }

        function getPorts(project) {
          var ports = {
            in: [],
            out: []
          };
          var graph = project.graph;

          for (var i in graph.blocks) {
            var block = graph.blocks[i];
            if (block.type == 'basic.input') {
              ports.in.push(digestId(block.id));
            }
            else if (block.type == 'basic.output') {
              ports.out.push(digestId(block.id));
            }
          }

          return ports;
        }

        function getContent(name, project) {
          var content = '';
          var graph = project.graph;

          // Wires

          for (var w in graph.wires) {
            content += 'wire w' + w + ';\n'
          }

          // I/O connections

          for (var w in graph.wires) {
            var wire = graph.wires[w];
            for (var i in graph.blocks) {
              var block = graph.blocks[i];
              if (block.type == 'basic.input') {
                if (wire.source.block == block.id) {
                  content += 'assign w' + w + ' = ' + digestId(block.id) + ';\n';
                }
              }
              else if (block.type == 'basic.output') {
                if (wire.target.block == block.id) {
                  content += 'assign ' + digestId(block.id) + ' = w' + w + ';\n';
                }
              }
            }
          }

          // Wires Connections

          var numWires = graph.wires.length;
          for (var i = 1; i < numWires; i++) {
            for (var j = 0; j < i; j++) {
              var wi = graph.wires[i];
              var wj = graph.wires[j];
              if (wi.source.block == wj.source.block &&
                  wi.source.port == wj.source.port) {
                content += 'assign w' + i + ' = w' + j + ';\n';
              }
            }
          }

          // Block instances

          var instances = []
          for (var b in graph.blocks) {
            var block = graph.blocks[b];
            if (block.type != 'basic.input' && block.type != 'basic.output') {
              var id = digestId(block.type, true);
              instances.push(name + '_' + id + ' ' + digestId(block.id) + ' (');

              // Parameters

              var params = [];
              var paramsNames = [];
              for (var w in graph.wires) {
                var param = '';
                var paramName = '';
                var wire = graph.wires[w];
                if (block.id == wire.source.block) {
                  paramName = digestId(wire.source.port);
                }
                else if (block.id == wire.target.block) {
                  paramName = digestId(wire.target.port);
                }
                if (paramName && paramsNames.indexOf(paramName) == -1) {
                  paramsNames.push(paramName);
                  param += '  .' + paramName;
                  param += '(w' + w + ')';
                  params.push(param);
                }
              }

              instances.push(params.join(',\n') + '\n);');
            }
          }
          content += instances.join('\n');

          return content;
        }

        function verilogCompiler(name, project) {
          var code = '';

          if (project &&
              project.graph) {

            // Dependencies modules

            for (var d in project.deps) {
              code += verilogCompiler(name + '_' + digestId(d, true), project.deps[d]);
              code += '\n';
            }

            // Code modules

            for (var i in project.graph.blocks) {
              var block = project.graph.blocks[i];
              if (block) {
                if (block.type == 'basic.code') {
                  var data = {
                    name: name + '_' + digestId(block.type, true),
                    ports: block.data.ports,
                    content: block.data.code
                  }
                  code += module(data);
                  code += '\n';
                }
              }
            }

            // Main module

            if (name){
              var data = {
                name: name,
                ports: getPorts(project),
                content: getContent(name, project)
              };
              code += module(data);
            }
          }

          return code;
        }

        function pcfCompiler(project) {
          var code = '';

          for (var i in project.graph.blocks) {
            var block = project.graph.blocks[i];
            if (block.type == 'basic.input' ||
                block.type == 'basic.output') {
              code += 'set_io ';
              code += digestId(block.id);
              code += ' ';
              code += block.data.pin.value;
              code += '\n';
            }
          }

          return code;
        }

    }]);
