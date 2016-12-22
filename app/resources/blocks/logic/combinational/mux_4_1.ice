{
  "version": "1.0",
  "package": {
    "name": "Mux 4:1",
    "version": "1.0.0",
    "description": "Multiplexer 4:1",
    "author": "Carlos Diaz",
    "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2090%2040%22%3E%3Cpath%20d=%22M-162%20419.9h-24v-7.2l-41-11.8v9h-25v2h25v18h-25v2h25v9l41-11.7v-7.4h24v-1.9zm-63%2018.5v-35l37%2010.8v13.5l-37%2010.7z%22/%3E%3C/svg%3E"
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "c3f73f68-1074-4355-b69f-6a20f7bea3e7",
          "type": "basic.input",
          "data": {
            "name": "i0",
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
            "x": 40,
            "y": 32
          }
        },
        {
          "id": "5fb29465-2ee7-45bb-afa4-9a3de895c774",
          "type": "basic.input",
          "data": {
            "name": "i1",
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
            "x": 40,
            "y": 104
          }
        },
        {
          "id": "e4eb896c-1039-4d73-aeb0-ce34b933f4c3",
          "type": "basic.code",
          "data": {
            "code": "reg _o;\nwire [1:0] _sel;\n\nassign _sel = {sel1, sel0};\n\nalways @(*) begin\n    case(_sel)\n        0: _o = in0;\n        1: _o = in1;\n        2: _o = in2;\n        3: _o = in3;\n        default: _o = in0;\n    endcase\nend\n\nassign o = _o;",
            "params": [],
            "ports": {
              "in": [
                {
                  "name": "in0",
                  "size": 1
                },
                {
                  "name": "in1",
                  "size": 1
                },
                {
                  "name": "in2",
                  "size": 1
                },
                {
                  "name": "in3",
                  "size": 1
                },
                {
                  "name": "sel0",
                  "size": 1
                },
                {
                  "name": "sel1",
                  "size": 1
                }
              ],
              "out": [
                {
                  "name": "o",
                  "size": 1
                }
              ]
            }
          },
          "position": {
            "x": 296,
            "y": 152
          }
        },
        {
          "id": "67ed5e09-486d-4f97-929f-aefea9c43951",
          "type": "basic.input",
          "data": {
            "name": "i2",
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
            "x": 40,
            "y": 184
          }
        },
        {
          "id": "061aa997-2f30-4591-8841-fb6abf5c3b2e",
          "type": "basic.output",
          "data": {
            "name": "o",
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
            "x": 776,
            "y": 248
          }
        },
        {
          "id": "8be9cded-6d06-4b23-b73c-94c7ff311dbc",
          "type": "basic.input",
          "data": {
            "name": "i3",
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
            "x": 40,
            "y": 256
          }
        },
        {
          "id": "1b7db016-c89a-4f65-b6f0-0f87c851c077",
          "type": "basic.input",
          "data": {
            "name": "sel0",
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
            "x": 40,
            "y": 328
          }
        },
        {
          "id": "a014971e-5470-490b-9058-b4b00f2dd125",
          "type": "basic.input",
          "data": {
            "name": "sel1",
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
            "x": 40,
            "y": 400
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "e4eb896c-1039-4d73-aeb0-ce34b933f4c3",
            "port": "o"
          },
          "target": {
            "block": "061aa997-2f30-4591-8841-fb6abf5c3b2e",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "a014971e-5470-490b-9058-b4b00f2dd125",
            "port": "out"
          },
          "target": {
            "block": "e4eb896c-1039-4d73-aeb0-ce34b933f4c3",
            "port": "sel1"
          }
        },
        {
          "source": {
            "block": "1b7db016-c89a-4f65-b6f0-0f87c851c077",
            "port": "out"
          },
          "target": {
            "block": "e4eb896c-1039-4d73-aeb0-ce34b933f4c3",
            "port": "sel0"
          }
        },
        {
          "source": {
            "block": "8be9cded-6d06-4b23-b73c-94c7ff311dbc",
            "port": "out"
          },
          "target": {
            "block": "e4eb896c-1039-4d73-aeb0-ce34b933f4c3",
            "port": "in3"
          }
        },
        {
          "source": {
            "block": "67ed5e09-486d-4f97-929f-aefea9c43951",
            "port": "out"
          },
          "target": {
            "block": "e4eb896c-1039-4d73-aeb0-ce34b933f4c3",
            "port": "in2"
          },
          "vertices": [
            {
              "x": 192,
              "y": 248
            }
          ]
        },
        {
          "source": {
            "block": "5fb29465-2ee7-45bb-afa4-9a3de895c774",
            "port": "out"
          },
          "target": {
            "block": "e4eb896c-1039-4d73-aeb0-ce34b933f4c3",
            "port": "in1"
          },
          "vertices": [
            {
              "x": 224,
              "y": 168
            }
          ]
        },
        {
          "source": {
            "block": "c3f73f68-1074-4355-b69f-6a20f7bea3e7",
            "port": "out"
          },
          "target": {
            "block": "e4eb896c-1039-4d73-aeb0-ce34b933f4c3",
            "port": "in0"
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
