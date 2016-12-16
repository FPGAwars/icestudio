{
  "version": "1.0",
  "package": {
    "name": "Demux 1:2",
    "version": "1.0.0",
    "description": "Demultiplexer 1:2",
    "author": "Carlos Diaz",
    "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2090%2040%22%3E%3Cpath%20d=%22M-252%20421.9h24v7.3l41%2011.7v-9h25v-2h-25v-18h25v-2h-25v-9l-41%2011.8v7.2h-24v2zm26%205.7v-13.5l37-10.8v35l-37-10.7z%22/%3E%3C/svg%3E"
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "c8fdb023-d458-4657-899c-5749a256be09",
          "type": "basic.code",
          "data": {
            "code": "assign {out1,out0} = in0 << sel0;",
            "ports": {
              "in": [
                "in0",
                "sel0"
              ],
              "out": [
                "out0",
                "out1"
              ]
            }
          },
          "position": {
            "x": 208,
            "y": 64
          }
        },
        {
          "id": "5fc9a8e9-d463-4c1f-b6a3-185d5cabb406",
          "type": "basic.input",
          "data": {
            "label": "i"
          },
          "position": {
            "x": 0,
            "y": 96
          }
        },
        {
          "id": "91e2ff2d-2430-41e5-9d21-bc9ec4082aaa",
          "type": "basic.output",
          "data": {
            "label": "o0"
          },
          "position": {
            "x": 720,
            "y": 96
          }
        },
        {
          "id": "75cafe5a-1968-49ed-9e05-70d1bc3fbd0f",
          "type": "basic.input",
          "data": {
            "label": "sel"
          },
          "position": {
            "x": 0,
            "y": 224
          }
        },
        {
          "id": "c6dc7002-dfc0-45fd-88e2-b5e5a75231f2",
          "type": "basic.output",
          "data": {
            "label": "o1"
          },
          "position": {
            "x": 720,
            "y": 224
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "c8fdb023-d458-4657-899c-5749a256be09",
            "port": "out1"
          },
          "target": {
            "block": "c6dc7002-dfc0-45fd-88e2-b5e5a75231f2",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "c8fdb023-d458-4657-899c-5749a256be09",
            "port": "out0"
          },
          "target": {
            "block": "91e2ff2d-2430-41e5-9d21-bc9ec4082aaa",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "5fc9a8e9-d463-4c1f-b6a3-185d5cabb406",
            "port": "out"
          },
          "target": {
            "block": "c8fdb023-d458-4657-899c-5749a256be09",
            "port": "in0"
          }
        },
        {
          "source": {
            "block": "75cafe5a-1968-49ed-9e05-70d1bc3fbd0f",
            "port": "out"
          },
          "target": {
            "block": "c8fdb023-d458-4657-899c-5749a256be09",
            "port": "sel0"
          }
        }
      ]
    },
    "deps": {},
    "state": {
      "pan": {
        "x": 104.8444188797269,
        "y": 152.1580250587398
      },
      "zoom": 0.8586960682653878
    }
  }
}