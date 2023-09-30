import os
import sys
import usb.core
import usb.util
from enum import Enum
import struct
import time

# Print iterations progress
def printProgressBar (iteration, total, prefix = '', suffix = '', decimals = 1, length = 100, fill = '█', printEnd = "\r"):
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
    if iteration == total:
        print()

def printProgressTime(
    totalMilliSeconds,
    steps=10,
    prefix="",
    suffix="",
    decimals=1,
    length=20,
    fill="█",
    printEnd="\r",
):
    """
    prints progress while sleeping totalMilliSeconds, bar is updated every `steps` milliseconds
    other params
    """
    for i in range(0, totalMilliSeconds, steps):
        printProgressBar(
            i,
            totalMilliSeconds - steps,
            prefix,
            suffix,
            decimals,
            length,
            fill,
            printEnd,
        )
        time.sleep(steps / 1000)

class Commands(Enum):
    EXECFILE = 0
    HEARTBEAT = 1
    APPFSBOOT = 3
    GETDIR = 4096
    READFILE = 4097
    WRITEFILE = 4098
    DELFILE = 4099
    DUPLFILE = 4100
    MVFILE = 4101
    MAKEDIR = 4102
    APPFSFDIR = 4103
    APPFSDEL = 4104
    APPFSWRITE = 4105

class WebUSBPacket():
    def __init__(self, command, message_id, payload=None):
        self.command = command
        self.message_id = message_id
        if (payload == None):
            self.payload = b""
        else:
            self.payload = payload

    def getMessage(self):
        return self._generateHeader() + self.payload 

    def _generateHeader(self):
        return struct.pack("<HIHI", self.command.value, len(self.payload), 0xADDE, self.message_id)

