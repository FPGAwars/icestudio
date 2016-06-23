{
  "board": "icezum",
  "graph": {
    "blocks": [
      {
        "id": "6796f28b-7f70-4c8d-adc8-b7f42d18b336",
        "type": "basic.code",
        "data": {
          "code": "// NOT logic gate\n\nassign c = ! a;",
          "ports": {
            "in": [
              "a"
            ],
            "out": [
              "c"
            ]
          }
        },
        "position": {
          "x": 240,
          "y": 80
        }
      },
      {
        "id": "ec18fe03-b702-43d3-afb2-156848805175",
        "type": "basic.input",
        "data": {
          "label": "x",
          "pin": {
            "name": "SW1",
            "value": "10"
          }
        },
        "position": {
          "x": 22,
          "y": 145
        }
      },
      {
        "id": "2b6984aa-9351-4d64-b4f8-48ef983cc738",
        "type": "basic.output",
        "data": {
          "label": "z",
          "pin": {
            "name": "LED0",
            "value": "95"
          }
        },
        "position": {
          "x": 765,
          "y": 145
        }
      }
    ],
    "wires": [
      {
        "source": {
          "block": "ec18fe03-b702-43d3-afb2-156848805175",
          "port": "out"
        },
        "target": {
          "block": "6796f28b-7f70-4c8d-adc8-b7f42d18b336",
          "port": "a"
        }
      },
      {
        "source": {
          "block": "6796f28b-7f70-4c8d-adc8-b7f42d18b336",
          "port": "c"
        },
        "target": {
          "block": "2b6984aa-9351-4d64-b4f8-48ef983cc738",
          "port": "in"
        }
      }
    ]
  },
  "deps": {}
}