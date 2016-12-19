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
            "x": 168,
            "y": 120
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
            "x": 480,
            "y": 120
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
            "x": 400,
            "y": 232
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
    "deps": {},
    "state": {
      "pan": {
        "x": 0,
        "y": 0
      },
      "zoom": 0.9999999403953552
    }
  }
}