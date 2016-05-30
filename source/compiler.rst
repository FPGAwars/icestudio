.. sec-compiler

Compiler
========

Output verilog structure:

1. Modules
2. Main module

   a. Wires
   b. Connections
   c. Nodes

Implementation
--------------

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: compiler.js
       :language: javascript
       :emphasize-lines: 17
       :linenos:

|

.. code-block:: bash

   node compiler.js

Examples
--------

Example 1
`````````

.. image:: ../resources/driver0.svg

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../examples/example1.json
       :language: json

    Generates

    .. literalinclude:: ../examples/example1.v
       :language: verilog

|

Example 2
`````````

.. image:: ../resources/and.svg

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../examples/example2.json
       :language: json

    Generates

    .. literalinclude:: ../examples/example2.v
       :language: verilog

|
