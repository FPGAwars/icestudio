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
          "id": "364b95cc-e8ff-4c65-b332-d6125c5968ee",
          "type": "basic.code",
          "data": {
            "code": "// NOT logic gate\nassign b = ~a;",
            "params": [],
            "ports": {
              "in": [
                {
                  "name": "a",
                  "size": 1
                }
              ],
              "out": [
                {
                  "name": "b",
                  "size": 1
                }
              ]
            }
          },
          "position": {
            "x": 248,
            "y": 88
          }
        },
        {
          "id": "a4058fa5-b66e-4e5e-b542-28d7c3e9d3cd",
          "type": "basic.input",
          "data": {
            "name": "",
            "pins": [
              {
                "index": "0",
                "name": "",
                "value": 0
              }
            ],
            "virtual": true
          },
          "position": {
            "x": 72,
            "y": 184
          }
        },
        {
          "id": "07895985-9d14-4a6f-8f2d-b2a6ddf61852",
          "type": "basic.output",
          "data": {
            "name": "",
            "pins": [
              {
                "index": "0",
                "name": "",
                "value": 0
              }
            ],
            "virtual": true
          },
          "position": {
            "x": 728,
            "y": 184
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "a4058fa5-b66e-4e5e-b542-28d7c3e9d3cd",
            "port": "out"
          },
          "target": {
            "block": "364b95cc-e8ff-4c65-b332-d6125c5968ee",
            "port": "a"
          }
        },
        {
          "source": {
            "block": "364b95cc-e8ff-4c65-b332-d6125c5968ee",
            "port": "b"
          },
          "target": {
            "block": "07895985-9d14-4a6f-8f2d-b2a6ddf61852",
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