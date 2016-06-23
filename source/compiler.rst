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

  npm install fs sha1

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

    .. literalinclude:: ../examples/example1.ice
       :language: json

    Generates

    .. literalinclude:: ../examples/example1.v
       :language: verilog

    .. literalinclude:: ../examples/example1.pcf
       :language: verilog

|

Example 2
`````````

.. image:: ../resources/wrapper.low.project.svg

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../examples/example2.ice
       :language: json

    Generates

    .. literalinclude:: ../examples/example2.v
       :language: verilog

    .. literalinclude:: ../examples/example2.pcf
       :language: verilog

|

Example 3
`````````

.. image:: ../resources/dwrapper.low.project.svg

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../examples/example3.ice
       :language: json

    Generates

    .. literalinclude:: ../examples/example3.v
       :language: verilog

    .. literalinclude:: ../examples/example3.pcf
       :language: verilog

|
