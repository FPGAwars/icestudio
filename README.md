<img src="./doc/images/icestudio-logo-label.png" align="center">

[![License](http://img.shields.io/:license-gpl-blue.svg)](http://opensource.org/licenses/GPL-2.0)
[![Documentation Status](https://readthedocs.org/projects/icestudio/badge/?version=stable)](http://icestudio.readthedocs.io/en/stable/)


**Experimental** graphic editor for open FPGAs. Built on top of the [icestorm project](http://www.clifford.at/icestorm/).

    GUI -> JSON -> Verilog, PCF

Supported boards:

* [IceZUM Alhambra](https://github.com/FPGAwars/icezum)
* [Nandland Go board](https://www.nandland.com/goboard/introduction.html)
* [iCEstick](http://www.pighixxx.com/test/portfolio-items/icestick/)
* [iCE40-HX8K](http://www.latticesemi.com/Products/DevelopmentBoardsAndKits/iCE40HX8KBreakoutBoard.aspx)
* [icoBOARD 1.0](http://icoboard.org/icoboard-1-0.html)
* [Kéfir I](http://fpgalibre.sourceforge.net/Kefir/)


## Roadmap

* Version 0.3.0

  * Requirements definition: [wiki](https://github.com/FPGAwars/icestudio/wiki/Icestudio-0.3.0:-proposed-features)


* Version 0.2.X

  * New blocks, examples and templates: [wiki](https://github.com/FPGAwars/icestudio/wiki/Icestudio-0.2.X:-proposed-content)

## Version 0.2.1

### Installation

1. Install and configure the [drivers](http://apiodoc.readthedocs.io/en/stable/source/installation.html#install-fpga-ftdi-drivers)

2. Download the [release](https://github.com/FPGAwars/icestudio/releases), unpack the zip and execute **icestudio**

**Documentation: http://icestudio.readthedocs.io**

NOTE: supported on Linux, Windows and Mac.

<img src="./doc/images/icestudio-0.2.1.png" width="700" align="center">

## Development

Install [Python 2.7](https://www.python.org/downloads/release/python-2711/)

Install [nodejs](https://github.com/nodejs/node)
```bash
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Download

```bash
git clone https://github.com/FPGAwars/icestudio.git
cd icestudio
```

### Install

Linux:

```bash
npm install --no-optional
```

Mac OS X:

```bash
npm install
```

### Execute

```bash
npm start
```

### Package

```bash
npm run dist
```

NOTE: in Mac OS X this commmand generates also a **dmg** package.

## Version 0.1

![][icestudio-0.1-demo]

## Videos

### Version 0.2

[![Icestudio: icoBOARD in a remote RPi2 ](http://img.youtube.com/vi/DAStv80OtXQ/0.jpg)](https://www.youtube.com/watch?v=DAStv80OtXQ "Icestudio: icoBOARD in a remote RPi2")

[![Icestudio: new gui & multiboard](http://img.youtube.com/vi/OWnVCjo7N9Y/0.jpg)](https://www.youtube.com/watch?v=OWnVCjo7N9Y "Icestudio: new gui & multiboard")

[![Icestudio: block factory](http://img.youtube.com/vi/mAIKb47z2Do/0.jpg)](http://www.youtube.com/watch?v=mAIKb47z2Do "Icestudio: block factory")


### Version 0.1

[![Icestudio: GUI for open FPGAs](http://img.youtube.com/vi/Okl4Rr_i6Qk/0.jpg)](http://www.youtube.com/watch?v=Okl4Rr_i6Qk "Icestudio: GUI for open FPGAs")

[![Icestudio: code generation](http://img.youtube.com/vi/pG1DsF9MIj0/0.jpg)](http://www.youtube.com/watch?v=pG1DsF9MIj0 "Icestudio: code generation")

## Authors

* [Jesús Arroyo Torrens](https://github.com/Jesus89)

## Contributors

* v0.2
 * [Tomás Calvo](https://github.com/tocalvo)
 * [Juan González (Obijuan)](https://github.com/Obijuan)
 * [Carlos Díaz](https://github.com/C47D)
 * [Xoan Sampaiño](https://github.com/xoan)
* v0.1
 * [Miguel Sánchez de León Peque](https://github.com/Peque)

## Credits

* v0.2: using [JointJS](https://github.com/clientIO/joint)
* v0.1: using [AngularJS-Flowchart](https://github.com/codecapers/AngularJS-FlowChart)
* Sponsored by [BQ](https://www.bq.com)

![](https://github.com/FPGAwars/icezum/raw/master/wiki/bq-logo.png)

## License

Licensed under [GPLv2](http://opensource.org/licenses/GPL-2.0) and [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/)

[icestudio-0.1-demo]: doc/images/icestudio-demo.gif
