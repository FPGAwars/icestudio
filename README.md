# Icestudio

[![R&D](https://img.shields.io/badge/-R%26D-brightgreen.svg)](https://github.com/Jesus89/icestudio)
[![License](http://img.shields.io/:license-gpl-blue.svg)](http://opensource.org/licenses/GPL-2.0)

Experimental graphic editor for open FPGAs. Tested with Linux and [iCEstick board](http://www.pighixxx.com/test/portfolio-items/icestick/). Built on top of [icestorm project](http://www.clifford.at/icestorm/).

    GUI -> JSON -> Verilog, PCF

![][icestudio-demo]

### Install dependencies

Install libftdi and [apio](https://github.com/bqlabs/apio)
```bash
sudo apt-get install libftdi1
pip install apio
```

Install tools: scons, icestorm, icestick rules.
```bash
apio install
```

## Usage

Download the [latest release](https://github.com/bqlabs/icestudio/releases), unpack the zip and execute Icestudio.

NOTE: this is an **early experimental version**. Although frontend Icestudio works multiplatform, Apio backend is only available for Linux x86. We are working on having the backend also for win, osx and arm architectures.

## Development

Install nodejs
```bash
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Install nwjs
```bash
sudo npm install -g nw
```

Install nw-builder
```bash
sudo npm install -g nw-builder
```

### Download

```bash
git clone https://github.com/bqlabs/icestudio.git
cd icestudio
```

### Execute

```bash
nw icestudio
```

### Package

```bash
nwbuild -p linux64 icestudio -v v0.12.3
nwbuild -p osx64 icestudio -v v0.12.3
nwbuild -p win64 icestudio -v v0.12.3

cd build/Icestudio

zip -r icestudio-linux64 linux64
zip -r icestudio-win64 win64
zip -r icestudio-osx64 osx64
```

## Videos

[![Icestudio: GUI for open FPGAs](http://img.youtube.com/vi/Okl4Rr_i6Qk/0.jpg)](http://www.youtube.com/watch?v=Okl4Rr_i6Qk "Icestudio: GUI for open FPGAs")

[![Icestudio: code generation](http://img.youtube.com/vi/pG1DsF9MIj0/0.jpg)](http://www.youtube.com/watch?v=pG1DsF9MIj0 "Icestudio: code generation")

## Authors

* Jesús Arroyo

## Contributors

* Miguel Sánchez de León Peque

## Credits

* Using [AngularJS-Flowchart](https://github.com/codecapers/AngularJS-FlowChart)

## License

![][bq-logo-cc-sa]

Licensed under [GPLv2](http://opensource.org/licenses/GPL-2.0) and [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/)

[icestudio-demo]: doc/images/icestudio-demo.gif
[bq-logo-cc-sa]: doc/images/bq-logo-cc-sa-small-150px.png
