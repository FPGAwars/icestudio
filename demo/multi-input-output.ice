{
  "image": "",
  "state": {
    "pan": {
      "x": 0,
      "y": 0
    },
    "zoom": 1
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
          "x": 168,
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
          "x": 408,
          "y": 232
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
          "x": 480,
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
          "block": "7625149d-3511-4d95-8405-a100409a5d42",
          "port": "in"
        }
      },
      {
        "source": {
          "block": "4f302bff-d4d1-4d6f-a7ec-b74698a3cd03",
          "port": "out"
        },
        "target": {
          "block": "c39221a3-87dd-4524-9f65-879112b27f51",
          "port": "in"
        }
      }
    ]
  },
  "deps": {}
}