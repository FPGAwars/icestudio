#!/usr/bin/python
# -*- coding: utf-8 -*-
# -- This script generates a board json file from a pcf
# -- Author Jesús Arroyo (C) 2016
# -- Licence GPLv2

# set_io --warn-no-port LED1 C8 -> { "name": "LED1", "value": "C8" },

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
pattern = 'set_io\s--warn-no-port\s(?P<name>.*?)\s+(?P<value>.*?)\s'

# Open file
with open(os.path.join(name, 'pinout.pcf')) as file:
    data = file.read()

    # Build json
    pinout = re.findall(pattern, data)
    format_pinout = []
    for item in pinout:
        format_pinout += [{ 'name': item[0], 'value': item[1] }]

    # Save json file
    with open(os.path.join(name, 'pinout.json'), 'w') as outfile:
        json.dump(format_pinout, outfile)
        print('Done!')
