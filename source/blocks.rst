.. sec-blocks

Blocks
======

Definitions
-----------

**Block**

Generic project definition. This entity can be synthesized in a FPGA, defining its I/O pins, or used in a more complex project as an aggregate.

  .. image:: ../resources/block-definition.svg

.. code-block:: json

   {
      "name": "",
      "label": "",
      "connectors": {
         "input": [ { "id": "", "label": "" } ],
         "output": [ { "id": "", "label": "" } ]
      },
      "code": { }
   }

**Block code**

Verilog: pure verilog code.

.. code-block:: json

   {
      "type": "verilog",
      "data" : "..."
   }

Graph: nodes and connections.

.. code-block:: json

   {
      "type": "graph",
      "data" : { "nodes": [], "connections": [] }
   }

**Node**

Block instance.

.. code-block:: json

   {
     "id": "", "type": "", "x": 0, "y": 0
   }

**Connection**

.. code-block:: json

   {
      "source": { "nodeId": "", "connectorId": "" },
      "target": { "nodeId": "", "connectorId": "" }
   }

Basic blocks
------------

Input
`````

This special block is used to define input nodes in a block.

.. image:: ../resources/input.svg

.. code-block:: json

   {
      "name": "input",
      "label": "",
      "connectors": {
         "input": null,
         "output": [ { "id": "out", "label": "" } ]
      }
   }


Output
``````

This special block is used to define input nodes in a block.

.. image:: ../resources/output.svg

.. code-block:: json

   {
      "name": "output",
      "label": "",
      "connectors": {
         "input": [ { "id": "in", "label": "" } ],
         "output": null
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
      "connectors": {
         "input": null,
         "output": [ { "id": "out", "label": "" } ]
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
      "connectors": {
         "input": null,
         "output": [ { "id": "out", "label": "" } ]
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
     "connectors": {
        "input": [ { "id": "in", "label": "" } ],
        "output": [ { "id": "out", "label": "" } ]
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
     "connectors": {
        "input": [ { "id": "a", "label": "" },
                   { "id": "b", "label": "" } ],
        "output": [ { "id": "out", "label": "" } ]
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

This is the simplest block defined by a graph. It contains only one block with one connector. The behavior is the same as the block *Driver high*.

.. image:: ../resources/high.svg

.. code-block:: json

   {
      "name": "high",
      "label": "HIGH",
      "connectors": {
         "input": null,
         "output": [ { "id": "o", "label": "" } ]
      },
      "code": {
         "type": "graph",
         "data" : {
           "nodes": [
              { "id": "d1", "type": "driver1", "x": 10, "y": 10 },
              { "id": "o", "type": "output", "x": 30, "y": 20 }
           ],
           "connections": [
             {
               "source": { "nodeId": "d1", "connectorId": "out" },
               "target": { "nodeId": "o", "connectorId": "in" }
             }
           ]
         }
      }
   }

This block can be used in other graphs, by selecting the type "high".

.. image:: ../resources/high-in-graph.svg

Also, it can be synthesized in a FPGA,  setting the *o1* value to a FPGA pin.

.. image:: ../resources/high-in-fpga.svg

Wrapping blocks
```````````````

This block is a wraper of the block *and*.

.. image:: ../resources/and-wraper.svg

.. code-block:: json

   {
      "name": "and-wraper",
      "label": "AND",
      "connectors": {
         "input": [ { "id": "x", "label": "" },
                    { "id": "y", "label": "" } ],
         "output": [ { "id": "o", "label": "" } ]
      },
      "code": {
         "type": "graph",
         "data" : {
           "nodes": [
              { "id": "x", "type": "input", "x": 0, "y": 5 },
              { "id": "y", "type": "input", "x": 0, "y": 25 },
              { "id": "a", "type": "and", "x": 10, "y": 10 },
              { "id": "o", "type": "output", "x": 30, "y": 20 }
           ],
           "connections": [
             {
               "source": { "nodeId": "x", "connectorId": "out" },
               "target": { "nodeId": "a", "connectorId": "a" }
             },
             {
               "source": { "nodeId": "y", "connectorId": "out" },
               "target": { "nodeId": "a", "connectorId": "b" }
             },
             {
               "source": { "nodeId": "a", "connectorId": "out" },
               "target": { "nodeId": "o", "connectorId": "in" }
             }
           ]
         }
      }
   }

.. note::

   The main connectors identifiers **x**, **y** and **o** are used in the input/output nodes.
