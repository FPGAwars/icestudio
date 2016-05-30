
function moduleCheck (b) {
  return true;
};

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

function moduleGen (b) {
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

    code += 'endmodule';
  }

  return code;
};


// Examples

var data;

// Example 1
data = require('../examples/example1.json');
console.log('Example 1\n');
console.log(moduleGen(data));
console.log('');

// Example 2
data = require('../examples/example2.json');
console.log('Example 2\n');
console.log(moduleGen(data));
console.log('');
