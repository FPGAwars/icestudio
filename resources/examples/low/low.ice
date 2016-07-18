{
  "board": "icezum",
  "graph": {
    "blocks": [
      {
        "id": "b959fb96-ac67-4aea-90b3-ed35a4c17bf5",
        "type": "basic.code",
        "data": {
          "code": "// Bit 0\n\nassign v = 1'b0;",
          "ports": {
            "in": [],
            "out": [
              "v"
            ]
          }
        },
        "position": {
          "x": 96,
          "y": 96
        }
      },
      {
        "id": "19c8f68d-5022-487f-9ab0-f0a3cd58bead",
        "type": "basic.output",
        "data": {
          "label": "o",
          "pin": {
            "name": "LED0",
            "value": "95"
          }
        },
        "position": {
          "x": 608,
          "y": 192
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