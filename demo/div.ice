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
          "id": "4aba74c5-d08d-4d91-9401-099c6aeceb64",
          "type": "basic.constant",
          "data": {
            "label": "M",
            "value": "12000000"
          },
          "position": {
            "x": 392,
            "y": -104
          }
        },
        {
          "id": "a2836617-8c44-4f54-9d1f-f2681c18db26",
          "type": "basic.code",
          "data": {
            "code": "// Div 12MHz / M\n\nlocalparam N = $clog2(M);\n\nreg [N-1:0] c = 0;\n\nalways @(posedge clk_in)\n  c <= (c == M - 1) ? 0 : c + 1;\n\nassign clk_out = c[N-1];",
            "params": [
              "M"
            ],
            "ports": {
              "in": [
                "clk_in"
              ],
              "out": [
                "clk_out"
              ]
            }
          },
          "position": {
            "x": 248,
            "y": 56
          }
        },
        {
          "id": "5e63bca8-458e-4d7a-ae46-dc2e457fdbf7",
          "type": "basic.input",
          "data": {
            "label": "clk",
            "name": "clk",
            "range": "",
            "pins": [
              {
                "index": "0",
                "name": "CLK",
                "value": "21"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 64,
            "y": 152
          }
        },
        {
          "id": "400c2d1d-bce3-4d7a-8ab9-078bd072e1b7",
          "type": "basic.output",
          "data": {
            "label": "",
            "name": "",
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
            "x": 752,
            "y": 152
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "5e63bca8-458e-4d7a-ae46-dc2e457fdbf7",
            "port": "out"
          },
          "target": {
            "block": "a2836617-8c44-4f54-9d1f-f2681c18db26",
            "port": "clk_in"
          }
        },
        {
          "source": {
            "block": "a2836617-8c44-4f54-9d1f-f2681c18db26",
            "port": "clk_out"
          },
          "target": {
            "block": "400c2d1d-bce3-4d7a-8ab9-078bd072e1b7",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "4aba74c5-d08d-4d91-9401-099c6aeceb64",
            "port": "constant-out"
          },
          "target": {
            "block": "a2836617-8c44-4f54-9d1f-f2681c18db26",
            "port": "M"
          }
        }
      ]
    },
    "deps": {},
    "state": {
      "pan": {
        "x": 3,
        "y": 145
      },
      "zoom": 0.9999999403953552
    }
  }
}