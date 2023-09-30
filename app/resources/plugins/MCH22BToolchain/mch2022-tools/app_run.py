#!/usr/bin/env python3

from webusb import *
import argparse
import sys
import time

parser = argparse.ArgumentParser(description='MCH2022 badge app run tool')
parser.add_argument("name", help="Name of app to be started")
parser.add_argument("--command", "-c", help="String to be stored in memory", required=False)
args = parser.parse_args()

name = args.name
command = args.command

badge = Badge()

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

result = badge.app_run(name.encode('ascii', "ignore"), command.encode('ascii', "ignore") if command else None)

if result:
    badge.reset(False)
    print("Started")
else:
    print("Failed to start")
    sys.exit(1)
