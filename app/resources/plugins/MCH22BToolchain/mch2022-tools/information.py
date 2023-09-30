#!/usr/bin/env python3

from webusb import *
import argparse
import sys
import time

parser = argparse.ArgumentParser(description='MCH2022 badge filesystem info tool')
args = parser.parse_args()

badge = Badge()

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

try:
    info = badge.info().split(" ")
    print("Device name:             {}".format(info[0]))
    print("Firmware version:        {}".format(info[1]))
except:
    pass

result = badge.fs_state()

internal_size = result["internal"]["size"]
internal_free = result["internal"]["free"]
sdcard_size = result["sd"]["size"]
sdcard_free = result["sd"]["free"]
appfs_size = result["app"]["size"]
appfs_free = result["app"]["free"]

badge.printProgressBar(appfs_size - appfs_free,       appfs_size,    'Internal APP filesystem: {: <32}'.format('{} of {} KB used'.format(int((appfs_size-appfs_free) / 1024), int(appfs_size / 1024))), '', 0, printEnd="\r\n")
badge.printProgressBar(internal_size - internal_free, internal_size, 'Internal FAT filesystem: {: <32}'.format('{} of {} KB used'.format(int((internal_size-internal_free) / 1024), int(internal_size / 1024))), '', 0, printEnd="\r\n")
if sdcard_size > 0:
    badge.printProgressBar(sdcard_size - sdcard_free,     sdcard_size,   'SD card  FAT filesystem: {: <32}'.format('{} of {} KB used'.format(int((sdcard_size-sdcard_free) / 1024), int(sdcard_size / 1024))), '', 0, printEnd="\r\n")
