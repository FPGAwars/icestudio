{
  "board": "icestick",
  "graph": {
    "blocks": [
      {
        "id": "c2d74062-f2b7-4935-aebe-bcd5fb40081a",
        "type": "driver.low",
        "data": {},
        "position": {
          "x": 100,
          "y": 100
        }
      },
      {
        "id": "eced7092-f887-4fac-9d0d-03bdbff56d3f",
        "type": "basic.output",
        "data": {
          "label": "x",
          "pin": {
            "name": "D1",
            "value": 99
          }
        },
        "position": {
          "x": 336,
          "y": 100
        }
      }
    ],
    "wires": [
      {
        "source": {
          "block": "c2d74062-f2b7-4935-aebe-bcd5fb40081a",
          "port": "2d811451-4777-4f7b-9da2-67bb9bb9a71e"
        },
        "target": {
          "block": "eced7092-f887-4fac-9d0d-03bdbff56d3f",
          "port": "in"
        }
      }
    ]
  },
  "deps": {
    "driver.low": {
      "graph": {
        "blocks": [
          {
            "id": "2e684aab-9f39-47a1-9af0-25969a6a908f",
            "type": "basic.code",
            "data": {
              "code": "// Driver low\n\nassign v = 1'b0;",
              "ports": {
                "in": [],
                "out": [
                  "v"
                ]
              }
            },
            "position": {
              "x": 100,
              "y": 100
            }
          },
          {
            "id": "2d811451-4777-4f7b-9da2-67bb9bb9a71e",
            "type": "basic.output",
            "data": {
              "label": "o"
            },
            "position": {
              "x": 627,
              "y": 165
            }
          }
        ],
        "wires": [
          {
            "source": {
              "block": "2e684aab-9f39-47a1-9af0-25969a6a908f",
              "port": "v"
            },
            "target": {
              "block": "2d811451-4777-4f7b-9da2-67bb9bb9a71e",
              "port": "in"
            }
          }
        ]
      },
      "deps": {}
    }
  }
}
