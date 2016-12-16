{
  "version": "1.0",
  "package": {
    "name": "TFF async",
    "version": "1.0.0",
    "description": "Toggle flip-flop with asynchronous reset",
    "author": "Carlos Diaz",
    "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2090%2040%22%3E%3Cg%20font-weight=%22400%22%20font-size=%2224.601%22%20font-family=%22sans-serif%22%20letter-spacing=%220%22%20word-spacing=%220%22%3E%3Ctext%20style=%22line-height:125%25%22%20x=%22-227.932%22%20y=%22421.867%22%20transform=%22translate(0%20-1.964)%22%3E%3Ctspan%20x=%22-227.932%22%20y=%22421.867%22%3ETFF%3C/tspan%3E%3C/text%3E%3Ctext%20style=%22line-height:125%25%22%20x=%22-227.001%22%20y=%22438.935%22%20transform=%22translate(0%20-1.964)%22%3E%3Ctspan%20x=%22-227.001%22%20y=%22438.935%22%20font-size=%2213.75%22%3Easync%3C/tspan%3E%3C/text%3E%3C/g%3E%3C/svg%3E"
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "b32a6101-5bd1-4bcf-ae5f-e569b958a6a2",
          "type": "basic.input",
          "data": {
            "label": "T"
          },
          "position": {
            "x": 168,
            "y": 112
          }
        },
        {
          "id": "075956ce-9af4-49ea-9123-91786feaba4d",
          "type": "basic.code",
          "data": {
            "code": "// T flip-flop with asynchronous reset\n\nreg _q = 1'b0;\n\nalways @(posedge clk or negedge rst_n)\nbegin\n    if(rst_n == 0)\n        _q <= 1'b0;\n    else\n        if(en & t)\n            _q = ~_q;\nend\n\nassign {q, q_n} = {_q, ~_q};",
            "ports": {
              "in": [
                "t",
                "en",
                "rst_n",
                "clk"
              ],
              "out": [
                "q",
                "q_n"
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
            "label": "Q"
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
            "label": "en"
          },
          "position": {
            "x": 168,
            "y": 184
          }
        },
        {
          "id": "8fa94192-fba9-4c2a-be61-b8ca88389423",
          "type": "basic.input",
          "data": {
            "label": "rst*"
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
            "label": "Q*"
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
            "label": "clk"
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
            "block": "075956ce-9af4-49ea-9123-91786feaba4d",
            "port": "q"
          },
          "target": {
            "block": "ffdd9aa2-aea3-4aa9-8431-80e799226774",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "075956ce-9af4-49ea-9123-91786feaba4d",
            "port": "q_n"
          },
          "target": {
            "block": "4a261f0b-523c-4fe0-ae1c-de05b8eb7e8a",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "6855f64f-fa1c-4371-b2e1-a98970674a96",
            "port": "out"
          },
          "target": {
            "block": "075956ce-9af4-49ea-9123-91786feaba4d",
            "port": "clk"
          }
        },
        {
          "source": {
            "block": "b32a6101-5bd1-4bcf-ae5f-e569b958a6a2",
            "port": "out"
          },
          "target": {
            "block": "075956ce-9af4-49ea-9123-91786feaba4d",
            "port": "t"
          }
        },
        {
          "source": {
            "block": "50d69ac2-949d-476e-a711-420ba9f510cd",
            "port": "out"
          },
          "target": {
            "block": "075956ce-9af4-49ea-9123-91786feaba4d",
            "port": "en"
          }
        },
        {
          "source": {
            "block": "8fa94192-fba9-4c2a-be61-b8ca88389423",
            "port": "out"
          },
          "target": {
            "block": "075956ce-9af4-49ea-9123-91786feaba4d",
            "port": "rst_n"
          }
        }
      ]
    },
    "deps": {},
    "state": {
      "pan": {
        "x": -100,
        "y": 0
      },
      "zoom": 1
    }
  }
}