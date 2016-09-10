#!/usr/bin/python3
# -*- coding: utf-8 -*-
# -- This script generates a board json file from a pcf
# -- Author Jesús Arroyo (C) 2016
# -- Licence GPLv2

# set_io --warn-no-port LED1 C8 -> { "name": "LED1", "value": "C8" },

import re
import json

print('Pinout generator')
print('----------------')

# Load parameters
name = input('Insert board name: ')  # eg. icoboard
label = input('Insert board label: ') # eg. icoBOARD 1.0

# Regex pattern
pattern = 'set_io\s--warn-no-port\s(?P<name>.*?)\s(?P<value>.*?)\n'

# Open file
with open(name + '.pcf') as file:
    data = file.read()

    # Build json
    pinout = re.findall(pattern, data)
    format_pinout = []
    for item in pinout:
        format_pinout += [{ 'name': item[0], 'value': item[1] }]
    board = { 'label': label, 'pinout': format_pinout }

    # Save json file
    with open(name + '.json', 'w') as outfile:
        json.dump(board, outfile)
        print('Done!')
