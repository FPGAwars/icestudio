# Icestudio

Experimental graphic editor for FPGAs.

    GUI -> JSON -> Verilog, PCF


## Execute

### Platformio + icestorm

Install [atom](https://atom.io/), [platformio](https://atom.io/) and [platformio-ide](https://atom.io/packages/platformio-ide).
Install icestick in platformio: [wiki](https://github.com/bqlabs/Platformio-FPGA/wiki/Platformio-FPGA-wiki-home).
Install icestorm toolchain in platformio with this [script](https://github.com/bqlabs/Platformio-FPGA/blob/master/build-toolchain.sh).

### GUI

TODO

### JSON to Verilog

```bash
cd src/json_verilog
./gen
```

### Build

```bash
platformio run
```

### Upload

```bash
platformio run --target upload
```
