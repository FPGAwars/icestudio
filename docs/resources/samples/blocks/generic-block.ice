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
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "5d1a5e30-fb31-499c-b139-309d303a630a",
          "type": "c35b3d1fbece910bf179442bbf5efe6f71a9291b",
          "position": {
            "x": 640,
            "y": 296
          },
          "size": {
            "width": 96,
            "height": 64
          }
        }
      ],
      "wires": []
    }
  },
  "dependencies": {
    "c35b3d1fbece910bf179442bbf5efe6f71a9291b": {
      "package": {
        "name": "Block",
        "version": "1.0",
        "description": "out = in ? C : D; p = q;",
        "author": "Jesús Arroyo",
        "image": ""
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "deddfc29-7bf1-4ac4-a24e-e91b4cc14335",
              "type": "basic.constant",
              "data": {
                "name": "C",
                "value": "4'b1111",
                "local": false
              },
              "position": {
                "x": 296,
                "y": 32
              }
            },
            {
              "id": "a9f85080-6523-428b-966c-359be16be956",
              "type": "basic.constant",
              "data": {
                "name": "D",
                "value": "4'b0000",
                "local": true
              },
              "position": {
                "x": 488,
                "y": 32
              }
            },
            {
              "id": "4aa2ce96-a449-42f1-b612-2c852dc50da8",
              "type": "basic.input",
              "data": {
                "name": "p"
              },
              "position": {
                "x": 680,
                "y": 64
              }
            },
            {
              "id": "7f5654cf-4591-4a66-9147-d0cbdcb95f79",
              "type": "basic.output",
              "data": {
                "name": "q"
              },
              "position": {
                "x": 896,
                "y": 64
              }
            },
            {
              "id": "fecaab8e-c7d4-4823-81fb-2b0d42f38026",
              "type": "basic.code",
              "data": {
                "code": "reg [3:0] b_aux;\n\nalways @(a)\nbegin\n  if (a == 1)\n    b_aux = C;\n  else\n    b_aux = D;\nend\n\nassign b = b_aux;\n",
                "params": [
                  {
                    "name": "C"
                  },
                  {
                    "name": "D"
                  }
                ],
                "ports": {
                  "in": [
                    {
                      "name": "a"
                    }
                  ],
                  "out": [
                    {
                      "name": "b",
                      "range": "[3:0]",
                      "size": 4
                    }
                  ]
                }
              },
              "position": {
                "x": 248,
                "y": 176
              }
            },
            {
              "id": "cbd336da-6d61-4c71-90e1-e11bbe6817fc",
              "type": "basic.input",
              "data": {
                "name": "in"
              },
              "position": {
                "x": 48,
                "y": 272
              }
            },
            {
              "id": "15e91005-34e6-4ce9-80b4-8c33c6c1e5a0",
              "type": "basic.output",
              "data": {
                "name": "out",
                "range": "[3:0]",
                "size": 4
              },
              "position": {
                "x": 760,
                "y": 272
              }
            }
          ],
          "wires": [
            {
              "source": {
                "block": "a9f85080-6523-428b-966c-359be16be956",
                "port": "constant-out"
              },
              "target": {
                "block": "fecaab8e-c7d4-4823-81fb-2b0d42f38026",
                "port": "D"
              }
            },
            {
              "source": {
                "block": "deddfc29-7bf1-4ac4-a24e-e91b4cc14335",
                "port": "constant-out"
              },
              "target": {
                "block": "fecaab8e-c7d4-4823-81fb-2b0d42f38026",
                "port": "C"
              }
            },
            {
              "source": {
                "block": "cbd336da-6d61-4c71-90e1-e11bbe6817fc",
                "port": "out"
              },
              "target": {
                "block": "fecaab8e-c7d4-4823-81fb-2b0d42f38026",
                "port": "a"
              }
            },
            {
              "source": {
                "block": "fecaab8e-c7d4-4823-81fb-2b0d42f38026",
                "port": "b"
              },
              "target": {
                "block": "15e91005-34e6-4ce9-80b4-8c33c6c1e5a0",
                "port": "in"
              },
              "size": 4
            },
            {
              "source": {
                "block": "4aa2ce96-a449-42f1-b612-2c852dc50da8",
                "port": "out"
              },
              "target": {
                "block": "7f5654cf-4591-4a66-9147-d0cbdcb95f79",
                "port": "in"
              }
            }
          ]
        }
      }
    }
  }
}