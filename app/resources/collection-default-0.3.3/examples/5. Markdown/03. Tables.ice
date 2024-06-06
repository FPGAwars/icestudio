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
          "id": "232b0729-ebb9-42ee-8f4a-35317a91ec47",
          "type": "basic.info",
          "data": {
            "info": "First Header | Second Header\n------------ | -------------\nContent from cell 1 | Content from cell 2\nContent in the first column | Content in the second column",
            "readonly": true
          },
          "position": {
            "x": 48,
            "y": 144
          },
          "size": {
            "width": 456,
            "height": 96
          }
        },
        {
          "id": "d43c7fc2-5639-4b16-b505-82575f2e6866",
          "type": "basic.info",
          "data": {
            "info": "## Tables\n\nTables are really helpfull",
            "readonly": true
          },
          "position": {
            "x": 56,
            "y": 32
          },
          "size": {
            "width": 304,
            "height": 72
          }
        },
        {
          "id": "ee7e89ce-8f58-4dde-999b-376f75f384e6",
          "type": "basic.info",
          "data": {
            "info": "a | b | AND\n--|---|------\n0 | 0 | 0 \n0 | 1 | 0\n1 | 0 | 0\n1 | 1 | 1\n",
            "readonly": true
          },
          "position": {
            "x": 56,
            "y": 336
          },
          "size": {
            "width": 256,
            "height": 120
          }
        },
        {
          "id": "850917e7-e990-48f4-aa56-141a8024d290",
          "type": "basic.info",
          "data": {
            "info": "**AND truth table**",
            "readonly": true
          },
          "position": {
            "x": 64,
            "y": 296
          },
          "size": {
            "width": 176,
            "height": 40
          }
        },
        {
          "id": "70455a45-a9f9-487a-8baa-0328056a0d53",
          "type": "b2090f68ef94fd3c5c0eaea93eb6ba7e80aff0b6",
          "position": {
            "x": 304,
            "y": 392
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "8d5d23dc-3111-437c-8e73-394992fc6530",
          "type": "basic.info",
          "data": {
            "info": "**a**  \n  \n**b**",
            "readonly": true
          },
          "position": {
            "x": 256,
            "y": 392
          },
          "size": {
            "width": 176,
            "height": 88
          }
        },
        {
          "id": "1065f4e2-f6b6-4de2-bd8c-b998b013b076",
          "type": "basic.info",
          "data": {
            "info": "**Output**",
            "readonly": true
          },
          "position": {
            "x": 424,
            "y": 408
          },
          "size": {
            "width": 120,
            "height": 40
          }
        }
      ],
      "wires": []
    }
  },
  "dependencies": {
    "b2090f68ef94fd3c5c0eaea93eb6ba7e80aff0b6": {
      "package": {
        "name": "AND",
        "version": "1.0.1",
        "description": "Puerta AND",
        "author": "Jesús Arroyo, Juan González",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22336.09%22%20height=%22194.045%22%20version=%221%22%3E%3Cpath%20d=%22M174.656%20190.045H78.304V4h96.352s87.463%208.625%2087.463%2091.94c0%2083.311-87.463%2094.105-87.463%2094.105z%22%20fill=%22none%22%20stroke=%22#000%22%20stroke-width=%228%22%20stroke-linejoin=%22round%22/%3E%3Cpath%20d=%22M4.057%2045.668h74.018M4.057%20144.812h74.018m184.632-50.034h69.326%22%20fill=%22none%22%20stroke=%22#000%22%20stroke-width=%228%22%20stroke-linecap=%22round%22/%3E%3Ctext%20style=%22line-height:125%25%22%20x=%2292.894%22%20y=%22114.587%22%20font-weight=%22400%22%20font-size=%2258.054%22%20font-family=%22sans-serif%22%20letter-spacing=%220%22%20word-spacing=%220%22%20fill=%22#00f%22%3E%3Ctspan%20x=%2292.894%22%20y=%22114.587%22%20style=%22-inkscape-font-specification:'sans-serif%20Bold'%22%20font-weight=%22700%22%3EAND%3C/tspan%3E%3C/text%3E%3C/svg%3E"
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "18c2ebc7-5152-439c-9b3f-851c59bac834",
              "type": "basic.input",
              "data": {
                "name": ""
              },
              "position": {
                "x": 64,
                "y": 88
              }
            },
            {
              "id": "664caf9e-5f40-4df4-800a-b626af702e62",
              "type": "basic.output",
              "data": {
                "name": ""
              },
              "position": {
                "x": 784,
                "y": 152
              }
            },
            {
              "id": "97b51945-d716-4b6c-9db9-970d08541249",
              "type": "basic.input",
              "data": {
                "name": ""
              },
              "position": {
                "x": 64,
                "y": 224
              }
            },
            {
              "id": "00925b04-5004-4307-a737-fa4e97c8b6ab",
              "type": "basic.code",
              "data": {
                "code": "//-- Puerta AND\n\n//-- module and (input wire a, input wire b,\n//--             output wire c);\n\nassign c = a & b;\n\n//-- endmodule",
                "params": [],
                "ports": {
                  "in": [
                    {
                      "name": "a"
                    },
                    {
                      "name": "b"
                    }
                  ],
                  "out": [
                    {
                      "name": "c"
                    }
                  ]
                }
              },
              "position": {
                "x": 256,
                "y": 48
              },
              "size": {
                "width": 464,
                "height": 272
              }
            }
          ],
          "wires": [
            {
              "source": {
                "block": "18c2ebc7-5152-439c-9b3f-851c59bac834",
                "port": "out"
              },
              "target": {
                "block": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "port": "a"
              }
            },
            {
              "source": {
                "block": "97b51945-d716-4b6c-9db9-970d08541249",
                "port": "out"
              },
              "target": {
                "block": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "port": "b"
              }
            },
            {
              "source": {
                "block": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "port": "c"
              },
              "target": {
                "block": "664caf9e-5f40-4df4-800a-b626af702e62",
                "port": "in"
              }
            }
          ]
        }
      }
    }
  }
}