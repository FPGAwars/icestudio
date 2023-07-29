#!/usr/bin/env python3
from webusb import *
import argparse
import sys
import time
import sys

parser = argparse.ArgumentParser(description='MCH2022 badge NVS write tool')
parser.add_argument("namespace", help="Namespace")
parser.add_argument("key", help="Key")
parser.add_argument("type", help="Type, one of u8, i8, u16, i16, u32, i32, u64, i64, string or blob")
parser.add_argument("value", help="Value, optional. If no value is provided the application will read from stdin", nargs='?', default=None)
args = parser.parse_args()

value = args.value

if not value:
    value = sys.stdin.buffer.read()

badge = Badge()

type_name = args.type.lower()
type_number = badge.nvs_name_to_type(type_name)

if type_name in ["u8", "i8", "u16", "i16", "u32", "i32", "u64", "i64"]:
    value = int(value)

if not badge.begin():
    print("Failed to connect")
    sys.exit(1)

result = badge.nvs_write(args.namespace, args.key, type_number, value)

if result:
    print("Value stored")
else:
    print("Failed to store value")
    sys.exit(1)
