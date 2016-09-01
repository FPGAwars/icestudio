{
  "image": "",
  "state": {
    "pan": {
      "x": 0,
      "y": 0
    },
    "zoom": 0.9999999403953552
  },
  "board": "icezum",
  "graph": {
    "blocks": [
      {
        "id": "aa8bab8b-61e4-4e28-b444-0e68d9484ea1",
        "type": "basic.input",
        "data": {
          "label": "button1",
          "pin": {
            "name": "SW1",
            "value": "10"
          }
        },
        "position": {
          "x": 40,
          "y": 32
        }
      },
      {
        "id": "5d1b4f33-ae65-4154-b4f4-ff1403437600",
        "type": "basic.input",
        "data": {
          "label": "button2",
          "pin": {
            "name": "SW2",
            "value": "11"
          }
        },
        "position": {
          "x": 40,
          "y": 128
        }
      },
      {
        "id": "3cad6e72-e7d3-4273-be1c-ce5f9b4c020a",
        "type": "basic.output",
        "data": {
          "label": "led",
          "pin": {
            "name": "LED7",
            "value": "104"
          }
        },
        "position": {
          "x": 664,
          "y": 80
        }
      },
      {
        "id": "cb5b06e5-0d7d-4c89-9c17-0cd7892369c1",
        "type": "logic.and",
        "data": {},
        "position": {
          "x": 488,
          "y": 80
        }
      },
      {
        "id": "cce8504a-dc1f-4deb-9ee3-5f215ac88408",
        "type": "basic.info",
        "data": {
          "info": "Basic AND gate circuit\n\nA 2-inputs AND logic gate is used to turn on\nthe LED7 only when the 2 input buttons\nare pressed\n\nThis example shows the basic behaviour of\nthe AND gate\n\nEXERCISE: Upload this circuit into the FPGA\nboard and play with it"
        },
        "position": {
          "x": 40,
          "y": 232
        }
      },
      {
        "id": "edf3b438-4271-45f7-bb14-2a6d040880dd",
        "type": "basic.info",
        "data": {
          "info": "Circuito básico con puerta AND\n\nUna puerta lógica AND de 2 entradas se usa\npara encender un led solo cuando los dos\npulsadores de entrada están apretados\n\nEste ejemplo muestra el comportamiento básico\nde una puerta AND\n\nEJERCICIO: Carga este circuito en la FPGA y \njuega con él"
        },
        "position": {
          "x": 464,
          "y": 232
        }
      },
      {
        "id": "54c58086-340e-49b3-a6d0-f1b091c8bf3f",
        "type": "config.pull-up-inv",
        "data": {},
        "position": {
          "x": 240,
          "y": 32
        }
      },
      {
        "id": "434fbbef-5ba3-4b59-bfee-88fc8e7be457",
        "type": "config.pull-up-inv",
        "data": {},
        "position": {
          "x": 240,
          "y": 128
        }
      }
    ],
    "wires": [
      {
        "source": {
          "block": "cb5b06e5-0d7d-4c89-9c17-0cd7892369c1",
          "port": "664caf9e-5f40-4df4-800a-b626af702e62"
        },
        "target": {
          "block": "3cad6e72-e7d3-4273-be1c-ce5f9b4c020a",
          "port": "in"
        }
      },
      {
        "source": {
          "block": "aa8bab8b-61e4-4e28-b444-0e68d9484ea1",
          "port": "out"
        },
        "target": {
          "block": "54c58086-340e-49b3-a6d0-f1b091c8bf3f",
          "port": "bb4a1ca9-1b30-471e-92ca-ca7ff2fc1150"
        }
      },
      {
        "source": {
          "block": "54c58086-340e-49b3-a6d0-f1b091c8bf3f",
          "port": "a139fa0d-9b45-4480-a251-f4a66b49aa23"
        },
        "target": {
          "block": "cb5b06e5-0d7d-4c89-9c17-0cd7892369c1",
          "port": "18c2ebc7-5152-439c-9b3f-851c59bac834"
        }
      },
      {
        "source": {
          "block": "5d1b4f33-ae65-4154-b4f4-ff1403437600",
          "port": "out"
        },
        "target": {
          "block": "434fbbef-5ba3-4b59-bfee-88fc8e7be457",
          "port": "bb4a1ca9-1b30-471e-92ca-ca7ff2fc1150"
        }
      },
      {
        "source": {
          "block": "434fbbef-5ba3-4b59-bfee-88fc8e7be457",
          "port": "a139fa0d-9b45-4480-a251-f4a66b49aa23"
        },
        "target": {
          "block": "cb5b06e5-0d7d-4c89-9c17-0cd7892369c1",
          "port": "97b51945-d716-4b6c-9db9-970d08541249"
        }
      }
    ]
  },
  "deps": {
    "logic.and": {
      "graph": {
        "blocks": [
          {
            "id": "18c2ebc7-5152-439c-9b3f-851c59bac834",
            "type": "basic.input",
            "data": {
              "label": ""
            },
            "position": {
              "x": 64,
              "y": 80
            }
          },
          {
            "id": "97b51945-d716-4b6c-9db9-970d08541249",
            "type": "basic.input",
            "data": {
              "label": ""
            },
            "position": {
              "x": 64,
              "y": 208
            }
          },
          {
            "id": "664caf9e-5f40-4df4-800a-b626af702e62",
            "type": "basic.output",
            "data": {
              "label": ""
            },
            "position": {
              "x": 752,
              "y": 144
            }
          },
          {
            "id": "00925b04-5004-4307-a737-fa4e97c8b6ab",
            "type": "basic.code",
            "data": {
              "code": "// AND logic gate\n\nassign c = a & b;",
              "ports": {
                "in": [
                  "a",
                  "b"
                ],
                "out": [
                  "c"
                ]
              }
            },
            "position": {
              "x": 256,
              "y": 48
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
      },
      "deps": {},
      "image": "resources/images/and.svg",
      "state": {
        "pan": {
          "x": 0,
          "y": 0
        },
        "zoom": 1
      }
    },
    "config.pull-up-inv": {
      "image": "resources/images/pull-up-inv.svg",
      "state": {
        "pan": {
          "x": -23,
          "y": 8
        },
        "zoom": 1
      },
      "graph": {
        "blocks": [
          {
            "id": "2b245a71-2d80-466b-955f-e3d61839fe25",
            "type": "basic.code",
            "data": {
              "code": "// Pull up inv\n\nwire din, dout, outen;\n\nassign o = ~din;\n\nSB_IO #(\n    .PIN_TYPE(6'b 1010_01),\n    .PULLUP(1'b 1)\n) io_pin (\n    .PACKAGE_PIN(i),\n    .OUTPUT_ENABLE(outen),\n    .D_OUT_0(dout),\n    .D_IN_0(din)\n);",
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
              "x": 256,
              "y": 104
            }
          },
          {
            "id": "bb4a1ca9-1b30-471e-92ca-ca7ff2fc1150",
            "type": "basic.input",
            "data": {
              "label": ""
            },
            "position": {
              "x": 64,
              "y": 200
            }
          },
          {
            "id": "a139fa0d-9b45-4480-a251-f4a66b49aa23",
            "type": "basic.output",
            "data": {
              "label": ""
            },
            "position": {
              "x": 760,
              "y": 200
            }
          }
        ],
        "wires": [
          {
            "source": {
              "block": "bb4a1ca9-1b30-471e-92ca-ca7ff2fc1150",
              "port": "out"
            },
            "target": {
              "block": "2b245a71-2d80-466b-955f-e3d61839fe25",
              "port": "i"
            }
          },
          {
            "source": {
              "block": "2b245a71-2d80-466b-955f-e3d61839fe25",
              "port": "o"
            },
            "target": {
              "block": "a139fa0d-9b45-4480-a251-f4a66b49aa23",
              "port": "in"
            }
          }
        ]
      },
      "deps": {}
    }
  }
}