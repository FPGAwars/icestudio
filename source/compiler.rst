.. sec-compiler

Compiler
========

JSON structure:

.. code-block:: json

   {
     "deps": [],
     "project": []
   }

Output verilog structure:

1. Modules
2. Main module

   a. Wires
   b. Nodes
   c. Connections

Implementation
--------------

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: compiler.js
       :language: javascript
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

Example 3
`````````

.. image:: ../resources/high.svg

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../examples/example3.json
       :language: json

    Generates

    .. literalinclude:: ../examples/example3.v
       :language: verilog

|
