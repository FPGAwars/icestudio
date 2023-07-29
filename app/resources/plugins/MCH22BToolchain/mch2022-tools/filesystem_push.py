#!/usr/bin/env python3

from webusb import *
import argparse
import sys
import time

parser = argparse.ArgumentParser(description='MCH2022 badge FAT filesystem file upload tool')
parser.add_argument("name", help="Local file")
parser.add_argument("target", help="Remote file")
args = parser.parse_args()

name = args.name
target = args.target

with open(name, "rb") as f:
    data = f.read()

if not (target.startswith("/internal") or target.startswith("/sd")):
    print("Path should always start with /internal or /sd")
    sys.exit(1)

if target.endswith("/"):
    target = target[:-1]

badge = Badge()

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

result = badge.fs_write_file(target.encode("ascii", "ignore"), data)

if result:
    print("File pushed succesfully")
else:
    print("Failed to push file")
    sys.exit(1)
