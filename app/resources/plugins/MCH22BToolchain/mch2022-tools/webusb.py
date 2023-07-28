#!/usr/bin/env python3

import os
import usb.core
import usb.util
import binascii
import time
import sys
import struct
from datetime import datetime

class Badge:
    # Defined in webusb_task.c of the RP2040 firmware
    REQUEST_STATE          = 0x22
    REQUEST_RESET          = 0x23
    REQUEST_BAUDRATE       = 0x24
    REQUEST_MODE           = 0x25
    REQUEST_MODE_GET       = 0x26
    REQUEST_FW_VERSION_GET = 0x27

    # Defined in main.c of the ESP32 firmware
    BOOT_MODE_NORMAL        = 0x00
    BOOT_MODE_WEBUSB_LEGACY = 0x01
    BOOT_MODE_FPGA_DOWNLOAD = 0x02
    BOOT_MODE_WEBUSB        = 0x03
    
    MAGIC = 0xFEEDF00D

    def __init__(self):
        if os.name == 'nt':
            from usb.backend import libusb1
            be = libusb1.get_backend(find_library=lambda x: os.path.dirname(__file__) + "\\libusb-1.0.dll")
            self.device = usb.core.find(idVendor=0x16d0, idProduct=0x0f9a, backend=be)
        else:
            self.device = usb.core.find(idVendor=0x16d0, idProduct=0x0f9a)

        if self.device is None:
            raise ValueError("Badge not found")

        configuration = self.device.get_active_configuration()

        self.webusb_esp32 = configuration[(4,0)]

        self.esp32_ep_out = usb.util.find_descriptor(self.webusb_esp32, custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT)
        self.esp32_ep_in  = usb.util.find_descriptor(self.webusb_esp32, custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_IN)

        self.request_type_in = usb.util.build_request_type(usb.util.CTRL_IN, usb.util.CTRL_TYPE_CLASS, usb.util.CTRL_RECIPIENT_INTERFACE)
        self.request_type_out = usb.util.build_request_type(usb.util.CTRL_OUT, usb.util.CTRL_TYPE_CLASS, usb.util.CTRL_RECIPIENT_INTERFACE)
        
        self.rx_data = bytes([])
        self.packets = []

        self.printGarbage = False

    def printProgressBar(self, iteration, total, prefix = '', suffix = '', decimals = 1, length = 50, fill = '█', printEnd = "\r"):
        """
        Call in a loop to create terminal progress bar
        @params:
            iteration   - Required  : current iteration (Int)
            total       - Required  : total iterations (Int)
            prefix      - Optional  : prefix string (Str)
            suffix      - Optional  : suffix string (Str)
            decimals    - Optional  : positive number of decimals in percent complete (Int)
            length      - Optional  : character length of bar (Int)
            fill        - Optional  : bar fill character (Str)
            printEnd    - Optional  : end character (e.g. "\r", "\r\n") (Str)
        """
        percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
        filledLength = int(length * iteration // total)
        bar = fill * filledLength + '-' * (length - filledLength)
        print(f'\r{prefix} |{bar}| {percent}% {suffix}', end = printEnd)
        # Print New Line on Complete
        if iteration == total and printEnd != "\r\n":
            print()

    def begin(self):
        if not self.sync():
            self.start_webusb()
            for i in range(20):
                if i == 10:
                    self.reset()
                    self.start_webusb()
                    time.sleep(0.5)
                self.printProgressBar(i, 20, 'Connecting...', '', 0)
                if self.sync():
                    self.printProgressBar(20, 20, 'Connecting...', '', 0)
                    return True
                time.sleep(0.1)
            return False
        return True

    def send_packet(self, command = b"XXXX", payload = bytes([]), flush = True):
        if flush:
            self.receive_packets(1)
            self.packets = []
        self.esp32_ep_out.write(struct.pack("<IIIII", self.MAGIC, 0x00000000, int.from_bytes(command, "little"), len(payload), binascii.crc32(payload)))
        if len(payload) > 0:
            self.esp32_ep_out.write(payload)

    def receive_data(self, timeout = 100):
        while timeout > 0:
            try:
                new_data = bytes(self.esp32_ep_in.read(self.esp32_ep_in.wMaxPacketSize, 5))
                self.rx_data += new_data
                if len(new_data) > 0:
                    timeout = 5
            except Exception as e:
                timeout-=1

    def receive_packets(self, timeout = 100):
        garbage = bytearray()
        self.receive_data(timeout)
        if len(self.rx_data) < 20: # length of header
            return False
        while len(self.rx_data) >= 20:
            header = struct.unpack("<IIIII", self.rx_data[:20])
            if header[0] != self.MAGIC:
                garbage.append(self.rx_data[0])
                self.rx_data = self.rx_data[1:]
                continue
            identifier = header[1]
            command = header[2]
            command_ascii = struct.pack("<I", command)
            payload_length = header[3]
            payload_crc = header[4]
            if (len(self.rx_data) - 20) < payload_length:
                print("Got header, not enough data")
                break
            #print("Receive payload length", command_ascii, payload_length)
            self.rx_data = self.rx_data[20:]
            payload = self.rx_data[:payload_length]
            self.rx_data = self.rx_data[payload_length:]
            payload_crc_check = binascii.crc32(payload)
            if payload_crc != payload_crc_check:
                #print("payload", payload)
                print("Payload CRC doesn't match {:08X} {:08X}".format(payload_crc, payload_crc_check))
                #continue
            self.packets.append({
                "identifier": identifier,
                "command": command_ascii,
                "payload": payload
            })
        if len(garbage) > 0 and self.printGarbage:
            print("Garbage:", garbage, garbage.decode("ascii", "ignore"))
        return True
    
    def receive_packet(self, timeout = 100):
        self.receive_packets(timeout)
        packet = None
        if len(self.packets) > 0:
            packet = self.packets[0]
            self.packets = self.packets[1:]
        return packet
    
    def peek_packet(self, timeout = 100):
        self.receive_packets(timeout)
        packet = None
        if len(self.packets) > 0:
            packet = self.packets[0]
        return packet
    
    def sync(self):
        self.receive_packets()
        self.packets = []
        self.send_packet(b"SYNC")
        response = self.receive_packet()
        if not response:
            return False
        if not response["command"] == b"SYNC":
            return False
        if  len(response["payload"]) != 2 or (struct.unpack("<H", response["payload"])[0] < 0x0001):
            print("Please update your MCH2022 badge to firmware version 2.0.1 or newer. This firmware is currently available on the experimental update channel only.")
            print("To install go to Settings > Install experimental firmware on your badge.")
            print()
            print("The tools for older firmwares can be found in the 'fsoverbus' subfolder of this repository")
            sys.exit(1)
            return False
        return True

    def ping(self, payload):
        self.send_packet(b"PING", payload)
        response = self.receive_packet()
        if not response:
            return False
        if not response["command"] == b"PING":
            print("No PING", response["command"])
            return False
        if not response["payload"] == payload:
            print("Payload mismatch", payload, response["payload"])
            for i in range(len(payload)):
                print(i, int(payload[i]), int(response["payload"][i]))
            return False
        return True

    def info(self):
        self.send_packet(b"INFO")
        response = self.receive_packet()
        if not response:
            return False
        if not response["command"] == b"INFO":
            print("No INFO", response["command"])
            return False
        return response["payload"].decode("ascii", "ignore")
    
    def fs_list(self, payload):
        self.send_packet(b"FSLS", payload + b"\0")
        response = self.receive_packet()
        if not response:
            print("No response")
            return None
        if not response["command"] == b"FSLS":
            if not response["command"] == b"ERR5": # Failed to open directory
                print("No FSLS", response["command"])
            return None
        payload = response["payload"]

        output = []
        
        while len(payload) > 0:
            data = payload[:1 + 4]
            payload = payload[1 + 4:]
            (item_type, item_name_length) = struct.unpack("<BI", data)
            name = payload[:item_name_length]
            payload = payload[item_name_length:]
            data = payload[:4 + 4 + 8]
            payload = payload[4 + 4 + 8:]
            (stat_res, item_size, item_modified) = struct.unpack("<iIQ", data)
            stat = None
            if stat_res == 0:
                stat = {
                    "size": item_size,
                    "modified": item_modified
                }
            item = {
                "type": item_type,
                "name": name,
                "stat": stat
            }
            output.append(item)
        return output

    def fs_file_exists(self, name):
        self.send_packet(b"FSEX", name)
        response = self.receive_packet()
        if not response:
            print("No response to FSEX")
            return False
        if not response["command"] == b"FSEX":
            print("No FSEX", response["command"])
            return False
        payload = response["payload"]
        if not len(payload) == 1:
            print("Wrong payload length")
            return False
        return True if payload[0] else False

    def fs_create_directory(self, name):
        self.send_packet(b"FSMD", name)
        response = self.receive_packet()
        if not response:
            print("No response to FSMD")
            return False
        if not response["command"] == b"FSMD":
            print("No FSMD", response["command"])
            return False
        payload = response["payload"]
        if not len(payload) == 1:
            print("Wrong payload length")
            return False
        return True if payload[0] else False

    def fs_remove(self, name):
        self.send_packet(b"FSRM", name)
        response = self.receive_packet(10000)
        if not response:
            print("No response to FSRM")
            return False
        if not response["command"] == b"FSRM":
            print("No FSRM", response["command"])
            return False
        payload = response["payload"]
        if not len(payload) == 1:
            print("Wrong payload length")
            return False
        return True if payload[0] else False

    def fs_state(self):
        self.send_packet(b"FSST")
        response = self.receive_packet()
        if not response:
            print("No response to FSST")
            return False
        if not response["command"] == b"FSST":
            print("No FSST", response["command"])
            return False
        payload = response["payload"]
        (internal_size, internal_free, sdcard_size, sdcard_free, appfs_size, appfs_free) = struct.unpack("<QQQQQQ", payload)
        return {
            "internal": {
                "size": internal_size,
                "free": internal_free
            },
            "sd": {
                "size": sdcard_size,
                "free": sdcard_free
            },
            "app": {
                "size": appfs_size,
                "free": appfs_free
            }
        }
    def fs_write_file(self, name, data):
        self.send_packet(b"FSFW", name)
        response = self.receive_packet()
        if not response:
            print("No response FSFW")
            return False
        if not response["command"] == b"FSFW":
            print("No FSFW", response["command"])
            return False
        payload = response["payload"]
        if not payload[0]:
            print("Failed to open file")
            return False
        position = 0

        total = len(data)
        while True:
            chunk = data[position:position+8192]
            if len(chunk) < 1:
                break
            self.printProgressBar(position, total, 'Writing...', '{} of {} bytes'.format(position, total), 0)
            position += 8192
            sent = self.fs_write_chunk(chunk)
            if sent != len(chunk):
                print("Failed to send data", sent, len(chunk))
                self.fs_close_file()
                return False
        self.fs_close_file()
        self.printProgressBar(100, 100, 'Writing...', '', 0)
        return True

    def fs_write_chunk(self, data):
        self.send_packet(b"CHNK", data)
        response = self.receive_packet()
        if not response:
            print("No response CHNK write")
            return False
        if not response["command"] == b"CHNK":
            print("No CHNK", response["command"])
            return False
        return struct.unpack("<I", response["payload"])[0]

    def fs_read_file(self, name):
        self.send_packet(b"FSFR", name)
        response = self.receive_packet()
        if not response:
            print("No response FSFR")
            return False
        if not response["command"] == b"FSFR":
            print("No FSFR", response["command"])
            return False
        payload = response["payload"]
        if not payload[0]:
            return False
        
        data = bytearray()

        while True:
            datanew = self.read_chunk()
            if datanew == None:
                print("Read error!")
                return False
            data += datanew
            self.printProgressBar(0, 100, 'Reading...', '{} bytes'.format(len(data)), 0)
            if len(datanew) < 1:
                break
        self.printProgressBar(100, 100, 'Reading...', '{} bytes'.format(len(data)), 0)
        self.fs_close_file()
        return data

    def fs_close_file(self):
        self.send_packet(b"FSFC")
        response = self.receive_packet()
        if not response:
            print("No response to FSFC")
            return False
        if not response["command"] == b"FSFC":
            print("No FSFC", response["command"])
            return False
        payload = response["payload"]
        if not len(payload) == 1:
            print("Wrong payload length")
            return False
        return True if payload[0] else False
    
    def read_chunk(self):
        self.send_packet(b"CHNK")
        response = self.receive_packet()
        if not response:
            print("No response CHNK read")
            return False
        if not response["command"] == b"CHNK":
            print("No CHNK", response["command"])
            return False
        payload = response["payload"]
        return payload

    def app_list(self):
        self.send_packet(b"APPL")
        response = self.receive_packet()
        if not response:
            print("No response")
            return None
        if not response["command"] == b"APPL":
            print("No APPL", response["command"])
            return None
        payload = response["payload"]

        output = []

        while len(payload) > 0:
            name_length = header = struct.unpack("<H", payload[:2])[0]
            payload = payload[2:]
            name = payload[:name_length]
            payload = payload[name_length:]
            title_length = header = struct.unpack("<H", payload[:2])[0]
            payload = payload[2:]
            title = payload[:title_length]
            payload = payload[title_length:]
            (version, size) = struct.unpack("<HI", payload[:6])
            payload = payload[6:]

            output.append({
                "name": name,
                "title": title,
                "version": version,
                "size": size
            })
        return output

    def app_read(self, name):
        self.send_packet(b"APPR", name)
        response = self.receive_packet()
        if not response:
            print("No response APPR")
            return False
        if not response["command"] == b"APPR":
            print("No APPR", response["command"])
            return False
        payload = response["payload"]
        if not payload[0]:
            return False

        data = bytearray()

        while True:
            datanew = self.read_chunk()
            if datanew == None:
                print("Read error!")
                return False
            data += datanew
            self.printProgressBar(0, 100, 'Reading...', '{} bytes'.format(len(data)), 0)
            if len(datanew) < 1:
                break
        self.printProgressBar(100, 100, 'Reading...', '{} bytes'.format(len(data)), 0)
        self.fs_close_file()
        return data

    def app_write(self, name, title, version, data):
        print("Preparing...")
        payload = struct.pack("<B", len(name)) + name + struct.pack("<B", len(title)) + title + struct.pack("<LH", len(data), version)
        self.send_packet(b"APPW", payload)
        response = self.receive_packet(10000)
        if not response:
            print("No response APPW")
            return False
        if not response["command"] == b"APPW":
            print("No APPW", response["command"])
            return False
        payload = response["payload"]
        if not payload[0]:
            print("Failed to open file")
            return False
        position = 0

        total = len(data)
        while True:
            chunk = data[position:position+8192]
            if len(chunk) < 1:
                break
            self.printProgressBar(position, total, 'Writing...', '{} of {} bytes'.format(position, total), 0)
            position += 8192
            sent = self.fs_write_chunk(chunk)
            if sent != len(chunk):
                print("Failed to send data", sent, len(chunk))
                self.fs_close_file()
                return False
        self.fs_close_file()
        self.printProgressBar(100, 100, 'Writing...', '', 0)
        return True

    def app_remove(self, name):
        self.send_packet(b"APPD", name)
        response = self.receive_packet(10000)
        if not response:
            print("No response to APPD")
            return False
        if not response["command"] == b"APPD":
            print("No APPD", response["command"])
            return False
        payload = response["payload"]
        if not len(payload) == 1:
            print("Wrong payload length")
            return False
        return True if payload[0] else False

    def app_run(self, name, command = None):
        if command:
            self.send_packet(b"APPX", name + b"\0" + command)
        else:
            self.send_packet(b"APPX", name)
        response = self.receive_packet()
        if not response:
            print("No response to APPX")
            return False
        if not response["command"] == b"APPX":
            print("No APPX", response["command"])
            return False
        payload = response["payload"]
        if not len(payload) == 1:
            print("Wrong payload length")
            return False
        return True if payload[0] else False

    def nvs_list(self, namespace = None):
        if namespace:
            self.send_packet(b"NVSL", namespace.encode("ascii", "ignore"))
        else:
            self.send_packet(b"NVSL")
        response = self.receive_packet()
        if not response:
            print("No response to NVSL")
            return None
        if not response["command"] == b"NVSL":
            print("No NVSL", response["command"])
            return None
        payload = response["payload"]

        output = {}

        while len(payload) > 0:
            namespace_name_length = struct.unpack("<H", payload[:2])[0]
            payload = payload[2:]
            namespace_name = payload[:namespace_name_length].decode("ascii", "ignore")
            payload = payload[namespace_name_length:]
            key_length = struct.unpack("<H", payload[:2])[0]
            payload = payload[2:]
            key = payload[:key_length].decode("ascii", "ignore")
            payload = payload[key_length:]
            value_type = struct.unpack("<B", payload[:1])[0]
            payload = payload[1:]
            value_size = struct.unpack("<L", payload[:4])[0]
            payload = payload[4:]
            if not namespace_name in output:
                output[namespace_name] = []
            output[namespace_name].append({
                "key": key,
                "type": value_type,
                "size": value_size
            })
        return output

    def nvs_read(self, namespace, key, type_number):
        payload = bytearray()
        payload += struct.pack("<B", len(namespace))
        payload += namespace.encode("ascii", "ignore")
        payload += struct.pack("<B", len(key))
        payload += key.encode("ascii", "ignore")
        payload += struct.pack("<B", type_number)
        self.send_packet(b"NVSR", payload)
        response = self.receive_packet()
        if not response:
            print("No response to NVSR")
            return None
        if not response["command"] == b"NVSR":
            print("No NVSR", response["command"])
            return None
        result = response["payload"]
        if type_number == 0x01:
            return struct.unpack("<B", result)[0]
        if type_number == 0x11:
            return struct.unpack("<b", result)[0]
        if type_number == 0x02:
            return struct.unpack("<H", result)[0]
        if type_number == 0x12:
            return struct.unpack("<h", result)[0]
        if type_number == 0x04:
            return struct.unpack("<I", result)[0]
        if type_number == 0x14:
            return struct.unpack("<i", result)[0]
        if type_number == 0x08:
            return struct.unpack("<Q", result)[0]
        if type_number == 0x18:
            return struct.unpack("<q", result)[0]
        if type_number == 0x21:
            return result.decode("utf-8", "ignore")
        return result

    def nvs_write(self, namespace, key, type_number, value):
        payload = bytearray()
        payload += struct.pack("<B", len(namespace))
        payload += namespace.encode("ascii", "ignore")
        payload += struct.pack("<B", len(key))
        payload += key.encode("ascii", "ignore")
        payload += struct.pack("<B", type_number)
        if type_number == 0x01:
            payload += struct.pack("<B", value)
        elif type_number == 0x11:
            payload += struct.pack("<b", value)
        elif type_number == 0x02:
            payload += struct.pack("<H", value)
        elif type_number == 0x12:
            payload += struct.pack("<h", value)
        elif type_number == 0x04:
            payload += struct.pack("<I", value)
        elif type_number == 0x14:
            payload += struct.pack("<i", value)
        elif type_number == 0x08:
            payload += struct.pack("<Q", value)
        elif type_number == 0x18:
            payload += struct.pack("<q", value)
        elif type_number == 0x21:
            if type(value) == bytes or type(value) == bytearray:
                payload += value
            else:
                payload += value.encode("utf-8", "ignore")
        elif type_number == 0x42:
            payload += bytes(value)
        else:
            raise ValueError("Invalid type")
        self.send_packet(b"NVSW", payload)
        response = self.receive_packet()
        if not response:
            print("No response to NVSW")
            return None
        if not response["command"] == b"NVSW":
            print("No NVSW", response["command"])
            return None
        result = response["payload"]
        return result

    def nvs_remove(self, namespace, key):
        payload = bytearray()
        payload += struct.pack("<B", len(namespace))
        payload += namespace.encode("ascii", "ignore")
        payload += struct.pack("<B", len(key))
        payload += key.encode("ascii", "ignore")
        self.send_packet(b"NVSD", payload)
        response = self.receive_packet()
        if not response:
            print("No response to NVSD")
            return None
        if not response["command"] == b"NVSD":
            print("No NVSD", response["command"])
            return None
        result = response["payload"]
        return result

    def nvs_type_to_name(self, type_number):
        if type_number == 0x01:
            return "u8"
        if type_number == 0x11:
            return "i8"
        if type_number == 0x02:
            return "u16"
        if type_number == 0x12:
            return "i16"
        if type_number == 0x04:
            return "u32"
        if type_number == 0x14:
            return "i32"
        if type_number == 0x08:
            return "u64"
        if type_number == 0x18:
            return "i64"
        if type_number == 0x21:
            return "string"
        if type_number == 0x42:
            return "blob"
        return str(type_number)

    def nvs_name_to_type(self, type_name):
        if type_name == "u8":
            return 0x01
        if type_name == "i8":
            return 0x11
        if type_name == "u16":
            return 0x02
        if type_name == "i16":
            return 0x12
        if type_name == "u32":
            return 0x04
        if type_name == "i32":
            return 0x14
        if type_name == "u64":
            return 0x08
        if type_name == "i64":
            return 0x18
        if type_name == "string":
            return 0x21
        if type_name == "blob":
            return 0x42
        raise ValueError("Invalid type name")

    def nvs_should_read(self, type_number):
        if type_number == 0x01:
            return True
        if type_number == 0x11:
            return True
        if type_number == 0x02:
            return True
        if type_number == 0x12:
            return True
        if type_number == 0x04:
            return True
        if type_number == 0x14:
            return True
        if type_number == 0x08:
            return True
        if type_number == 0x18:
            return True
        if type_number == 0x21:
            return True
        return False

    def reset(self, reset_esp = True):
        self.device.ctrl_transfer(self.request_type_out, self.REQUEST_STATE, 0x0000, self.webusb_esp32.bInterfaceNumber) # Connect
        self.device.ctrl_transfer(self.request_type_out, self.REQUEST_MODE, self.BOOT_MODE_NORMAL, self.webusb_esp32.bInterfaceNumber)
        if reset_esp:
            self.device.ctrl_transfer(self.request_type_out, self.REQUEST_RESET, 0x0000, self.webusb_esp32.bInterfaceNumber)
        self.device.ctrl_transfer(self.request_type_out, self.REQUEST_BAUDRATE, 1152, self.webusb_esp32.bInterfaceNumber)
    
    def start_webusb(self):
        self.device.ctrl_transfer(self.request_type_out, self.REQUEST_STATE, 0x0001, self.webusb_esp32.bInterfaceNumber) # Connect
        current_mode = int(self.device.ctrl_transfer(self.request_type_in, self.REQUEST_MODE_GET, 0, self.webusb_esp32.bInterfaceNumber, 1)[0]) # Read WebUSB mode

        if current_mode != self.BOOT_MODE_WEBUSB:
            self.device.ctrl_transfer(self.request_type_out, self.REQUEST_MODE, self.BOOT_MODE_WEBUSB, self.webusb_esp32.bInterfaceNumber)
            self.device.ctrl_transfer(self.request_type_out, self.REQUEST_RESET, 0x0000, self.webusb_esp32.bInterfaceNumber)
            self.device.ctrl_transfer(self.request_type_out, self.REQUEST_BAUDRATE, 9216, self.webusb_esp32.bInterfaceNumber)
