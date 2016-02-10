# Icestudio

[![R&D](https://img.shields.io/badge/-R%26D-brightgreen.svg)](https://github.com/Jesus89/icestudio)
[![License](http://img.shields.io/:license-gpl-blue.svg)](http://opensource.org/licenses/GPL-2.0)

![][icestudio-demo]

Experimental graphic editor for open FPGAs.

    GUI -> JSON -> Verilog, PCF

### Install dependencies

Install apio: scons + icestorm
```bash
pip install apio
apio install
```

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

# License

![][bq-logo-cc-sa]

Licensed under [GPLv2](http://opensource.org/licenses/GPL-2.0) and [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/)

[icestudio-demo]: doc/images/icestudio.gif
[bq-logo-cc-sa]: doc/images/bq-logo-cc-sa-small-150px.png
