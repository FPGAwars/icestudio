
var sha1 = require('sha1');

function digestId(id) {
  if (id.indexOf('-') != -1) {
    return 'v' + sha1(id).toString().substring(0, 6);
  }
  return id;
}

function moduleCheck (b) {
  return true;
}

function moduleParams (type, c) {
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

function moduleGenerator (b) {
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
              param += '   .' + wire.source.port;
              param += '(w' + c + ')';
              params.push(param);
            }
            if (block.id == wire.target.block) {
              param += '   .' + wire.target.port;
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

function findDependencies (data) {
  var deps = [];
  if (data.code.type == 'graph') {
    var graph = data.code.data;
    for (var n in graph.blocks) {
      var type = graph.blocks[n].type;
      if (deps.indexOf(type) == -1) {
        deps.push(graph.blocks[n].type);
      }
    }
  }
  return deps;
}

function compiler (data) {
  var code = '';
  var blocks = require('./blocks.json');

  // Find dependencies
  var deps = findDependencies(data);

  // Dependencies modules
  for (var category in blocks) {
    for (var key in blocks[category]) {
      if (deps.indexOf(category + '.' + key) != -1) {
        blocks[category][key].name = category + '.' + key;
        code += moduleGenerator(blocks[category][key]);
      }
    }
  }

  code += '\n';

  // Main module
  code += moduleGenerator(data);

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
/*test_example('example4');
test_example('example5');
test_example('example6');*/

//console.log(compiler(require('../examples/example1.json')));
