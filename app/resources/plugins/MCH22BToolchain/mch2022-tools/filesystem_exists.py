#!/usr/bin/env python3

from webusb import *
import argparse
import sys
import time

parser = argparse.ArgumentParser(description='MCH2022 badge FAT filesystem file exists check tool')
parser.add_argument("name", help="Name of file")
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

result = badge.fs_file_exists(name.encode('ascii', "ignore"))

if result:
    print("File exists")
else:
    print("File does not exist")
    sys.exit(1)
