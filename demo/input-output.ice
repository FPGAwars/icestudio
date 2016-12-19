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
          "id": "f4405019-32a9-4f31-8e42-441c85f1959c",
          "type": "basic.input",
          "data": {
            "label": "in",
            "pin": {
              "name": "SW1",
              "value": "10"
            }
          },
          "position": {
            "x": 104,
            "y": 112
          }
        },
        {
          "id": "ef08c4f3-94b9-4e85-9fe7-78bc2a376c72",
          "type": "basic.output",
          "data": {
            "label": "out",
            "pin": {
              "name": "LED0",
              "value": "95"
            }
          },
          "position": {
            "x": 344,
            "y": 112
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "f4405019-32a9-4f31-8e42-441c85f1959c",
            "port": "out"
          },
          "target": {
            "block": "ef08c4f3-94b9-4e85-9fe7-78bc2a376c72",
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
      "zoom": 0.9999999638409349
    }
  }
}