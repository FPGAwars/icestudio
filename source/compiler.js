
function moduleCheck (b) {
  return true;
}

function moduleParams (type, c) {
  var code;
  if (c[type]) {
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

    if (b.code.type == 'verilog') {
      code += ' ' + b.code.data + '\n';
    }
    else if (b.code.type == 'graph') {
      code += '\n';
    }

    code += 'endmodule';
  }

  return code;
}

function compiler (data) {
  var code = '';

  // Dependencies
  for (var index in data.deps) {
    code += moduleGenerator(data.deps[index]);
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

// Example 1
test_example('example1');
test_example('example2');
