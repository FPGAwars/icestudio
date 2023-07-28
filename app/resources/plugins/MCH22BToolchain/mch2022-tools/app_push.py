#!/usr/bin/env python3

from webusb import *
import argparse
import sys
import time

parser = argparse.ArgumentParser(description='MCH2022 badge app upload tool')
parser.add_argument("file", help="Application binary")
parser.add_argument("name", help="Application name")
parser.add_argument("title", help="Application title")
parser.add_argument("version", type=int, help="Application version")
parser.add_argument('--run', '-r', '-R', action='store_true', help="Run application after uploading")
args = parser.parse_args()

name = args.name.encode("ascii", "ignore")
title = args.title.encode("ascii", "ignore")
version = args.version
if version < 0:
    version = 0

with open(args.file, "rb") as f:
    data = f.read()

badge = Badge()

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

result = badge.app_write(name, title, version, data)

if result:
    print("App installed succesfully")
else:
    print("Failed to install app")
    sys.exit(1)

if args.run:
    result = badge.app_run(name)

    if result:
        badge.reset(False)
        print("Started")
    else:
        print("Failed to start")
        sys.exit(1)
