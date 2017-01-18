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
          "id": "02460189-14a0-48d0-ad87-74faf9a1177e",
          "type": "basic.constant",
          "data": {
            "name": "N",
            "value": "20",
            "local": false
          },
          "position": {
            "x": 376,
            "y": 64
          }
        },
        {
          "id": "51e4e6a6-ef05-48e6-8f22-a355e6eda3ae",
          "type": "862d2a36c72ddee13ea44bf906fe1b60efa90941",
          "position": {
            "x": 568,
            "y": 64
          }
        },
        {
          "id": "1a49c635-92d6-4641-bd3b-dbd7604a76bf",
          "type": "basic.output",
          "data": {
            "name": "LED 5",
            "pins": [
              {
                "index": "0",
                "name": "LED5",
                "value": "101"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 752,
            "y": 64
          }
        },
        {
          "id": "1f3764d6-7db2-4e5a-912d-a25aad6459e2",
          "type": "basic.output",
          "data": {
            "name": "LED 4",
            "pins": [
              {
                "index": "0",
                "name": "LED4",
                "value": "99"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 752,
            "y": 144
          }
        },
        {
          "id": "e38831b6-fd92-4e35-9fea-17b439002721",
          "type": "basic.code",
          "data": {
            "code": "// Counter 4 bit\n// @include div.v\n\nwire trig; reg c;\n\nDIV #(N) div (\n  .clk(clk),\n  .out(trig)\n);\n\nalways @(posedge trig) begin\n  if (rst == 1)\n    c <= 0;\n  else if (ena == 1)\n    c <= c + 1;\nend\n",
            "params": [
              {
                "name": "N"
              }
            ],
            "ports": {
              "in": [
                {
                  "name": "clk"
                },
                {
                  "name": "ena"
                },
                {
                  "name": "rst"
                }
              ],
              "out": [
                {
                  "name": "c",
                  "range": "[3:0]",
                  "size": 4
                }
              ]
            }
          },
          "position": {
            "x": 232,
            "y": 208
          }
        },
        {
          "id": "289670b6-0d76-4c0e-91ce-23f62b106fa5",
          "type": "basic.input",
          "data": {
            "name": "clk",
            "pins": [
              {
                "index": "0",
                "name": "CLK",
                "value": "21"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 40,
            "y": 216
          }
        },
        {
          "id": "4c30cdb0-f1af-4af1-bb4b-12e443b84a17",
          "type": "basic.output",
          "data": {
            "name": "LEDs",
            "range": "[3:0]",
            "pins": [
              {
                "index": "3",
                "name": "LED3",
                "value": "98"
              },
              {
                "index": "2",
                "name": "LED2",
                "value": "97"
              },
              {
                "index": "1",
                "name": "LED1",
                "value": "96"
              },
              {
                "index": "0",
                "name": "LED0",
                "value": "95"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 752,
            "y": 256
          }
        },
        {
          "id": "9803de82-f844-48f0-9f6a-b428395073b4",
          "type": "basic.input",
          "data": {
            "name": "Button 1",
            "pins": [
              {
                "index": "0",
                "name": "SW1",
                "value": "10"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 40,
            "y": 304
          }
        },
        {
          "id": "4caf869e-5202-4aa0-acbf-14fac565eaf1",
          "type": "basic.input",
          "data": {
            "name": "Button 2",
            "pins": [
              {
                "index": "0",
                "name": "SW2",
                "value": "11"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 40,
            "y": 392
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "51e4e6a6-ef05-48e6-8f22-a355e6eda3ae",
            "port": "19c8f68d-5022-487f-9ab0-f0a3cd58bead"
          },
          "target": {
            "block": "1f3764d6-7db2-4e5a-912d-a25aad6459e2",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "51e4e6a6-ef05-48e6-8f22-a355e6eda3ae",
            "port": "19c8f68d-5022-487f-9ab0-f0a3cd58bead"
          },
          "target": {
            "block": "1a49c635-92d6-4641-bd3b-dbd7604a76bf",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "e38831b6-fd92-4e35-9fea-17b439002721",
            "port": "c"
          },
          "target": {
            "block": "4c30cdb0-f1af-4af1-bb4b-12e443b84a17",
            "port": "in"
          },
          "size": 4
        },
        {
          "source": {
            "block": "289670b6-0d76-4c0e-91ce-23f62b106fa5",
            "port": "out"
          },
          "target": {
            "block": "e38831b6-fd92-4e35-9fea-17b439002721",
            "port": "clk"
          }
        },
        {
          "source": {
            "block": "02460189-14a0-48d0-ad87-74faf9a1177e",
            "port": "constant-out"
          },
          "target": {
            "block": "e38831b6-fd92-4e35-9fea-17b439002721",
            "port": "N"
          }
        },
        {
          "source": {
            "block": "9803de82-f844-48f0-9f6a-b428395073b4",
            "port": "out"
          },
          "target": {
            "block": "e38831b6-fd92-4e35-9fea-17b439002721",
            "port": "ena"
          }
        },
        {
          "source": {
            "block": "4caf869e-5202-4aa0-acbf-14fac565eaf1",
            "port": "out"
          },
          "target": {
            "block": "e38831b6-fd92-4e35-9fea-17b439002721",
            "port": "rst"
          }
        }
      ]
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
    "862d2a36c72ddee13ea44bf906fe1b60efa90941": {
      "package": {
        "name": "Bit 0",
        "version": "1.0.0",
        "description": "Assign 0 to the output wire",
        "author": "Jesús Arroyo",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2247.303%22%20height=%2227.648%22%20viewBox=%220%200%2044.346456%2025.919999%22%3E%3Ctext%20style=%22line-height:125%25%22%20x=%22325.37%22%20y=%22315.373%22%20font-weight=%22400%22%20font-size=%2212.669%22%20font-family=%22sans-serif%22%20letter-spacing=%220%22%20word-spacing=%220%22%20transform=%22translate(-307.01%20-298.51)%22%3E%3Ctspan%20x=%22325.37%22%20y=%22315.373%22%20style=%22-inkscape-font-specification:'Courier%2010%20Pitch'%22%20font-family=%22Courier%2010%20Pitch%22%3E0%3C/tspan%3E%3C/text%3E%3C/svg%3E"
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "b959fb96-ac67-4aea-90b3-ed35a4c17bf5",
              "type": "basic.code",
              "data": {
                "code": "// Bit 0\n\nassign v = 1'b0;",
                "params": [],
                "ports": {
                  "in": [],
                  "out": [
                    {
                      "name": "v"
                    }
                  ]
                }
              },
              "position": {
                "x": 96,
                "y": 96
              }
            },
            {
              "id": "19c8f68d-5022-487f-9ab0-f0a3cd58bead",
              "type": "basic.output",
              "data": {
                "name": ""
              },
              "position": {
                "x": 608,
                "y": 192
              }
            }
          ],
          "wires": [
            {
              "source": {
                "block": "b959fb96-ac67-4aea-90b3-ed35a4c17bf5",
                "port": "v"
              },
              "target": {
                "block": "19c8f68d-5022-487f-9ab0-f0a3cd58bead",
                "port": "in"
              }
            }
          ]
        },
        "state": {
          "pan": {
            "x": 0,
            "y": 0
          },
          "zoom": 1
        }
      }
    }
  }
}