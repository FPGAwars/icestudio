# JSON to verilog compiler
#
# GPLv2

import json


def generate_head(json_module):
    """
    # JSON
    {
        "name": "m",
        "input": ["a"],
        "output": ["b"]
    }

    # Verilog
    module m(input a, output b);
    """
    _name = json_module['name']
    _input = json_module['input']
    _output = json_module['output']

    code = 'module ' + _name
    code += '('
    if _input:
        code += 'input ' + ', '.join(_input)
        if _output:
            code += ', '
    if _output:
        code += 'output ' + ', '.join(_output)
    code += ');'
    return code


def generate_module(json_module):
    """
    # JSON
    {
        "name": "notc",
        "input": ["a"],
        "output": ["b"],
        "inline": "assign b = ! a;"
    }

    # Verilog
    module notc(input a, output b);
    assign b = ! a;
    endmodule
    """
    code = generate_head(json_module) + '\n'
    code += json_module['inline'] + '\n'
    code += 'endmodule\n'
    return code


def generate_netlist(json_netlist, json_modules):
    """
    # JSON
    {
        "name": "notc",
        "input": ["a"],
        "output": ["b"],
        "inline": "assign b = ! a;"
    }
    {
        "name": "main",
        "input": ["A"],
        "output": ["B"],
        "wires": ["aux"],
        "modules": [
            {
                "name": "notc",
                "input": ["A"],
                "output": ["B"]
            }
        ]
    }

    # Verilog
    module main(input A, output B);
    wire aux;
    notc notc0 (
        .a(A),
        .b(B)
    );
    endmodule
    """
    _wires = json_netlist['wires']
    _modules = json_netlist['modules']
    _inline = json_netlist['inline']
    code = generate_head(json_netlist) + '\n'
    # Wires
    if _wires:
        for wire in _wires:
            code += 'wire ' + wire + ';\n'
    # Modules
    if _modules:
        for index, module in enumerate(_modules):
            name = module['name']
            module_def = find_module(name, json_modules)
            code += name + ' ' + name + str(index) + ' (\n'
            input_list = []
            output_list = []
            for i, _input in enumerate(module_def['input']):
                input_list += ['    .' + _input + '(' + module['input'][i] + ')']
            for i, _output in enumerate(module_def['output']):
                output_list += ['    .' + _output + '(' + module['output'][i] + ')']
            code += ',\n'.join(input_list + output_list) + '\n'
            code += ');\n'
    # Inline
    if _inline:
        code += _inline + '\n'
    code += 'endmodule\n'
    return code


def find_module(name, modules):
    for m in modules:
        if name == m['name']:
            return m


def find_modules(data):
    modules = []
    for m in data['modules']:
        modules += [m['name']]
    return modules


def get_json_modules(data):
    modules = []
    ms = find_modules(data)
    for m in ms:
        with open('src/json/' + m + '.json') as data_json:
            modules += [json.load(data_json)]
            data_json.close()
    return modules


def load_verilog_modules(json_modules):
    code = ''
    for json_module in json_modules:
        code += generate_module(json_module)
    return code


def load_verilog_netlist(json_netlist, json_modules):
    code = ''
    code += generate_netlist(json_netlist, json_modules)
    return code


def main():
    filename = 'main'
    code = '// Generated verilog code\n'

    with open('src/json/' + filename + '.json') as data_json:

        # Read JSON
        json_netlist = json.load(data_json)
        json_modules = get_json_modules(json_netlist)

        # Generate Verilog
        code += load_verilog_modules(json_modules)
        code += load_verilog_netlist(json_netlist, json_modules)

        with open('src/' + filename + '.v', 'w') as data_verilog:

            # Write Verilog
            data_verilog.write(code)
            data_verilog.close()

        data_json.close()


if __name__ == '__main__':
    main()
