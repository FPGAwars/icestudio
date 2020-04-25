# -- This script generates a board json file from a pcf
# -- Author Jesús Arroyo (C) 2016-2017
# ---       Juan Gonzalez Gomez (C) 2020
# -- Licence GPLv2

import re
import json
from pathlib import Path

# -- Constant with the new of the file to open
FILENAME = "pinout.lpf"
OUTPUTFILE = "pinout.json"

# -- Read the file. Convert to upper case
data = Path(FILENAME).read_text()

pattern = r'LOCATE\s*?COMP\s*?"(.*)"\s*?SITE\s*?"(.*)";\s*?#?\s*?(input|output|inout)'

pinout = re.findall(pattern, data)

format_pinout = []
for item in pinout:
    #print(item)
    format_pinout += [{'name': item[0], 'value': item[1], 'type': item[2] or 'inout'}]

# -- Print the contents on the console
print(f"{json.dumps(format_pinout)}")