class WebUSB():
    def __init__(self, boot = True):
        if os.name == 'nt':
            from usb.backend import libusb1
            lube = libusb1.get_backend(find_library=lambda x: os.path.dirname(__file__) + "\\libusb-1.0.dll")
            self.device = usb.core.find(idVendor=0x16d0, idProduct=0x0f9a, backend=lube)
        elif sys.platform == 'darwin' and os.path.exists('/opt/homebrew/Cellar/libusb'):
            from usb.backend import libusb1
            max_version = max(os.listdir('/opt/homebrew/Cellar/libusb/'))
            lube = libusb1.get_backend(find_library=lambda x: f'/opt/homebrew/Cellar/libusb/{max_version}/lib/libusb-1.0.dylib')
            self.device = usb.core.find(idVendor=0x16d0, idProduct=0x0f9a, backend=lube)
        else:
            self.device = usb.core.find(idVendor=0x16d0, idProduct=0x0f9a)

        if self.device is None:
            raise ValueError("Badge not found")

        self.configuration = self.device.get_active_configuration()
        self.webusb_esp32   = self.configuration[(4,0)]
        self.ep_out = usb.util.find_descriptor(self.webusb_esp32, custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_OUT)
        self.ep_in  = usb.util.find_descriptor(self.webusb_esp32, custom_match = lambda e: usb.util.endpoint_direction(e.bEndpointAddress) == usb.util.ENDPOINT_IN)

        self.REQUEST_TYPE_CLASS_TO_INTERFACE = usb.util.CTRL_TYPE_CLASS + usb.util.CTRL_RECIPIENT_INTERFACE
        self.REQUEST_STATE    = 0x22
        self.REQUEST_RESET    = 0x23
        self.REQUEST_BAUDRATE = 0x24
        self.REQUEST_MODE     = 0x25

        self.TIMEOUT = 60
        self.PAYLOADHEADERLEN = 12

        if boot:
            self.bootWebUSB()
        self.message_id = 1

    def getMessageId(self):
        self.message_id += 1
        return self.message_id

    
    def bootWebUSB(self):
        """
        Boots the badge into webusb mode
        """
        self.device.ctrl_transfer(self.REQUEST_TYPE_CLASS_TO_INTERFACE, self.REQUEST_STATE, 0x0001, self.webusb_esp32.bInterfaceNumber)
        self.device.ctrl_transfer(self.REQUEST_TYPE_CLASS_TO_INTERFACE, self.REQUEST_MODE, 0x0001, self.webusb_esp32.bInterfaceNumber)
        self.device.ctrl_transfer(self.REQUEST_TYPE_CLASS_TO_INTERFACE, self.REQUEST_RESET, 0x0000, self.webusb_esp32.bInterfaceNumber)
        self.device.ctrl_transfer(self.REQUEST_TYPE_CLASS_TO_INTERFACE, self.REQUEST_BAUDRATE, 9216, self.webusb_esp32.bInterfaceNumber)
   
        print("Booting into WebUSB, please wait ...")                          
        printProgressTime(4000)  # Wait for the badge to have boot into webusb mode  
        while True:
            try:
                self.ep_in.read(128)
            except Exception as e:
                break

    def receiveResponse(self, show_hourglass=False):
        """
        receveives the response, for longish response times,
        you can keep the user occupied by setting show_hourglass to True
        """
        response = bytes([])
        starttime = time.time()
        anim = 0
        while (time.time() - starttime) < self.TIMEOUT:
            if show_hourglass:
                print(f"\rWaiting for response { (1+(anim%3)) * '.'}   ", end="\r")
                anim += 1

            data = None
            try:
                data = bytes(self.ep_in.read(128))
            except Exception as e:
                pass
            
            if data != None:
                response += data
            
            if len(response) >= self.PAYLOADHEADERLEN:
                if show_hourglass:
                    print()
                command, payloadlen, verif, message_id = struct.unpack_from("<HIHI", response)
                if verif != 0xADDE:
                    raise Exception("Failed verification")
                if len(response) >= (payloadlen + self.PAYLOADHEADERLEN):
                    return (command, message_id, response[self.PAYLOADHEADERLEN:])
        raise Exception("Timeout in receiving")

    
    def sendPacket(self, packet, transfersize=2048, show_response_hourglass=False):
        transfersize = 2048
        msg = packet.getMessage()
        starttime = time.time()

        if len(msg) > transfersize:
            printProgressBar(0, len(msg) // transfersize, length=20)
        for i in range(0, len(msg), transfersize):
            self.ep_out.write(msg[i:i+transfersize])
            time.sleep(0.01)
            if len(msg) > transfersize:
                printProgressBar(i//transfersize, len(msg) // transfersize, length=20)
        #self.ep_out.write(packet.getMessage())
        print(f"transfer speed: {(len(msg)/(time.time()-starttime)/1024):0.2f} kb/s")
        command, message_id, data = self.receiveResponse(show_hourglass=show_response_hourglass)
        if message_id != packet.message_id:
            raise Exception("Mismatch in id")
        if command != packet.command.value:
            raise Exception("Mismatch in command")
        return data

    def sendHeartbeat(self):
        """
        Send heartbeat towards the badges

        parameters:
            None

        returns:
            bool : True if badge responded, false if no response
        """

        data = self.sendPacket(WebUSBPacket(Commands.HEARTBEAT, self.getMessageId()))
        return data.decode().rstrip('\x00') == "ok"

    def getFSDir(self, dir):
        """
        Get files and directories on the badge filesystem

        parameters:
            dir (str) : Directory to get contents from

        returns:
            res (dict) : Dict containing 'dir' which is the requested directory, 'files' list of files in the directory, 'dirs' list of directories

        """

        data = self.sendPacket(WebUSBPacket(Commands.GETDIR, self.getMessageId(), dir.encode(encoding='ascii')))
        data = data.decode()
        data = data.split("\n")
        result = dict()
        result["dir"] = data[0]
        result["files"] = list()
        result["dirs"] = list()
        for i in range(1, len(data)):
            fd = data[i]
            if fd[0] == "f":
                result["files"].append(fd[1:])
            else:
                result["dirs"].append(fd[1:])
        return result

    def pushFSfile(self, filename, file):
        """
        Upload file to fs
        root path should /flash or /sdcard

        parameters:
            filename (str) : name of the file
            file (bytes) : file contents as byte array

        returns:
            bool : true if file was uploaded
        """

        payload = filename.encode(encoding='ascii') + b"\x00" + file
        data = self.sendPacket(WebUSBPacket(Commands.WRITEFILE, self.getMessageId(), payload))
        return data.decode().rstrip('\x00') == "ok"

    def appfsUpload(self, appname, file):
        """
        Upload app to appfs

        parameters:
            appname (str) : name of the app
            file (bytes) : the app to be upload
        
        returns:
            bool : true if app was uploaded succesfully
        """

        payload = appname.encode(encoding="ascii") + b"\x00" + file
        data = self.sendPacket(WebUSBPacket(Commands.APPFSWRITE, self.getMessageId(), payload), show_response_hourglass=True)
        return data.decode().rstrip('\x00') == "ok"
    
    def appfsRemove(self, appname):
        """
        Remove app from appfs

        parameters:
            appname (str) : name of the app to be removed
        
        returns:
            bool : true if app was deleted succesfully
        """
        
        payload = appname.encode(encoding="ascii") + b"\x00"
        data = self.sendPacket(WebUSBPacket(Commands.APPFSDEL, self.getMessageId(), payload))
        return data.decode().rstrip('\x00') == "ok"

    def appfsExecute(self, appname):
        """
        Execute app from appfs

        parameters:
            appname (str) : name of the app to be executed

        returns:
            bool : true if app was executed
        
        """
        

        payload = appname.encode(encoding="ascii") + b"\x00"
        data = self.sendPacket(WebUSBPacket(Commands.APPFSBOOT, self.getMessageId(), payload))
        return data.decode().rstrip('\x00') == "ok"

    def appfsList(self):
        """
        Get apps from appfs

        parameters:
            None
        
        returns:
            list : list of dicts containing 'name' and 'size'
        """

        data = self.sendPacket(WebUSBPacket(Commands.APPFSFDIR, self.getMessageId()))
        num_apps, = struct.unpack_from("<I", data)
        data = data[4:]
        res = list()
        for i in range(0, num_apps):
            appsize, lenname = struct.unpack_from("<II", data)
            data = data[8:]
            name = data[0:lenname].decode(encoding="ascii")
            data = data[lenname:]
            res.append({"name":name, "size":appsize})
        return res

    def disconnect(self):
        self.device.ctrl_transfer(self.REQUEST_TYPE_CLASS_TO_INTERFACE, self.REQUEST_BAUDRATE, 1152, self.webusb_esp32.bInterfaceNumber)
        self.device.ctrl_transfer(self.REQUEST_TYPE_CLASS_TO_INTERFACE, self.REQUEST_MODE, 0x0000, self.webusb_esp32.bInterfaceNumber)
        self.device.ctrl_transfer(self.REQUEST_TYPE_CLASS_TO_INTERFACE, self.REQUEST_STATE, 0x0000, self.webusb_esp32.bInterfaceNumber)


    def reset(self):
        self.device.ctrl_transfer(self.REQUEST_TYPE_CLASS_TO_INTERFACE, self.REQUEST_RESET, 0x0000, self.webusb_esp32.bInterfaceNumber)
