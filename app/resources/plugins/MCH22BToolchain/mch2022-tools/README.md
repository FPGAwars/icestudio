## Using WebUSB tools
This directory contains command line tools for use with your badge.

To use them, you will need to `pip install pyusb`.

### Application management
The AppFS contains binary ESP32 apps - standalone firmwares that can be booted and used as apps.

`app_list.py`

Lists all apps on the AppFS.

`app_push.py {file} {name} {title} {version} [--run]`

Installs an ESP32 app to the AppFS.
The `--run` flag will also immediately start the app after installing.

`app_pull.py {name} {target}`

Downloads the ESP32 app binary to your computer, the file will be saved at the location provided as target.

`app_run.py {name}`

Boots an ESP32 app with the specified name.

`webusb_remove.py {app_name}`

Removes an ESP32 app from the AppFS.

### FAT filesystem
`filesystem_list.py [path] [--recursive]`

Returns a directory listing for the specified path.

`filesystem_push.py {name} {target}`

Uploads file `{name}` to location `{target}` on the filesystem of the badge.
`target` should always start with `/internal` or `/sd` and the target path should always end with a filename.

`filesystem_pull.py {name} {target}`

Downloads file `{name}` from the filesystem of the badge to location `{target}` on your computer.
`name` should always start with `/internal` or `/sd` and the path should always end with a filename.

`filesystem_remove.py {name}`

Removes a file or a directory from the filesystem of the badge. In case of a directory the directory is removed recursively.
`name` should always start with `/internal` or `/sd`.

`filesystem_create_directory.py {name}`

Creates a directory on the filesystem of the badge.
`name` should always start with `/internal` or `/sd`.

`filesystem_exists.py {name}`

Checks if a file exists on the filesystem of the badge.
`name` should always start with `/internal` or `/sd`.

### Configuration management

`configuration_list.py [namespace]`

Lists all configuration entries in the NVS partition of the badge. The optional `namespace` argument allows for filtering the results, returning only the entries in the provided namespace.

`configuration_read.py {namespace} {key} {type}`

Reads the value of a configuration entry with key `{key}` in namespace `{namespace}`. Valid types are u8 (8-bit unsigned integer), i8 (8-bit signed integer), u16 (16-bit unsigned integer), i16 (16-bit signed integer), u32 (32-bit unsigned integer), i32 (32-bit signed integer), u64 (64-bit unsigned integer), i64 (64-bit signed integer), string (a text string) and blob (binary data).

Note that reading entries of type `blob` will output raw binary data to stdout. You might want to pipe the output to another program (`python configuration_read.py example example blob | xxd`) or to a file (`python configuration_read.py example example blob > data.bin`).

`configuration_write.py {namespace} {key} {type} [value]`

Writes the value of a configuration entry with key `{key}` in namespace `{namespace}`. Valid types are u8 (8-bit unsigned integer), i8 (8-bit signed integer), u16 (16-bit unsigned integer), i16 (16-bit signed integer), u32 (32-bit unsigned integer), i32 (32-bit signed integer), u64 (64-bit unsigned integer), i64 (64-bit signed integer), string (a text string) and blob (binary data).

The value can either be provided using optional command line argument `[value]` or by writing a value to stdin (`echo "test" | python configuration_write.py owner nickname string`). Writing to stdin can also be used for storing binary data to a configuration entry of type `blob`.

`configuration_remove.py {namespace} {key}`

Removes a configuration entry with key `{key}` in namespace `{namespace}` from the NVS partition.

### FPGA
`fpga.py {filename} [bindings]`

Loads a bit stream from a file into the FPGA. This tool also allows for uploading and presenting files to the FPGA via the SPI interface that connects the FPGA to the ESP32.

### Other
`exit.py`

Reboots the badge, exiting webusb mode.

`information.py`

Returns usage information about the FAT filesystems and the AppFS filesystem
