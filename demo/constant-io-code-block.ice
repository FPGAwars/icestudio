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
            "label": "in",
            "pin": {
              "name": "SW1",
              "value": "10"
            }
          },
          "position": {
            "x": 24,
            "y": 264
          }
        },
        {
          "id": "94e9a915-defe-4437-8abd-d3e57dafbb45",
          "type": "basic.output",
          "data": {
            "label": "out",
            "pin": {
              "name": "LED0",
              "value": "95"
            }
          },
          "position": {
            "x": 712,
            "y": 264
          }
        },
        {
          "id": "9051bd8c-0c39-4b19-bb08-71ac0ba8e9bf",
          "type": "basic.input",
          "data": {
            "label": "",
            "pin": {
              "name": "",
              "value": 0
            }
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
      "zoom": 0.85276198387146
    }
  }
}