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
   "image": "",
   "state": {
     "pan": {
       "x": 0,
       "y": 0
     },
     "zoom": 1
   }
 }

Examples
--------

Low project
```````````

.. image:: ../resources/images/low-project.png

File: **low.ice**

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../resources/examples/low/low.ice
       :language: json

|

Not project
```````````

.. image:: ../resources/images/not-project.png

File: **not.ice**

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../resources/examples/not/not.ice
       :language: json

|

Or project
``````````

.. image:: ../resources/images/or-project.png

File: **or.ice**

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../resources/examples/or/or.ice
       :language: json

|

Cnot project
````````````

.. image:: ../resources/images/cnot-project.png

File: **cnot.ice**

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../resources/examples/cnot/cnot.ice
       :language: json

|

Dnot project
````````````

.. image:: ../resources/images/dnot-project.png

File: **dnot.ice**

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../resources/examples/dnot/dnot.ice
       :language: json

|
