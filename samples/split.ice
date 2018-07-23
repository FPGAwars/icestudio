{
  "version": "1.2",
  "package": {
    "name": "Split 4:1",
    "version": "1.0",
    "description": "Split a 4-bit bus into bits",
    "author": "Jesús Arroyo",
    "image": ""
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "a20ed6fe-ca4e-4648-9e62-8ec3d7fbfb9c",
          "type": "basic.output",
          "data": {
            "name": "out3",
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
            "x": 720,
            "y": 136
          }
        },
        {
          "id": "acbe271d-4e5b-43cd-9024-281a706267a1",
          "type": "basic.output",
          "data": {
            "name": "out2",
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
            "x": 720,
            "y": 192
          }
        },
        {
          "id": "83fd883e-245b-42ad-9069-6808f6c14ad4",
          "type": "basic.input",
          "data": {
            "name": "in",
            "range": "[3:0]",
            "pins": [
              {
                "index": "3",
                "name": "",
                "value": "0"
              },
              {
                "index": "2",
                "name": "",
                "value": "0"
              },
              {
                "index": "1",
                "name": "",
                "value": "0"
              },
              {
                "index": "0",
                "name": "",
                "value": "0"
              }
            ],
            "virtual": true,
            "clock": false
          },
          "position": {
            "x": 64,
            "y": 216
          }
        },
        {
          "id": "e04dce66-66d6-4e44-98b5-95b6c758c923",
          "type": "basic.output",
          "data": {
            "name": "out1",
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
            "x": 720,
            "y": 248
          }
        },
        {
          "id": "2b80bddc-b868-4b65-9117-fad207f5da37",
          "type": "basic.output",
          "data": {
            "name": "out0",
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
            "x": 720,
            "y": 304
          }
        },
        {
          "id": "c0bff986-e6fd-4731-9d0e-014e93478244",
          "type": "basic.code",
          "data": {
            "code": "assign {out3,out2,out1,out0} = in;",
            "params": [],
            "ports": {
              "in": [
                {
                  "name": "in",
                  "range": "[3:0]",
                  "size": 4
                }
              ],
              "out": [
                {
                  "name": "out3"
                },
                {
                  "name": "out2"
                },
                {
                  "name": "out1"
                },
                {
                  "name": "out0"
                }
              ]
            }
          },
          "position": {
            "x": 256,
            "y": 168
          },
          "size": {
            "width": 368,
            "height": 160
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "83fd883e-245b-42ad-9069-6808f6c14ad4",
            "port": "out"
          },
          "target": {
            "block": "c0bff986-e6fd-4731-9d0e-014e93478244",
            "port": "in"
          },
          "size": 4
        },
        {
          "source": {
            "block": "c0bff986-e6fd-4731-9d0e-014e93478244",
            "port": "out0"
          },
          "target": {
            "block": "2b80bddc-b868-4b65-9117-fad207f5da37",
            "port": "in"
          },
          "vertices": []
        },
        {
          "source": {
            "block": "c0bff986-e6fd-4731-9d0e-014e93478244",
            "port": "out1"
          },
          "target": {
            "block": "e04dce66-66d6-4e44-98b5-95b6c758c923",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "c0bff986-e6fd-4731-9d0e-014e93478244",
            "port": "out2"
          },
          "target": {
            "block": "acbe271d-4e5b-43cd-9024-281a706267a1",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "c0bff986-e6fd-4731-9d0e-014e93478244",
            "port": "out3"
          },
          "target": {
            "block": "a20ed6fe-ca4e-4648-9e62-8ec3d7fbfb9c",
            "port": "in"
          }
        }
      ]
    }
  },
  "dependencies": {}
}