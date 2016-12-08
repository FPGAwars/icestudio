{
  "image": "",
  "state": {
    "pan": {
      "x": 0,
      "y": 0
    },
    "zoom": 1
  },
  "board": "icezum",
  "graph": {
    "blocks": [
      {
        "id": "7de57b0c-2b62-4d25-864f-4cd940aa2aa5",
        "type": "basic.constant",
        "data": {
          "label": "C",
          "value": "1'b1"
        },
        "position": {
          "x": 152,
          "y": 56
        }
      },
      {
        "id": "6ca79224-5f67-4c69-95fd-32d27bdc67b4",
        "type": "basic.output",
        "data": {
          "label": "out",
          "pin": {
            "name": "LED0",
            "value": "95"
          }
        },
        "position": {
          "x": 336,
          "y": 184
        }
      }
    ],
    "wires": [
      {
        "source": {
          "block": "7de57b0c-2b62-4d25-864f-4cd940aa2aa5",
          "port": "constant-out"
        },
        "target": {
          "block": "6ca79224-5f67-4c69-95fd-32d27bdc67b4",
          "port": "in"
        },
        "vertices": [
          {
            "x": 208,
            "y": 216
          }
        ]
      }
    ]
  },
  "deps": {}
}