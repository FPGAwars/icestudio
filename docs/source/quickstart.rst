.. _quickstart:

Quick Start
===========

Select your board
-----------------

The first time you open the application, you have to select your FPGA board.

.. image:: ../resources/images/quickstart/board-prompt.png

If you want to change the board, go to **Select > Board**

.. image:: ../resources/images/quickstart/board.png

Setup the toolchain
-------------------

Go to **Tools > Toolchain > Install**

.. image:: ../resources/images/quickstart/toolchain.png

`Apio <https://github.com/FPGAwars/apio>`_ backend and all its needed `packages <https://github.com/FPGAwars/apio#apio-packages>`_ will be installed. This operation does not require Internet connection.

Setup the drivers
-----------------

Connect your FPGA board and select **Tools > Drivers > Enable**. This operation requires **administrator privileges**.

.. image:: ../resources/images/quickstart/drivers.png

.. note::

    In Windows, an external application (Zadig) is launched to replace the existing FTDI driver of the **Interface 0** by **libusbK**.

    .. image:: ../resources/images/quickstart/zadig.png
        :align: center

    |

    In MacOS this operation requires Internet connection to allow `Homebrew` to install `libffi` and `libftdi` packages.

Upload a design
---------------

Go to **File > Examples > 1. Basic > 01. One LED**

.. image:: ../resources/images/quickstart/example.png

.. image:: ../resources/images/quickstart/01_one_led.png

Then, you can verify, build or upload the project in **Tools > Verify | Build | Upload**.

.. image:: ../resources/images/quickstart/upload.png

Here is the FPGA board with the **LED0** turned on.

.. image:: ../resources/images/quickstart/icezum.png
