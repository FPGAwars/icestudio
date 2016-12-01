{
  "board": "icezum",
  "graph": {
    "blocks": [
      {
        "id": "18c2ebc7-5152-439c-9b3f-851c59bac834",
        "type": "basic.input",
        "data": {
          "label": "",
          "pin": {
            "name": "",
            "value": ""
          }
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
          "pin": {
            "name": "",
            "value": ""
          }
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
  "image": "",
  "state": {
    "pan": {
      "x": 0,
      "y": 0
    },
    "zoom": 1
  }
}