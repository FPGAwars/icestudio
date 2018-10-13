# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
### Support UP5K boards (#)
- [iCEBreaker](https://github.com/icebreaker-fpga/icebreaker)
- [iCEBreaker bitsy](https://github.com/icebreaker-fpga/icebreaker)
- [UPDuino v1.0](http://gnarlygrey.atspace.cc/development-platform.html#upduino)
- [UPDuino v2.0](http://gnarlygrey.atspace.cc/development-platform.html#upduino_v2l)
- [FPGA 101 Workshop Badge Board](https://github.com/mmicko/workshop_badge)
- [iCE40 UltraPlus Breakout Board](http://www.latticesemi.com/en/Products/DevelopmentBoardsAndKits/iCE40UltraPlusBreakoutBoard)

### General
- Add cs_CZ translation (by nerakino)
- Add nl_NL translation (by @elektor-labs)
- Use venv --always-copy flag only for Windows (#244)

## [0.3.3] - 2018-09-16
### General
- Check apio debug settings for dist
- Update fr_FR translation (#254, #272 by @pcotret)
- Add Alhambra II pinout SVG (#257 by @EladioDM)
- Update eu_ES translation (#262 by @Lorea-Aldabaldetreku)
- Add de_DE translation (#263 by @PhilippvK)
- Add `Bootloader not active` for TinyFPGA boards
- Add prompt for selecting the board at the beginning
- Add Live command output: `View > Command output`
- Fix `removeAllCollections` for one item
- Fix translations for info blocks
- Use collection-default 0.3.3
- Fix selection-box render for info blocks
- Load translations of the default collection
- Enable pointer events for `details` tag in Info block
- Propagate double click for selected blocks
- Update apio to 0.3.6
- Update gl_ES translation (#273 by @xoan)

## [0.3.3-rc] - 2018-08-17
### Memory address (#250)
- Add `Address format` combo (bin, dec, hex)
- Refactor forms
- Improve forms style

### External collections (#251)
- Add `Edit > Preferences > External collections` form
- Refactor `Select > Collections`:
    - Default collection
    - Internal collections
    - External collections
- Reload collection when a block/example is saved
- Improve collections load speed
- Allow symbolic linked dirs as collections

### Support for TinyFPGA BX
- Add TinyFPGA BX information (#232 by @tinyfpga)
- Auto install `tinyprog` programmer

### General
- Update fr_FR translation (#240 by @pcotret)
- Update gl_ES translation (#245 by @xoan)
- Update es_ES translation
- Fix check toolchain (#246 by @set-soft)
- Fix project.version on save
- Fix restore input form values
- Improve Memory block BLIF errors
- Improve select box size
- Disable undo/redo while adding blocks
- Add `View > Toolchain output`
- Show scroll only on focus
- Refactor `Edit > Preferences > Board rules` menu
- Refactor `Select > Boards` menu
- Update documentation

## [0.3.3-beta] - 2018-05-24
### Support Alhambra II (#227)
- Add PCF
- Add pinout
- Use Apio 0.3.3

### File format!
- New version 1.2
- Add Memory block
- No state (zoom, pan) information
- Improve version check. Add update message

### Memory block (#233)
- Add Basic > Memory block
- Contains: name + local flag + editor
- Exportable as a parameter
- Resizable block
- Use Verilog syntax highlight
- Generate an internal "list" file

### Improve Info block (#235)
- Add syntax highlight
- Render checkbox task list
- Improve render font size
- Improve rendering: fix tables

### General
- Fix installation bug Mac (#237)
- Improve block connectors (#223)
- Update eu_ES translation (#221 by @Lorea-Aldabaldetreku)
- Add Collections > Reload function
- Rotate constant port labels
- Wires avoid port labels :D
- Allow any character for I/O/Constant/Memory block names
- Improve findBlockInArea function
- Disable events in ports
- Improve toolchain status check
- Fix driver installer for Windows
- Update driver instructions for Windows (#208)
- Merge documentation repo in `docs` directory
- Blocks style (#238)
  - Allow empty names: optimize size
  - Increase blocks interactive border
  - Refactor header for I/O/Constant/Memory blocks
  - Improve blocks replacement

## [0.3.2] - 2018-04-14
- Fix drivers configuration for Windows
- Fix "profile not found" message
- Add Python packages management
- Add Chinese translation (#212 by @VladimirDuan)
- Install scons package from apio
- Update fr_FR translation (#216 by @pcotret)
- Update ca_ES translation (#217 by @fsayas)
- Update virtualenv package to v15.2.0
- Add virtualenv "--always-copy" option to avoid symlink issues
- Improve tmp build_dir management
- Allow Chinese chars in I/O/Constant blocks
- Improve blocks edition alerts
- Center replaced blocks
- Fix undo/redo bug with ace-builds v1.2.9


## [0.3.2-beta] - 2018-02-03
- Update fr_FR translation (#181 by @pcotret)
- Add Kefir I SVG pinout (#182, #183 by @set-soft)
- Update Icezum Alhambre SVG pinout (by @obijuan)
- Add Breakout Board HX8K SVG pinout (#186 by @yomboprime)
- Update gl_ES translation (#188 by @danyd)
- Serial drivers (#192)
  - Refactor drivers configuration
  - Install drivers for the selected board (FTDI/Serial/None)
- Improve **Info block**
  - Fix zoom and font family
  - Add support for emoji and web links
  - Avoid interaction with wires
  - Toogle info block with double-click
- Add **Drag & Replace** blocks (#198)
- Add FFs and LUTs to FPGA resources (#199)
- Optimize FPGA resources detection
- Style improvements

### Support for TinyFPGA B2 (#193)
- Add TinyFPGA B2 information (#185 by @tinyfpga)
- Detect `bootloader` and `disconnected` errors
- Auto install `tinyfpgab` programmer

### Support for BlackIce (#195)
- Add BlackIce I information
- Add BlackIce II information
- Auto install `blackiceprog` programmer


## [0.3.1] - 2017-11-01
- Add *iCE40-HX8K Breakout Board* SVG pinout (#173 by @yomboprime)
- Add `FPGA resources` section (#177)
  - View > FPGA resources
  - Show used/total resources for each board
- Update modals' style
- Add more *Kéfir I iCE40-HX4K* pins (#178 by @set-soft)
- Update Basque translation (#179 by @Lorea-Aldabaldetreku)
- Add *Olimex iCE40HX8K-EVB* pinout (#180 by @brianredbeard)
- Improve `Basic menu` style (fix for Mac OS)
- Detect yosys libffi error
- Fix cursor padding on zoom
- Improve menu auto show/hide behavior


## [0.3.1-rc] - 2017-10-15
- Use zip instead of tar.gz (internal toolchain)
- Add `Project information` changes to undo stack
- Add clickable notification to install the toolchain
- Fix setup drivers in Linux from AppImage (#163)
- Refactor read/save files using Promises
- Check toolchain version on init
- Move up `Project information` menu option
- Export BLIF, ASC and Bitstream files
- Refactor apioRun using Promises
- Show/Hide tooltip in the selected blocks
- Allow enter in the selected blocks
- Remove `Reset view` menu option
- Improve footer: better breadcrumbs collapse
- Fix blocks offset on created
- Change header/footer colors
- Improve `endmodule` error detection in code blocks
- Detect errors in constant blocks
- Reset warning/error notifications
- Improve `toolchain install` notifications
- Add `setup drivers` clickable message before toolchain install
- Improve close alert
- Explicit include `.list` files in code blocks
- Use tmp build directories for each open window
- Improve menu show/hide/click behavior
- Update spanish translations


## [0.3.0] - 2017-06-04
- Fix v/vh/list files installation from a collection
- Fix Python 32-bit in win32 installer (#153)
- Update eu_ES translations (#156 by @1138-4EB)
- Improve selected board/collection initialization
- Rearrange selected board/collection when lang changes
- Fix verilog errors detection in Windows
- Fix rules update on board change
- Enable code/info blocks scroll-zoom
- Improve clock render
- Enable Ctrl+U in code/info blocks
- Improve Verify errors
- Improve render style
- Fix content changes detection
- Check Alt key in shortcuts
- Update apio to 0.2.4:
  - Improve upload speed ~70%
- Fix restore I/O values on board change undo/redo
- Improve 'Project load' message
- Fix code block ports edition
- Check max bus size up to 96
- Update fr_FR translations (#159 by @pcotret)
- Update iCEstick IrDA_SD pin
- Update Default collection to 0.3.0
- Verify/Build/Upload optimization: run only if changed
- Show FPGA resources in upload command
- Improve code/info blocks zoom
- Update Icestudio logo


## [0.3.0-rc] - 2017-03-30
#### Collections
- Fix adding multiple collections files
- Install README.md, .v, .vh and .list files from a collection
- Save included files when a project is saved
- Install the "Default collection" with npm install
- Edit collection name on install
- Add View > Collection info: README viewer

#### Verilog error detection: [video](https://www.youtube.com/watch?v=Cv_ZxP_pJvs)
- Detect and parse iverilog errors
- Detect and parse yosys errors
- Mark Generic block errors
- Mark Code block errors
- Add warning/error annotations to Code blocks

#### General
- Fix Project Information SVG management
- Windows installer: separate 32/64 bit installation
- Add linux [un]installer scripts
- Update galician translation (#142 by @xoan)
- Update basque translation (#143 by @Lorea)
- Update basque translation (#144 by @1138-4EB)
- Add catalan translation (#145 by @fsayas)
- Create AppImage packaging (also [grunt-appimage](https://www.npmjs.com/package/grunt-appimage) plugin)
- Add "Remove selected blocks" using "Back" key
- Improve Mac OS drivers management ([More information](https://github.com/FPGAwars/apio/wiki/FTDI-Drivers-flowchart-Mac-OS))
- Open Homebrew website when the notification is clicked
- Draw "Remove wire tool" at the end of the wire
- Package windows_(x86|amd64) toolchains
- Refactor mouse interaction ([More information](https://github.com/FPGAwars/icestudio/wiki))
- Improve blocks creation (move and click)
- Update french translation (#148 #149 #150 #151 by @pcotret)
- Add "missing xclip" notification
- Avoid to close menu on click
- Fit desing to window: open project and resize
- Apply translations to Info blocks
- Disabe Code/Info selection on blur
- Add Readonly property to Info block
- Add "language change" to the undo stack
- Update es_ES translation


## [0.3.0-beta3] - 2017-02-14
#### Create Windows installer
- Uninstall previous version if required
- Install Python 2.7 if required
- Install Icestudio app
- Install Icestudio shortcut
- Register .ice files: open in Icestudio with double-click
- Uninstaller: remove toolchain, profile or collections

#### Add Board rules
- Output rules:
  - Initialize not used ports contained in the rules
- Input rules:
  - Applied to Code/Generic input ports
  - Detect not connected ports contained in the rules
  - Render port connection rule
- Add Edit > Preferences > Board rules > Enable/Disable
- Add View > Board rules
- Update rules on board change

#### Update Collections
- New structure:
  - blocks
  - examples
  - locale
  - package.json
- Validate collection before install
- Add File > Blocks section
- Recursive load of blocks and examples
- Manage translations for installed collections

#### General
- Update eu_ES translation (#129 by @Lorea-Aldabaldetreku)
- Store current board in the profile
- Filter Input & Output pins in the I/O blocks options
- Toggle selected block with right-click
- Add "Show clock" option in the Input blocks
- Refactor Shortcuts system
- Add Shorcuts for Mac OS X
- Group "keyboard arrow steps" in time
- Add resizer tool to Code/Info blocks
- Style improvements
- Manage paths with spaces and non-ASCII characters
- Add menu Select > Boards/Collections
- Bugfix verilog compiler: self-connected wires
- Apply zoom to Code/Info blocks content
- Paste on multiple Icestudio windows (copy also wires)
- Remember old port connections after Code block edition
- Detect project board on load
- Save profile when an attribute is set
- Update es_ES translation

Thanks to **Patripi** for the feedback and suggestions!


## [0.3.0-beta2] - 2017-01-20
### Upgrade Edit menu
- Add Edit > Undo/Redo. Detect the following actions:
  - Add or remove a block
  - Add or remove a wire
  - Move a block or a blocks selection
  - Edit an I/O block: name, type and value
  - Edit a Constant block: name, type and value
  - Edit a Code block: ports, parameters and content
  - Edit an Information block: content
  - Change the board
- Add Edit > Cut
- Add Edit > Copy
- Add Edit > Paste
- Add Edit > Select all
- Add Edit > Fit content

### Multiple windows
- File > New: launch a new window
- File > Open: launch a new window if required
- File > Examples: launch a new window if required
- Add argument to the application: eg: ./icestudio /path/to/project.ice
- Show project changed state

### New project format 1.1
- Improve dependency management
- Update compiler to 1.1
- Add backwards compatibility (1.0, 0)

### Add collections
- Add Tools > Collections > Add
- Add Tools > Collections > Remove
- Add Tools > Collections > Remove all
- Add View > Collections

### General
- Update eu_ES translation (#121 by @Lorea-Aldabaldetreku)
- Add block tooltips (package.description)
- Add more _shortcuts_ (https://github.com/FPGAwars/icestudio/wiki)
- Improve blocks selection
- Move blocks selection with the arrow keys
- Minor style improvements
- Update blocks, examples and samples
- Change !"Virtual port" to "FPGA pin"
- Improve Basic menu style
- Light resources load on start (examples, blocks)
- Package without ZIP compression (Improve start performance on Windows)
- Remove unnecessary .so and .dll files from packaging
- Update POT file and es_ES translation


## [0.3.0-beta] - 2016-12-23
### Constant block
- Add constant blocks
- Add local parameter flag
- Add parameters to Code blocks
- Add parameters to Generic blocks

### Project format
- New project format: version 1.0
- Insert compresed SVG in the project (using [SVGO](https://github.com/svg/svgo))
- Refactor project management: new project.service
- Add Edit > Preferences > Project information prompt
- Open, Save, Reset and pre-visualize the SVG image
- Update all compilers to new project format
- Backwards compatibility: notify and update "Old projects"

### Bus wires support
- Add Input/Output bus: using [x:y] notation
- Add Code block ports bus: using [x:y] notation
- Refactor blocks management: blocks service
- Update all compilers for bus wires management
- Prevent different wire size connections
- Add bus wires to Generic blocks

### General
- Update french translation (#110 by @Martoni)
- Add debouncer block (by @Obijuan)
- Add invalid connection notifications
- Remove templates (not used)
- Update bower dependencies
- Install libffi in Mac OS drivers configuration (thanks **Patripi**!)
- Sort Input/Output ports by position (x,y)
- Add File > Quit
- Check source code using JSHint
- Add contador (#118 by @C47D)
- Add virtual I/O ports (green)
- Check wrong port names
- Bug fixes and visual improvements
- Update examples and blocks to new project format
- Add project samples
- Update POT file and es_ES translation


## [0.2.3] - 2016-12-01
- Detect system language
- Add iCE40-HX8K PCF pinout (#103 by @Democrito)
- Add multiple input prompt in Code block dialog
- Add warning notifications for invalid connections
- Add FPGA used resources notification
- Improve Verilog compiler
- Synchronize included files from a "Imported block"
- Fix translations in dialog buttons
- Add back link in block examination
- Add selected board in the footer
- Improve notifications: errors up to 30s
- Fix Code block shortcuts (Mac OS)
- Remove block using "Back" key (Mac OS)
- Include a base directory in the zip packages (#107)
- Remove grid: canvas truncate problem
- Add Ctrl+p to take a snapshot
- Add dot bifurcations in wires
- Fix SVG Pinout viewer (Windows)
- Little update in French translation (#109 by @pcotret)
- Minor style improvements and bug fixes

Thanks to **AlexTC** for the feedback and suggestions!


## [0.2.3-beta] - 2016-11-21
- Improve development mode
- Add osx32 package
- Add Config > Tri-state block (#91 by @set-soft)
- Add French translation (#92 by @Martoni)
- Reorder File > Export menu
- Add grunt toolchain task to generate standalone distributions
- Add Toolchain > Reset default
- Add apio min/max version
- Add [Travis-ci packaging](https://travis-ci.org/FPGAwars/icestudio)
- Add [Travis-ci deployment](https://travis-ci.org/FPGAwars/icestudio)
- Reorder examples by board
- Update IceZUM Alhambra examples
- Remove \_build dir on start
- Add Apio version in Tools > Toolchain
- Refactor boards management
- Add View > PCF
- Add View > Pinout (SVG)
- Add View > Datasheet (url)
- Reorder Edit > Preferences
- Improve Drivers > Enable in Mac (thanks **AlexTC**)
- Improve translation system: using PO files


## [0.2.2] - 2016-11-10
- Add Hex 7 Segments CC (#80 by @C47D)
- Add Hex 7 Segments CA (#81 by @C47D)
- Support [Kefir I](http://fpgalibre.sourceforge.net/Kefir/index.html) board (@set-soft)
- Add `default_nettype none` to generated verilog files
- Add Icestudio headers to generated files
- Add verilog header (.vh) files inclusion
- Add File > Export testbench
- Add File > Export GTKWave
- Compatible with apio-debian (#87 by @set-soft)
- Add Tools > Enable/Disable drivers for Linux, Mac and Windows
- Install gtkwave toolchain package (only for Windows)
- Update spanish translation
- Improve internet connection detection
- Add iceblink40 pinout (#90 by @Democrito)
- Minor fixes Windows and Mac OSX
- Use apio version [0.1.9, 0.2.0)


## [0.2.1] - 2016-09-12
- Add mux/demux blocks (#66 by @C47D)
- Add pull-up/pull-up-inv blocks (#67 by @C47D)
- Add FF blocks (#75 by @C47D)
- Add full Spanish translation
- Add Galician translation (#73 by @xoan)
- Add Basque translation (#74 by @Obijuan)
- Improve block examination
- Add verilog files inclusion
- Remote host execution: Edit > Remote hostname
- Optimize json files size for distribution
- Support [iCE40-HX8K board](http://www.latticesemi.com/Products/DevelopmentBoardsAndKits/iCE40HX8KBreakoutBoard.aspx) (#68 by @C47D)
- Support [icoBOARD 1.0](http://icoboard.org/icoboard-1-0.html)


## [0.2.0] - 2016-08-11
- Edit > Language: English, Spanish
- Add more logic gates
- Add logo
- Add dmg packaging
- Check input-config connections
- Recursive resources detection
- Sync list files
- Optimize >30% packages size
- Minor GUI improvements
- Increase apio exec maxBuffer


## [0.2.0-beta2] - 2016-07-20
- Add grid, pan (left-click) and zoom (wheel).
- Add selection tool (right-click).
- Improve blocks and wires appearance.
- Improve blocks and wires behavior.
- Add basic > info block.
- Edit code block ports by double-click.
- File menu: add basic examples.
- File menu: add templates.
- File menu: Export verilog and PCF.
- Edit menu: Add Image path.
- Add View menu and Reset view item.
- Tools menu: add verify (uses apio > icarus verilog).
- Tools menu: improve toolchain installation.
- Add config block: input-config (pullup).


## [0.2.0-beta1] - 2016-06-29
- Rewrite all the application using:
  - nodejs
  - angularjs
  - jquery
  - grunt
  - bower
- GUI refactor using:
  - nwjs
  - jointjs
  - alerfityjs
  - bootstrap
  - ace editor
  - select2
- File menu: add new project
- File menu: add open project
- File menu: add examples
- File menu: add save
- File menu: add save as
- File menu: add import block
- File menu: add export as block
- Edit menu: add clear graph
- Edit menu: add clone selected + shortcut
- Edit menu: add remove selected + shortcut
- Boards menu: support multiple boards:
  - iCEstick
  - Icezum
  - Go board
- Tools menu: add build
- Tools menu: add upload
- Tools menu: add install toolchain:
  - Install and create a Python virtualenv
  - Install apio
  - Install system, scons, icestorm
- Tools menu: add remove toolchain
- Help menu: add view license
- Help menu: add documentation
- Help menu: add source code
- Help menu: add community forum
- Help menu: add about Icestudio
- Basic blocks:
  - code: contains a verilog editor
  - input & output: contains a FPGA I/O pin selector
- Bit blocks: 0, 1
- Logic blocks: and, not, or
- Add block examination
- Add breadcrumbs to allow navigation
- Add multiplatform packaging using grunt


## [0.1.0] - 2016-03-09
- Prototype release
