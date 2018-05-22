{
  "version": "1.1",
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
          "id": "72a3e396-3f04-428b-907b-bdf382527eb7",
          "type": "basic.input",
          "data": {
            "name": "in",
            "pins": [
              {
                "index": "0",
                "name": "",
                "value": "0"
              }
            ],
            "virtual": true,
            "clock": false
          },
          "position": {
            "x": 32,
            "y": 32
          }
        },
        {
          "id": "9e8da846-9389-4f63-aa8b-f2a2bddfbb63",
          "type": "basic.input",
          "data": {
            "name": "in",
            "pins": [
              {
                "index": "0",
                "name": "SW1",
                "value": "10"
              }
            ],
            "virtual": false,
            "clock": false
          },
          "position": {
            "x": 184,
            "y": 32
          }
        },
        {
          "id": "5ecbe088-acf0-4248-b166-d421ac6fed46",
          "type": "basic.output",
          "data": {
            "name": "out",
            "pins": [
              {
                "index": "0",
                "name": "",
                "value": "0"
              }
            ],
            "virtual": true
          },
          "position": {
            "x": 344,
            "y": 32
          }
        },
        {
          "id": "79b6c1e9-863a-46b4-af49-e25a2c131e5d",
          "type": "basic.output",
          "data": {
            "name": "out",
            "pins": [
              {
                "index": "0",
                "name": "LED0",
                "value": "95"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 488,
            "y": 32
          }
        },
        {
          "id": "4d3293ce-c03c-48d5-8a8a-2bb5ccc58e53",
          "type": "basic.constant",
          "data": {
            "name": "V",
            "value": "4'b1001",
            "local": true
          },
          "position": {
            "x": 640,
            "y": 32
          }
        },
        {
          "id": "57256b2e-5dae-42fb-bd5a-62ca9710623c",
          "type": "basic.input",
          "data": {
            "name": "in",
            "range": "[1:0]",
            "pins": [
              {
                "index": "1",
                "name": "SW1",
                "value": "10"
              },
              {
                "index": "0",
                "name": "SW2",
                "value": "11"
              }
            ],
            "virtual": false,
            "clock": false
          },
          "position": {
            "x": 184,
            "y": 136
          }
        },
        {
          "id": "70a47306-d294-4300-8445-c15704493413",
          "type": "basic.output",
          "data": {
            "name": "out",
            "range": "[1:0]",
            "pins": [
              {
                "index": "1",
                "name": "LED0",
                "value": "95"
              },
              {
                "index": "0",
                "name": "LED1",
                "value": "96"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 488,
            "y": 136
          }
        },
        {
          "id": "8aca617e-21d9-4812-b686-015a2a8009fe",
          "type": "basic.input",
          "data": {
            "name": "in",
            "range": "[1:0]",
            "pins": [
              {
                "index": "1",
                "name": "",
                "value": "0"
              },
              {
                "index": "0",
                "name": "",
                "value": "0"
              }
            ],
            "virtual": true,
            "clock": false
          },
          "position": {
            "x": 32,
            "y": 152
          }
        },
        {
          "id": "8c86e803-6682-46de-8a5b-c9f26f3be87b",
          "type": "basic.output",
          "data": {
            "name": "out",
            "range": "[1:0]",
            "pins": [
              {
                "index": "1",
                "name": "",
                "value": "0"
              },
              {
                "index": "0",
                "name": "",
                "value": "0"
              }
            ],
            "virtual": true
          },
          "position": {
            "x": 344,
            "y": 152
          }
        },
        {
          "id": "cfd3d272-f4f1-4ca9-a19b-e811a6dfdd0d",
          "type": "basic.code",
          "data": {
            "code": "reg b;\n\nalways @(a)\nbegin\n  if (a == 1)\n    b = C;\n  else\n    b = D;\nend",
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
            "x": 32,
            "y": 288
          },
          "size": {
            "width": 256,
            "height": 160
          }
        },
        {
          "id": "38b91705-b898-43b4-b593-dd23c46eb478",
          "type": "basic.info",
          "data": {
            "info": "Lorem ipsum\n...\n"
          },
          "position": {
            "x": 344,
            "y": 288
          },
          "size": {
            "width": 208,
            "height": 80
          }
        },
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
    },
    "state": {
      "pan": {
        "x": 0,
        "y": 0
      },
      "zoom": 1
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
        },
        "state": {
          "pan": {
            "x": -1.6949,
            "y": 61.9746
          },
          "zoom": 0.8686
        }
      }
    }
  }
}