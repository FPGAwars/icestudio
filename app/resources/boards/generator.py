#!/usr/bin/python
# -*- coding: utf-8 -*-
# -- This script generates a board json file from a pcf
# -- Author Jesús Arroyo (C) 2016-2017
# -- Licence GPLv2

# set_io LED0 95 # output               ->  { "name": "LED0", "value": "95",  "type": "output" }
# set_io --warn-no-port SW1 10 # input  ->  { "name": "SW1",  "value": "10",  "type": "input" }
# set_io --warn-no-port D13 144         ->  { "name": "D13",  "value": "144", "type": "inout" }

import os
import re
import json

print('Pinout generator')
print('----------------')

# Python 2-3 compat
try:
    input = raw_input
except:
    pass

# Load parameters
name = input('Insert board name: ')  # eg. icoboard

# Regex pattern
pattern = 'set_io\s+(--warn-no-port)?\s*(.*?)\s+(.*?)\s+(#+\s+(input|output))?'

# Open file
with open(os.path.join(name, 'pinout.pcf')) as file:
    data = file.read()

    # Build json
    pinout = re.findall(pattern, data)
    print(pinout)
    format_pinout = []
    for item in pinout:
        format_pinout += [{ 'name': item[1], 'value': item[2], 'type': item[4] or 'inout' }]

    # Save json file
    with open(os.path.join(name, 'pinout.json'), 'w') as outfile:
        json.dump(format_pinout, outfile)
        print('Done!')
