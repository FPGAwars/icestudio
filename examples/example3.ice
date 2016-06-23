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
      },
      {
        "id": "97be4ab0-0877-4059-b0e0-9a9247770e70",
        "type": "driver.low",
        "data": {},
        "position": {
          "x": 99,
          "y": 222
        }
      },
      {
        "id": "fec9bf47-3f78-4a0b-b7c4-cf62af032037",
        "type": "basic.output",
        "data": {
          "label": "y",
          "pin": {
            "name": "D2",
            "value": "98"
          }
        },
        "position": {
          "x": 339,
          "y": 221
        }
      }
    ],
    "wires": [
      {
        "source": {
          "block": "c2d74062-f2b7-4935-aebe-bcd5fb40081a",
          "port": "19c8f68d-5022-487f-9ab0-f0a3cd58bead"
        },
        "target": {
          "block": "eced7092-f887-4fac-9d0d-03bdbff56d3f",
          "port": "in"
        }
      },
      {
        "source": {
          "block": "97be4ab0-0877-4059-b0e0-9a9247770e70",
          "port": "19c8f68d-5022-487f-9ab0-f0a3cd58bead"
        },
        "target": {
          "block": "fec9bf47-3f78-4a0b-b7c4-cf62af032037",
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
            "id": "b959fb96-ac67-4aea-90b3-ed35a4c17bf5",
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
            "id": "19c8f68d-5022-487f-9ab0-f0a3cd58bead",
            "type": "basic.output",
            "data": {
              "label": ""
            },
            "position": {
              "x": 633,
              "y": 165
            }
          }
        ],
        "wires": [
          {
            "source": {
              "block": "b959fb96-ac67-4aea-90b3-ed35a4c17bf5",
              "port": "v"
            },
            "target": {
              "block": "19c8f68d-5022-487f-9ab0-f0a3cd58bead",
              "port": "in"
            }
          }
        ]
      },
      "deps": {}
    }
  }
}
