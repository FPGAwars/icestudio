## Using WebUSB tools
This directory contains command line tools for use with your badge.

To use them, you will need to `pip install pyusb`.

### AppFS
The AppFS contains binary ESP32 apps - standalone firmwares that can be booted and used as apps.

`webusb_ls.py`  
Lists all apps on the AppFS.

`webusb_push.py {target_name} {filename} [--run]`  
Installs an ESP32 app to the AppFS.
The `--run` flag will also immediately start the app after installing.

`webusb_boot.py {app_name}`  
Boots an ESP32 app with the specified name.

`webusb_rm.py {app_name}`  
Removes an ESP32 app from the AppFS.

### Filesystem
`webusb_fat_ls.py [path]`  
Returns a directory listing for the specified path.

`webusb_fat_push.py {filename} {target_location}`  
Uploads a local file to the FAT filesystem.  
`target_location` should always start with `/flash` or `/sdcard` and include the target filename.

### FPGA
`webusb_fpga.py {filename} [bindings]`  
Loads a bit stream from a file into the FPGA.

### General
`webusb_reset.py`  
Reboots the device.
