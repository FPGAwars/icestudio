.. sec-project

Project
=======

Definition
----------

A project is a composition of blocks. It includes the FPGA board.

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
   "deps" : [],
 }

**Example: driver low**

.. image:: ../resources/driver.low.project.svg

File: **driver.low.ice**

.. code-block:: json
  :emphasize-lines: 27

  {
    "board": "icezum",
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
             "name": "o",
             "value": "LED0"
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

**Example: wrapper low**

.. image:: ../resources/wrapper.low.project.svg

File: **wrapper.low.ice**

.. code-block:: json
  :emphasize-lines: 19

  {
    "board": "icestick",
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
             "name": "x",
             "value": "D1"
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
