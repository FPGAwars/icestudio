{
  "version": "1.2",
  "package": {
    "name": "Mux4:1",
    "version": "1.1",
    "description": "Multiplexer 4 to 1",
    "author": "Jesús Arroyo",
    "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2081%2040%22%20width=%2281%22%20height=%2240%22%3E%3Cpath%20d=%22M-191%20419.9v-7.2l-41-11.8v40l41-11.7v-7.4zm-39%2018.5v-35l37%2010.8v13.5z%22/%3E%3C/svg%3E"
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
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
            "x": 64,
            "y": 160
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
            "x": 720,
            "y": 192
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
            "x": 64,
            "y": 232
          }
        },
        {
          "id": "5e1563d7-86de-4618-a9b0-2a08075af9ec",
          "type": "basic.code",
          "data": {
            "code": "// Multiplexer 4 to 1\n\nassign out = data[sel];",
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
                  "name": "out"
                }
              ]
            }
          },
          "position": {
            "x": 312,
            "y": 152
          },
          "size": {
            "width": 272,
            "height": 144
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
          "vertices": [],
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
    }
  },
  "dependencies": {}
}