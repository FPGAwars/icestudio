#!/usr/bin/env python3
from webusb import *

dev = WebUSB()
apps = dev.appfsList()

print("Number of apps:", len(apps))

print("{0: <5}  {1:}".format("size", "name"))
print("==============================")
for app in apps:
    appsize = app["size"]
    appname = app["name"]
    print("{0: <5}  \"{1:}\"".format(appsize, appname))
