.. sec-gui

GUI
===

.. image:: ../resources/images/gui.png

Source code: https://github.com/fpgawars/icestudio

Menu
----

File
````

* **New project**: create a new project.
* **Open project**: show a file dialog to open a project (.ice).
* **Examples**: contains all stored examples. A example is loaded as a project.
* **Templates**: contains all stored templates. A template is loaded as a project.

* **Save**: save the current project (.ice).
* **Save as**: show a save file dialog to save the current project (.ice).

* **Import block**: load a block file (.iceb) into the current project.
* **Export as block**: show a save file dialog to export the current project as a block file (.iceb).

* **Export verilog**: show a save file dialog to export the current verilog code file (.v).
* **Export PCF**: show a save file dialog to export the current pcf file (.pcf).

.. note::

  When a project is exported as a block, all FPGA I/O information is removed.


.. hint::

  Examples and templates are stored in `app/resources/examples` and `app/resources/templates` respectively. To create a new examples/templates category just create a directory there. To create a new example/template copy and paste an **.ice** file.

Edit
````

* **Clear all**: remove all blocks and wires from the graph.
* **Clone selected**: clone the selected block. It can also be done with *Ctrl + c* key.
* **Remove selected**: remove the selected block. It can also be done with *Ctrl + x* and *Supr* keys.

* **Image path**: set the project's relative image path. This image will be shown in the exported block. For example, a valid value can be: 'resources/images/and.svg'.

* **Remote hostname**: set the hostame of a remote device with a FPGA board connected. The format is user@host. For example, pi@192.168.0.22. Verify, Build and Upload functions will be executed in this host, that must have apio pre-configured.

* **Language**: select the application language: English, Spanish, Galician, Basque. This selection is stored in the app profile.

View
````

* **Reset view**: reset pan and zoom to its default values.

Boards
``````
It contains the supported boards: **Icezum**, **Go board**, **iCEstick**, **iCE40-HX8K**, **icoBOARD 1.0**. When a board is selected all I/O block combos are updated and its current values removed.

.. hint::

  This information is stored in the `app/resources/boards` directory. To support a new board just create a new JSON file with its information. Also, a generator.py script has been created to generate the board JSON file from a PCF file.

Tools
`````

* **Verify**: check the generated verilog source code.
* **Build**: generate the bitstream from the graphic source.
* **Upload**: generate and upload the bitstream to the FPGA board.

* **Install/Upgrade toolchain**: install a python virtualenv in `.icestudio/venv`, apio and icestorm toolchain. It requires Python 2.7 installed and Internet connection.
* **Remove toolchain**: remove the directories `.icestudio` and `.apio`.

.. hint::

  Generated files are stored in the `_build` directory.

Help
````

* **View license**: open the Icestudio's license in a web browser.
* **Version**: show the current version.

* **Documentation**: open the Icestudio's documentation in a web browser.
* **Source code**: open the Icestudio's source code in a web browser.

* **Community forum**: open the FPGAwars forum in a web browser.

* **About Icestudio**: information about the application.

Blocks menu
-----------

Basic
`````

It contains the basic blocks:

* **Code**: code block. Ports are asked in a prompt dialog.
* **Info**: info block. Text box for comments and notes.
* **Input**: input block. Block name is asked in a prompt dialog.
* **Output**: output block. Block name is asked in a prompt dialog.

.. note::

  Multiple **input** and **output** blocks can be created using the `space` separator. For example: ``x y z`` will create 3 blocks with those names. FPGA I/O ports values are set in the block combo box. These values can be set by searching and also unset by doing click on the cross.
  Double click over **input** and **output** blocks allows to modify the block name.
  In **code** block ports definition, *input* and *output* ports are separated by a space. Port names are separated by ``,``. For example: ``a,b``: input a and b, ``a,b c``: input a and b, output c.
  Double click over **code** blocks allows to modify its *input* and *output* ports.

Stored blocks
`````````````

It contains all stored blocks sorted by categories. These menu is generated when the application starts.

.. hint::

  Blocks are stored in `app/resources/blocks`. To create a new block category just create a directory there. To create a new block copy and paste an **.iceb** file.


Graph
-----

This is the main panel. It contains the blocks and the wires.

Pan & Zoom
``````````

Pan is performed using the **mouse left button** over the background. Zoom is performed using **mouse wheel**. Both values can be reset in *View > Reset view*.

.. image:: ../resources/images/gui-pan-zoom.png


Select
``````

Block selection is performed using the **mouse right button**. Blocks can be selected/unselected individually using right-click/Ctrl+right-click, respectively. In addition, several blocks can be selected by a selection box. Selection is cancelled when the background is clicked.

.. image:: ../resources/images/gui-select.png


Blocks examination
``````````````````

Non-basic blocks can be read only examined by **double clicking** the block using the **mouse left button**. This is a recursive action.

During the examination, pan, zoom and code navigation are enabled.

.. image:: ../resources/images/gui-examination.png

.. note::

  The examination path is stored in the **breadcrumbs**. This allows you to go back to any previous block.
