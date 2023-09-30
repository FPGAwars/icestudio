#!/usr/bin/env python3
from webusb import *
import argparse
import sys
import time
import sys

parser = argparse.ArgumentParser(description='MCH2022 badge NVS remove tool')
parser.add_argument("namespace", help="Namespace")
parser.add_argument("key", help="Key")
args = parser.parse_args()

badge = Badge()

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

result = badge.nvs_remove(args.namespace, args.key)

if result:
    print("Entry removed")
else:
    print("Failed to remove entry")
    sys.exit(1)
