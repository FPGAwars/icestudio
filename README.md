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
* [icoBOARD 1.0](http://icoboard.org/about-icoboard.html)
* [Kéfir I](http://fpgalibre.sourceforge.net/Kefir/)

## Version 0.2.3

### Installation

1. Install [Python 2.7](https://www.python.org)

2. Download the [release](https://github.com/FPGAwars/icestudio/releases), unzip and execute **icestudio**

**Documentation: http://icestudio.readthedocs.io**

Supported on Linux, Windows and Mac OSX.

<img src="./doc/images/icestudio-0.2.3.png" width="700" align="center">

## Development

Install [Python 2.7](https://www.python.org/downloads/release/python-2711/)

Install [nodejs](https://github.com/nodejs/node)

##### Ubuntu

```bash
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Download

```bash
git clone https://github.com/FPGAwars/icestudio.git
cd icestudio
```

### Install

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

NOTE: in Mac OS X this command also generates a **dmg** package.

## Languages

|  Language  | Translated strings                         |
|:----------:|:------------------------------------------:|
| English    | ![Progress](http://progressed.io/bar/100)  |
| Spanish    | ![Progress](http://progressed.io/bar/100)  |
| French     | ![Progress](http://progressed.io/bar/77)   |
| Basque     | ![Progress](http://progressed.io/bar/70)   |
| Galician   | ![Progress](http://progressed.io/bar/68)   |

**Contribute**: add or update the [translations](https://github.com/FPGAwars/icestudio/tree/develop/app/resources/locale) by following the [next instructions](https://angular-gettext.rocketeer.be/dev-guide/translate/#poedit).

```bash
npm run gettext
```

## Roadmap

There is a [Wishlist](https://github.com/FPGAwars/icestudio/wiki/Wishlist:-proposed-features) in the wiki with the features proposed by the Community. If you want to contribute with new features and ideas write in the [Google Group](https://groups.google.com/forum/#!forum/fpga-wars-explorando-el-lado-libre).

 We use the GitHub issues to schedule our new features and improvements.


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
 * [Salvador E. Tropea](https://github.com/set-soft)
 * [Democrito](https://github.com/Democrito)
 * [Martoni](https://github.com/Martoni)
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
