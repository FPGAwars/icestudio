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
          "id": "a2a4b6b5-5279-4006-8699-38b484642e22",
          "type": "basic.input",
          "data": {
            "name": "in",
            "range": "[1:0]",
            "pins": [
              {
                "index": "1",
                "name": "SW1",
                "value": "10"
              },
              {
                "index": "0",
                "name": "SW2",
                "value": "11"
              }
            ],
            "virtual": false,
            "clock": false
          },
          "position": {
            "x": 440,
            "y": 88
          }
        },
        {
          "id": "c228f351-d3ec-495f-9f0f-5d40a9443ba8",
          "type": "basic.input",
          "data": {
            "name": "Button",
            "pins": [
              {
                "index": "0",
                "name": "SW1",
                "value": "10"
              }
            ],
            "virtual": false,
            "clock": false
          },
          "position": {
            "x": 112,
            "y": 104
          }
        },
        {
          "id": "1691533e-3eea-432e-aecf-8342f1604c01",
          "type": "basic.input",
          "data": {
            "name": "",
            "pins": [
              {
                "index": "0",
                "name": "",
                "value": ""
              }
            ],
            "virtual": true,
            "clock": true
          },
          "position": {
            "x": 280,
            "y": 104
          }
        },
        {
          "id": "edb05e4e-da6a-4c66-95e3-0e21b5b6c3b6",
          "type": "basic.input",
          "data": {
            "name": "in",
            "range": "[1:0]",
            "pins": [
              {
                "index": "1",
                "name": "",
                "value": ""
              },
              {
                "index": "0",
                "name": "",
                "value": ""
              }
            ],
            "virtual": true,
            "clock": false
          },
          "position": {
            "x": 592,
            "y": 104
          }
        },
        {
          "id": "16cc475a-7916-48f3-8158-13159b842bcd",
          "type": "basic.output",
          "data": {
            "name": "out",
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
            "x": 440,
            "y": 208
          }
        },
        {
          "id": "934f4c9c-4454-453a-acbf-83263249966c",
          "type": "basic.output",
          "data": {
            "name": "",
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
            "x": 112,
            "y": 216
          }
        },
        {
          "id": "71d0097f-9149-4372-bb3d-e39376c4f3f4",
          "type": "basic.output",
          "data": {
            "name": "out",
            "pins": [
              {
                "index": "0",
                "name": "",
                "value": "0"
              }
            ],
            "virtual": true
          },
          "position": {
            "x": 280,
            "y": 216
          }
        },
        {
          "id": "3089b334-8de8-494c-8a26-e715dee844fc",
          "type": "basic.output",
          "data": {
            "name": "",
            "range": "[1:0]",
            "pins": [
              {
                "index": "1",
                "name": "",
                "value": "0"
              },
              {
                "index": "0",
                "name": "",
                "value": "0"
              }
            ],
            "virtual": true
          },
          "position": {
            "x": 592,
            "y": 216
          }
        }
      ],
      "wires": []
    }
  },
  "dependencies": {}
}