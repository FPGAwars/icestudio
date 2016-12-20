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
          "id": "aa8bab8b-61e4-4e28-b444-0e68d9484ea1",
          "type": "basic.input",
          "data": {
            "label": "button1",
            "name": "button1",
            "range": "",
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
            "y": 32
          }
        },
        {
          "id": "81f8eceb-3742-4350-8833-78fef262c542",
          "type": "logic.gate.and",
          "data": {},
          "position": {
            "x": 248,
            "y": 80
          }
        },
        {
          "id": "3cad6e72-e7d3-4273-be1c-ce5f9b4c020a",
          "type": "basic.output",
          "data": {
            "label": "led",
            "name": "led",
            "range": "",
            "pins": [
              {
                "index": "0",
                "name": "LED7",
                "value": "104"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 440,
            "y": 80
          }
        },
        {
          "id": "5d1b4f33-ae65-4154-b4f4-ff1403437600",
          "type": "basic.input",
          "data": {
            "label": "button2",
            "name": "button2",
            "range": "",
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
            "y": 128
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
        }
      ],
      "wires": [
        {
          "source": {
            "block": "aa8bab8b-61e4-4e28-b444-0e68d9484ea1",
            "port": "out"
          },
          "target": {
            "block": "81f8eceb-3742-4350-8833-78fef262c542",
            "port": "18c2ebc7-5152-439c-9b3f-851c59bac834"
          }
        },
        {
          "source": {
            "block": "5d1b4f33-ae65-4154-b4f4-ff1403437600",
            "port": "out"
          },
          "target": {
            "block": "81f8eceb-3742-4350-8833-78fef262c542",
            "port": "97b51945-d716-4b6c-9db9-970d08541249"
          }
        },
        {
          "source": {
            "block": "81f8eceb-3742-4350-8833-78fef262c542",
            "port": "664caf9e-5f40-4df4-800a-b626af702e62"
          },
          "target": {
            "block": "3cad6e72-e7d3-4273-be1c-ce5f9b4c020a",
            "port": "in"
          }
        }
      ]
    },
    "deps": {
      "logic.gate.and": {
        "version": "1.0",
        "package": {
          "name": "AND",
          "version": "1.0.0",
          "description": "AND logic gate",
          "author": "Jesús Arroyo",
          "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2090%2040%22%3E%3Cpath%20d=%22M-252%20409.9h26v2h-26zM-252%20429.9h27v2h-27z%22/%3E%3Cpath%20d=%22M-227%20400.9v39.9h20.4c11.3%200%2020-9%2020-20s-8.7-20-20-20H-227zm2.9%202.8h17.6c9.8%200%2016.7%207.6%2016.7%2017.1%200%209.5-7.4%2017.1-17.1%2017.1H-224c-.1.1-.1-34.2-.1-34.2z%22/%3E%3Cpath%20d=%22M-187.911%20419.9H-162v2h-25.911z%22/%3E%3C/svg%3E"
        },
        "design": {
          "board": "icezum",
          "graph": {
            "blocks": [
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
              },
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
                "id": "97b51945-d716-4b6c-9db9-970d08541249",
                "type": "basic.input",
                "data": {
                  "label": ""
                },
                "position": {
                  "x": 64,
                  "y": 208
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
          "state": {
            "pan": {
              "x": 0,
              "y": 0
            },
            "zoom": 0.9999999784900666
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