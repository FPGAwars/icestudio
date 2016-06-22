.. sec-compiler

Compiler
========

The JSON structure of a project is a block definition.

Output verilog structure:

1. Modules
2. Main module

   a. Wires definition
   b. Wires connections
   c. Blocks instances

Implementation
--------------

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../code/compiler.js
       :language: javascript
       :linenos:

|

.. code-block:: bash

   node compiler.js

Examples
--------

Example 1
`````````

.. image:: ../resources/driver.low.project.svg

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../examples/example1.json
       :language: json

    Generates

    .. literalinclude:: ../examples/example1.v
       :language: verilog

    .. literalinclude:: ../examples/example1.pcf
       :language: verilog

|
