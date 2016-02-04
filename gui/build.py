#!/usr/bin/env python
# -*- coding: utf-8 -*-
# JSON to verilog compiler
#
# GPLv2

import sys
import json

__author__ = 'Jesús Arroyo Torrens <jesus.arroyo@bq.com>'
__license__ = 'GNU General Public License v2 http://www.gnu.org/licenses/gpl2.html'


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


def generate_verilog_modules(nodes):
    """
    JSON
    {
        "type": "driver",
        "vcode": "...",
        "id": 11,
        ...
    }

    Verilog
    vcode value
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
            code += '\n' + node['vcode']
    return code


def generate_verilog_main(name, nodes, connections):
    """
    JSON + name: main
    {
        "nodes": [
            {
                "type": "driver",
                "params": [ { "name": "B", "value": "1'b1"} ],
                "id": 10,
                "outputConnectors": [ { "name": "o" } ]
            },
            {
                "type": "output",
                "params": [ "97" ],
                "id": 11,
                "inputConnectors": [ { "label": "97" } ]
            }
        ],
        "connections": [
            {
                "source": { "nodeID": 10, "connectorIndex": 0 },
                "dest": { "nodeID": 11, "connectorIndex": 0 }
            }
        ]
    }

    Verilog
    module main(output output11);
    wire w0;
    assign output11 = w0;
    driver #(
      .B(1'b1)
     )
     driver10 (
      .o(w0)
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
    # Assign i/o
    for index, connection in enumerate(connections):
        for i in _input:
            if i == 'input' + str(connection['source']['nodeID']):
                inline += 'assign w{0} = {1};\n'.format(index, i)
        for o in _output:
            if o == 'output' + str(connection['dest']['nodeID']):
                inline += 'assign {1} = w{0};\n'.format(index, o)
    # Assign wires (TODO: optimize)
    num = len(connections)
    for i in xrange(num):
        for j in xrange(num):
            if i < j:
                ni = connections[i]['source']['nodeID']
                nj = connections[j]['source']['nodeID']
                ci = connections[i]['source']['connectorIndex']
                cj = connections[j]['source']['connectorIndex']
                if ni == nj and ci == cj:
                    inline += 'assign w{0} = w{1};\n'.format(i, j)
    # Entities (TODO: optimize)
    for node in nodes:
        if node['type'] != 'input' and node['type'] != 'output':
            inline += node['type']
            # Parameters
            params = []
            if node['params']:
                for param in node['params']:
                    params += ['  .{0}({1})'.format(param['name'], param['value'])]
                inline += ' #(\n'
                inline += ',\n'.join(params) + '\n'
                inline += ' )\n'
            # Name
            inline += ' ' + node['type'] + str(node['id']) + ' (\n'
            # I/O
            ios = []
            ioh = []
            for index, connection in enumerate(connections):
                if node['id'] == connection['source']['nodeID']:
                    io = node['outputConnectors'][connection['source']['connectorIndex']]['name']
                    if io not in ioh:
                        ioh += [io]
                        ios += ['  .{0}(w{1})'.format(io, index)]
                if node['id'] == connection['dest']['nodeID']:
                    io = node['inputConnectors'][connection['dest']['connectorIndex']]['name']
                    if io not in ioh:
                        ioh += [io]
                        ios += ['  .{0}(w{1})'.format(io, index)]
            inline += ',\n'.join(ios) + '\n'
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
      "type": "input", "params": [ "44" ], "id": 15
    },
    {
      "type": "output", "params": [ "95" ], "id": 16
    }

    # PCF
    set_io input15 44
    set_io output16 95
    """
    code = ''
    for n in nodes:
        if n['type'] == 'input' or n['type'] == 'output':
            code += 'set_io {0}{1} {2}\n'.format(n['type'], n['id'], n['params'][0])
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
