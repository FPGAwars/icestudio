.. _userguide:

User Guide
==========

.. image:: ../resources/images/userguide/main.png

Menu
----

File
````

+-----------------+----------------------------------------------+--------------+-----------+
|     Action      |                 Description                  |   Shorcuts   |  Mac OS   |
+=================+==============================================+==============+===========+
|       New       |             Create a new window              |    Ctrl+N    |    ⌘+N    |
+-----------------+----------------------------------------------+--------------+-----------+
|     Open...     |                Open a project                |    Ctrl+O    |    ⌘+O    |
+-----------------+----------------------------------------------+--------------+-----------+
|     Blocks      | Open the blocks from the selected collection |              |           |
+-----------------+----------------------------------------------+--------------+-----------+
|    Examples     |Open the examples from the selected collection|              |           |
+-----------------+----------------------------------------------+--------------+-----------+
| Add as block... |           Add a project as a block           |              |           |
+-----------------+----------------------------------------------+--------------+-----------+
|      Save       |           Save the current project           |    Ctrl+S    |    ⌘+S    |
+-----------------+----------------------------------------------+--------------+-----------+
|   Save as...    |       Save the current with a new name       | Ctrl+Shift+S | Shift+⌘+S |
+-----------------+----------------------------------------------+--------------+-----------+
|    Export...    |         Export multiple output files         |              |           |
+-----------------+----------------------------------------------+--------------+-----------+
|      Quit       |            Close the application             |    Ctrl+Q    |    ⌘+Q    |
+-----------------+----------------------------------------------+--------------+-----------+

.. note::

  The exportable files are: Verilog, PCF, Testbench, GTKWave, BLIF, ASC and Bitstream

Edit
````

+---------------------+---------------------------------+-----------------------+-----------------+
|   Action            |           Description           |       Shortcut        |     Mac OS      |
+=====================+=================================+=======================+=================+
|    Undo             |      Undo the last change       |        Ctrl+Z         |       ⌘+Z       |
+---------------------+---------------------------------+-----------------------+-----------------+
|    Redo             |      Revert the last undo       | Ctrl+Y | Ctrl+Shift+Z | ⌘+Y | Shift+⌘+Z |
+---------------------+---------------------------------+-----------------------+-----------------+
|     Cut             |       Cut selected blocks       |        Ctrl+X         |       ⌘+X       |
+---------------------+---------------------------------+-----------------------+-----------------+
|    Copy             |      Copy selected blocks       |        Ctrl+C         |       ⌘+C       |
+---------------------+---------------------------------+-----------------------+-----------------+
|    Paste            |       Paste copied blocks       |        Ctrl+V         |       ⌘+V       |
+---------------------+---------------------------------+-----------------------+-----------------+
| Select all          |      Select all the blocks      |        Ctrl+A         |       ⌘+A       |
+---------------------+---------------------------------+-----------------------+-----------------+
| Fit content         | Fit the content into the screen |        Ctrl+1         |       ⌘+1       |
+---------------------+---------------------------------+-----------------------+-----------------+

