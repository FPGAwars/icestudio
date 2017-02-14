{
  "version": "1.1",
  "package": {
    "name": "TFF",
    "version": "1.0.0",
    "description": "Toggle flip-flop with synchronous reset",
    "author": "Carlos Diaz",
    "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2090%2040%22%3E%3Ctext%20style=%22line-height:125%25%22%20x=%22-227.932%22%20y=%22429.867%22%20font-weight=%22400%22%20font-size=%2224.601%22%20font-family=%22sans-serif%22%20letter-spacing=%220%22%20word-spacing=%220%22%3E%3Ctspan%20x=%22-227.932%22%20y=%22429.867%22%3ETFF%3C/tspan%3E%3C/text%3E%3C/svg%3E"
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "b32a6101-5bd1-4bcf-ae5f-e569b958a6a2",
          "type": "basic.input",
          "data": {
            "name": "T",
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
          "id": "163997db-34b5-4c61-a06c-5ab94207674a",
          "type": "basic.code",
          "data": {
            "code": "// T flip-flop with synchronous reset\n\nreg _q = 1'b0;\n\nalways @(posedge clk)\nbegin\n    if(rst_n == 0)\n        _q <= 1'b0;\n    else\n        if(en & t)\n            _q = ~_q;\nend\n\nassign {q, q_n} = {_q, ~_q};",
            "params": [],
            "ports": {
              "in": [
                {
                  "name": "t"
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
          "id": "8fa94192-fba9-4c2a-be61-b8ca88389423",
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
            "block": "163997db-34b5-4c61-a06c-5ab94207674a",
            "port": "q"
          },
          "target": {
            "block": "ffdd9aa2-aea3-4aa9-8431-80e799226774",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "163997db-34b5-4c61-a06c-5ab94207674a",
            "port": "q_n"
          },
          "target": {
            "block": "4a261f0b-523c-4fe0-ae1c-de05b8eb7e8a",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "50d69ac2-949d-476e-a711-420ba9f510cd",
            "port": "out"
          },
          "target": {
            "block": "163997db-34b5-4c61-a06c-5ab94207674a",
            "port": "en"
          }
        },
        {
          "source": {
            "block": "8fa94192-fba9-4c2a-be61-b8ca88389423",
            "port": "out"
          },
          "target": {
            "block": "163997db-34b5-4c61-a06c-5ab94207674a",
            "port": "rst_n"
          }
        },
        {
          "source": {
            "block": "b32a6101-5bd1-4bcf-ae5f-e569b958a6a2",
            "port": "out"
          },
          "target": {
            "block": "163997db-34b5-4c61-a06c-5ab94207674a",
            "port": "t"
          }
        },
        {
          "source": {
            "block": "6855f64f-fa1c-4371-b2e1-a98970674a96",
            "port": "out"
          },
          "target": {
            "block": "163997db-34b5-4c61-a06c-5ab94207674a",
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
