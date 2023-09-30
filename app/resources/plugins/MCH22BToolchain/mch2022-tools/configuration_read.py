#!/usr/bin/env python3
from webusb import *
import argparse
import sys
import time
import sys

parser = argparse.ArgumentParser(description='MCH2022 badge NVS read tool')
parser.add_argument("namespace", help="Namespace")
parser.add_argument("key", help="Key")
parser.add_argument("type", help="Type, one of u8, i8, u16, i16, u32, i32, u64, i64, string or blob")
args = parser.parse_args()

badge = Badge()

type_name = args.type.lower()
type_number = badge.nvs_name_to_type(type_name)

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

value = badge.nvs_read(args.namespace, args.key, type_number)

if type_name == "blob":
    sys.stdout.buffer.write(value)
else:
    print(value)
