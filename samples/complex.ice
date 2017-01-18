{
  "version": "1.1",
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
          "id": "bfebb831-8b03-43e1-9b87-013f1b5a9cdf",
          "type": "basic.constant",
          "data": {
            "name": "C",
            "value": "4'b1010",
            "local": false
          },
          "position": {
            "x": 128,
            "y": 40
          }
        },
        {
          "id": "6f0cbf26-fd2e-4fa2-b55a-5f93e7af02c7",
          "type": "8be60c981ee16ae78ea91d5b17181c7a72c5e6fe",
          "position": {
            "x": 120,
            "y": 184
          }
        },
        {
          "id": "85073adf-db9b-4850-83de-8f9af24478ee",
          "type": "739ddadeeb546b401f15a37331dac9d9165a15f9",
          "position": {
            "x": 336,
            "y": 200
          }
        },
        {
          "id": "28a13e1c-47e8-4b22-b3f1-271bd5762ed7",
          "type": "a18ef3d9a87624c0875cb79ca115f0e625bf67d8",
          "position": {
            "x": 528,
            "y": 200
          }
        },
        {
          "id": "0fbbb687-4a61-4b1d-a022-8884a20bef5c",
          "type": "basic.output",
          "data": {
            "name": "led",
            "pins": [
              {
                "index": "0",
                "name": "LED7",
                "value": "104"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 712,
            "y": 200
          }
        },
        {
          "id": "21e9e7f9-9b8a-4fca-904d-e266f1496454",
          "type": "basic.input",
          "data": {
            "name": "in",
            "range": "[1:0]",
            "pins": [
              {
                "index": "1",
                "name": "SW1",
                "value": "10"
              },
              {
                "index": "0",
                "name": "SW2",
                "value": "11"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 152,
            "y": 280
          }
        },
        {
          "id": "6c809d38-547d-4c70-92eb-2d5c389429e7",
          "type": "basic.output",
          "data": {
            "name": "debug",
            "range": "[1:0]",
            "pins": [
              {
                "index": "1",
                "name": "LED1",
                "value": "96"
              },
              {
                "index": "0",
                "name": "LED0",
                "value": "95"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 712,
            "y": 280
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "21e9e7f9-9b8a-4fca-904d-e266f1496454",
            "port": "out"
          },
          "target": {
            "block": "6c809d38-547d-4c70-92eb-2d5c389429e7",
            "port": "in"
          },
          "size": 2
        },
        {
          "source": {
            "block": "21e9e7f9-9b8a-4fca-904d-e266f1496454",
            "port": "out"
          },
          "target": {
            "block": "85073adf-db9b-4850-83de-8f9af24478ee",
            "port": "f6528039-852b-41f9-aa41-268994b3f631"
          },
          "size": 2
        },
        {
          "source": {
            "block": "85073adf-db9b-4850-83de-8f9af24478ee",
            "port": "60d40fc8-3388-4066-8f0a-af17e179a9bd"
          },
          "target": {
            "block": "28a13e1c-47e8-4b22-b3f1-271bd5762ed7",
            "port": "a4058fa5-b66e-4e5e-b542-28d7c3e9d3cd"
          }
        },
        {
          "source": {
            "block": "28a13e1c-47e8-4b22-b3f1-271bd5762ed7",
            "port": "07895985-9d14-4a6f-8f2d-b2a6ddf61852"
          },
          "target": {
            "block": "0fbbb687-4a61-4b1d-a022-8884a20bef5c",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "6f0cbf26-fd2e-4fa2-b55a-5f93e7af02c7",
            "port": "ef743d41-5941-4831-becd-0d930c4eed54"
          },
          "target": {
            "block": "85073adf-db9b-4850-83de-8f9af24478ee",
            "port": "95f8c313-6e18-4ee3-b9cf-7266dec53c93"
          },
          "size": 4
        },
        {
          "source": {
            "block": "bfebb831-8b03-43e1-9b87-013f1b5a9cdf",
            "port": "constant-out"
          },
          "target": {
            "block": "6f0cbf26-fd2e-4fa2-b55a-5f93e7af02c7",
            "port": "909655b9-5ef0-4c45-9494-c0238d2e4732"
          }
        }
      ]
    },
    "state": {
      "pan": {
        "x": 0,
        "y": 0
      },
      "zoom": 1
    }
  },
  "dependencies": {
    "8be60c981ee16ae78ea91d5b17181c7a72c5e6fe": {
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
              "id": "909655b9-5ef0-4c45-9494-c0238d2e4732",
              "type": "basic.constant",
              "data": {
                "name": "Value",
                "value": "4'b1110",
                "local": false
              },
              "position": {
                "x": 192,
                "y": 56
              }
            },
            {
              "id": "7e351e09-634d-407c-ab7e-452519468292",
              "type": "basic.constant",
              "data": {
                "name": "offset",
                "value": "0",
                "local": true
              },
              "position": {
                "x": 384,
                "y": 56
              }
            },
            {
              "id": "b6bc7556-6362-45ca-80e5-6db7a3100c7d",
              "type": "basic.code",
              "data": {
                "code": "assign out = C + D;",
                "params": [
                  {
                    "name": "C"
                  },
                  {
                    "name": "D"
                  }
                ],
                "ports": {
                  "in": [],
                  "out": [
                    {
                      "name": "out",
                      "range": "[3:0]",
                      "size": 4
                    }
                  ]
                }
              },
              "position": {
                "x": 144,
                "y": 200
              }
            },
            {
              "id": "ef743d41-5941-4831-becd-0d930c4eed54",
              "type": "basic.output",
              "data": {
                "name": "out",
                "range": "[3:0]",
                "size": 4
              },
              "position": {
                "x": 680,
                "y": 296
              }
            }
          ],
          "wires": [
            {
              "source": {
                "block": "909655b9-5ef0-4c45-9494-c0238d2e4732",
                "port": "constant-out"
              },
              "target": {
                "block": "b6bc7556-6362-45ca-80e5-6db7a3100c7d",
                "port": "C"
              }
            },
            {
              "source": {
                "block": "7e351e09-634d-407c-ab7e-452519468292",
                "port": "constant-out"
              },
              "target": {
                "block": "b6bc7556-6362-45ca-80e5-6db7a3100c7d",
                "port": "D"
              }
            },
            {
              "source": {
                "block": "b6bc7556-6362-45ca-80e5-6db7a3100c7d",
                "port": "out"
              },
              "target": {
                "block": "ef743d41-5941-4831-becd-0d930c4eed54",
                "port": "in"
              },
              "size": 4
            }
          ]
        },
        "state": {
          "pan": {
            "x": 0,
            "y": 0
          },
          "zoom": 1
        }
      }
    },
    "739ddadeeb546b401f15a37331dac9d9165a15f9": {
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
              "id": "5e1563d7-86de-4618-a9b0-2a08075af9ec",
              "type": "basic.code",
              "data": {
                "code": "// Multiplexer 4 to 1 \nassign out = data[sel];",
                "params": [],
                "ports": {
                  "in": [
                    {
                      "name": "data",
                      "range": "[3:0]",
                      "size": 4
                    },
                    {
                      "name": "sel",
                      "range": "[1:0]",
                      "size": 2
                    }
                  ],
                  "out": [
                    {
                      "name": "out"
                    }
                  ]
                }
              },
              "position": {
                "x": 288,
                "y": 112
              }
            },
            {
              "id": "95f8c313-6e18-4ee3-b9cf-7266dec53c93",
              "type": "basic.input",
              "data": {
                "name": "d",
                "range": "[3:0]",
                "size": 4
              },
              "position": {
                "x": 48,
                "y": 144
              }
            },
            {
              "id": "60d40fc8-3388-4066-8f0a-af17e179a9bd",
              "type": "basic.output",
              "data": {
                "name": "out"
              },
              "position": {
                "x": 760,
                "y": 208
              }
            },
            {
              "id": "f6528039-852b-41f9-aa41-268994b3f631",
              "type": "basic.input",
              "data": {
                "name": "s",
                "range": "[1:0]",
                "size": 2
              },
              "position": {
                "x": 48,
                "y": 272
              }
            }
          ],
          "wires": [
            {
              "source": {
                "block": "95f8c313-6e18-4ee3-b9cf-7266dec53c93",
                "port": "out"
              },
              "target": {
                "block": "5e1563d7-86de-4618-a9b0-2a08075af9ec",
                "port": "data"
              },
              "size": 4
            },
            {
              "source": {
                "block": "f6528039-852b-41f9-aa41-268994b3f631",
                "port": "out"
              },
              "target": {
                "block": "5e1563d7-86de-4618-a9b0-2a08075af9ec",
                "port": "sel"
              },
              "size": 2
            },
            {
              "source": {
                "block": "5e1563d7-86de-4618-a9b0-2a08075af9ec",
                "port": "out"
              },
              "target": {
                "block": "60d40fc8-3388-4066-8f0a-af17e179a9bd",
                "port": "in"
              }
            }
          ]
        },
        "state": {
          "pan": {
            "x": 0,
            "y": 0
          },
          "zoom": 1
        }
      }
    },
    "a18ef3d9a87624c0875cb79ca115f0e625bf67d8": {
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
              "id": "364b95cc-e8ff-4c65-b332-d6125c5968ee",
              "type": "basic.code",
              "data": {
                "code": "// NOT logic gate\nassign b = ~a;",
                "params": [],
                "ports": {
                  "in": [
                    {
                      "name": "a"
                    }
                  ],
                  "out": [
                    {
                      "name": "b"
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
              "id": "a4058fa5-b66e-4e5e-b542-28d7c3e9d3cd",
              "type": "basic.input",
              "data": {
                "name": ""
              },
              "position": {
                "x": 72,
                "y": 184
              }
            },
            {
              "id": "07895985-9d14-4a6f-8f2d-b2a6ddf61852",
              "type": "basic.output",
              "data": {
                "name": ""
              },
              "position": {
                "x": 728,
                "y": 184
              }
            }
          ],
          "wires": [
            {
              "source": {
                "block": "a4058fa5-b66e-4e5e-b542-28d7c3e9d3cd",
                "port": "out"
              },
              "target": {
                "block": "364b95cc-e8ff-4c65-b332-d6125c5968ee",
                "port": "a"
              }
            },
            {
              "source": {
                "block": "364b95cc-e8ff-4c65-b332-d6125c5968ee",
                "port": "b"
              },
              "target": {
                "block": "07895985-9d14-4a6f-8f2d-b2a6ddf61852",
                "port": "in"
              }
            }
          ]
        },
        "state": {
          "pan": {
            "x": 0,
            "y": 0
          },
          "zoom": 1
        }
      }
    }
  }
}