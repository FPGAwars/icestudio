.. sec-howto

How to...
=========

Install the toolchain
---------------------

1. **Install Python 2.7**

  .. warning::

    Windows users: DON’T FORGET to select Add python.exe to Path feature on the “Customize” stage.

2. **Launch the toolchain installation process**

  Go to **Tools > Toolchain > Install**. Be patient for the toolchain installation.

  .. image:: ../resources/images/howto/installtoolchain.png

|

.. note::

  When the toolchain is installed, the menu option changes to **Tools > Toolchain > Update**. Also, the toolchain can be restored to default in **Tools > Toolchain > Reset default**.

Update the toolchain
---------------------

1. **Connect to the Internet**

2. **Launch the toolchain updating process**

  Go to **Tools > Toolchain > Update**. Be patient for the toolchain update.

Install the drivers
-------------------

1. **Install the toolchain** (required for Windows)

2. **Enable the FTDI drivers**

  Go to **Tools > Drivers > Enable**. Each OS has a different process. This configuration requires administration privileges.

.. note::

  To revert the drivers configuration go to **Tools > Drivers > Disable**

Create a project
----------------

1. **Create a new project**

   Go to **Edit > New**, write your project's name and press OK.

   .. image:: ../resources/images/howto/new.png

|

2. **Add your blocks**

 1. *Input/Output blocks*

    Click on **Basic > Input** or **Basic > Output**, write the block's name and press OK or Enter.

    These blocks can be configured as **virtual** (green). Then, the FPGA pin selector won't be shown.

    Also, it can be configured as **buses** using the ``[x:y]`` notation (``x`` is the most significant bit).

    .. image:: ../resources/images/howto/io.png

 |

 2. *Constant blocks*

    Click on **Basic > Constant**, write the block's name and press OK or Enter.

    These blocks can be configures as **local**. Then, this parameter won't be exported.

    .. image:: ../resources/images/howto/constant.png

 |

 3. *Code blocks*

    Click on **Basic > Code**, add the code ports. Port names are separated by a comma. E.g.: ``a, b``.

    .. image:: ../resources/images/howto/code-prompt.png

    |

    This block contains a text editor to write your module in verilog code. Module header and footer are not required.

    .. image:: ../resources/images/howto/code.png

 |

 4. *Info blocks*

    Click on **Basic > Info**.

    This block contains a text editor to add comments about the project.

    .. image:: ../resources/images/howto/info.png

 |

 5. *Bit blocks*

    Click on **Bit > 0** or **Bit > 1**.

    These blocks are low and high logic drivers.

    .. image:: ../resources/images/howto/bit.png

 |

 6. *Config block*

    Click on **Config > Pull up / Pull up inv / Tri-state**.

    The *Pull up* block must be connected to input ports in order to configure a pull up in the FPGA.

    .. image:: ../resources/images/howto/config.png

 |

 7. *Logic blocks*

    Go to the **Logic** menu and select. This menu contains **Logic Gates**, **Combinational blocks** and **Sequential flip-flops**.

    .. image:: ../resources/images/howto/logic.png

|

3. **Connect your blocks**

.. image:: ../resources/images/howto/bwire.png

|

.. image:: ../resources/images/howto/wire.png

|

4. **Select your board**

   Go to **Boards** menu and select **Go board**, **iCE40-HX8K**, **iCEstick**, **Icezum Alhambra**, **icoBOARD 1.0** or **Kéfir I**.

   .. image:: ../resources/images/howto/board.png

|

5. **Set FPGA I/O pins**

   Select all Input/Output blocks' pins.

   .. image:: ../resources/images/howto/fpgapin.png

|

6. **Save the project**

   Go to **Edit > Save**:

   It will be saved as an **.ice** file.

   .. image:: ../resources/images/howto/save.png

|


Upload a bitstream
------------------

1. **Open a project**

   Go to **Edit > Open...** and select an **.ice** file.

   |

2. **Verify the project**

   Go to **Tools > Verify**.

   This option checks the generated verilog code using ``apio verify``.

   .. image:: ../resources/images/howto/verify.png

   |

3. **Build the project**

   Go to **Tools > Build**.

   This option generates a bitstream using ``apio build``.

   .. image:: ../resources/images/howto/build.png

   |

4. **Upload the project**

   Connect your FPGA board and press **Tools > Upload**. This option uses ``apio upload``.

   .. image:: ../resources/images/howto/upload.png

   |


Create a block
--------------

1. **Open a project**

   Go to **Edit > Open project** and select an **.ice** file.

|

.. image:: ../resources/images/howto/project.png

2. **Verify the project**

   Go to **Tools > Verify**.

|

2. **Add the project information**

   Go to **Edit > Preferences > Project information**.

   .. image:: ../resources/images/howto/project-info.png

   |

|

3. **Save the project**

   Go to **Edit > Save as...**.

   .. image:: ../resources/images/howto/saveas.png

   |

Add a project as block
----------------------

1. **Open or create a new project**

|

2. **Import the custom block**

   Go to **Edit > Add as block...** and select an **.ice** file.

   .. image:: ../resources/images/howto/addasblock.png

   |

   .. image:: ../resources/images/howto/customblock.png

   |

3. **Examine the custom block**

   Complex blocks can be examined by double clicking the block.

   .. image:: ../resources/images/howto/examine.png

   |

Include a list file
-------------------

If your code block contains a list file(s), for example:

.. code-block:: verilog

  $readmemh("rom.list", rom);

1. **Save the ice project**

2. **Copy the list file(s) in the project directory**

3. **Build and upload the project**

Include a verilog (header) file
-------------------------------

If your code block includes a verilog (header) file(s), for example:

.. code-block:: verilog

  // @include lib.vh
  // @include math.v

  `include "lib.vh"

1. **Save the ice project**

2. **Copy the verilog (header) file(s) in the project's directory**

3. **Build and upload the project**

Configure a remote host
------------------------

I you want to use a RPi, eg pi@192.168.0.22, or another computer from Icestudio as a client, first configure the host:

1. **Copy your SSH public key into the server**

  .. code-block:: bash

    $ ssh-keygen
    $ ssh-copy-id -i .ssh/id_rsa.pub pi@192.168.0.22

2. **Install apio in the server**

  .. code-block:: bash

    $ ssh pi@192.168.0.22
    $ sudo pip install -U apio
    $ apio install --all
    $ apio drivers --enable  # For FTDI devices

3. **Enter the host name in Icestudio, Edit > Remote hostname**

   .. image:: ../resources/images/howto/remotehost.png

   |

4. **Now, Verify, Build and Upload tools will run in the selected host**
