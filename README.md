# Icestudio

[![R&D](https://img.shields.io/badge/-R%26D-brightgreen.svg)](https://github.com/Jesus89/icestudio)
[![License](http://img.shields.io/:license-gpl-blue.svg)](http://opensource.org/licenses/GPL-2.0)

Experimental graphic editor for open FPGAs. Tested with Linux and [iCEstick board](http://www.pighixxx.com/test/portfolio-items/icestick/). Built on top of [icestorm project](http://www.clifford.at/icestorm/).

    GUI -> JSON -> Verilog, PCF

![][icestudio-demo]

### Install dependencies

Install libftdi
```bash
sudo apt-get install libftdi1
```

Install [apio](https://github.com/bqlabs/apio)
```bash
sudo pip install apio
apio install
```

Install nodejs
```bash
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Install nwjs
```bash
sudo npm install -g nw
```

### Download

```bash
git clone https://github.com/Jesus89/icestudio.git
cd icestudio
```

### Execute

```bash
nw gui
```

[![Icestudio: code generation](http://img.youtube.com/vi/pG1DsF9MIj0/0.jpg)](http://www.youtube.com/watch?v=pG1DsF9MIj0 "Icestudio: code generation")

[![Icestudio: modules code and labels](http://img.youtube.com/vi/lCm5WAkVGIE/0.jpg)](http://www.youtube.com/watch?v=lCm5WAkVGIE "Icestudio: modules code and labels")


### Authors

* Jesús Arroyo

### Credits

* Using [AngularJS-Flowchart](https://github.com/codecapers/AngularJS-FlowChart)

# License

![][bq-logo-cc-sa]

Licensed under [GPLv2](http://opensource.org/licenses/GPL-2.0) and [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/)

[icestudio-demo]: doc/images/icestudio-demo.gif
[bq-logo-cc-sa]: doc/images/bq-logo-cc-sa-small-150px.png
