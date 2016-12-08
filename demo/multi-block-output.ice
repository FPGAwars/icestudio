{
  "image": "",
  "state": {
    "pan": {
      "x": 0,
      "y": 0
    },
    "zoom": 1.000000007072795
  },
  "board": "icezum",
  "graph": {
    "blocks": [
      {
        "id": "4f302bff-d4d1-4d6f-a7ec-b74698a3cd03",
        "type": "basic.input",
        "data": {
          "label": "in",
          "pin": {
            "name": "SW1",
            "value": "10"
          }
        },
        "position": {
          "x": 96,
          "y": 120
        }
      },
      {
        "id": "7625149d-3511-4d95-8405-a100409a5d42",
        "type": "basic.output",
        "data": {
          "label": "out",
          "pin": {
            "name": "LED1",
            "value": "96"
          }
        },
        "position": {
          "x": 464,
          "y": 208
        }
      },
      {
        "id": "c39221a3-87dd-4524-9f65-879112b27f51",
        "type": "basic.output",
        "data": {
          "label": "out",
          "pin": {
            "name": "LED0",
            "value": "95"
          }
        },
        "position": {
          "x": 464,
          "y": 40
        }
      },
      {
        "id": "6ebac9b8-8eb9-4c4b-8b58-962ccc2919f4",
        "type": "logic.gate.not",
        "data": {},
        "position": {
          "x": 272,
          "y": 120
        }
      }
    ],
    "wires": [
      {
        "source": {
          "block": "4f302bff-d4d1-4d6f-a7ec-b74698a3cd03",
          "port": "out"
        },
        "target": {
          "block": "6ebac9b8-8eb9-4c4b-8b58-962ccc2919f4",
          "port": "18c2ebc7-5152-439c-9b3f-851c59bac834"
        }
      },
      {
        "source": {
          "block": "6ebac9b8-8eb9-4c4b-8b58-962ccc2919f4",
          "port": "664caf9e-5f40-4df4-800a-b626af702e62"
        },
        "target": {
          "block": "c39221a3-87dd-4524-9f65-879112b27f51",
          "port": "in"
        }
      },
      {
        "source": {
          "block": "6ebac9b8-8eb9-4c4b-8b58-962ccc2919f4",
          "port": "664caf9e-5f40-4df4-800a-b626af702e62"
        },
        "target": {
          "block": "7625149d-3511-4d95-8405-a100409a5d42",
          "port": "in"
        }
      }
    ]
  },
  "deps": {
    "logic.gate.not": {
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
              "y": 144
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
            "id": "5365ed8c-e5db-4445-938f-8d689830ea5c",
            "type": "basic.code",
            "data": {
              "code": "// NOT logic gate\n\nassign c = ~ a;",
              "ports": {
                "in": [
                  "a"
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
              "block": "5365ed8c-e5db-4445-938f-8d689830ea5c",
              "port": "a"
            }
          },
          {
            "source": {
              "block": "5365ed8c-e5db-4445-938f-8d689830ea5c",
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
      "image": "resources/images/not.svg",
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