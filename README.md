# Icestudio

[![R&D](https://img.shields.io/badge/-R%26D-brightgreen.svg)](https://github.com/Jesus89/icestudio)
[![License](http://img.shields.io/:license-gpl-blue.svg)](http://opensource.org/licenses/GPL-2.0)

Experimental graphic editor for open FPGAs.

    GUI -> JSON -> Verilog, PCF

### Install dependencies

Install [platformio](platformio.org)
```bash
pip install platformio
```

Install icestick in platformio: [wiki](https://github.com/bqlabs/Platformio-FPGA/wiki/Platformio-FPGA-wiki-home).

Install icestorm toolchain in platformio with this [script](https://github.com/bqlabs/Platformio-FPGA/blob/master/build-toolchain.sh).

Install nodejs and nwjs
```bash
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g nw
```

### Execute

```bash
nw gui
```

### Authors

* Jesús Arroyo

### Credits

* Using [AngularJS-Flowchart](https://github.com/codecapers/AngularJS-FlowChart)
