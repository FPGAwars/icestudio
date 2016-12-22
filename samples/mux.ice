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
          "id": "5e1563d7-86de-4618-a9b0-2a08075af9ec",
          "type": "basic.code",
          "data": {
            "code": "// Multiplexer 4 to 1 \nassign out = data[sel];",
            "params": [],
            "ports": {
              "in": [
                {
                  "name": "data",
                  "range": "[3:0]",
                  "size": 4
                },
                {
                  "name": "sel",
                  "range": "[1:0]",
                  "size": 2
                }
              ],
              "out": [
                {
                  "name": "out",
                  "size": 1
                }
              ]
            }
          },
          "position": {
            "x": 288,
            "y": 112
          }
        },
        {
          "id": "95f8c313-6e18-4ee3-b9cf-7266dec53c93",
          "type": "basic.input",
          "data": {
            "name": "d",
            "range": "[3:0]",
            "pins": [
              {
                "index": "3",
                "name": "",
                "value": 0
              },
              {
                "index": "2",
                "name": "",
                "value": 0
              },
              {
                "index": "1",
                "name": "",
                "value": 0
              },
              {
                "index": "0",
                "name": "",
                "value": 0
              }
            ],
            "virtual": true
          },
          "position": {
            "x": 48,
            "y": 144
          }
        },
        {
          "id": "60d40fc8-3388-4066-8f0a-af17e179a9bd",
          "type": "basic.output",
          "data": {
            "name": "out",
            "pins": [
              {
                "index": "0",
                "name": "",
                "value": 0
              }
            ],
            "virtual": true
          },
          "position": {
            "x": 760,
            "y": 208
          }
        },
        {
          "id": "f6528039-852b-41f9-aa41-268994b3f631",
          "type": "basic.input",
          "data": {
            "name": "s",
            "range": "[1:0]",
            "pins": [
              {
                "index": "1",
                "name": "",
                "value": 0
              },
              {
                "index": "0",
                "name": "",
                "value": 0
              }
            ],
            "virtual": true
          },
          "position": {
            "x": 48,
            "y": 272
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "95f8c313-6e18-4ee3-b9cf-7266dec53c93",
            "port": "out"
          },
          "target": {
            "block": "5e1563d7-86de-4618-a9b0-2a08075af9ec",
            "port": "data"
          },
          "size": 4
        },
        {
          "source": {
            "block": "f6528039-852b-41f9-aa41-268994b3f631",
            "port": "out"
          },
          "target": {
            "block": "5e1563d7-86de-4618-a9b0-2a08075af9ec",
            "port": "sel"
          },
          "size": 2
        },
        {
          "source": {
            "block": "5e1563d7-86de-4618-a9b0-2a08075af9ec",
            "port": "out"
          },
          "target": {
            "block": "60d40fc8-3388-4066-8f0a-af17e179a9bd",
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