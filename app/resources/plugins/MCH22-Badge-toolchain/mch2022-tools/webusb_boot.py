#!/usr/bin/env python3
from webusb import *
import argparse

parser = argparse.ArgumentParser(description='MCH2022 badge app boot tool')
parser.add_argument("name", help="AppFS filename")
args = parser.parse_args()

name = args.name

dev = WebUSB()
print(f"Booting application \"{name}\"...")

res = dev.appfsExecute(name)
if res:
    print("App started")
else:
    print("App failed to start")

