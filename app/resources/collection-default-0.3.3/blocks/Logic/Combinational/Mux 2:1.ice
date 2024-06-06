{
  "version": "1.2",
  "package": {
    "name": "Mux 2:1",
    "version": "1.0.0",
    "description": "Multiplexer 2:1",
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
            "x": 80,
            "y": 120
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
            "x": 80,
            "y": 208
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
            "x": 792,
            "y": 208
          }
        },
        {
          "id": "67ed5e09-486d-4f97-929f-aefea9c43951",
          "type": "basic.input",
          "data": {
            "name": "sel",
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
            "x": 80,
            "y": 296
          }
        },
        {
          "id": "ba573190-2ead-411a-a323-1b15a22d46db",
          "type": "basic.code",
          "data": {
            "code": "reg _o;\n\nalways @(*) begin\n    case(sel0)\n        0: _o = in0;\n        1: _o = in1;\n        default: _o = in0;\n    endcase\nend\n\nassign o = _o;",
            "params": [],
            "ports": {
              "in": [
                {
                  "name": "in0"
                },
                {
                  "name": "in1"
                },
                {
                  "name": "sel0"
                }
              ],
              "out": [
                {
                  "name": "o"
                }
              ]
            }
          },
          "position": {
            "x": 312,
            "y": 112
          },
          "size": {
            "width": 384,
            "height": 256
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "ba573190-2ead-411a-a323-1b15a22d46db",
            "port": "o"
          },
          "target": {
            "block": "061aa997-2f30-4591-8841-fb6abf5c3b2e",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "c3f73f68-1074-4355-b69f-6a20f7bea3e7",
            "port": "out"
          },
          "target": {
            "block": "ba573190-2ead-411a-a323-1b15a22d46db",
            "port": "in0"
          }
        },
        {
          "source": {
            "block": "5fb29465-2ee7-45bb-afa4-9a3de895c774",
            "port": "out"
          },
          "target": {
            "block": "ba573190-2ead-411a-a323-1b15a22d46db",
            "port": "in1"
          }
        },
        {
          "source": {
            "block": "67ed5e09-486d-4f97-929f-aefea9c43951",
            "port": "out"
          },
          "target": {
            "block": "ba573190-2ead-411a-a323-1b15a22d46db",
            "port": "sel0"
          }
        }
      ]
    }
  },
  "dependencies": {}
}