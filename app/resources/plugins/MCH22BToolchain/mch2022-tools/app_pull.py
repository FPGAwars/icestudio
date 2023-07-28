#!/usr/bin/env python3

from webusb import *
import argparse
import sys
import time

parser = argparse.ArgumentParser(description='MCH2022 badge app download tool')
parser.add_argument("name", help="Remote app")
parser.add_argument("target", help="Local file")
args = parser.parse_args()

name = args.name
target = args.target

badge = Badge()

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

result = badge.app_read(name.encode("ascii", "ignore"))

if result:
    with open(target, "wb") as f:
        f.write(result)
        f.truncate(len(result))
    print("App downloaded succesfully")
else:
    print("Failed to download app")
    sys.exit(1)
