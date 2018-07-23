{
  "version": "1.2",
  "package": {
    "name": "in-out",
    "version": "1.0",
    "description": "Assign the input to both outputs",
    "author": "Jesús Arroyo",
    "image": ""
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "b25e5929-162c-4631-8d04-156e0b382590",
          "type": "basic.input",
          "data": {
            "name": "in",
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
            "x": 224,
            "y": 112
          }
        },
        {
          "id": "2a8315b1-437e-40b7-adfb-ff961a0aa8f6",
          "type": "basic.output",
          "data": {
            "name": "out",
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
            "x": 488,
            "y": 112
          }
        },
        {
          "id": "f8ffb071-9a46-4b46-86d2-cd5b83bae395",
          "type": "basic.output",
          "data": {
            "name": "",
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
            "x": 488,
            "y": 248
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "b25e5929-162c-4631-8d04-156e0b382590",
            "port": "out"
          },
          "target": {
            "block": "2a8315b1-437e-40b7-adfb-ff961a0aa8f6",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "b25e5929-162c-4631-8d04-156e0b382590",
            "port": "out"
          },
          "target": {
            "block": "f8ffb071-9a46-4b46-86d2-cd5b83bae395",
            "port": "in"
          }
        }
      ]
    }
  },
  "dependencies": {}
}