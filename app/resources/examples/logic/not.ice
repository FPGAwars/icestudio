{
  "board": "icezum",
  "graph": {
    "blocks": [
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
          "x": 31,
          "y": 67
        }
      },
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
          "x": 239,
          "y": 80
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
          "x": 756,
          "y": 147
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