
function moduleCheck (b) {
  return true;
}

function moduleParams (type, c) {
  var code;
  if (c[type].length !== 0) {
    var params = [];
    for (var p in c[type]) {
      params.push(c[type][p].id);
    }
    code = type + ' ' + params.join(', ');
  }
  return code;
}

function moduleGenerator (b) {
  var code = '';

  if (moduleCheck(b)) {

    // Header

    code += 'module ';
    code += b.name;
    code += 'x (';

    var params = [];
    var input = moduleParams('input', b.connectors);

    if (input) {
      params.push(input);
    }
    var output = moduleParams('output', b.connectors);
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
      for (var c in graph.connections) {
        code += ' wire w' + c + ';\n'
      }

      // Connections
      for (var c in graph.connections) {
        var input = b.connectors.input;
        var output = b.connectors.output;
        var connection = graph.connections[c];
        // Input connectors
        for (var i in input) {
          var id = input[i].id;
          if (connection.source.nodeId == id) {
            code += ' assign w' + c + ' = ' + id + ';\n'
          }
        }
        // Output connectors
        for (var o in output) {
          var id = output[o].id;
          if (connection.target.nodeId == id) {
            code += ' assign ' + id + ' = w' + c + ';\n'
          }
        }
      }

      // Nodes
      for (var n in graph.nodes) {
        var node = graph.nodes[n];
        if (node.type != 'input' && node.type != 'output') {
          code += ' ' + node.type + 'x ' + node.id + ' (\n';

          // I/O
          var params = [];
          for (var c in graph.connections) {
            var param = '';
            var connection = graph.connections[c];
            if (node.id == connection.source.nodeId) {
              param += '   .' + connection.source.connectorId;
              param += '(w' + c + ')';
              params.push(param);
            }
            if (node.id == connection.target.nodeId) {
              param += '   .' + connection.target.connectorId;
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

    code += 'endmodule\n';
  }

  return code;
}

function compiler (data) {
  var code = '';

  // Dependencies
  for (var index in data.deps) {
    code += moduleGenerator(data.deps[index]);
    code += '\n';
  }

  // Project
  code += moduleGenerator(data.project);

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
test_example('example1');
test_example('example2');
test_example('example3');
test_example('example4');
test_example('example5');
test_example('example6');

//console.log(compiler(require('../examples/example6.json')));
