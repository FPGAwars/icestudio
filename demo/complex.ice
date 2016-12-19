{
  "version": "1.0",
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
          "id": "3e7df107-03ee-4c35-9e52-607770f4c832",
          "type": "basic.output",
          "data": {
            "label": "a",
            "pin": {
              "name": "LED0",
              "value": "95"
            }
          },
          "position": {
            "x": 216,
            "y": 80
          }
        },
        {
          "id": "365fa313-f3c1-433d-9d51-97429dfaa3c8",
          "type": "basic.constant",
          "data": {
            "label": "Value",
            "value": "1'b1"
          },
          "position": {
            "x": 344,
            "y": 80
          }
        },
        {
          "id": "083f6679-313b-497a-b2f0-4d972bc3cffa",
          "type": "basic.output",
          "data": {
            "label": "c",
            "pin": {
              "name": "LED2",
              "value": "97"
            }
          },
          "position": {
            "x": 760,
            "y": 144
          }
        },
        {
          "id": "1ffad532-f6da-47b0-8e85-d27fdcc211a8",
          "type": "basic.input",
          "data": {
            "label": "in",
            "pin": {
              "name": "SW1",
              "value": "10"
            }
          },
          "position": {
            "x": 48,
            "y": 248
          }
        },
        {
          "id": "1aa80d81-052d-426d-a073-a6e9678a9959",
          "type": "block",
          "data": {},
          "position": {
            "x": 280,
            "y": 264
          }
        },
        {
          "id": "e55fa1d9-ac88-461c-b5c1-4f4302c547cc",
          "type": "block",
          "data": {},
          "position": {
            "x": 536,
            "y": 280
          }
        },
        {
          "id": "8631a189-f5ed-4be1-88df-30d6acb97f99",
          "type": "basic.output",
          "data": {
            "label": "d",
            "pin": {
              "name": "LED3",
              "value": "98"
            }
          },
          "position": {
            "x": 768,
            "y": 280
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "1ffad532-f6da-47b0-8e85-d27fdcc211a8",
            "port": "out"
          },
          "target": {
            "block": "1aa80d81-052d-426d-a073-a6e9678a9959",
            "port": "a8faca21-4b86-4bb1-8cd1-8c5252d4038f"
          }
        },
        {
          "source": {
            "block": "1aa80d81-052d-426d-a073-a6e9678a9959",
            "port": "94e9a915-defe-4437-8abd-d3e57dafbb45"
          },
          "target": {
            "block": "e55fa1d9-ac88-461c-b5c1-4f4302c547cc",
            "port": "a8faca21-4b86-4bb1-8cd1-8c5252d4038f"
          }
        },
        {
          "source": {
            "block": "1aa80d81-052d-426d-a073-a6e9678a9959",
            "port": "94e9a915-defe-4437-8abd-d3e57dafbb45"
          },
          "target": {
            "block": "1aa80d81-052d-426d-a073-a6e9678a9959",
            "port": "9051bd8c-0c39-4b19-bb08-71ac0ba8e9bf"
          },
          "vertices": [
            {
              "x": 288,
              "y": 352
            }
          ]
        },
        {
          "source": {
            "block": "1ffad532-f6da-47b0-8e85-d27fdcc211a8",
            "port": "out"
          },
          "target": {
            "block": "3e7df107-03ee-4c35-9e52-607770f4c832",
            "port": "in"
          },
          "vertices": []
        },
        {
          "source": {
            "block": "365fa313-f3c1-433d-9d51-97429dfaa3c8",
            "port": "constant-out"
          },
          "target": {
            "block": "1aa80d81-052d-426d-a073-a6e9678a9959",
            "port": "386bc685-d806-4487-bece-b442b8c8689c"
          },
          "vertices": []
        },
        {
          "source": {
            "block": "365fa313-f3c1-433d-9d51-97429dfaa3c8",
            "port": "constant-out"
          },
          "target": {
            "block": "e55fa1d9-ac88-461c-b5c1-4f4302c547cc",
            "port": "386bc685-d806-4487-bece-b442b8c8689c"
          },
          "vertices": [
            {
              "x": 496,
              "y": 224
            }
          ]
        },
        {
          "source": {
            "block": "e55fa1d9-ac88-461c-b5c1-4f4302c547cc",
            "port": "94e9a915-defe-4437-8abd-d3e57dafbb45"
          },
          "target": {
            "block": "083f6679-313b-497a-b2f0-4d972bc3cffa",
            "port": "in"
          },
          "vertices": [
            {
              "x": 680,
              "y": 256
            }
          ]
        },
        {
          "source": {
            "block": "e55fa1d9-ac88-461c-b5c1-4f4302c547cc",
            "port": "94e9a915-defe-4437-8abd-d3e57dafbb45"
          },
          "target": {
            "block": "8631a189-f5ed-4be1-88df-30d6acb97f99",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "1ffad532-f6da-47b0-8e85-d27fdcc211a8",
            "port": "out"
          },
          "target": {
            "block": "e55fa1d9-ac88-461c-b5c1-4f4302c547cc",
            "port": "9051bd8c-0c39-4b19-bb08-71ac0ba8e9bf"
          },
          "vertices": [
            {
              "x": 200,
              "y": 400
            }
          ]
        }
      ]
    },
    "deps": {
      "block": {
        "version": "1.0",
        "package": {
          "name": "",
          "version": "",
          "description": "",
          "author": "",
          "image": ""
        },
        "design": {
          "graph": {
            "blocks": [
              {
                "id": "386bc685-d806-4487-bece-b442b8c8689c",
                "type": "basic.constant",
                "data": {
                  "label": "C",
                  "value": "1'b0"
                },
                "position": {
                  "x": 360,
                  "y": 8
                }
              },
              {
                "id": "94e9a915-defe-4437-8abd-d3e57dafbb45",
                "type": "basic.output",
                "data": {
                  "label": "out"
                },
                "position": {
                  "x": 712,
                  "y": 264
                }
              },
              {
                "id": "ec9b901f-4cda-4f53-81ae-bfd74a0f0ae6",
                "type": "basic.code",
                "data": {
                  "code": "assign o = v;",
                  "params": [
                    "v"
                  ],
                  "ports": {
                    "in": [
                      "i"
                    ],
                    "out": [
                      "o"
                    ]
                  }
                },
                "position": {
                  "x": 216,
                  "y": 168
                }
              },
              {
                "id": "a8faca21-4b86-4bb1-8cd1-8c5252d4038f",
                "type": "basic.input",
                "data": {
                  "label": "in"
                },
                "position": {
                  "x": 24,
                  "y": 264
                }
              },
              {
                "id": "9051bd8c-0c39-4b19-bb08-71ac0ba8e9bf",
                "type": "basic.input",
                "data": {
                  "label": ""
                },
                "position": {
                  "x": 24,
                  "y": 360
                }
              }
            ],
            "wires": [
              {
                "source": {
                  "block": "386bc685-d806-4487-bece-b442b8c8689c",
                  "port": "constant-out"
                },
                "target": {
                  "block": "ec9b901f-4cda-4f53-81ae-bfd74a0f0ae6",
                  "port": "v"
                }
              },
              {
                "source": {
                  "block": "ec9b901f-4cda-4f53-81ae-bfd74a0f0ae6",
                  "port": "o"
                },
                "target": {
                  "block": "94e9a915-defe-4437-8abd-d3e57dafbb45",
                  "port": "in"
                }
              },
              {
                "source": {
                  "block": "a8faca21-4b86-4bb1-8cd1-8c5252d4038f",
                  "port": "out"
                },
                "target": {
                  "block": "ec9b901f-4cda-4f53-81ae-bfd74a0f0ae6",
                  "port": "i"
                }
              }
            ]
          },
          "deps": {},
          "state": {
            "pan": {
              "x": 45.83406713517239,
              "y": 43.306661649315814
            },
            "zoom": 0.8527620016280335
          }
        }
      }
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