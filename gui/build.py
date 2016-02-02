#!/usr/bin/env python
# JSON to verilog compiler
#
# GPLv2

import sys
import json


class Module:

    def __init__(self, name='', _input=0, _output=0, inline=''):
        self.name = name
        self.input = _input
        self.output = _output
        self.inline = inline

    def _get_list(self, id, num):
        _list = []
        for i in xrange(num):
            _list += [id + str(i)]
        return _list

    def __str__(self):
        code = '\nmodule ' + self.name + '('
        if self.input:
            ilist = self._get_list('i', self.input)
            code += 'input ' + ', '.join(ilist)
            if self.output:
                code += ', '
        if self.output:
            olist = self._get_list('o', self.output)
            code += 'output ' + ', '.join(olist)
        code += ');\n'
        code += self.inline
        code += 'endmodule\n'
        return code


def load_verilog_types(types):
    """
    JSON
    {
        "name": "not", "input": 1, "output": 1,
        "inline": "assign o0 = ! i0;"
    }

    Verilog
    module notx(input i0, output o0);
    assign o0 = ! i0;
    endmodule
    """
    code = ''
    for t in types:
        code += str(Module(t['name'] + 'x', t['input'],
                           t['output'], t['inline'] + '\n'))
    return code


def load_verilog_graph(name, graph):
    """
    JSON + name: main
    {
        "nodes": [ { "name": "i0", "type": "input",
                     "value": 99, "pos": [0, 0] },
                   { "name": "o0", "type": "output",
                     "value": 98, "pos": [0, 10] },
                   { "name": "not0", "type": "not",
                     "value": null, "pos": [0, 5] } ],
        "links": [ { "from": "i0", "to": "not0.i0" },
                   { "from": "not0.o0", "to": "o0" } ]
    }

    Verilog
    module main(input i0, output o0);
    wire w0;
    wire w1;
    assign w0 = i0;
    assign w1 = o0;
    notx not0 (
        .i0(w0),
        .o0(w1)
    );
    endmodule
    """
    nodes = graph['nodes']
    links = graph['links']
    _input = _count('input', nodes)
    _output = _count('output', nodes)

    inline = ''
    # Wires
    wires = len(links)
    if wires > 0:
        for wire in xrange(wires):
            inline += 'wire w{0};\n'.format(wire)
    # Assign
    for index, link in enumerate(links):
        inline += _add_assign('i', _input, index, link)
        inline += _add_assign('o', _output, index, link)
    # Entities
    for node in nodes:
        if node['type'] != 'input' and node['type'] != 'output':
            inline += node['type'] + 'x ' + node['name'] + '(\n'
            params = []
            for index, link in enumerate(links):
                params += _add_instance(node['name'], index, link)
            inline += ',\n'.join(params) + '\n'
            inline += ');\n'

    module = Module(name, _input, _output, inline)
    return str(module)


def _count(_type, nodes):
    c = 0
    for node in nodes:
        if node['type'] == _type:
            c += 1
    return c


def _equals(name, link):
    return name == link['from'] or name == link['to']


def _contains(name, link):
    if name in link['from']:
        return 'from'
    elif name in link['to']:
        return 'to'
    else:
        return None


def _add_assign(id, num, index, link):
    ret = ''
    for i in xrange(num):
        if _equals(id + str(i), link):
            ret += 'assign w{0} = {1}{2};\n'.format(index, id, i)
    return ret


def _add_instance(name, index, link):
    ret = []
    _dir = _contains(name, link)
    if _dir:
        param = link[_dir].split('.')[1]
        ret += ['    .{0}(w{1})'.format(param, index)]
    return ret


def load_pcf(nodes):
    """
    # JSON
    {
        "name": "i0", "type": "input",
        "value": 99, "pos": [0, 0]
    }

    # PCF
    set_io i0 99
    """
    code = ''
    for n in nodes:
        if n['type'] == 'input' or n['type'] == 'output':
            code += 'set_io {0} {1}\n'.format(n['name'], n['value'])
    return code


def main():
    if len(sys.argv) != 2:
        print('Error: example number required')
        return
    else:
        filename = sys.argv[1]
        ofilename = 'main'

    # Load JSON graph
    with open(filename) as data:
        graph = json.load(data)
        data.close()

    # Write Verilog file
    with open('../src/' + ofilename + '.v', 'w') as data:
        # Generate Verilog
        code = '// Generated verilog\n'
        code += load_verilog_types(types)
        code += load_verilog_graph(ofilename, graph)
        # Write Verilog
        data.write(code)
        data.close()

    # Write PCF file
    with open('../src/' + ofilename + '.pcf', 'w') as data:
        # Generate PCF
        code = load_pcf(graph['nodes'])
        # Write PCF
        data.write(code)
        data.close()

if __name__ == '__main__':
    main()
