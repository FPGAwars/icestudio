{
  "version": "1.2",
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
          "id": "c9d95bfe-5f79-4bff-aced-341ccc6025c4",
          "type": "basic.output",
          "data": {
            "name": "LED",
            "range": "[7:0]",
            "pins": [
              {
                "index": "7",
                "name": "LED7",
                "value": "104"
              },
              {
                "index": "6",
                "name": "LED6",
                "value": "102"
              },
              {
                "index": "5",
                "name": "LED5",
                "value": "101"
              },
              {
                "index": "4",
                "name": "LED4",
                "value": "99"
              },
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
            "x": 568,
            "y": 104
          }
        },
        {
          "id": "02054c3e-70b4-428b-bdb8-cec60d1c3523",
          "type": "basic.info",
          "data": {
            "info": "Using buses for displaying a fixed value in the LEDs",
            "readonly": true
          },
          "position": {
            "x": 72,
            "y": 96
          },
          "size": {
            "width": 432,
            "height": 32
          }
        },
        {
          "id": "06b3188b-ecff-4ae0-95e3-ab7c5cf2cce4",
          "type": "basic.code",
          "data": {
            "code": "//-- Displaying a 8-bit data\n//-- in the LEDs\nassign data = 8'hAA;",
            "params": [],
            "ports": {
              "in": [],
              "out": [
                {
                  "name": "data",
                  "range": "[7:0]",
                  "size": 8
                }
              ]
            }
          },
          "position": {
            "x": 72,
            "y": 184
          },
          "size": {
            "width": 304,
            "height": 128
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "06b3188b-ecff-4ae0-95e3-ab7c5cf2cce4",
            "port": "data"
          },
          "target": {
            "block": "c9d95bfe-5f79-4bff-aced-341ccc6025c4",
            "port": "in"
          },
          "size": 8
        }
      ]
    }
  },
  "dependencies": {}
}