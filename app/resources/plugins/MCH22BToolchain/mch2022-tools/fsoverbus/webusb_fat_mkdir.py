#!/usr/bin/env python3

import os
import usb.core
import usb.util
import binascii
import time
import sys
import struct
import argparse

parser = argparse.ArgumentParser(description='MCH2022 badge FAT filesystem mkdir tool')
parser.add_argument("path", help="Folder to create")
args = parser.parse_args()

# Defined in webusb_task.c of the RP2040 firmware
REQUEST_STATE          = 0x22
REQUEST_RESET          = 0x23
REQUEST_BAUDRATE       = 0x24
REQUEST_MODE           = 0x25
REQUEST_MODE_GET       = 0x26
REQUEST_FW_VERSION_GET = 0x27

WEBUSB_MODE_NEW_WEBUSB = 0x03

if os.name == 'nt':
    from usb.backend import libusb1
    be = libusb1.get_backend(find_library=lambda x: os.path.dirname(__file__) + "\\libusb-1.0.dll")
    device = usb.core.find(idVendor=0x16d0, idProduct=0x0f9a, backend=be)
else:
    device = usb.core.find(idVendor=0x16d0, idProduct=0x0f9a)

if device is None:
    raise ValueError("Badge not found")

configuration = device.get_active_configuration()

webusb_esp32 = configuration[(4,0)]

esp32_ep_out = usb.util.find_descriptor(webusb_esp32, custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT)
esp32_ep_in  = usb.util.find_descriptor(webusb_esp32, custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_IN)

request_type_in = usb.util.build_request_type(usb.util.CTRL_IN, usb.util.CTRL_TYPE_CLASS, usb.util.CTRL_RECIPIENT_INTERFACE)
request_type_out = usb.util.build_request_type(usb.util.CTRL_OUT, usb.util.CTRL_TYPE_CLASS, usb.util.CTRL_RECIPIENT_INTERFACE)

# Connect
device.ctrl_transfer(request_type_out, REQUEST_STATE, 0x0001, webusb_esp32.bInterfaceNumber)

# Read WebUSB mode
current_mode = int(device.ctrl_transfer(request_type_in, REQUEST_MODE_GET, 0, webusb_esp32.bInterfaceNumber, 1)[0])

if current_mode != WEBUSB_MODE_NEW_WEBUSB:
    print("Starting...")
    device.ctrl_transfer(request_type_out, REQUEST_MODE, WEBUSB_MODE_NEW_WEBUSB, webusb_esp32.bInterfaceNumber)
    device.ctrl_transfer(request_type_out, REQUEST_RESET, 0x0000, webusb_esp32.bInterfaceNumber)
    device.ctrl_transfer(request_type_out, REQUEST_BAUDRATE, 1152, webusb_esp32.bInterfaceNumber)
    time.sleep(4)

data_buffer = b""

magic = 0xFEEDF00D

def handle_packet(identifier, command, payload):
    command_ascii = struct.pack("<I", command)
    if (command_ascii == b"OKOK"):
        #print("Command received, processing...")
        pass
    elif (command_ascii == b"FSMD"):
        if payload[0] == 1:
            print("Succesfully created directory")
        else:
            print("Failed to create directory")

def parse_response(new_data = b""):
    global data_buffer
    data_buffer += new_data
    
    if len(data_buffer) < 20: # length of header
        # Not enough data
        return
    
    while len(data_buffer) >= 20:
        header = struct.unpack("<IIIII", data_buffer[:20])
        if header[0] != magic:
            data_buffer = data_buffer[1:]
            continue
        identifier = header[1]
        command = header[2]
        command_ascii = struct.pack("<I", command)
        payload_length = header[3]
        payload_crc = header[4]
        if (len(data_buffer) - 20) < payload_length:
            print("Got header, not enough data")
            break
        data_buffer = data_buffer[20:]
        payload = data_buffer[:payload_length]
        data_buffer = data_buffer[payload_length:]
        payload_crc_check = binascii.crc32(payload)
        if payload_crc != payload_crc_check:
            print("Payload CRC doesn't match", payload_crc, payload_crc_check)
            continue
        #print("Packet", identifier, command, command_ascii, payload)
        handle_packet(identifier, command, payload)

path = args.path

if (path.startswith("/flash")):
    path = "/internal" + path[6:]
if (path.startswith("/sdcard")):
    path = "/sd" + path[7:]
# Remove trailing /
if path.endswith("/"):
    path = path[:-1]

print(path)

payload = path.encode("ascii")
esp32_ep_out.write(struct.pack("<IIIII", magic, 0x00000000, int.from_bytes(b"FSMD", "little"), len(payload), binascii.crc32(payload)))
esp32_ep_out.write(payload)

data = bytes([])
t = 2000
while t > 0:
    try:
        new_data = bytes(esp32_ep_in.read(esp32_ep_in.wMaxPacketSize, 20))
        data += new_data
        if len(new_data) > 0:
            t = 20
    except Exception as e:
        t-=1

parse_response(data)

device.ctrl_transfer(request_type_out, REQUEST_STATE, 0x0000, webusb_esp32.bInterfaceNumber)
