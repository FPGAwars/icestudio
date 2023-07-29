#!/usr/bin/env python3
from webusb import *
import argparse
import sys
import time

def listdir(location, recursive = False):
    filelist = badge.fs_list(location)
    if not filelist == None:
        for f in filelist:
            sizestring = ""
            modifiedstring = ""
            if f["stat"]:
                if f["type"] != 2:
                    s = f["stat"]["size"]
                    if s >= 1024:
                        sizestring = str(round(s / 1024, 2)) + " KB"
                    else:
                        sizestring = str(s) + " B"
                modifiedstring = datetime.utcfromtimestamp(f["stat"]["modified"]).strftime('%Y-%m-%d %H:%M:%S')
            typestring = "File"
            if f["type"] == 2:
                typestring = "Dir"
            newlocation = location + b"/" + f["name"]
            locationstring = newlocation.decode("ascii", errors="ignore")
            print("{: <5} {: <64} {: <12} {: <19}".format(typestring, locationstring, sizestring, modifiedstring))
            if f["type"] == 2 and recursive:
                listdir(newlocation, recursive)
    else:
        print(location.decode("ascii") + " ** Failed to open directory **")

parser = argparse.ArgumentParser(description='MCH2022 badge FAT filesystem directory list tool')
parser.add_argument("name", help="directory name")
parser.add_argument('--recursive', '-r', '-R', action='store_true')
args = parser.parse_args()

name = args.name
recursive = args.recursive

if name == "/":
    print("\x1b[4m{: <5}\x1b[0m \x1b[4m{: <64}\x1b[0m \x1b[4m{: <12}\x1b[0m \x1b[4m{: <19}\x1b[0m".format("Type", "Name", "Size", "Modified"))
    print("{: <5} {: <64} {: <12} {: <19}".format("Dir", "/internal", "", ""))
    print("{: <5} {: <64} {: <12} {: <19}".format("Dir", "/sd", "", ""))
    sys.exit(0)

if not (name.startswith("/internal") or name.startswith("/sd")):
    print("Path should always start with /internal or /sd")
    sys.exit(1)

if name.endswith("/"):
    name = name[:-1]

badge = Badge()

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

print("\x1b[4m{: <5}\x1b[0m \x1b[4m{: <64}\x1b[0m \x1b[4m{: <12}\x1b[0m \x1b[4m{: <19}\x1b[0m".format("Type", "Name", "Size", "Modified"))
listdir(name.encode("ascii"), recursive)
