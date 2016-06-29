{
  "board": "icezum",
  "graph": {
    "blocks": [
      {
        "id": "18c2ebc7-5152-439c-9b3f-851c59bac834",
        "type": "basic.input",
        "data": {
          "label": "x",
          "pin": {
            "name": "SW1",
            "value": "10"
          }
        },
        "position": {
          "x": 31,
          "y": 31
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
          "x": 243,
          "y": 73
        }
      },
      {
        "id": "97b51945-d716-4b6c-9db9-970d08541249",
        "type": "basic.input",
        "data": {
          "label": "y",
          "pin": {
            "name": "SW2",
            "value": "11"
          }
        },
        "position": {
          "x": 34,
          "y": 255
        }
      },
      {
        "id": "664caf9e-5f40-4df4-800a-b626af702e62",
        "type": "basic.output",
        "data": {
          "label": "o",
          "pin": {
            "name": "LED0",
            "value": "95"
          }
        },
        "position": {
          "x": 760,
          "y": 137
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
  "deps": {}
}