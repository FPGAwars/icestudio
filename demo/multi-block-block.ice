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
          "id": "215b7e1b-9d43-410b-ab88-1410f6a39cc1",
          "type": "logic.gate.not",
          "data": {},
          "position": {
            "x": 456,
            "y": 64
          }
        },
        {
          "id": "c39221a3-87dd-4524-9f65-879112b27f51",
          "type": "basic.output",
          "data": {
            "label": "out",
            "name": "out",
            "range": "",
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
            "x": 632,
            "y": 64
          }
        },
        {
          "id": "4f302bff-d4d1-4d6f-a7ec-b74698a3cd03",
          "type": "basic.input",
          "data": {
            "label": "in",
            "name": "in",
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
            "x": 96,
            "y": 128
          }
        },
        {
          "id": "c31c5c84-2f92-40f8-abe7-8dc9b214fb39",
          "type": "logic.gate.not",
          "data": {},
          "position": {
            "x": 272,
            "y": 128
          }
        },
        {
          "id": "7be8e651-1218-45ac-ac26-ef34a903e50e",
          "type": "logic.gate.not",
          "data": {},
          "position": {
            "x": 456,
            "y": 208
          }
        },
        {
          "id": "7625149d-3511-4d95-8405-a100409a5d42",
          "type": "basic.output",
          "data": {
            "label": "out",
            "name": "out",
            "range": "",
            "pins": [
              {
                "index": "0",
                "name": "LED1",
                "value": "96"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 632,
            "y": 208
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
            "block": "c31c5c84-2f92-40f8-abe7-8dc9b214fb39",
            "port": "18c2ebc7-5152-439c-9b3f-851c59bac834"
          }
        },
        {
          "source": {
            "block": "c31c5c84-2f92-40f8-abe7-8dc9b214fb39",
            "port": "664caf9e-5f40-4df4-800a-b626af702e62"
          },
          "target": {
            "block": "215b7e1b-9d43-410b-ab88-1410f6a39cc1",
            "port": "18c2ebc7-5152-439c-9b3f-851c59bac834"
          }
        },
        {
          "source": {
            "block": "215b7e1b-9d43-410b-ab88-1410f6a39cc1",
            "port": "664caf9e-5f40-4df4-800a-b626af702e62"
          },
          "target": {
            "block": "c39221a3-87dd-4524-9f65-879112b27f51",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "c31c5c84-2f92-40f8-abe7-8dc9b214fb39",
            "port": "664caf9e-5f40-4df4-800a-b626af702e62"
          },
          "target": {
            "block": "7be8e651-1218-45ac-ac26-ef34a903e50e",
            "port": "18c2ebc7-5152-439c-9b3f-851c59bac834"
          }
        },
        {
          "source": {
            "block": "7be8e651-1218-45ac-ac26-ef34a903e50e",
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
        "version": "1.0",
        "package": {
          "name": "NOT",
          "version": "1.0.0",
          "description": "NOT logic gate",
          "author": "Jesús Arroyo",
          "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2291.33%22%20height=%2245.752%22%20version=%221%22%3E%3Cpath%20d=%22M0%2020.446h27v2H0zM70.322%2020.447h15.3v2h-15.3z%22/%3E%3Cpath%20d=%22M66.05%2026.746c-2.9%200-5.3-2.4-5.3-5.3s2.4-5.3%205.3-5.3%205.3%202.4%205.3%205.3-2.4%205.3-5.3%205.3zm0-8.6c-1.8%200-3.3%201.5-3.3%203.3%200%201.8%201.5%203.3%203.3%203.3%201.8%200%203.3-1.5%203.3-3.3%200-1.8-1.5-3.3-3.3-3.3z%22/%3E%3Cpath%20d=%22M25.962%202.563l33.624%2018.883L25.962%2040.33V2.563z%22%20fill=%22none%22%20stroke=%22#000%22%20stroke-width=%223%22/%3E%3C/svg%3E"
        },
        "design": {
          "board": "icezum",
          "graph": {
            "blocks": [
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
              },
              {
                "id": "18c2ebc7-5152-439c-9b3f-851c59bac834",
                "type": "basic.input",
                "data": {
                  "label": "",
                  "name": "",
                  "range": "",
                  "pins": [
                    {
                      "index": "0",
                      "name": "",
                      "value": 0
                    }
                  ],
                  "virtual": false
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
                  "label": "",
                  "name": "",
                  "range": "",
                  "pins": [
                    {
                      "index": "0",
                      "name": "",
                      "value": 0
                    }
                  ],
                  "virtual": false
                },
                "position": {
                  "x": 752,
                  "y": 144
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
          "state": {
            "pan": {
              "x": 0,
              "y": 0
            },
            "zoom": 1
          }
        }
      }
    },
    "state": {
      "pan": {
        "x": 0,
        "y": 0
      },
      "zoom": 0.9999999403953552
    }
  }
}