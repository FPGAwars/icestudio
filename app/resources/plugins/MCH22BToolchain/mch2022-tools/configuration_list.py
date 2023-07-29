#!/usr/bin/env python3
from webusb import *
import argparse
import sys
import time

parser = argparse.ArgumentParser(description='MCH2022 badge NVS list tool')
parser.add_argument("namespace", help="Namespace", nargs='?', default=None)
args = parser.parse_args()

badge = Badge()

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

print("\x1b[4m{: <32}\x1b[0m \x1b[4m{: <32}\x1b[0m \x1b[4m{: <8}\x1b[0m \x1b[4m{: <10}\x1b[0m \x1b[4m{: <32}\x1b[0m".format("Namespace", "Key", "Type", "Size", "Value"))
badge.printGarbage = True
if args.namespace:
    entries = badge.nvs_list(args.namespace)
else:
    entries = badge.nvs_list()

if not entries:
    print("Failed to read data")
else:
    for namespace in entries:
        for entry in entries[namespace]:
            value = "(skipped)"
            if entry["size"] < 64 and badge.nvs_should_read(entry["type"]):
                value = str(badge.nvs_read(namespace, entry["key"], entry["type"]))
            print("{: <32} {: <32} {: <8} {:10d} {}".format(namespace, entry["key"], badge.nvs_type_to_name(entry["type"]), entry["size"], value))
