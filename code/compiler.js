/**
 * @author Jesús Arroyo Torrens <jesus.jkhlg@gmail.com>
 *
 * June 2016
 */

 'use strict';

var sha1 = require('sha1');

function digestId(id) {
  if (id.indexOf('-') != -1) {
    return sha1(id).toString().substring(0, 6);
  }
  return id;
}

function moduleCheck(b) {
  return true;
}

function moduleParams(type, c) {
  var code;
  if (c[type].length !== 0) {
    var params = [];
    for (var p in c[type]) {
      params.push(digestId(c[type][p].id));
    }
    code = ((type == 'in') ? 'input ' : (type == 'out') ? 'output ' : ' ')
    code += params.join(', ');
  }
  return code;
}

function moduleGenerator(b) {
  var code = '';

  if (moduleCheck(b)) {

    // Header

    code += 'module ';
    code += b.name.replace('.', '_');
    code += 'x (';

    var params = [];
    var input = moduleParams('in', b.ports);

    if (input) {
      params.push(input);
    }
    var output = moduleParams('out', b.ports);
    if (output) {
      params.push(output);
    }
    code += params.join(', ');

    code += ');\n';

    // Content
    if (!b.code)
      return '';

    if (b.code.type == 'verilog') {
      code += ' ' + b.code.data + '\n';
    }
    else if (b.code.type == 'graph') {
      var graph = b.code.data;

      // Wires
      for (var c in graph.wires) {
        code += ' wire w' + c + ';\n'
      }

      // Connections
      for (var c in graph.wires) {
        var input = b.ports.in;
        var output = b.ports.out;
        var connection = graph.wires[c];
        // Input connectors
        for (var i in input) {
          var id = input[i].id;
          if (connection.source.block == id) {
            code += ' assign w' + c + ' = ' + digestId(id) + ';\n'
          }
        }
        // Output connectors
        for (var o in output) {
          var id = output[o].id;
          if (connection.target.block == id) {
            code += ' assign ' + digestId(id) + ' = w' + c + ';\n'
          }
        }
      }

      // Blocks
      for (var n in graph.blocks) {
        var block = graph.blocks[n];
        if (block.type != 'io.input' && block.type != 'io.output') {
          code += ' ' + block.type.replace('.', '_') + 'x ' + digestId(block.id) + ' (\n';

          // I/O
          var params = [];
          for (var c in graph.wires) {
            var param = '';
            var wire = graph.wires[c];
            if (block.id == wire.source.block) {
              param += '   .' + digestId(wire.source.port);
              param += '(w' + c + ')';
              params.push(param);
            }
            if (block.id == wire.target.block) {
              param += '   .' + digestId(wire.target.port);
              param += '(w' + c + ')';
              params.push(param);
            }
          }

          code += params.join(',\n');
          code += '\n';

          code += ' );\n';
        }
      }
    }

    // Footer

    code += 'endmodule\n\n';
  }

  return code;
}

function findDependencies(data, blocks) {
  var deps = [];

  if (data.code && data.code.type == 'graph') {
    var graph = data.code.data;
    for (var n in graph.blocks) {
      var type = graph.blocks[n].type;
      if (deps.indexOf(type) == -1) {
        deps.push(type);
      }
      var category = type.split('.')[0];
      var key = type.split('.')[1];
      var retdeps = findDependencies(blocks[category][key], blocks);
      for (var i in retdeps) {
        if (deps.indexOf(retdeps[i]) == -1) {
          deps.push(retdeps[i]);
        }
      }
    }
  }
  return deps;
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

    data.ports.in.forEach(function (element, index, array) {
      array[index] = 'input ' + element;
    })
    data.ports.out.forEach(function (element, index, array) {
      array[index] = 'output ' + element;
    })

    var params = [];

    if (data.ports.in.length > 0) {
      params.push(data.ports.in.join(', '));
    }
    if (data.ports.out.length > 0) {
      params.push(data.ports.out.join(', '));
    }

    code += params.join(', ');

    code += ');\n';

    // Content

    code += data.content.replace('\n\n', '\n');

    // Footer

    code += '\nendmodule\n\n';
  }

  return code;
}

function getPorts(name, project) {
  var ports = {
    in: [],
    out: []
  };

  for (var i in project.graph.blocks) {
    var block = project.graph.blocks[i];
    if (block.type == 'basic.input') {
      ports.in.push(name + '_' + digestId(block.id));
    }
    else if (block.type == 'basic.output') {
      ports.out.push(name + '_' + digestId(block.id));
    }
  }

  return ports;
}

function getContent(name, project) {
  return '.';
}

function compiler(name, project) {
  var code = '';

  //console.log(project);

  // TODO: Attach PCF file [project.board]

  // Code modules

  for (var i in project.graph.blocks) {
    var block = project.graph.blocks[i];
    if (block.type == 'basic.code') {
      var data = {
        name: name + '_' + digestId(block.id),
        ports: block.data.ports,
        content: block.data.code
      }
      code += module(data);
    }
  }

  // TODO: Dependencies modules

  // Main module
  var data = {
    name: name + '_main',
    ports: getPorts(name, project),
    content: getContent(name, project)
  };
  code += module(data);

  return code;
}


// Examples

var fs = require('fs');

function compare_string(s1, s2) {
  var diff = [];
  var string1 = s1.split(" ");
  var string2 = s2.split(" ");
  var size = Math.max(s1.length, s2.length);

  for(x = 0; x < size; x++) {
      if(string1[x] != string2[x]) {
          diff.push(string1[x]);
      }
  }

  return diff.join(' ');
}

function test_example (name) {
  var filename = '../examples/' + name;
  fs.readFile(filename + '.v', 'utf8', function (err, data) {
    if (err) throw err;

    var example = require(filename + '.json');
    var s1 = compiler(example).replace(/[\r\n]/g, "");
    var s2 = data.replace(/[\r\n]/g, "");

    process.stdout.write('Testing ' + name + ' ...');
    if (s1 == s2) {
      process.stdout.write(' [OK]\n');
    }
    else {
      process.stdout.write(' [Fail]\n');
      process.stdout.write(compare_string(s1, s2) + '\n');
    }
  });
}

// Test examples
/*test_example('example1');
test_example('example2');
test_example('example3');
test_example('example4');
test_example('example5');
test_example('example6');*/

console.log(compiler('example1', require('../examples/example1.json')));
