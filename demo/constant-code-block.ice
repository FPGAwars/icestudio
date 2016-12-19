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
          "id": "386bc685-d806-4487-bece-b442b8c8689c",
          "type": "basic.constant",
          "data": {
            "label": "C",
            "value": "1'b0"
          },
          "position": {
            "x": 280,
            "y": 48
          }
        },
        {
          "id": "b38fa7c5-3a2e-403b-b3d3-ac32917b5596",
          "type": "basic.code",
          "data": {
            "code": "assign o = v;",
            "params": [
              "v"
            ],
            "ports": {
              "in": [],
              "out": [
                "o"
              ]
            }
          },
          "position": {
            "x": 136,
            "y": 192
          }
        },
        {
          "id": "94e9a915-defe-4437-8abd-d3e57dafbb45",
          "type": "basic.output",
          "data": {
            "label": "led",
            "name": "led",
            "range": "",
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
            "x": 624,
            "y": 288
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "386bc685-d806-4487-bece-b442b8c8689c",
            "port": "constant-out"
          },
          "target": {
            "block": "b38fa7c5-3a2e-403b-b3d3-ac32917b5596",
            "port": "v"
          }
        },
        {
          "source": {
            "block": "b38fa7c5-3a2e-403b-b3d3-ac32917b5596",
            "port": "o"
          },
          "target": {
            "block": "94e9a915-defe-4437-8abd-d3e57dafbb45",
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