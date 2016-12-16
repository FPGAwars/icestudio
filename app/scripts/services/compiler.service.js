'use strict';

angular.module('icestudio')
  .service('compiler', function(nodeSha1,
                                _package) {

    this.generate = function(target, project) {
      var code = '';
      switch(target) {
        case 'verilog':
          code += header('//');
          code += '`default_nettype none\n';
          code += verilogCompiler('main', project);
          break;
        case 'pcf':
          code += header('#');
          code += pcfCompiler(project);
          break;
        case 'testbench':
          code += header('//');
          code += testbenchCompiler(project);
          break;
        case 'gtkwave':
          code += header('[*]');
          code += gtkwaveCompiler(project);
          break;
        default:
          code += '';
      }
      return code;
    };

    function header(comment) {
      var header = '';
      var date = new Date();
      header += comment + ' Code generated by Icestudio ' + _package.version + '\n';
      header += comment + ' ' + date.toUTCString() + '\n';
      header += '\n';
      return header;
    }

    function digestId(id, force) {
      if (id.indexOf('-') !== -1 || force) {
        return 'v' + nodeSha1(id).toString().substring(0, 6);
      }
      else {
        return id.replace('.', '_');
      }
    }

    function module(data) {
      var code = '';
      if (data && data.name && data.ports) {

        // Header

        code += '\nmodule ' + data.name;

        //-- Parameters

        var params = [];
        for (var p in data.params) {
          if (data.params[p] instanceof Object) {
            // Generic block
            params.push(' parameter ' + data.params[p].name + ' = ' + (data.params[p].value ? data.params[p].value : '0'));
          }
          else {
            // Code block
            params.push(' parameter ' + data.params[p] + ' = 0');
          }
        }

        if (params.length > 0) {
          code += ' #(\n';
          code += params.join(',\n');
          code += '\n)';
        }

        //-- Ports

        var ports = [];
        for (var i in data.ports.in) {
          ports.push(' input ' + data.ports.in[i]);
        }
        for (var o in data.ports.out) {
          ports.push(' output ' + data.ports.out[o]);
        }

        if (ports.length > 0) {
          code += ' (\n';
          code += ports.join(',\n');
          code += '\n)';
        }

        code += ';\n';

        // Content

        if (data.content) {

          var content = data.content.split('\n');

          content.forEach(function (element, index, array) {
            array[index] = ' ' + element;
          });

          code += content.join('\n');
        }

        // Footer

        code += '\nendmodule\n';
      }

      return code;
    }

    function getParams(project) {
      var params = [];
      var graph = project.design.graph;

      for (var i in graph.blocks) {
        var block = graph.blocks[i];
        if (block.type === 'basic.constant') {
          params.push({
            name: digestId(block.id),
            value: block.data.value
          });
        }
      }

      return params;
    }

    function getPorts(project) {
      var ports = {
        in: [],
        out: []
      };
      var graph = project.design.graph;

      for (var i in graph.blocks) {
        var block = graph.blocks[i];
        if (block.type === 'basic.input') {
          ports.in.push(digestId(block.id));
        }
        else if (block.type === 'basic.output') {
          ports.out.push(digestId(block.id));
        }
      }

      return ports;
    }

    function getContent(name, project) {
      var i, j, w;
      var content = [];
      var graph = project.design.graph;
      var connections = {
        localparam: [],
        wire: [],
        assign: []
      };

      for (w in graph.wires) {
        var wire = graph.wires[w];
        if (wire.source.port === 'constant-out') {
          // Local Parameters
          var constantBlock = findBlock(wire.source.block, graph);
          var paramValue = digestId(constantBlock.id);
          if (paramValue) {
            connections.localparam.push('localparam p' + w + ' = ' + paramValue  + ';');
          }
        }
        else {
          // Wires
          connections.wire.push('wire w' + w + ';');
        }
        // Assignations
        for (i in graph.blocks) {
          var block = graph.blocks[i];
          if (block.type === 'basic.input') {
            if (wire.source.block === block.id) {
              connections.assign.push('assign w' + w + ' = ' + digestId(block.id) + ';');
            }
          }
          else if (block.type === 'basic.output') {
            if (wire.target.block === block.id) {
              if (wire.source.port === 'constant-out') {
                // connections.assign.push('assign ' + digestId(block.id) + ' = p' + w + ';');
              }
              else {
                connections.assign.push('assign ' + digestId(block.id) + ' = w' + w + ';');
              }
            }
          }
        }
      }

      content = content.concat(connections.localparam);
      content = content.concat(connections.wire);
      content = content.concat(connections.assign);

      // Wires Connections

      var numWires = graph.wires.length;
      for (i = 1; i < numWires; i++) {
        for (j = 0; j < i; j++) {
          var wi = graph.wires[i];
          var wj = graph.wires[j];
          if (wi.source.block === wj.source.block &&
              wi.source.port === wj.source.port &&
              wi.source.port !== 'constant-out') {
            content.push('assign w' + i + ' = w' + j + ';');
          }
        }
      }

      // Block instances

      content = content.concat(getInstances(name, project.design.graph));

      return content.join('\n');
    }

    function getInstances(name, graph) {
      var w, wire;
      var instances = [];
      var blocks = graph.blocks;

      for (var b in blocks) {
        var instance = '';
        var block = blocks[b];

        if (block.type !== 'basic.input' &&
            block.type !== 'basic.output' &&
            block.type !== 'basic.constant' &&
            block.type !== 'basic.info') {

          // Header

          var id = digestId(block.type, true);
          if (block.type === 'basic.code') {
            id += '_' + digestId(block.id);
          }
          instance += name + '_' + digestId(id);

          //-- Parameters

          var params = [];
          for (w in graph.wires) {
            wire = graph.wires[w];
            if ((block.id === wire.target.block) &&
                (wire.source.port === 'constant-out')) {
              var paramName = digestId(wire.target.port);
              var param = '';
              param += ' .' + paramName;
              param += '(p' + w + ')';
              params.push(param);
            }
          }

          if (params.length > 0) {
            instance += ' #(\n' + params.join(',\n') + '\n)';
          }

          //-- Instance name

          instance += ' ' +  digestId(block.id);

          //-- Ports

          var ports = [];
          var portsNames = [];
          for (w in graph.wires) {
            var portName = '';
            var isConstant = false;
            wire = graph.wires[w];
            if (block.id === wire.source.block) {
              portName = digestId(wire.source.port);
            }
            else if (block.id === wire.target.block) {
              portName = digestId(wire.target.port);
              isConstant = wire.source.port === 'constant-out';
            }
            if (portName && !isConstant &&
                portsNames.indexOf(portName) === -1) {
              portsNames.push(portName);
              var port = '';
              port += ' .' + portName;
              port += '(w' + w + ')';
              ports.push(port);
            }
          }

          instance += ' (\n' + ports.join(',\n') + '\n);';
        }

        if (instance) {
          instances.push(instance);
        }
      }
      return instances;
    }

    function findBlock(id, graph) {
      for (var b in graph.blocks) {
        if (graph.blocks[b].id === id) {
          return graph.blocks[b];
        }
      }
      return null;
    }

    function verilogCompiler(name, project) {
      var data;
      var code = '';

      if (project &&
          project.design &&
          project.design.graph) {

        var graph = project.design.graph;
        var deps = project.design.deps;

        // Scape dot in name

        name = digestId(name);

        // Main module

        if (name) {
          data = {
            name: name,
            params: getParams(project),
            ports: getPorts(project),
            content: getContent(name, project)
          };
          code += module(data);
        }

        // Dependencies modules

        for (var d in deps) {
          code += verilogCompiler(name + '_' + digestId(d, true), deps[d]);
        }

        // Code modules

        for (var i in graph.blocks) {
          var block = graph.blocks[i];
          if (block) {
            if (block.type === 'basic.code') {
              data = {
                name: name + '_' + digestId(block.type, true) + '_' + digestId(block.id),
                params: block.data.params,
                ports: block.data.ports,
                content: block.data.code
              };
              code += module(data);
            }
          }
        }
      }

      return code;
    }

    function pcfCompiler(project) {
      var code = '';
      var graph = project.design.graph;

      for (var i in graph.blocks) {
        var block = graph.blocks[i];
        if (block.type === 'basic.input' ||
            block.type === 'basic.output') {
          code += 'set_io ';
          code += digestId(block.id);
          code += ' ';
          code += block.data.pin.value;
          code += '\n';
        }
      }

      return code;
    }

    function testbenchCompiler(project) {
      var i, o, w;
      var code = '';

      code += '// Testbench template\n\n';

      code += '`default_nettype none\n';
      code += '`define DUMPSTR(x) `"x.vcd`"\n';
      code += '`timescale 10 ns / 1 ns\n\n';

      var ports = { in: [], out: [] };
      var content = '\n';

      content += '// Simulation time: 100ns (10 * 10ns)\n';
      content += 'parameter DURATION = 10;\n\n';

      var io = mainIO(project);
      var input = io[0];
      var output = io[1];

      // Input/Output
      content += '// Input/Output\n';
      for (i in input) {
        content += 'reg ' + input[i].label + ';\n';
      }
      for (o in output) {
        content += 'wire ' + output[o].label + ';\n';
      }

      var wires = input.concat(output);

      // Module instance
      content += '\n// Module instance\n';
      content += 'main MAIN (\n';
      var connections = [];
      for (w in wires) {
        connections.push(' .' + wires[w].id + '(' + wires[w].label + ')');
      }
      content += connections.join(',\n');
      content += '\n);\n';

      // Clock signal
      var hasClk = false;
      for (i in input) {
        if (input[i].label.toLowerCase() === 'input_clk') {
          hasClk = true;
          break;
        }
      }
      if (hasClk) {
        content += '\n// Clock signal\n';
        content += 'always #0.5 input_clk = ~input_clk;\n';
      }

      content += '\ninitial begin\n';
      content += ' // File were to store the simulation results\n';
      content += ' $dumpfile(`DUMPSTR(`VCD_OUTPUT));\n';
      content += ' $dumpvars(0, main_tb);\n\n';
      content += ' // TODO: initialize the registers here\n';
      content += ' // e.g. input_value = 1;\n';
      content += ' // e.g. #2 input_value = 0;\n';
      for (i in input) {
        content += ' ' + input[i].label + ' = 0;\n';
      }
      content += '\n';
      content += ' #(DURATION) $display("End of simulation");\n';
      content += ' $finish;\n';
      content += 'end\n';

      var data = {
        name: 'main_tb',
        ports: ports,
        content: content
      };
      code += module(data);

      return code;
    }

    function gtkwaveCompiler(project) {
      var code = '';

      var io = mainIO(project);
      var input = io[0];
      var output = io[1];

      var wires = input.concat(output);
      for (var w in wires) {
        code += 'main_tb.' + wires[w].label + '\n';
      }

      return code;
    }

    function mainIO(project) {
      var input = [];
      var output = [];
      var inputUnnamed = 0;
      var outputUnnamed = 0;
      var graph = project.design.graph;
      for (var i in graph.blocks) {
        var block = graph.blocks[i];
        if (block.type === 'basic.input') {
          if (block.data.label) {
            input.push({ id: digestId(block.id), label: 'input_' + block.data.label.replace(' ', '_') });
          }
          else {
            input.push({ id: digestId(block.id), label: 'input_' + inputUnnamed.toString() });
            inputUnnamed += 1;
          }
        }
        else if (block.type === 'basic.output') {
          if (block.data.label) {
            output.push({ id: digestId(block.id), label: 'output_' + block.data.label.replace(' ', '_') });
          }
          else {
            output.push({ id: digestId(block.id), label: 'output_' + outputUnnamed.toString() });
            outputUnnamed += 1;
          }
        }
      }

      return [input, output];
    }

  });
