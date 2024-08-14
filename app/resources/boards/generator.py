#!/usr/bin/python
# -*- coding: utf-8 -*-
# -- This script generates a board json file from a pcf
# -- Author Jesús Arroyo (C) 2016-2017
# -- Licence GPLv2

# set_io LED0 95 # output
#   ->  { "name": "LED0", "value": "95",  "type": "output" }
# set_io --warn-no-port SW1 10 # input
#   ->  { "name": "SW1",  "value": "10",  "type": "input" }
# set_io --warn-no-port D13 144
#   ->  { "name": "D13",  "value": "144", "type": "inout" }

import os
import re
import sys
import json

if len(sys.argv) < 2:
    print('Insert a board name')
    exit(1)

# Load parameters
name = sys.argv[1]
path = os.path.join(os.path.dirname(__file__), name)

# Check board
if not os.path.isdir(name):
    print('Board {} does not exist'.format(name))
    exit(1)

print('Generating pinout...')

# Regex pattern
# The old pattern regexp only permit one parameter in pcf line definition:
#
# pattern = 'set_io\s+(--warn-no-port)?\s*(.*?)\s+(.*?)\s+(#+\s+(input|output|inout))?'
#
# The new one is more flexible for io arguments
pattern = 'set_io(\s)(-\w*|--warn-no-port)\s+(-\w*|no|yes|\s+)*(.*?)\s+(.*?)\s(\s+)*(#+\s+(input|output|inout))?'

# Open file
with open(os.path.join(path, 'pinout.pcf')) as file:
    data = file.read()

    # Build json
    pinout = re.findall(pattern, data)
    #Sorted in reverse order by name to avoid conflicting overlapping labels like D0 - LED0 - DD0
    pinout=sorted(pinout, key=lambda pinout: pinout[1],reverse=True)

    format_pinout = []
    for item in pinout:
        format_pinout += [{
            'name': item[3].strip(),
            'value': item[4].strip(),
            'type': item[5].strip() or 'inout'
        }]

    # Save json file
    with open(os.path.join(path, 'pinout.json'), 'w') as outfile:
        json.dump(format_pinout, outfile)
        print('Done!')
