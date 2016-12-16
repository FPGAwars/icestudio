{
  "version": "1.0",
  "package": {
    "name": "Demux 1:8",
    "version": "1.0.0",
    "description": "Demultiplexer 1:8",
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
            "label": "o0"
          },
          "position": {
            "x": 784,
            "y": -128
          }
        },
        {
          "id": "c6dc7002-dfc0-45fd-88e2-b5e5a75231f2",
          "type": "basic.output",
          "data": {
            "label": "o1"
          },
          "position": {
            "x": 784,
            "y": -48
          }
        },
        {
          "id": "5e246f93-51ad-4d6f-83f1-4fcce69c5ae3",
          "type": "basic.output",
          "data": {
            "label": "o2"
          },
          "position": {
            "x": 784,
            "y": 32
          }
        },
        {
          "id": "5fc9a8e9-d463-4c1f-b6a3-185d5cabb406",
          "type": "basic.input",
          "data": {
            "label": "i"
          },
          "position": {
            "x": 16,
            "y": 40
          }
        },
        {
          "id": "1ea41d18-7010-42c0-932f-99d135efdb73",
          "type": "basic.code",
          "data": {
            "code": "assign {out7,out6,out5,out4,out3,out2,out1,out0} = in0 << {sel2,sel1,sel0};",
            "ports": {
              "in": [
                "in0",
                "sel0",
                "sel1",
                "sel2"
              ],
              "out": [
                "out0",
                "out1",
                "out2",
                "out3",
                "out4",
                "out5",
                "out6",
                "out7"
              ]
            }
          },
          "position": {
            "x": 208,
            "y": 64
          }
        },
        {
          "id": "b9d764ea-538a-420f-a8d3-45af7a8e30a2",
          "type": "basic.output",
          "data": {
            "label": "o3"
          },
          "position": {
            "x": 784,
            "y": 112
          }
        },
        {
          "id": "75cafe5a-1968-49ed-9e05-70d1bc3fbd0f",
          "type": "basic.input",
          "data": {
            "label": "sel0"
          },
          "position": {
            "x": 16,
            "y": 120
          }
        },
        {
          "id": "657dab9e-6580-4f02-b54f-66477863f26a",
          "type": "basic.input",
          "data": {
            "label": "sel1"
          },
          "position": {
            "x": 16,
            "y": 200
          }
        },
        {
          "id": "1b8510ac-d723-4226-bf28-c7329d0f73fb",
          "type": "basic.output",
          "data": {
            "label": "o4"
          },
          "position": {
            "x": 784,
            "y": 208
          }
        },
        {
          "id": "e1a156c8-5813-46f6-a4d4-c672857f3396",
          "type": "basic.input",
          "data": {
            "label": "sel2"
          },
          "position": {
            "x": 16,
            "y": 280
          }
        },
        {
          "id": "65f31fca-d607-4d5c-82cc-878a93b8e580",
          "type": "basic.output",
          "data": {
            "label": "o5"
          },
          "position": {
            "x": 784,
            "y": 304
          }
        },
        {
          "id": "c8fadd68-77e1-47be-a262-b076e878e6fd",
          "type": "basic.output",
          "data": {
            "label": "o6"
          },
          "position": {
            "x": 784,
            "y": 384
          }
        },
        {
          "id": "99ca2a23-7e0d-4c34-9ab1-988c6bf69633",
          "type": "basic.output",
          "data": {
            "label": "o7"
          },
          "position": {
            "x": 784,
            "y": 464
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "5fc9a8e9-d463-4c1f-b6a3-185d5cabb406",
            "port": "out"
          },
          "target": {
            "block": "1ea41d18-7010-42c0-932f-99d135efdb73",
            "port": "in0"
          }
        },
        {
          "source": {
            "block": "75cafe5a-1968-49ed-9e05-70d1bc3fbd0f",
            "port": "out"
          },
          "target": {
            "block": "1ea41d18-7010-42c0-932f-99d135efdb73",
            "port": "sel0"
          }
        },
        {
          "source": {
            "block": "657dab9e-6580-4f02-b54f-66477863f26a",
            "port": "out"
          },
          "target": {
            "block": "1ea41d18-7010-42c0-932f-99d135efdb73",
            "port": "sel1"
          }
        },
        {
          "source": {
            "block": "e1a156c8-5813-46f6-a4d4-c672857f3396",
            "port": "out"
          },
          "target": {
            "block": "1ea41d18-7010-42c0-932f-99d135efdb73",
            "port": "sel2"
          }
        },
        {
          "source": {
            "block": "1ea41d18-7010-42c0-932f-99d135efdb73",
            "port": "out0"
          },
          "target": {
            "block": "91e2ff2d-2430-41e5-9d21-bc9ec4082aaa",
            "port": "in"
          },
          "vertices": [
            {
              "x": 664,
              "y": -24
            }
          ]
        },
        {
          "source": {
            "block": "1ea41d18-7010-42c0-932f-99d135efdb73",
            "port": "out7"
          },
          "target": {
            "block": "99ca2a23-7e0d-4c34-9ab1-988c6bf69633",
            "port": "in"
          },
          "vertices": [
            {
              "x": 664,
              "y": 416
            }
          ]
        },
        {
          "source": {
            "block": "1ea41d18-7010-42c0-932f-99d135efdb73",
            "port": "out1"
          },
          "target": {
            "block": "c6dc7002-dfc0-45fd-88e2-b5e5a75231f2",
            "port": "in"
          },
          "vertices": [
            {
              "x": 680,
              "y": 32
            }
          ]
        },
        {
          "source": {
            "block": "1ea41d18-7010-42c0-932f-99d135efdb73",
            "port": "out2"
          },
          "target": {
            "block": "5e246f93-51ad-4d6f-83f1-4fcce69c5ae3",
            "port": "in"
          },
          "vertices": [
            {
              "x": 696,
              "y": 112
            }
          ]
        },
        {
          "source": {
            "block": "1ea41d18-7010-42c0-932f-99d135efdb73",
            "port": "out3"
          },
          "target": {
            "block": "b9d764ea-538a-420f-a8d3-45af7a8e30a2",
            "port": "in"
          },
          "vertices": [
            {
              "x": 712,
              "y": 176
            }
          ]
        },
        {
          "source": {
            "block": "1ea41d18-7010-42c0-932f-99d135efdb73",
            "port": "out4"
          },
          "target": {
            "block": "1b8510ac-d723-4226-bf28-c7329d0f73fb",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "1ea41d18-7010-42c0-932f-99d135efdb73",
            "port": "out5"
          },
          "target": {
            "block": "65f31fca-d607-4d5c-82cc-878a93b8e580",
            "port": "in"
          },
          "vertices": [
            {
              "x": 696,
              "y": 288
            }
          ]
        },
        {
          "source": {
            "block": "1ea41d18-7010-42c0-932f-99d135efdb73",
            "port": "out6"
          },
          "target": {
            "block": "c8fadd68-77e1-47be-a262-b076e878e6fd",
            "port": "in"
          },
          "vertices": [
            {
              "x": 680,
              "y": 320
            },
            {
              "x": 680,
              "y": 360
            },
            {
              "x": 680,
              "y": 376
            },
            {
              "x": 688,
              "y": 416
            }
          ]
        }
      ]
    },
    "deps": {},
    "state": {
      "pan": {
        "x": 75.69774669071234,
        "y": 148.91048230054443
      },
      "zoom": 0.6331667332315369
    }
  }
}
