#!/usr/bin/env python3
from webusb import *
import argparse
import sys
import time

def listapps():
    applist = badge.app_list()
    if not applist == None:
        print("\x1b[4m{: <48}\x1b[0m \x1b[4m{: <64}\x1b[0m \x1b[4m{: <8}\x1b[0m \x1b[4m{: <10}\x1b[0m".format("Name", "Title", "Version", "Size"))
        for app in applist:
            size = str(app["size"]) + " B"
            if app["size"] > 1024:
                size = str(round(app["size"] / 1024, 2)) + " KB"
            print("{: <48} {: <64} {: <8} {: <10}".format(app["name"].decode("ascii", errors="ignore"), app["title"].decode("ascii", errors="ignore"), str(app["version"]), size))
    else:
        print(location.decode("ascii") + " ** Failed to load application list **")

parser = argparse.ArgumentParser(description='MCH2022 badge application list tool')
args = parser.parse_args()

badge = Badge()

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

listapps()
