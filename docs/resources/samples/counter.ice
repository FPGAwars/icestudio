{
  "version": "1.2",
  "package": {
    "name": "counter",
    "version": "1.0",
    "description": "4-bit counter. N is the number of bits to count.",
    "author": "Jesús Arroyo",
    "image": ""
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "1a49c635-92d6-4641-bd3b-dbd7604a76bf",
          "type": "basic.output",
          "data": {
            "name": "",
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
            "x": 760,
            "y": 56
          }
        },
        {
          "id": "1f3764d6-7db2-4e5a-912d-a25aad6459e2",
          "type": "basic.output",
          "data": {
            "name": "",
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
            "x": 760,
            "y": 136
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
            "x": 760,
            "y": 248
          }
        },
        {
          "id": "9803de82-f844-48f0-9f6a-b428395073b4",
          "type": "basic.input",
          "data": {
            "name": "Enable",
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
            "y": 296
          }
        },
        {
          "id": "4caf869e-5202-4aa0-acbf-14fac565eaf1",
          "type": "basic.input",
          "data": {
            "name": "Reset",
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
        },
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
            "y": 56
          }
        },
        {
          "id": "976c6f41-7ed1-41b5-953b-cd4a5709c701",
          "type": "3e6c249e205080168c1bf4ee8dbc33b50653d5f4",
          "position": {
            "x": 608,
            "y": 56
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "e38831b6-fd92-4e35-9fea-17b439002721",
          "type": "basic.code",
          "data": {
            "code": "// Counter 4 bits\n// @include div.v\n\nwire trig; reg out;\n\nDIV #(N) div (\n  .clk(clk),\n  .out(trig)\n);\n\nalways @(posedge trig) begin\n  if (rst == 1)\n    out <= 0;\n  else if (ena == 1)\n    out <= out + 1;\nend\n",
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
                  "name": "out",
                  "range": "[3:0]",
                  "size": 4
                }
              ]
            }
          },
          "position": {
            "x": 248,
            "y": 184
          },
          "size": {
            "width": 352,
            "height": 288
          }
        }
      ],
      "wires": [
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
        },
        {
          "source": {
            "block": "976c6f41-7ed1-41b5-953b-cd4a5709c701",
            "port": "19c8f68d-5022-487f-9ab0-f0a3cd58bead"
          },
          "target": {
            "block": "1a49c635-92d6-4641-bd3b-dbd7604a76bf",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "976c6f41-7ed1-41b5-953b-cd4a5709c701",
            "port": "19c8f68d-5022-487f-9ab0-f0a3cd58bead"
          },
          "target": {
            "block": "1f3764d6-7db2-4e5a-912d-a25aad6459e2",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "e38831b6-fd92-4e35-9fea-17b439002721",
            "port": "out"
          },
          "target": {
            "block": "4c30cdb0-f1af-4af1-bb4b-12e443b84a17",
            "port": "in"
          },
          "size": 4
        }
      ]
    }
  },
  "dependencies": {
    "3e6c249e205080168c1bf4ee8dbc33b50653d5f4": {
      "package": {
        "name": "Bit 1",
        "version": "1.0.0",
        "description": "Assign 1 to the output wire",
        "author": "Jesús Arroyo",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2247.303%22%20height=%2227.648%22%20viewBox=%220%200%2044.346456%2025.919999%22%3E%3Ctext%20style=%22line-height:125%25%22%20x=%22325.218%22%20y=%22315.455%22%20font-weight=%22400%22%20font-size=%2212.669%22%20font-family=%22sans-serif%22%20letter-spacing=%220%22%20word-spacing=%220%22%20transform=%22translate(-307.01%20-298.51)%22%3E%3Ctspan%20x=%22325.218%22%20y=%22315.455%22%20style=%22-inkscape-font-specification:'Courier%2010%20Pitch'%22%20font-family=%22Courier%2010%20Pitch%22%3E1%3C/tspan%3E%3C/text%3E%3C/svg%3E"
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "b959fb96-ac67-4aea-90b3-ed35a4c17bf5",
              "type": "basic.code",
              "data": {
                "code": "// Bit 1\n\nassign v = 1'b1;",
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
        }
      }
    }
  }
}