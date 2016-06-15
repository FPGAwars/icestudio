.. sec-blocks

Blocks
======

Definitions
-----------

Block
``````

Generic project definition. This entity can be synthesized in a FPGA, defining its I/O pins, or used in a more complex project as an aggregate.

  .. image:: ../resources/block-definition.svg

  |

  .. code-block:: json

     {
        "name": "",
        "label": "",
        "ports": {
           "in": [ { "id": "", "label": "" } ],
           "out": [ { "id": "", "label": "" } ]
        },
        "code": { }
     }

Block code
''''''''''

**Verilog**

  .. code-block:: json

     {
        "type": "verilog",
        "data" : "..."
     }

**Graph**

  .. code-block:: json

     {
        "type": "graph",
        "data" : { "blocks": [], "wires": [] }
     }

  Blocks: block instance.

    .. code-block:: json

       {
         "id": "", "type": "", "x": 0, "y": 0
       }

  Wires: connections. Block and port are the id keys of the element.

    .. code-block:: json

       {
          "source": { "block": "", "port": "" },
          "target": { "block": "", "port": "" }
       }

Basic blocks
------------

Input
`````

This special block is used to define input blocks in a block.

.. image:: ../resources/input.svg

.. code-block:: json

   {
      "name": "input",
      "label": "",
      "ports": {
         "in": [],
         "out": [ { "id": "out", "label": "" } ]
      }
   }


Output
``````

This special block is used to define input blocks in a block.

.. image:: ../resources/output.svg

.. code-block:: json

   {
      "name": "output",
      "label": "",
      "ports": {
         "in": [ { "id": "in", "label": "" } ],
         "out": []
      }
   }

Driver low
``````````

Set the wire to 0.

.. image:: ../resources/driver0.svg

.. code-block:: json

   {
      "name": "driver0",
      "label": "\"0\"",
      "ports": {
         "in": [],
         "out": [ { "id": "out", "label": "" } ]
      },
      "code": {
         "type": "verilog",
         "data" : "assign out = 1'b0;"
      }
   }

Driver high
```````````

Set the wire to 1.

.. image:: ../resources/driver1.svg

.. code-block:: json

   {
      "name": "driver1",
      "label": "\"1\"",
      "ports": {
         "in": [],
         "out": [ { "id": "out", "label": "" } ]
      },
      "code": {
         "type": "verilog",
         "data" : "assign out = 1'b1;"
      }
   }

Not
````

Inverter logic gate.

.. image:: ../resources/not.svg

.. code-block:: json

  {
     "name": "not",
     "label": "",
     "ports": {
        "in": [ { "id": "in", "label": "" } ],
        "out": [ { "id": "out", "label": "" } ]
     },
     "code": {
        "type": "verilog",
        "data" : "assign out = ! in;"
     }
  }

And
````
And logic gate.

.. image:: ../resources/and.svg

.. code-block:: json

  {
     "name": "and",
     "label": "",
     "ports": {
        "in": [ { "id": "a", "label": "" },
                { "id": "b", "label": "" } ],
        "out": [ { "id": "out", "label": "" } ]
     },
     "code": {
        "type": "verilog",
        "data" : "assign out = a & b;"
     }
  }

Examples
--------

Hello, block!
`````````````

This is the simplest block defined by a graph. It contains only one block with one port. The behavior is the same as the block *Driver high*.

.. image:: ../resources/high.svg

.. code-block:: json

   {
      "name": "high",
      "label": "HIGH",
      "ports": {
         "in": [],
         "out": [ { "id": "out", "label": "" } ]
      },
      "code": {
         "type": "graph",
         "data" : {
           "blocks": [
              { "id": "d1", "type": "driver1", "x": 10, "y": 10 },
              { "id": "out", "type": "output", "x": 30, "y": 20 }
           ],
           "wires": [
             {
               "source": { "block": "d1", "port": "out" },
               "target": { "block": "out", "port": "in" }
             }
           ]
         }
      }
   }

This block can be used in other graphs, by selecting the type "high".

.. image:: ../resources/high-in-graph.svg

Also, it can be synthesized in a FPGA, setting the *o1* value to a FPGA pin.

.. image:: ../resources/high-in-fpga.svg

Wrapping blocks
```````````````

This block is a wraper of the block *and*.

.. image:: ../resources/and-wraper.svg

.. code-block:: json

   {
      "name": "and_wraper",
      "label": "AND",
      "ports": {
         "in": [ { "id": "x", "label": "" },
                 { "id": "y", "label": "" } ],
         "out": [ { "id": "out", "label": "" } ]
      },
      "code": {
         "type": "graph",
         "data" : {
           "blocks": [
              { "id": "x", "type": "input", "x": 0, "y": 5 },
              { "id": "y", "type": "input", "x": 0, "y": 25 },
              { "id": "a", "type": "and", "x": 10, "y": 10 },
              { "id": "out", "type": "output", "x": 30, "y": 20 }
           ],
           "wires": [
             {
               "source": { "block": "x", "port": "out" },
               "target": { "block": "a", "port": "a" }
             },
             {
               "source": { "block": "y", "port": "out" },
               "target": { "block": "a", "port": "b" }
             },
             {
               "source": { "block": "a", "port": "out" },
               "target": { "block": "out", "port": "in" }
             }
           ]
         }
      }
   }

.. note::

   The main ports identifiers **x**, **y** and **out** are used in the input/output block ids.
