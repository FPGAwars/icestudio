.. sec-blocks

Blocks
======

Definitions
-----------

Block
`````

A block is an entity with *input* and *output* ports composed by blocks.

Its *input* and *output* ports are defined from its *input* and *output* block instances.

Extension: **.iceblock**

  .. image:: ../resources/block-definition.svg

  |

.. code-block:: json

   {
     "graph": {
       "blocks" : [],
       "wires": []
     },
     "deps" : [],
   }

Block instances
'''''''''''''''

.. code-block:: json

   {
     "id": "",
     "type": "",
     "data": {},
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

Input instance
``````````````

This special block is used to define input blocks in a project.
It has one output port named 'out'.

.. image:: ../resources/basic-input.svg

.. code-block:: json

   {
     "id": "",
     "type": "basic.input",
     "data": { "name": "a" },
     "position": { "x": 0, "y": 0 }
   }

Output instance
```````````````

This special block is used to define output blocks in a projects.
It has one input port named 'in'.

.. image:: ../resources/basic-output.svg

.. code-block:: json

   {
     "id": "",
     "type": "basic.output",
     "data": { "name": "o" },
     "position": { "x": 0, "y": 0 }
   }

Code instance
`````````````

This special block is used to define verilog code in a block.
It has input and output ports defined in *value.ports* field.

.. image:: ../resources/basic-code.svg

.. code-block:: json

   {
     "id": "",
     "type": "basic.code",
     "data": {
       "code": "// And gate\n\nassign o = a & b;\n",
       "ports": { "in": ["a", "b"], "out": ["o"] }
     },
     "position": { "x": 0, "y": 0 }
   }

Simple blocks
-------------

Simple blocks contain **only** basic blocks.
It has no dependencies.

**Example: driver low**

.. image:: ../resources/driver.low.svg

File: **driver.low.iceblock**

.. code-block:: json

   {
     "graph" : {
       "blocks": [
          {
            "id": "85c862ec-e84d-44ac-b0bc-e0345389298b",
            "type": "basic.code",
            "data": {
              "code": "assign v = 1'b0;",
              "ports": {
                "in": [],
                "out": [
                  "v"
                ]
              }
            },
            "position": {
              "x": 10,
              "y": 10
            }
          },
          {
            "id": "438779b9-2e6a-41b4-8972-4085ce871f14",
            "type": "basic.output",
            "data": {
              "name": "o"
            },
            "position": {
              "x": 50,
              "y": 20
            }
          }
       ],
       "wires": [
         {
           "source": {
             "block": "85c862ec-e84d-44ac-b0bc-e0345389298b",
             "port": "v"
           },
           "target": {
             "block": "438779b9-2e6a-41b4-8972-4085ce871f14",
             "port": "in"
           }
         }
       ]
     },
     "deps": []
   }

Complex blocks
--------------

Complex blocks contain **not only** basic blocks.

**Example: wrapper low**

.. image:: ../resources/wrapper.low.svg

File: **wrapper.low.iceblock**

.. code-block:: json

  {
    "graph" : {
      "blocks": [
         {
           "id": "2578d60a-d3de-4567-932c-3d32cb0449cb",
           "type": "driver.low",
           "data": {},
           "position": {
             "x": 10,
             "y": 10
           }
         },
         {
           "id": "a8bcf1d4-2ecf-4cc9-80da-60a0c65d7762",
           "type": "basic.output",
           "data": {
             "name": "x"
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
            "block": "2578d60a-d3de-4567-932c-3d32cb0449cb",
            "port": "o"
          },
          "target": {
            "block": "a8bcf1d4-2ecf-4cc9-80da-60a0c65d7762",
            "port": "in"
          }
        }
      ]
    },
    "deps": [
      {
        "driver.low": {
          "graph" : {
            "blocks": [
               {
                 "id": "85c862ec-e84d-44ac-b0bc-e0345389298b",
                 "type": "basic.code",
                 "data": {
                   "code": "assign v = 1'b0;",
                   "ports": {
                     "in": [],
                     "out": [
                       "v"
                     ]
                   }
                 },
                 "position": {
                   "x": 10,
                   "y": 10
                 }
               },
               {
                 "id": "438779b9-2e6a-41b4-8972-4085ce871f14",
                 "type": "basic.output",
                 "data": {
                   "name": "o"
                 },
                 "position": {
                   "x": 50,
                   "y": 20
                 }
               }
            ],
            "wires": [
              {
                "source": {
                  "block": "85c862ec-e84d-44ac-b0bc-e0345389298b",
                  "port": "v"
                },
                "target": {
                  "block": "438779b9-2e6a-41b4-8972-4085ce871f14",
                  "port": "in"
                }
              }
            ]
          },
          "deps": []
        }
      }
    ]
  }
