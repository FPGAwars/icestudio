#!/usr/bin/env python3

import os
import usb.core
import usb.util
import binascii
import time
import sys
import argparse

# Defined in webusb_task.c of the RP2040 firmware
REQUEST_STATE          = 0x22
REQUEST_RESET          = 0x23
REQUEST_BAUDRATE       = 0x24
REQUEST_MODE           = 0x25
REQUEST_MODE_GET       = 0x26
REQUEST_FW_VERSION_GET = 0x27

WEBUSB_MODE_FPGA_DOWNLOAD = 0x02

parser = argparse.ArgumentParser(description='MCH2022 badge FPGA bit stream loading tool')
parser.add_argument("bitstream", help="Bitstream binary")
parser.add_argument("bindings", nargs="*", help="Data files/bindings")
args = parser.parse_args()

def usb_tx(title, data):
    global esp32_ep_out
    print(f"{title:s} : ", end="", file=sys.stderr)

    sent = 0
    time.sleep(0.2)
    while len(data) - sent > 0:
        print(".", end="", file=sys.stderr)
        sys.stderr.flush()
        txLength = min(2048, len(data) - sent)
        esp32_ep_out.write(data[sent:sent + txLength])
        time.sleep(0.1)
        sent += txLength

    print("", file=sys.stderr)

with open(args.bitstream, "rb") as f:
    bitstream = f.read()

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

if current_mode != WEBUSB_MODE_FPGA_DOWNLOAD:
    device.ctrl_transfer(request_type_out, REQUEST_MODE, 0x0002, webusb_esp32.bInterfaceNumber)
    device.ctrl_transfer(request_type_out, REQUEST_RESET, 0x0000, webusb_esp32.bInterfaceNumber)
    device.ctrl_transfer(request_type_out, REQUEST_BAUDRATE, 9216, webusb_esp32.bInterfaceNumber)
    print("Waiting for ESP32 to boot into FPGA download mode...")
else:
    print("ESP32 already in FPGA download mode, connecting...")

requested_len = 4 + 4 - 1 # 2 times "FPGA" if we are unlucky and "PGAFPGA" got transmitted
data = bytearray()
timeout = time.monotonic() + 5

while (data.find(b'FPGA') == -1):
    if len(data) >= requested_len * 50 or time.monotonic() > timeout: # ~50 tries or 5 seconds
        raise ValueError("Badge does not answer")
    try:
        data += bytes(esp32_ep_in.read(32))
    except Exception as e:
        #print(e)
        pass

esp32_ep_out.write(b'FPGA')

time.sleep(0.5)

# Send the data bindings if any
for binfo in args.bindings:
    # Clear ?
    if binfo[0] == '-':
        fid = int(binfo[1:], 0)
        title = f"Clearing FID 0x{fid:08x}"
        packet = [
            b'C',
            fid.to_bytes(4, byteorder='little'),
            b'\x00\x00\x00\x00\x00\x00\x00\x00',
        ]

    # Remote File binding ?
    elif binfo[0] == '=':
        fid, path = binfo[1:].split(':',2)
        fid = int(fid, 0)
        title = f"Binding FID 0x{fid:08x} to path '{path:s}'"
        path = path.encode('utf-8')
        packet = [
            b'F',
            fid.to_bytes(4, byteorder='little'),
            len(path).to_bytes(4, byteorder='little'),
            binascii.crc32(path).to_bytes(4, byteorder='little'),
            path,
        ]

    # Data bindings ? (Local file)
    else:
        fid, path = binfo[0:].split(':',2)
        fid = int(fid, 0)
        title = f"Sending data block for FID 0x{fid:08x} (local file '{path:s}')"
        with open(path, "rb") as fh:
            data = fh.read()
        packet = [
            b'D',
            fid.to_bytes(4, byteorder='little'),
            len(data).to_bytes(4, byteorder='little'),
            binascii.crc32(data).to_bytes(4, byteorder='little'),
            data,
        ]

    # Send it
    usb_tx(title, b''.join(packet))

bitstream_packet = [
    b'B\x00\x00\x00\x00',
    len(bitstream).to_bytes(4, byteorder='little'),
    binascii.crc32(bitstream).to_bytes(4, byteorder='little'),
    bitstream,
]

usb_tx("Sending bitstream", b''.join(bitstream_packet))

# Disconnect
device.ctrl_transfer(request_type_out, REQUEST_STATE, 0x0000, webusb_esp32.bInterfaceNumber)