Preferences
'''''''''''

**Language**

The supported languages are:

* English
* Spanish
* French
* Chinese
* Galician
* Basque
* Catalan

**Board rules**

Enable or disable globally the board rules. These rules allow to automate tasks such as default port connections or default pin values. For example, the IceZUM Alhambra rules are:

* All not connected "clk" ports are connected to the internal CLK signal.
* All not used LEDs are turned off.

More information in the `Board rules section <./rules.html>`_.

**External collections**

Set the external collections path in your system. This absolute route should contain Icestudio collections (directories or symbolic links to directories) that will be loaded as external collections.

**Remote hostname**

Set the hostame of a remote device with an FPGA board connected. The format is user@host. For example, pi@192.168.0.22. Verify, Build and Upload functions will be executed in this host, that must have apio pre-configured.

Project information
'''''''''''''''''''

Contains all the information about the project:

  .. image:: ../resources/images/userguide/project-info.png

  |

* Name: project name
* Version: version number
* Description: information shown in the block tooltip
* Author: creator of the project
* Image: SVG shown in the block body


View
````

+-----------------+----------------------------------------------+
|   Action        |             Description                      |
+=================+==============================================+
|     PCF         |       Show the board PCF file                |
+-----------------+----------------------------------------------+
|    Pinout       |      Show the board SVG pinout               |
+-----------------+----------------------------------------------+
|  Datasheet      | Open a web browser with the board datasheet  |
+-----------------+----------------------------------------------+
| Board rules     |         Show the current board rules         |
+-----------------+----------------------------------------------+
| Collection info |   Show the current collection README file    |
+-----------------+----------------------------------------------+
| Command output  |Show the output of the latest executed command|
+-----------------+----------------------------------------------+
| FPGA resources  |     Show / Hide the used FPGA resources      |
+-----------------+----------------------------------------------+


Select
``````

**Board**

Select the FPGA board. The supported boards are:

HX1K

* `IceZUM Alhambra <https://github.com/FPGAwars/icezum>`_
* `Nandland Go board <https://www.nandland.com/goboard/introduction.html>`_
* `iCEstick Evaluation Kit <http://www.latticesemi.com/icestick>`_

HX8K

* `Alhambra II <https://github.com/FPGAwars/Alhambra-II-FPGA>`_
* `BlackIce <https://hackaday.io/project/12930-blackice-low-cost-open-hardware-fpga-dev-board>`_
* `BlackIce II <https://github.com/mystorm-org/BlackIce-II>`_
* `icoBOARD 1.0 <http://icoboard.org/icoboard-1-0.html>`_
* `Kéfir I iCE40-HX4K <http://fpgalibre.sourceforge.net/Kefir/>`_
* `iCE40-HX8K Breakout Board <http://www.latticesemi.com/en/Products/DevelopmentBoardsAndKits/iCE40HX8KBreakoutBoard>`_

LP8K

* `TinyFPGA B2 <https://tinyfpga.com/b-series-guide.html>`_
* `TinyFPGA BX <https://tinyfpga.com/bx/guide.html>`_

UP5K

* `iCEBreaker <https://github.com/icebreaker-fpga/icebreaker>`_
* `iCEBreaker bitsy <https://github.com/icebreaker-fpga/icebreaker>`_
* `UPDuino v1.0 <http://gnarlygrey.atspace.cc/development-platform.html#upduino>`_
* `UPDuino v2.0 <http://gnarlygrey.atspace.cc/development-platform.html#upduino_v2l>`_
* `FPGA 101 Workshop Badge Board <https://github.com/mmicko/workshop_badge>`_
* `iCE40 UltraPlus Breakout Board <http://www.latticesemi.com/en/Products/DevelopmentBoardsAndKits/iCE40UltraPlusBreakoutBoard>`_

When a board is selected all I/O block combos are updated and its current values reset.

.. hint::

  This information is stored in the `app/resources/boards` directory. In order to support a new board just create a new directory with the *info.json*, *pinout.pcf* and *pinout.svg* (optional) files with its information. The *pinout.json* file must be generated from the *pinout.pcf* using the *generator.py* script.

**Collection**

Select the Collection from the internal collections installed (from **Tools > Collections**) or the external collections (from **Edit > Preferences > External collections**).

.. image:: ../resources/images/userguide/collections.png

|

A collection is composed by **blocks** and **examples**. When a collections is selected, the following sections are updated with the collection content:

* File > Blocks
* File > Examples
* Menu blocks

.. note::

  The *Default collection* is always available, and contains the blocks and examples distributed within the application.

Tools
`````

+--------+----------------------------------------------------------------+----------+--------+
| Action |                          Description                           | Shortcut | Mac OS |
+========+================================================================+==========+========+
| Verify |                Check the generated verilog code                |  Ctrl+R  |  ⌘+R   |
+--------+----------------------------------------------------------------+----------+--------+
| Build  |            Synthesize the bitstream from the design            |  Ctrl+B  |  ⌘+B   |
+--------+----------------------------------------------------------------+----------+--------+
| Upload |  Synthesize (if required) and upload the bitstream to the FPGA |  Ctrl+U  |  ⌘+U   |
+--------+----------------------------------------------------------------+----------+--------+

Toolchain
'''''''''

+----------------+-----------------------------------------------------------------------------------+
|     Action     |                                    Description                                    |
+================+===================================================================================+
| Install/Update | Install a virtualenv, apio and the required apio packages. It requires Python 2.7 |
+----------------+-----------------------------------------------------------------------------------+
|     Remove     |                         Remove the toolchain directories                          |
+----------------+-----------------------------------------------------------------------------------+
| Reset default  |             Restore the default toolchain distributed within Icestudio            |
+----------------+-----------------------------------------------------------------------------------+
|  Apio version  |                           Show the current apio version                           |
+----------------+-----------------------------------------------------------------------------------+

Drivers
'''''''

+---------+------------------------------------------------------------------------+
| Action  |                              Description                               |
+=========+========================================================================+
| Enable  | Launch the FTDI drivers configuration. Each OS has a different process |
+---------+------------------------------------------------------------------------+
| Disable | Revert the FTDI drivers configuration. Each OS has a different process |
+---------+------------------------------------------------------------------------+

