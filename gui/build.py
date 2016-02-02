#!/usr/bin/env python
# JSON to verilog compiler
#
# GPLv2

import sys
import json


class Module:

    def __init__(self, name='', _input=[], _output=[], inline=''):
        self.name = name
        self.input = _input
        self.output = _output
        self.inline = inline

    def __str__(self):
        code = '\nmodule ' + self.name + '('
        if self.input:
            code += 'input ' + ', '.join(self.input)
            if self.output:
                code += ', '
        if self.output:
            code += 'output ' + ', '.join(self.output)
        code += ');\n'
        code += self.inline
        code += 'endmodule\n'
        return code


def _get_list(id, num):
    _list = []
    for i in xrange(num):
        _list += [id + str(i)]
    return _list


def generate_verilog_modules(nodes):
    """
    JSON
    {
        "name": "NOT",
        "type": "not",
        "id": 12,
        "inline": "assign o0 = ! i0;",
        "inputConnectors": [ { "name": "" } ],
        "outputConnectors": [ { "name": "" } ]
    }

    Verilog
    module notx(input i0, output o0);
    assign o0 = ! i0;
    endmodule
    """
    code = ''
    types = {}
    # Filter modules
    for node in nodes:
        if node['type'] != 'input' and \
           node['type'] != 'output' and \
           node['type'] not in types.values():
            types[node['id']] = node['type']
    # Generate modules
    for node in nodes:
        if node['id'] in types:
            name = node['type'] + 'x'
            _input = 0
            _output = 0
            inline = ''
            if 'inputConnectors' in node:
                _input = len(node['inputConnectors'])
            if 'outputConnectors' in node:
                _output = len(node['outputConnectors'])
            if 'inline' in node:
                inline = node['inline'] + '\n'
            code += str(Module(name,
                               _get_list('i', _input),
                               _get_list('o', _output),
                               inline))
    return code


def generate_verilog_main(name, nodes, connections):
    """
    JSON + name: main
    {
      "nodes": [
        {
          "type": "input", "value": "99", "id": 10,
          "outputConnectors": [ { "name": "99" } ]
        },
        {
          "type": "output", "value": "97", "id": 11,
          "inputConnectors": [ { "name": "97" } ]
        },
        {
          "type": "not", "id": 12,
          "inline": "assign o0 = ! i0;",
          "inputConnectors": [ { "name": "" } ],
          "outputConnectors": [ { "name": "" } ]
        }
      ],
      "connections": [
        {
          "source": { "nodeID": 10, "connectorIndex": 0 },
          "dest": { "nodeID": 12, "connectorIndex": 0 }
        },
        {
          "source": { "nodeID": 12, "connectorIndex": 0 },
          "dest": { "nodeID": 11, "connectorIndex": 0 }
        }
      ]
    }

    Verilog
    module main(input input10, output output11);
    wire w0;
    wire w1;
    assign w0 = input10;
    assign w1 = output11;
    notx not12 (
        .i0(w0),
        .o0(w1)
    );
    endmodule
    """
    _input = _list('input', nodes)
    _output = _list('output', nodes)
    inline = ''
    # Wires
    wires = len(connections)
    if wires > 0:
        for wire in xrange(wires):
            inline += 'wire w{0};\n'.format(wire)
    # Assign
    for index, connection in enumerate(connections):
        for i in _input:
            if i == 'input' + str(connection['source']['nodeID']):
                inline += 'assign w{0} = {1};\n'.format(index, i)
        for o in _output:
            if o == 'output' + str(connection['dest']['nodeID']):
                inline += 'assign w{0} = {1};\n'.format(index, o)
    # Entities
    for node in nodes:
        if node['type'] != 'input' and node['type'] != 'output':
            inline += node['type'] + 'x '
            inline += node['type'] + str(node['id']) + ' (\n'
            params = []
            for index, connection in enumerate(connections):
                if node['id'] == connection['source']['nodeID']:
                    param = 'o' + str(connection['source']['connectorIndex'])
                    params += ['    .{0}(w{1})'.format(param, index)]
                if node['id'] == connection['dest']['nodeID']:
                    param = 'i' + str(connection['source']['connectorIndex'])
                    params += ['    .{0}(w{1})'.format(param, index)]
            inline += ',\n'.join(params) + '\n'
            inline += ');\n'

    module = Module(name, _input, _output, inline)
    return str(module)


def _list(_type, nodes):
    ret = []
    for node in nodes:
        if node['type'] == _type:
            ret += [_type + str(node['id'])]
    return ret


def load_pcf(nodes):
    """
    # JSON
    {
      "type": "input", "value": "99", "id": 10
    },
    {
      "type": "output", "value": "97", "id": 11
    },

    # PCF
    set_io input10 99
    set_io output11 97
    """
    code = ''
    for n in nodes:
        if n['type'] == 'input' or n['type'] == 'output':
            code += 'set_io {0}{1} {2}\n'.format(n['type'], n['id'], n['value'])
    return code


def main():
    if len(sys.argv) != 2:
        print('Error: example number required')
        return
    else:
        filename = sys.argv[1]

    # Load JSON graph
    with open(filename) as data:
        graph = json.load(data)
        nodes = graph['nodes']
        connections = graph['connections']
        data.close()

    # Write Verilog file
    with open('../src/main.v', 'w') as data:
        # Generate Verilog
        code = '// Generated verilog\n'
        code += generate_verilog_modules(nodes)
        code += generate_verilog_main('main', nodes, connections)
        # Write Verilog
        data.write(code)
        data.close()

    # Write PCF file
    with open('../src/main.pcf', 'w') as data:
        # Generate PCF
        code = load_pcf(graph['nodes'])
        # Write PCF
        data.write(code)
        data.close()

    print("OK")

if __name__ == '__main__':
    main()
