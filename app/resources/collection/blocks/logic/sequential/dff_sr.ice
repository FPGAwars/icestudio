{
  "version": "1.1",
  "package": {
    "name": "DFF",
    "version": "1.0.0",
    "description": "Delay flip-flop with synchronous reset",
    "author": "Carlos Diaz",
    "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2090%2040%22%3E%3Ctext%20style=%22line-height:125%25%22%20x=%22-231.121%22%20y=%22429.867%22%20font-weight=%22400%22%20font-size=%2224.601%22%20font-family=%22sans-serif%22%20letter-spacing=%220%22%20word-spacing=%220%22%3E%3Ctspan%20x=%22-231.121%22%20y=%22429.867%22%3EDFF%3C/tspan%3E%3C/text%3E%3C/svg%3E"
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "b32a6101-5bd1-4bcf-ae5f-e569b958a6a2",
          "type": "basic.input",
          "data": {
            "name": "D",
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
            "x": 168,
            "y": 104
          }
        },
        {
          "id": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
          "type": "basic.code",
          "data": {
            "code": "// D flip-flop with synchronous reset\n\nreg _q = 1'b0;\n\nalways @(posedge clk)\nbegin\n    if(rst_n == 0)\n        _q = 1'b0;\n    else if(en)\n        _q <= d;\nend\n\nassign {q, q_n} = {_q, ~_q};\n",
            "params": [],
            "ports": {
              "in": [
                {
                  "name": "d"
                },
                {
                  "name": "en"
                },
                {
                  "name": "rst_n"
                },
                {
                  "name": "clk"
                }
              ],
              "out": [
                {
                  "name": "q"
                },
                {
                  "name": "q_n"
                }
              ]
            }
          },
          "position": {
            "x": 344,
            "y": 120
          }
        },
        {
          "id": "ffdd9aa2-aea3-4aa9-8431-80e799226774",
          "type": "basic.output",
          "data": {
            "name": "Q",
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
            "x": 824,
            "y": 152
          }
        },
        {
          "id": "50d69ac2-949d-476e-a711-420ba9f510cd",
          "type": "basic.input",
          "data": {
            "name": "en",
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
            "x": 168,
            "y": 176
          }
        },
        {
          "id": "07105e68-401b-49e9-b85f-2cddbfee9fbe",
          "type": "basic.input",
          "data": {
            "name": "rst_n",
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
            "x": 168,
            "y": 256
          }
        },
        {
          "id": "4a261f0b-523c-4fe0-ae1c-de05b8eb7e8a",
          "type": "basic.output",
          "data": {
            "name": "Q_n",
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
            "x": 824,
            "y": 280
          }
        },
        {
          "id": "6855f64f-fa1c-4371-b2e1-a98970674a96",
          "type": "basic.input",
          "data": {
            "name": "clk",
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
            "x": 168,
            "y": 328
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
            "port": "q"
          },
          "target": {
            "block": "ffdd9aa2-aea3-4aa9-8431-80e799226774",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
            "port": "q_n"
          },
          "target": {
            "block": "4a261f0b-523c-4fe0-ae1c-de05b8eb7e8a",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "b32a6101-5bd1-4bcf-ae5f-e569b958a6a2",
            "port": "out"
          },
          "target": {
            "block": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
            "port": "d"
          }
        },
        {
          "source": {
            "block": "50d69ac2-949d-476e-a711-420ba9f510cd",
            "port": "out"
          },
          "target": {
            "block": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
            "port": "en"
          }
        },
        {
          "source": {
            "block": "07105e68-401b-49e9-b85f-2cddbfee9fbe",
            "port": "out"
          },
          "target": {
            "block": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
            "port": "rst_n"
          }
        },
        {
          "source": {
            "block": "6855f64f-fa1c-4371-b2e1-a98970674a96",
            "port": "out"
          },
          "target": {
            "block": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
            "port": "clk"
          }
        }
      ]
    },
    "state": {
      "pan": {
        "x": -100,
        "y": 0
      },
      "zoom": 1
    }
  },
  "dependencies": {}
}
