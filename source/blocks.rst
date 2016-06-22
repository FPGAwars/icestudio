.. sec-blocks

Blocks
======

Definitions
-----------

Block
`````

A block is an entity with *input* and *output* ports composed by blocks.

Its *input* and *output* ports are defined from its *input* and *output* block instances.

Extension: **.iceb**

  .. image:: ../resources/block-definition.svg

  |

.. code-block:: json

   {
     "graph": {
       "blocks" : [],
       "wires": []
     },
     "deps" : {},
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
     }
   }


Wire instances
''''''''''''''

.. code-block:: json

   {
     "source": {
       "block": "",
       "port": ""
     },
     "target": {
       "block": "",
       "port": ""
     }
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
     "data": {
       "label": "a",
       "pin": {
         "name": "LED0",
         "value": 95
       }
     },
     "position": {
       "x": 0,
       "y": 0
     }
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
     "data": {
       "label": "o",
       "pin": {
         "name": "LED1",
         "value": 96
       }
     },
     "position": {
       "x": 0,
       "y": 0
     }
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
       "ports": {
         "in": [
           "a",
           "b"
          ],
          "out": [
            "o"
          ]
        }
     },
     "position": {
       "x": 0,
       "y": 0
     }
   }

Simple blocks
-------------

Simple blocks contain **only** basic blocks.
It has no dependencies.

**Example: driver low**

.. image:: ../resources/driver.low.svg

File: **driver/low.iceb**

.. code-block:: json

  {
    "graph": {
      "blocks": [
        {
          "id": "2e684aab-9f39-47a1-9af0-25969a6a908f",
          "type": "basic.code",
          "data": {
            "code": "// Driver low\n\nassign v = 1'b0;",
            "ports": {
              "in": [],
              "out": [
                "v"
              ]
            }
          },
          "position": {
            "x": 100,
            "y": 100
          }
        },
        {
          "id": "2d811451-4777-4f7b-9da2-67bb9bb9a71e",
          "type": "basic.output",
          "data": {
            "label": "o"
          },
          "position": {
            "x": 627,
            "y": 165
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "2e684aab-9f39-47a1-9af0-25969a6a908f",
            "port": "v"
          },
          "target": {
            "block": "2d811451-4777-4f7b-9da2-67bb9bb9a71e",
            "port": "in"
          }
        }
      ]
    },
    "deps": {}
  }

Complex blocks
--------------

Complex blocks contain **not only** basic blocks.

**Example: wrapper low**

.. image:: ../resources/wrapper.low.svg

File: **wrapper/low.iceb**

.. code-block:: json

  {
    "graph": {
      "blocks": [
        {
          "id": "c2d74062-f2b7-4935-aebe-bcd5fb40081a",
          "type": "driver.low",
          "data": {},
          "position": {
            "x": 100,
            "y": 100
          }
        },
        {
          "id": "eced7092-f887-4fac-9d0d-03bdbff56d3f",
          "type": "basic.output",
          "data": {
            "name": "x"
          },
          "position": {
            "x": 336,
            "y": 100
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "c2d74062-f2b7-4935-aebe-bcd5fb40081a",
            "port": "o"
          },
          "target": {
            "block": "eced7092-f887-4fac-9d0d-03bdbff56d3f",
            "port": "in"
          }
        }
      ]
    },
    "deps": {
      "driver.low": {
        "graph": {
          "blocks": [
            {
              "id": "2e684aab-9f39-47a1-9af0-25969a6a908f",
              "type": "basic.code",
              "data": {
                "code": "// Driver low\n\nassign v = 1'b0;",
                "ports": {
                  "in": [],
                  "out": [
                    "v"
                  ]
                }
              },
              "position": {
                "x": 100,
                "y": 100
              }
            },
            {
              "id": "2d811451-4777-4f7b-9da2-67bb9bb9a71e",
              "type": "basic.output",
              "data": {
                "name": "o"
              },
              "position": {
                "x": 627,
                "y": 165
              }
            }
          ],
          "wires": [
            {
              "source": {
                "block": "2e684aab-9f39-47a1-9af0-25969a6a908f",
                "port": "v"
              },
              "target": {
                "block": "2d811451-4777-4f7b-9da2-67bb9bb9a71e",
                "port": "in"
              }
            }
          ]
        },
        "deps": {}
      }
    }
  }
