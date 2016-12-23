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
          "id": "909655b9-5ef0-4c45-9494-c0238d2e4732",
          "type": "basic.constant",
          "data": {
            "name": "Value",
            "value": "4'b1110",
            "local": false
          },
          "position": {
            "x": 192,
            "y": 56
          }
        },
        {
          "id": "7e351e09-634d-407c-ab7e-452519468292",
          "type": "basic.constant",
          "data": {
            "name": "offset",
            "value": "0",
            "local": true
          },
          "position": {
            "x": 384,
            "y": 56
          }
        },
        {
          "id": "b6bc7556-6362-45ca-80e5-6db7a3100c7d",
          "type": "basic.code",
          "data": {
            "code": "assign out = C + D;",
            "params": [
              {
                "name": "C"
              },
              {
                "name": "D"
              }
            ],
            "ports": {
              "in": [],
              "out": [
                {
                  "name": "out",
                  "range": "[3:0]",
                  "size": 4
                }
              ]
            }
          },
          "position": {
            "x": 144,
            "y": 200
          }
        },
        {
          "id": "ef743d41-5941-4831-becd-0d930c4eed54",
          "type": "basic.output",
          "data": {
            "name": "out",
            "range": "[3:0]",
            "pins": [
              {
                "index": "3",
                "name": "LED3",
                "value": "98"
              },
              {
                "index": "2",
                "name": "LED2",
                "value": "97"
              },
              {
                "index": "1",
                "name": "LED1",
                "value": "96"
              },
              {
                "index": "0",
                "name": "LED0",
                "value": "95"
              }
            ],
            "virtual": true
          },
          "position": {
            "x": 680,
            "y": 296
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "909655b9-5ef0-4c45-9494-c0238d2e4732",
            "port": "constant-out"
          },
          "target": {
            "block": "b6bc7556-6362-45ca-80e5-6db7a3100c7d",
            "port": "C"
          }
        },
        {
          "source": {
            "block": "7e351e09-634d-407c-ab7e-452519468292",
            "port": "constant-out"
          },
          "target": {
            "block": "b6bc7556-6362-45ca-80e5-6db7a3100c7d",
            "port": "D"
          }
        },
        {
          "source": {
            "block": "b6bc7556-6362-45ca-80e5-6db7a3100c7d",
            "port": "out"
          },
          "target": {
            "block": "ef743d41-5941-4831-becd-0d930c4eed54",
            "port": "in"
          },
          "size": 4
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