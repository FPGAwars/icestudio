/**
 * @author Jesús Arroyo Torrens <jesus.jkhlg@gmail.com>
 *
 * June 2016
 */

 'use strict';

var fs = require('fs');
var sha1 = require('sha1');


function digestId(id, force) {
  if (id.indexOf('-') != -1 || force) {
    return 'v' + sha1(id).toString().substring(0, 6);
  }
  return id;
}
/*

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
*/

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
    });
    data.ports.out.forEach(function (element, index, array) {
      array[index] = 'output ' + element;
    });

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

  // Connections

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

  // Block instances

  var instances = []
  for (var b in graph.blocks) {
    var block = graph.blocks[b];
    if (block.type != 'basic.input' && block.type != 'basic.output') {
      var id = digestId(block.type, true);
      instances.push(name + '_' + id + ' ' + digestId(block.id) + ' (');

      // Parameters
      var params = [];
      for (var w in graph.wires) {
        var param = '';
        var wire = graph.wires[w];
        if (block.id == wire.source.block) {
          project.deps[block.type]
          param += '  .' + digestId(wire.source.port);
          param += '(w' + w + ')';
          params.push(param);
        }
        if (block.id == wire.target.block) {
          param += '   .' + digestId(wire.target.port);
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

    for (var i in project.graph.blocks) {
      var block = project.graph.blocks[i];
      if (block) {
        if (block.type == 'basic.code') {
          // Code modules
          var data = {
            name: name + '_' + digestId(block.type, true),
            ports: block.data.ports,
            content: block.data.code
          }
          code += module(data);
          code += '\n';
        }
        /*else if (block.type != 'basic.input' &&
                 block.type != 'basic.output') {
          // Instance modules
          var data = {
            name: digestId(block.id),
            ports: getPorts(project.deps[block.type]),
            content: getContent(project.deps[block.type])
          };
          code += module(data);
          code += '\n';
        }*/
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


// Examples

var fs = require('fs');

function compare_string(s1, s2) {
  var diff = [];
  var string1 = s1.split(" ");
  var string2 = s2.split(" ");
  var size = Math.max(s1.length, s2.length);

  for(var x = 0; x < size; x++) {
    if(string1[x] != string2[x]) {
      diff.push(string1[x]);
    }
  }

  return diff.join(' ');
}

function test_example(name, extension) {
  var filename = '../examples/' + name;
  fs.readFile(filename + '.' + extension, 'utf8', function (err, data) {
    if (err) throw err;

    var example = JSON.parse(fs.readFileSync(filename + '.ice'));
    if (extension == 'v') {
      var s1 = verilogCompiler('main', example).replace(/[\r\n]/g, "");
    }
    else {
      var s1 = pcfCompiler(example).replace(/[\r\n]/g, "");
    }
    var s2 = data.replace(/[\r\n]/g, "");

    process.stdout.write('Testing ' + name + ' ' + extension + ' ...');
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
/*test_example('example1', 'v');
test_example('example1', 'pcf');
test_example('example2', 'v');
test_example('example2', 'pcf');*/
/*test_example('example3');
test_example('example4');
test_example('example5');
test_example('example6');*/

console.log(verilogCompiler('main', JSON.parse(fs.readFileSync('../examples/example3.ice'))));
console.log(pcfCompiler(JSON.parse(fs.readFileSync('../examples/example3.ice'))));
