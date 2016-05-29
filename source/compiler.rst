.. sec-compiler

Compiler
========

Output verilog structure:

* Modules
* Main module
 * Wires
 * Connections
 * Nodes

Examples
--------

Driver low
``````````

This block:

.. image:: ../resources/driver0.png

.. code-block:: json

   {
      "name": "driver0",
      "label": "\"0\"",
      "connectors": {
         "input": null,
         "output": [ { "id": "out", "label": "" } ]
      },
      "code": {
         "type": "verilog",
         "data" : "assign out = 1'b0;"
      }
   }

Will generate this module:

.. code-block:: verilog

   module driver0 (output out);
   assign out = 1'b0;
   endmodule
