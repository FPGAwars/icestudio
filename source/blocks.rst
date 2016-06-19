.. sec-blocks

Blocks
======

Definitions
-----------

Block
`````

Generic project definition. This entity can be synthesized in a FPGA, defining its I/O pins, or used in a more complex project as an aggregate.

  .. image:: ../resources/block-definition.svg

  |

.. code-block:: json

   {
     "type": "",
     "data": {
       "blocks" : [],
       "wires": []
     }
   }

Block instances
'''''''''''''''

.. code-block:: json

   {
     "id": "",
     "type": "",
     "value": {},
     "position": { "x": 0, "y": 0 }
   }


Wire instances
''''''''''''''

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
It has one output port named 'out'.

.. image:: ../resources/basic-input.svg

.. code-block:: json

   {
     "id": "",
     "type": "basic.input",
     "value": { "name": "a" },
     "position": { "x": 0, "y": 0 }
   }

Output
``````

This special block is used to define input blocks in a block.
It has one input port named 'in'.

.. image:: ../resources/basic-output.svg

.. code-block:: json

   {
     "id": "",
     "type": "basic.output",
     "value": { "name": "o" },
     "position": { "x": 0, "y": 0 }
   }

Code
````

This special block is used to define verilog code in a block.
It has input and output ports defined in *value.ports* field.

.. image:: ../resources/basic-code.svg

.. code-block:: json

   {
     "id": "",
     "type": "basic.code",
     "value": {
       "ports": { "in": ["a", "b"], "out": ["o"] },
       "code": "// And gate\n\nassign out = a & b;\n"
     },
     "position": { "x": 0, "y": 0 }
   }

Simple blocks
-------------

Driver low
``````````

Set the wire to 0.

.. image:: ../resources/driver0.svg

.. code-block:: json

   {
     "type": "driver.low",
     "data" : {
       "blocks": [
          {
            "id": "85c862ec-e84d-44ac-b0bc-e0345389298b",
            "type": "basic.code",
            "value": {
              "ports": {
                "in": [],
                "out": [ "outpin" ]
              },
              "code": "assign outpin = 1'b0;"
            },
            "position": {
              "x": 10,
              "y": 10
            }
          },
          {
            "id": "438779b9-2e6a-41b4-8972-4085ce871f14",
            "type": "basic.output",
            "value": {
              "name": "out"
            },
            "position": {
              "x": 30,
              "y": 10
            }
          }
       ],
       "wires": [
         {
           "source": {
             "block": "85c862ec-e84d-44ac-b0bc-e0345389298b",
             "port": "outpin"
           },
           "target": {
             "block": "438779b9-2e6a-41b4-8972-4085ce871f14",
             "port": "in"
           }
         }
       ]
     }
   }

TODO:: continue update            V

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
