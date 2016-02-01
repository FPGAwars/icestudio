# Icestudio

NOTE: Under development

Experimental graphic editor for FPGAs.

    GUI -> JSON -> Verilog, PCF


## Execute

### Platformio + icestorm

Install [platformio](https://atom.io/).
Install icestick in platformio: [wiki](https://github.com/bqlabs/Platformio-FPGA/wiki/Platformio-FPGA-wiki-home).
Install icestorm toolchain in platformio with this [script](https://github.com/bqlabs/Platformio-FPGA/blob/master/build-toolchain.sh).

### GUI

Install nodejs y nwjs

```bash
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g nw
```

Execute

```bash
nw gui-test/
```

### JSON to Verilog

```bash
python build.py (1,2,...)

Ex: python build.py 1
```

### Build

```bash
platformio run
```

### Upload

```bash
platformio run --target upload
```
