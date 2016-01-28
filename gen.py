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

    code = '\nmodule ' + _name
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


def generate_netlist(json_netlist):
    """
    # JSON
    {
        "name": "main",
        "input": {
            "A": 99
        },
        "output": {
            "B": 98
        },
        "wires": [
            "aux"
        ],
        "modules": [
            {
                "name": "notc",
                "input": {
                    "a": "A"
                },
                "output": {
                    "b": "B"
                }
            }
        ],
        "inline": ""
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
            code += name + ' ' + name + str(index) + ' (\n'
            input_list = []
            output_list = []
            for _input in module['input']:
                input_list += ['    .' + _input + '(' + module['input'][_input] + ')']
            for _output in module['output']:
                output_list += ['    .' + _output + '(' + module['output'][_output] + ')']
            code += ',\n'.join(input_list + output_list) + '\n'
            code += ');\n'
    # Inline
    if _inline:
        code += _inline + '\n'
    code += 'endmodule\n'
    return code


def generate_pcf(json_netlist):
    """
    # JSON
    {
        "name": "main",
        "input": {
            "A": 99
        },
        "output": {
            "B": 98
        },
    }

    # PCF
    set_io A 99
    set_io B 98
    """
    code = ''
    for key, value in json_netlist['input'].iteritems():
        code += 'set_io ' + key + ' ' + str(value) + '\n'
    for key, value in json_netlist['output'].iteritems():
        code += 'set_io ' + key + ' ' + str(value) + '\n'
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


def load_verilog_netlist(json_netlist):
    code = ''
    code += generate_netlist(json_netlist)
    return code


def load_pcf(json_netlist):
    code = ''
    code += generate_pcf(json_netlist)
    return code


def main():
    filename = 'main'

    with open('src/json/' + filename + '.json') as data_json:

        # Read JSON
        json_netlist = json.load(data_json)
        json_modules = get_json_modules(json_netlist)

        with open('src/' + filename + '.v', 'w') as data_verilog:

            # Generate Verilog
            code = '// Generated verilog\n'
            code += load_verilog_modules(json_modules)
            code += load_verilog_netlist(json_netlist)

            # Write Verilog
            data_verilog.write(code)
            data_verilog.close()

        with open('src/' + filename + '.pcf', 'w') as data_verilog:

            # Generate PCF
            code = load_pcf(json_netlist)

            # Write PCF
            data_verilog.write(code)
            data_verilog.close()

        data_json.close()


if __name__ == '__main__':
    main()
