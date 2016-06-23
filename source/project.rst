.. sec-project

Project
=======

Definition
----------

A project is a composition of blocks. It includes the FPGA board information.

Its *input* and *output* block instances have also the FPGA I/O values to allow the synthesis.

It can be exported as a block, by removing the FPGA board and I/O data.

Extension: **.ice**

.. code-block:: json

 {
   "board": "",
   "graph": {
     "blocks" : [],
     "wires": []
   },
   "deps" : {},
 }

Examples
--------

Example 1
`````````

**Driver low**

.. image:: ../resources/driver.low.project.svg

File: **driver/low.ice**

.. literalinclude:: ../examples/example1.json
   :language: json
   :emphasize-lines: 27

Example 2
`````````

**Wrapper low**

.. image:: ../resources/wrapper.low.project.svg

File: **wrapper/low.ice**

.. literalinclude:: ../examples/example2.json
   :language: json
   :emphasize-lines: 19
