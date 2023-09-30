#!/usr/bin/env python3

from webusb import *
import argparse
import sys
import time

parser = argparse.ArgumentParser(description='MCH2022 badge FAT filesystem directory creation tool')
parser.add_argument("name", help="directory name")
args = parser.parse_args()

name = args.name

if not (name.startswith("/internal") or name.startswith("/sd")):
    print("Path should always start with /internal or /sd")
    sys.exit(1)

if name.endswith("/"):
    name = name[:-1]

badge = Badge()

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

result = badge.fs_create_directory(name.encode('ascii', "ignore"))

if result:
    print("Directory created")
else:
    print("Failed to create directory")
    sys.exit(1)
