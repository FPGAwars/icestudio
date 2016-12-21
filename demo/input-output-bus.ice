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
          "id": "a63cb442-f0cf-4802-8542-0b50bf859a3c",
          "type": "basic.input",
          "data": {
            "label": "buttons[0:1]",
            "name": "buttons",
            "range": "[0:1]",
            "pins": [
              {
                "index": "0",
                "name": "SW1",
                "value": "10"
              },
              {
                "index": "1",
                "name": "SW2",
                "value": "11"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 128,
            "y": 64
          }
        },
        {
          "id": "39d544a4-e8fd-4c59-909e-61cddd5e7f98",
          "type": "basic.output",
          "data": {
            "label": "leds[1:0]",
            "name": "leds",
            "range": "[1:0]",
            "pins": [
              {
                "index": "1",
                "name": "LED0",
                "value": "95"
              },
              {
                "index": "0",
                "name": "LED1",
                "value": "96"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 408,
            "y": 64
          }
        },
        {
          "id": "99ebca85-09ff-456a-8caa-cfa78955e25f",
          "type": "basic.input",
          "data": {
            "label": "in",
            "name": "in",
            "range": "",
            "pins": [
              {
                "index": "0",
                "name": "D10",
                "value": "141"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 184,
            "y": 248
          }
        },
        {
          "id": "5b81602a-731c-42bd-9f81-3bec86dbe75c",
          "type": "basic.output",
          "data": {
            "label": "out",
            "name": "out",
            "range": "",
            "pins": [
              {
                "index": "0",
                "name": "LED2",
                "value": "97"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 384,
            "y": 248
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "a63cb442-f0cf-4802-8542-0b50bf859a3c",
            "port": "out"
          },
          "target": {
            "block": "39d544a4-e8fd-4c59-909e-61cddd5e7f98",
            "port": "in"
          },
          "size": 2
        },
        {
          "source": {
            "block": "99ebca85-09ff-456a-8caa-cfa78955e25f",
            "port": "out"
          },
          "target": {
            "block": "5b81602a-731c-42bd-9f81-3bec86dbe75c",
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
      "zoom": 1
    }
  }
}
