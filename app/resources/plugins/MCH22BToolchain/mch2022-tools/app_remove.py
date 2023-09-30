#!/usr/bin/env python3

from webusb import *
import argparse
import sys
import time

parser = argparse.ArgumentParser(description='MCH2022 badge app removal tool')
parser.add_argument("name", help="Name of app to be removed")
args = parser.parse_args()

name = args.name

badge = Badge()

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

result = badge.app_remove(name.encode('ascii', "ignore"))

if result:
    print("Removed")
else:
    print("Failed to remove")
    sys.exit(1)
