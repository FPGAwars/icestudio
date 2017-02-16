.. _quickstart:

Quick Start
===========

Setup the toolchain
-------------------

Go to **Tools > Toolchain > Install**

.. image:: ../resources/images/quickstart/toolchain.png

`Apio <https://github.com/FPGAwars/apio>`_ backend will be installed, and all its needed `packages <https://github.com/FPGAwars/apio#apio-packages>`_.

Setup the drivers
-----------------

Connect your FPGA board and select **Tools > Drivers > Enable**. This operation requires **administrator privileges**.

.. image:: ../resources/images/quickstart/drivers.png

.. note::

    In Windows, an external application (Zadig) is launched to replace the existing FTDI driver of the **Interface 0** by **libusbK**.

    .. image:: ../resources/images/quickstart/zadig.png
        :align: center

Select your FPGA board
----------------------

Go to **Select > Board**

.. image:: ../resources/images/quickstart/board.png

Upload an example
-----------------

Go to **File > Examples > 1. Basic > 1. Led on**

.. image:: ../resources/images/quickstart/example.png

.. image:: ../resources/images/quickstart/1_led_on.png

Then, you can verify, build or upload the project in **Tools > Verify | Build | Upload**.

.. image:: ../resources/images/quickstart/upload.png

Here is the FPGA board with the **LED0** turned on.

.. image:: ../resources/images/quickstart/icezum.png