Collections
'''''''''''

+------------+---------------------------------------------+
|   Action   |                 Description                 |
+============+=============================================+
|    Add     | Add a ZIP file with one or more collections |
+------------+---------------------------------------------+
|   Reload   | Reload all the collections from the files   |
+------------+---------------------------------------------+
|   Remove   |       Remove the selected collection        |
+------------+---------------------------------------------+
| Remove all |         Remove all the collections          |
+------------+---------------------------------------------+

.. note::

  A collection is composed by **blocks** and **examples** sorted by categories (directories). The **package.json** file is required and contains information about the collection. The **locale** directory is optional and contains the translations for the blocks and examples. A collection has the following structure:

  .. code::

    Collection/
    ├── blocks/
    ├── examples/
    ├── locale/
    ├── LICENSE
    ├── package.json
    └── README.md


  A ZIP file of collections contains one or more *Collection directories* at the main level. A collection can be selected in **Select > Collections**.

  More information in the `Default collection <https://github.com/FPGAwars/collection-default>`_.

.. hint::

    When a ZIP file of collections is added to Icestudio, it is installed in `~/.icestudio/collections`.


Help
````

+-----------------+---------------------------------------------------+
|     Action      |                    Description                    |
+=================+===================================================+
|  View license   |    Open the Icestudio license in a web browser    |
+-----------------+---------------------------------------------------+
|     Version     |       Show the Icestudio current version          |
+-----------------+---------------------------------------------------+
|  Documentation  | Open the Icestudio documentation in a web browser |
+-----------------+---------------------------------------------------+
|   Source code   |  Open the Icestudio source code in a web browser  |
+-----------------+---------------------------------------------------+
| Community forum |     Open the FPGAwars forum in a web browser      |
+-----------------+---------------------------------------------------+
| About Icestudio |         Information about the application         |
+-----------------+---------------------------------------------------+



Blocks menu
-----------

Basic
`````

It contains the basic blocks:

* **Input**: show a dialog to insert the name and type of the input block.
* **Output**: show a dialog to insert the name and type of the output block.
* **Constant**: show a dialog to insert the name and type of the constant block.
* **Memory**: show a dialog to insert the name and type of the memory block.
* **Code**: show a dialog to insert the ports and parameters of the code block.
* **Information**: create an empty text box block.

.. note::

  **Input** and **output** ports can be set to **virtual**. Virtual ports are used to independent-FPGA projects.
  Also, they can be configured as a **bus** by adding the notation ``[x:y]`` to the port name.

.. note::

  **Constant** and **memory** blocks can be set to **local**. Local parameters are not exposed when the project is added as a block.

.. hint::

  Multiple **input**, **output**, **constant** and **memory** blocks can be created using the `comma` separator. For example: ``x, y, z`` will create 3 blocks with those names. FPGA I/O ports values are set in the block combo box. These values can be set by searching and also unset by doing click on the cross.
  Double click over **input**, **output**, **constant** or **memory** block allows to modify the block name and type.
  In **code** block ports definition, multiple *input* and *output* ports, and *parameters*, can be created also using the `comma` separator.


Blocks
``````

It contains all stored blocks sorted by categories. This menu is generated when the application starts. It can show the Default collection or any installed collection.

Design
------

This is the main panel. It contains the blocks and the wires.


Pan & Zoom
``````````

Pan is performed using the **Ctrl + mouse left button** or **mouse right button** over the background. Zoom is performed using **mouse wheel**.

.. image:: ../resources/images/userguide/pan-zoom.png


Select
``````

Block selection is performed with the **mouse left button**. Blocks can be **selected/unselected** individually using **Shift+left-click**. In addition, several blocks can be selected by a **selection box**. A selection is canceled when the background is **left-clicked**.

.. image:: ../resources/images/userguide/select.png

Move blocks
```````````

Any block or blocks selection can be moved in the design using the **mouse left button** over the block or the selection. Also a blocks selection can be moved with the **arrow keys**.

.. image:: ../resources/images/userguide/move.png

Resize text blocks
``````````````````

**Memory**, **Code**, and **Information** blocks can be resized with the resize tool in the **bottom-right corner** of the block.

.. image:: ../resources/images/userguide/resize.png

Block examination
`````````````````

Non-basic blocks can be read only examined by **double clicking** the block using the **mouse left button**. This is a recursive action. In order to go back, click on the **< back** link or press the **back key**.

During the examination, pan, zoom and code navigation are enabled. Also the 'Fit content' action.

.. image:: ../resources/images/userguide/examination.png

.. note::

  The examination path is stored in the **breadcrumbs**. This allows to go back to any previous block.


Verilog error detection
```````````````````````
The Verify, Build and Upload errors are captured and showed in the design with a notification.

.. image:: ../resources/images/userguide/error-notification.png

|

If the error comes from a Code block it is marked in red an inline annotation is set:

.. image:: ../resources/images/userguide/error-code-block.png

|

If the error comes from a Constant block it is marked in red.

.. image:: ../resources/images/userguide/error-constant-block.png

|

If the error comes from a Generic block it is marked in red.

.. image:: ../resources/images/userguide/error-generic-block.png

|

Undo/Redo
``````````

Icestudio allows to undo/redo the following actions:

* Add or remove a block.
* Add or remove a wire.
* Move a block or a blocks selection.
* Edit an I/O block: name, type and value.
* Edit a Constant block: name, type and value.
* Edit a Memory block: name, type, format and value.
* Edit a Code block: ports, parameters and content.
* Edit an Information block: type and content.
* Change the board.
* Change the language.
* Change the Project information: when undo/redo a Project information change, a clickable notification will appear to access the Project information section.

.. image:: ../resources/images/userguide/undo-project-information.png

|

Take a snapshot
---------------

Taking a **png** snapshot of the application is as easy as press **Ctrl+P**. A save dialog appears to set the name and the path of the captured image.
