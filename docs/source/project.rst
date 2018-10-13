.. _project:

Project
=======

Definition
----------

* Version: 1.2.
* Package: project information.
* Design: board information and circuit design.
* Dependencies: all used dependencies in one level.

Extension: **.ice**

.. code-block:: json

    {
      "version": "1.2",
      "package": {
        "name": "",
        "version": "",
        "description": "",
        "author": "",
        "image": ""
      },
      "design": {
        "board": "",
        "graph": {
          "blocks": [],
          "wires": []
        }
      },
      "dependencies": {}
    }

Block instances
'''''''''''''''

.. code-block:: json

    {
      "id": "",
      "type": "",
      "data": {},
      "position": {
        "x": 0,
        "y": 0
      },
      "size": {
        "width": 0,
        "height": 0
      }
    }


Wire instances
''''''''''''''

Wire
~~~~

.. code-block:: json

    {
      "source": {
        "block": "",
        "port": ""
      },
      "target": {
        "block": "",
        "port": ""
      },
      "vertices": [
        {
          "x": 0,
          "y": 0
        }
      ]
    }

Bus
~~~

.. code-block:: json

    {
      "source": {
        "block": "",
        "port": ""
      },
      "target": {
        "block": "",
        "port": ""
      },
      "vertices": [
        {
          "x": 0,
          "y": 0
        }
      ],
      "size": 2
    }

Package
-------

* Name
* Version
* Description
* Author
* Image (SVG)

.. image:: ../resources/images/project/information.png

Samples
-------

1. in-out
'''''''''

.. image:: ../resources/images/project/in-out.png

|

File: **in-out.ice**

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../../samples/in-out.ice
       :language: json

|

2. not
''''''

.. image:: ../resources/images/project/not.png

|

File: **not.ice**

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../../samples/not.ice
       :language: json

|

3. mux
''''''

.. image:: ../resources/images/project/mux.png

|

File: **mux.ice**

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../../samples/mux.ice
       :language: json

|

4. assign
'''''''''

.. image:: ../resources/images/project/assign.png

|

File: **assign.ice**

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../../samples/assign.ice
       :language: json

|

5. complex
''''''''''

.. image:: ../resources/images/project/complex.png

|

File: **complex.ice**

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../../samples/complex.ice
       :language: json

|
