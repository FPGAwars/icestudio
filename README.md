<img src="https://raw.githubusercontent.com/FPGAwars/icestudio/develop/docs/resources/images/logo/icestudio-logo-label.png" align="center">

[![Build Status](https://travis-ci.org/FPGAwars/icestudio.svg?branch=v0.3.3)](https://travis-ci.org/FPGAwars/icestudio)
[![Version](https://img.shields.io/badge/version-v0.3.3-orange.svg)](https://github.com/FPGAwars/icestudio/releases)
[![License](http://img.shields.io/:license-gpl-blue.svg)](http://opensource.org/licenses/GPL-2.0)
[![Documentation Status](https://readthedocs.org/projects/icestudio/badge/?version=latest)](http://icestudio.readthedocs.io/en/latest)

Visual editor for open FPGA boards. Built on top of the [Icestorm project](http://www.clifford.at/icestorm/) using [Apio](https://github.com/FPGAwars/apio).

    Graphic design -> Verilog, PCF -> Bistream -> FPGA

### Supported boards

#### HX1K

| Board name | Interface |
|:-|:-:|
| [IceZUM Alhambra](https://github.com/FPGAwars/icezum) | FTDI |
| [Nandland Go board](https://www.nandland.com/goboard/introduction.html) | FTDI |
| [iCEstick Evaluation Kit](http://www.latticesemi.com/icestick) | FTDI |

#### HX8K

| Board name | Interface |
|:-|:-:|
| [Alhambra II](https://github.com/FPGAwars/Alhambra-II-FPGA) | FTDI |
| [BlackIce](https://hackaday.io/project/12930-blackice-low-cost-open-hardware-fpga-dev-board) | Serial |
| [BlackIce II](https://github.com/mystorm-org/BlackIce-II) | Serial |
| [icoBOARD 1.0](http://icoboard.org/about-icoboard.html) | GPIO RPi |
| [Kéfir I iCE40-HX4K](http://fpgalibre.sourceforge.net/Kefir/) | FTDI |
| [iCE40-HX8K Breakout Board](http://www.latticesemi.com/Products/DevelopmentBoardsAndKits/iCE40HX8KBreakoutBoard) | FTDI |

#### LP8K

| Board name | Interface |
|:-|:-:|
| [TinyFPGA B2](https://tinyfpga.com/b-series-guide.html) | Serial |
| [TinyFPGA BX](https://tinyfpga.com/bx/guide.html) | Serial |

#### UP5K

| Board name | Interface |
|:-|:-:|
| [iCEBreaker](https://github.com/icebreaker-fpga/icebreaker) | FTDI |
| [iCEBreaker bitsy](https://github.com/icebreaker-fpga/icebreaker) | FTDI |
| [UPDuino v1.0](http://gnarlygrey.atspace.cc/development-platform.html#upduino) | FTDI |
| [UPDuino v2.0](http://gnarlygrey.atspace.cc/development-platform.html#upduino_v2l) | FTDI |
| [FPGA 101 Workshop Badge Board](https://github.com/mmicko/workshop_badge) | FTDI |
| [iCE40 UltraPlus Breakout Board](http://www.latticesemi.com/en/Products/DevelopmentBoardsAndKits/iCE40UltraPlusBreakoutBoard) | FTDI |

## Installation

* **GNU/Linux**

  1. Install [Python 2.7](https://www.python.org) and **xclip**
  2. Download and execute the [AppImage](https://github.com/FPGAwars/icestudio/releases)


* **Windows**

  1. Download and execute the [Windows installer](https://github.com/FPGAwars/icestudio/releases)


* **Mac OS**

  1. Install [Python 2.7](https://www.python.org) and [Homebrew](https://brew.sh)
  2. Download and execute the [DMG package](https://github.com/FPGAwars/icestudio/releases)

<img src="https://raw.githubusercontent.com/FPGAwars/icestudio/develop/docs/resources/images/demo/main.png" width="700" align="center">

<img src="https://raw.githubusercontent.com/FPGAwars/icestudio/develop/docs/resources/images/demo/main-1.png" width="700" align="center">

Check the [Documentation](http://icestudio.readthedocs.io/en/latest) for more information.

## Development

Install [Python 2.7](https://www.python.org/downloads/) and [Node.js](https://nodejs.org/).

[Atom](https://atom.io/) editor with [linter-jshint](https://atom.io/packages/linter-jshint) is recommended.

If you want to add blocks or examples, please contribute to [icestudio-blocks](https://github.com/FPGAwars/icestudio-blocks), [icestudio-examples](https://github.com/FPGAwars/icestudio-examples) or [collection-default](https://github.com/FPGAwars/collection-default).

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

### Languages

|  Language  | Translated strings                        |
|:----------:|:-----------------------------------------:|
| English    | ![Progress](http://progressed.io/bar/100) |
| Spanish    | ![Progress](http://progressed.io/bar/100) |
| French     | ![Progress](http://progressed.io/bar/100) |
| German     | ![Progress](http://progressed.io/bar/99)  |
| Dutch      | ![Progress](http://progressed.io/bar/100) |
| Czech      | ![Progress](http://progressed.io/bar/100) |
| Greek      | ![Progress](http://progressed.io/bar/100) |
| Chinese    | ![Progress](http://progressed.io/bar/91)  |
| Galician   | ![Progress](http://progressed.io/bar/100) |
| Basque     | ![Progress](http://progressed.io/bar/99)  |
| Catalan    | ![Progress](http://progressed.io/bar/91)  |

**Contribute!**

Add or update the [app translations](https://github.com/FPGAwars/icestudio/tree/develop/app/resources/locale) using **[Poedit](https://poedit.net/)**.

*Developer note*: use `npm run gettext` to extract the labels from the code.

### Documentation

```bash
cd docs
make html
firefox _build/html/index.html
```

### Package

```bash
npm run dist
```

| Target OS | Development OS | Output files |
|:---:|:-------------:|:-----------------:|
| GNU/Linux | GNU/Linux | (linux32,linux64).zip, (linux32,linux64).AppImage |
| Windows | GNU/Linux | (win32,win64).zip, (win32,win64).exe |
|  Mac OS | Mac OS | (osx32,osx64).zip, osx64.dmg  |

### Apio configuration

Apio backend is configured in the `app/package.json` file:

- `apio.min`: minimum version (>=)
- `apio.max`: maximum version (<)
- `apio.extras`: list of external Python programmers (*blackiceprog*, *tinyfpgab*)
- `apio.external`: load an external Apio package instead of the default one (e.g. */path/to/my/apio*)
- `apio.branch`: install Apio from the repository branch instead of PyPI.

An external Apio package can be also set on runtime using the `ICESTUDIO_APIO` environment variable.

### Troubleshooting

If you get this error `npm ERR! peerinvalid The package grunt@1.0.1 does not satisfy its siblings' peerDependencies requirements!`, try to update your **[nodejs](https://github.com/nodejs/node)** or execute:

```bash
npm update -g
```

[More information](https://github.com/angular-fullstack/generator-angular-fullstack/issues/431)

## Roadmap

There is a [Wishlist](https://github.com/FPGAwars/icestudio/wiki/Wishlist:-proposed-features) in the wiki with the features proposed by the Community. If you want to contribute with new features and ideas write in the [Google Group](https://groups.google.com/forum/#!forum/fpga-wars-explorando-el-lado-libre).

 We use the GitHub [issues](https://github.com/FPGAwars/icestudio/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) to track the work and schedule our new features and improvements.

## Authors

* [Jesús Arroyo Torrens](https://github.com/Jesus89)

## Contributors

|Version | Contributors |
|:-:|:-:|
| 0.4 | [Elektor.Labs](https://github.com/elektor-labs), [Piotr Esden-Tempski](https://github.com/esden), [raTmole](https://github.com/ratmole) |
| 0.3 | [Lorea-Aldabaldetreku](https://github.com/Lorea-Aldabaldetreku), [Carlos Díaz](https://github.com/C47D), [Martoni](https://github.com/Martoni), [Xoan Sampaiño](https://github.com/xoan), [Unai](https://github.com/1138-4EB), [Francisco Sayas](https://github.com/fsayas), [Pascal Cotret](https://github.com/pcotret), [Juan Jose Luna Espinosa](https://github.com/yomboprime), [Salvador E. Tropea](https://github.com/set-soft), [redbeard](https://github.com/brianredbeard), [Eladio Delgado](https://github.com/EladioDM), [Philipp van Kempen](https://github.com/PhilippvK) |
| 0.2 | [Tomás Calvo](https://github.com/tocalvo), [Juan González (Obijuan)](https://github.com/Obijuan), [Carlos Díaz](https://github.com/C47D), [Xoan Sampaiño](https://github.com/xoan), [Salvador E. Tropea](https://github.com/set-soft), [Democrito](https://github.com/Democrito), [Martoni](https://github.com/Martoni), [Pascal Cotret](https://github.com/pcotret) |
| 0.1 | [Miguel Sánchez de León Peque](https://github.com/Peque) |

## Credits

* [FPGAwars](http://fpgawars.github.io/) community has developed this project in a voluntary and altruistic way since 02/2017.

  <img src="https://avatars3.githubusercontent.com/u/18257418?s=100">

* [BQ](https://www.bq.com) sponsored this project from 02/2016 to 02/2017. Thanks

## License

Licensed under [GPL 2.0](http://opensource.org/licenses/GPL-2.0) and [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).
