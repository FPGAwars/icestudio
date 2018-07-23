{
  "version": "1.2",
  "package": {
    "name": "Assign",
    "version": "1.1",
    "description": "Assign the value plus an offset to the 4bit output",
    "author": "Jesús Arroyo",
    "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22557.531%22%20height=%22417.407%22%20viewBox=%220%200%20522.68539%20391.31919%22%3E%3Ctext%20style=%22line-height:125%25;text-align:center%22%20x=%22388.929%22%20y=%22571.69%22%20font-weight=%22400%22%20font-size=%22382.156%22%20font-family=%22sans-serif%22%20letter-spacing=%220%22%20word-spacing=%220%22%20text-anchor=%22middle%22%20transform=%22translate(-127.586%20-256.42)%22%3E%3Ctspan%20x=%22388.929%22%20y=%22571.69%22%3E=%3C/tspan%3E%3C/text%3E%3C/svg%3E"
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
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
            "x": 616,
            "y": 240
          }
        },
        {
          "id": "909655b9-5ef0-4c45-9494-c0238d2e4732",
          "type": "basic.constant",
          "data": {
            "name": "value",
            "value": "4'b1110",
            "local": false
          },
          "position": {
            "x": 192,
            "y": 112
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
            "x": 328,
            "y": 112
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
            "x": 168,
            "y": 232
          },
          "size": {
            "width": 272,
            "height": 80
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
    }
  },
  "dependencies": {}
}