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
          "id": "3ea55b72-cda0-4f43-886b-e225b00229a4",
          "type": "basic.constant",
          "data": {
            "label": "Value",
            "value": "1'b1"
          },
          "position": {
            "x": 296,
            "y": 32
          }
        },
        {
          "id": "eb6dddea-3a81-4e26-ab7d-ed107b3676c9",
          "type": "constant-code-block",
          "data": {},
          "position": {
            "x": 248,
            "y": 184
          }
        },
        {
          "id": "06bd1d14-7302-4dd7-9e95-650d1070a203",
          "type": "basic.output",
          "data": {
            "label": "led",
            "pin": {
              "name": "LED0",
              "value": "95"
            }
          },
          "position": {
            "x": 536,
            "y": 184
          }
        },
        {
          "id": "7217b44b-f3e6-4eb6-862b-1d55c0655ee7",
          "type": "constant-code-block",
          "data": {},
          "position": {
            "x": 392,
            "y": 328
          }
        },
        {
          "id": "019e1dba-a150-483a-9c95-c2970ec781a9",
          "type": "basic.output",
          "data": {
            "label": "led",
            "pin": {
              "name": "LED1",
              "value": "96"
            }
          },
          "position": {
            "x": 680,
            "y": 328
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "7217b44b-f3e6-4eb6-862b-1d55c0655ee7",
            "port": "94e9a915-defe-4437-8abd-d3e57dafbb45"
          },
          "target": {
            "block": "019e1dba-a150-483a-9c95-c2970ec781a9",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "3ea55b72-cda0-4f43-886b-e225b00229a4",
            "port": "constant-out"
          },
          "target": {
            "block": "eb6dddea-3a81-4e26-ab7d-ed107b3676c9",
            "port": "386bc685-d806-4487-bece-b442b8c8689c"
          }
        },
        {
          "source": {
            "block": "eb6dddea-3a81-4e26-ab7d-ed107b3676c9",
            "port": "94e9a915-defe-4437-8abd-d3e57dafbb45"
          },
          "target": {
            "block": "06bd1d14-7302-4dd7-9e95-650d1070a203",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "3ea55b72-cda0-4f43-886b-e225b00229a4",
            "port": "constant-out"
          },
          "target": {
            "block": "7217b44b-f3e6-4eb6-862b-1d55c0655ee7",
            "port": "386bc685-d806-4487-bece-b442b8c8689c"
          },
          "vertices": [
            {
              "x": 472,
              "y": 152
            }
          ]
        }
      ]
    },
    "deps": {
      "constant-code-block": {
        "version": "1.0",
        "package": {
          "name": "",
          "version": "",
          "description": "",
          "author": "",
          "image": ""
        },
        "design": {
          "graph": {
            "blocks": [
              {
                "id": "386bc685-d806-4487-bece-b442b8c8689c",
                "type": "basic.constant",
                "data": {
                  "label": "C",
                  "value": "1'b0"
                },
                "position": {
                  "x": 280,
                  "y": 48
                }
              },
              {
                "id": "94e9a915-defe-4437-8abd-d3e57dafbb45",
                "type": "basic.output",
                "data": {
                  "label": "led"
                },
                "position": {
                  "x": 624,
                  "y": 288
                }
              },
              {
                "id": "b38fa7c5-3a2e-403b-b3d3-ac32917b5596",
                "type": "basic.code",
                "data": {
                  "code": "assign o = v;",
                  "params": [
                    "v"
                  ],
                  "ports": {
                    "in": [],
                    "out": [
                      "o"
                    ]
                  }
                },
                "position": {
                  "x": 136,
                  "y": 192
                }
              }
            ],
            "wires": [
              {
                "source": {
                  "block": "386bc685-d806-4487-bece-b442b8c8689c",
                  "port": "constant-out"
                },
                "target": {
                  "block": "b38fa7c5-3a2e-403b-b3d3-ac32917b5596",
                  "port": "v"
                }
              },
              {
                "source": {
                  "block": "b38fa7c5-3a2e-403b-b3d3-ac32917b5596",
                  "port": "o"
                },
                "target": {
                  "block": "94e9a915-defe-4437-8abd-d3e57dafbb45",
                  "port": "in"
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
    },
    "state": {
      "pan": {
        "x": -139,
        "y": 20
      },
      "zoom": 0.9999999638409349
    }
  }
}