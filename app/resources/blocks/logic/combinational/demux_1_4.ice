{
  "version": "1.1",
  "package": {
    "name": "Demux 1:4",
    "version": "1.0.0",
    "description": "Demultiplexer 1:4",
    "author": "Carlos Diaz",
    "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2090%2040%22%3E%3Cpath%20d=%22M-252%20421.9h24v7.3l41%2011.7v-9h25v-2h-25v-18h25v-2h-25v-9l-41%2011.8v7.2h-24v2zm26%205.7v-13.5l37-10.8v35l-37-10.7z%22/%3E%3C/svg%3E"
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "91e2ff2d-2430-41e5-9d21-bc9ec4082aaa",
          "type": "basic.output",
          "data": {
            "name": "o0",
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
            "x": 800,
            "y": 64
          }
        },
        {
          "id": "8a50b4e9-884d-49bb-98c3-3cd1e6cb3f4f",
          "type": "basic.code",
          "data": {
            "code": "assign {out3,out2,out1,out0} = in0 << {sel1,sel0};",
            "params": [],
            "ports": {
              "in": [
                {
                  "name": "in0"
                },
                {
                  "name": "sel0"
                },
                {
                  "name": "sel1"
                }
              ],
              "out": [
                {
                  "name": "out0"
                },
                {
                  "name": "out1"
                },
                {
                  "name": "out2"
                },
                {
                  "name": "out3"
                }
              ]
            }
          },
          "position": {
            "x": 248,
            "y": 88
          }
        },
        {
          "id": "5fc9a8e9-d463-4c1f-b6a3-185d5cabb406",
          "type": "basic.input",
          "data": {
            "name": "i",
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
            "x": 56,
            "y": 96
          }
        },
        {
          "id": "c6dc7002-dfc0-45fd-88e2-b5e5a75231f2",
          "type": "basic.output",
          "data": {
            "name": "o1",
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
            "x": 800,
            "y": 144
          }
        },
        {
          "id": "75cafe5a-1968-49ed-9e05-70d1bc3fbd0f",
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
            "x": 56,
            "y": 184
          }
        },
        {
          "id": "5e246f93-51ad-4d6f-83f1-4fcce69c5ae3",
          "type": "basic.output",
          "data": {
            "name": "o2",
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
            "x": 800,
            "y": 224
          }
        },
        {
          "id": "657dab9e-6580-4f02-b54f-66477863f26a",
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
            "x": 56,
            "y": 272
          }
        },
        {
          "id": "b9d764ea-538a-420f-a8d3-45af7a8e30a2",
          "type": "basic.output",
          "data": {
            "name": "o3",
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
            "x": 800,
            "y": 304
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "8a50b4e9-884d-49bb-98c3-3cd1e6cb3f4f",
            "port": "out0"
          },
          "target": {
            "block": "91e2ff2d-2430-41e5-9d21-bc9ec4082aaa",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "8a50b4e9-884d-49bb-98c3-3cd1e6cb3f4f",
            "port": "out1"
          },
          "target": {
            "block": "c6dc7002-dfc0-45fd-88e2-b5e5a75231f2",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "8a50b4e9-884d-49bb-98c3-3cd1e6cb3f4f",
            "port": "out2"
          },
          "target": {
            "block": "5e246f93-51ad-4d6f-83f1-4fcce69c5ae3",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "8a50b4e9-884d-49bb-98c3-3cd1e6cb3f4f",
            "port": "out3"
          },
          "target": {
            "block": "b9d764ea-538a-420f-a8d3-45af7a8e30a2",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "5fc9a8e9-d463-4c1f-b6a3-185d5cabb406",
            "port": "out"
          },
          "target": {
            "block": "8a50b4e9-884d-49bb-98c3-3cd1e6cb3f4f",
            "port": "in0"
          }
        },
        {
          "source": {
            "block": "75cafe5a-1968-49ed-9e05-70d1bc3fbd0f",
            "port": "out"
          },
          "target": {
            "block": "8a50b4e9-884d-49bb-98c3-3cd1e6cb3f4f",
            "port": "sel0"
          }
        },
        {
          "source": {
            "block": "657dab9e-6580-4f02-b54f-66477863f26a",
            "port": "out"
          },
          "target": {
            "block": "8a50b4e9-884d-49bb-98c3-3cd1e6cb3f4f",
            "port": "sel1"
          }
        }
      ]
    },
    "state": {
      "pan": {
        "x": 11.1761,
        "y": 3.2151
      },
      "zoom": 0.9235
    }
  },
  "dependencies": {}
}