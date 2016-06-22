{
  "board": "icezum",
  "graph": {
    "blocks": [
      {
        "id": "cbd703ed-2a68-41dc-9dc6-31238dd1d16d",
        "type": "basic.output",
        "data": {
          "label": "o",
          "pin": {
            "name": "LED0",
            "value": "95"
          }
        },
        "position": {
          "x": 630,
          "y": 165
        }
      },
      {
        "id": "472d74e8-d77d-4e46-bc7a-ab1c8d65a498",
        "type": "basic.code",
        "data": {
          "code": "// Driver high\n\nassign v = 1b'1;",
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
      }
    ],
    "wires": [
      {
        "source": {
          "block": "472d74e8-d77d-4e46-bc7a-ab1c8d65a498",
          "port": "out11"
        },
        "target": {
          "block": "cbd703ed-2a68-41dc-9dc6-31238dd1d16d",
          "port": "in"
        }
      }
    ]
  },
  "deps": {}
}
