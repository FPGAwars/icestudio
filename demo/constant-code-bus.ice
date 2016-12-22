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
          "id": "04b316b2-452b-4e2f-bdc6-26d1a204c675",
          "type": "basic.constant",
          "data": {
            "label": "C",
            "local": true,
            "value": "5"
          },
          "position": {
            "x": 232,
            "y": 32
          }
        },
        {
          "id": "3d5412cf-96ac-4429-9a22-01d5095f0981",
          "type": "basic.code",
          "data": {
            "code": "// Assign constant parameter\n\nassign out = value;",
            "params": [
              {
                "label": "value",
                "name": "value"
              }
            ],
            "ports": {
              "in": [],
              "out": [
                {
                  "label": "out[3:0]",
                  "name": "out",
                  "range": "[3:0]",
                  "size": 4
                }
              ]
            }
          },
          "position": {
            "x": 88,
            "y": 176
          }
        },
        {
          "id": "6d4f9130-37c5-48d2-b481-b803d818c3c7",
          "type": "basic.output",
          "data": {
            "label": "leds[3:0]",
            "name": "leds",
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
            "virtual": false
          },
          "position": {
            "x": 624,
            "y": 224
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "04b316b2-452b-4e2f-bdc6-26d1a204c675",
            "port": "constant-out"
          },
          "target": {
            "block": "3d5412cf-96ac-4429-9a22-01d5095f0981",
            "port": "value"
          }
        },
        {
          "source": {
            "block": "3d5412cf-96ac-4429-9a22-01d5095f0981",
            "port": "out"
          },
          "target": {
            "block": "6d4f9130-37c5-48d2-b481-b803d818c3c7",
            "port": "in"
          },
          "size": 4
        }
      ]
    },
    "deps": {},
    "state": {
      "pan": {
        "x": -7,
        "y": 13
      },
      "zoom": 1
    }
  }
}