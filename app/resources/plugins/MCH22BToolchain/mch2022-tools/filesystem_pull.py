#!/usr/bin/env python3

from webusb import *
import argparse
import sys
import time

parser = argparse.ArgumentParser(description='MCH2022 badge FAT filesystem file download tool')
parser.add_argument("name", help="Remote file")
parser.add_argument("target", help="Local file")
args = parser.parse_args()

name = args.name
target = args.target

if not (name.startswith("/internal") or name.startswith("/sd")):
    print("Path should always start with /internal or /sd")
    sys.exit(1)

if name.endswith("/"):
    name = name[:-1]

badge = Badge()

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

result = badge.fs_read_file(name.encode("ascii", "ignore"))

if result:
    with open(target, "wb") as f:
        f.write(result)
        f.truncate(len(result))
    print("File downloaded succesfully")
else:
    print("Failed to download file")
    sys.exit(1)
