{
  "version": "1.1",
  "package": {
    "name": "Complex",
    "version": "1.0",
    "description": "Example including projects as blocks",
    "author": "Jesús Arroyo",
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
            "x": 120,
            "y": 56
          }
        },
        {
          "id": "ceadef15-e833-414a-93e7-aea6f85a882b",
          "type": "894ab7f455e1e77e336f2e96457b1da7381a61bd",
          "position": {
            "x": 120,
            "y": 184
          }
        },
        {
          "id": "00824624-3f88-4f18-9983-3e45d52b19c7",
          "type": "88119a9ec745ebab0cf9098d339d2bbdd803db40",
          "position": {
            "x": 376,
            "y": 200
          }
        },
        {
          "id": "bf4b5914-c791-42d3-b876-df0e03d5a9a4",
          "type": "dd6af852895fb14362cdc5cb5f47c76353d7c7ad",
          "position": {
            "x": 536,
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
            "x": 120,
            "y": 296
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
            "y": 296
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
            "block": "bfebb831-8b03-43e1-9b87-013f1b5a9cdf",
            "port": "constant-out"
          },
          "target": {
            "block": "ceadef15-e833-414a-93e7-aea6f85a882b",
            "port": "909655b9-5ef0-4c45-9494-c0238d2e4732"
          }
        },
        {
          "source": {
            "block": "bf4b5914-c791-42d3-b876-df0e03d5a9a4",
            "port": "07895985-9d14-4a6f-8f2d-b2a6ddf61852"
          },
          "target": {
            "block": "0fbbb687-4a61-4b1d-a022-8884a20bef5c",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "21e9e7f9-9b8a-4fca-904d-e266f1496454",
            "port": "out"
          },
          "target": {
            "block": "00824624-3f88-4f18-9983-3e45d52b19c7",
            "port": "f6528039-852b-41f9-aa41-268994b3f631"
          },
          "vertices": [
            {
              "x": 296,
              "y": 288
            }
          ],
          "size": 2
        },
        {
          "source": {
            "block": "00824624-3f88-4f18-9983-3e45d52b19c7",
            "port": "60d40fc8-3388-4066-8f0a-af17e179a9bd"
          },
          "target": {
            "block": "bf4b5914-c791-42d3-b876-df0e03d5a9a4",
            "port": "a4058fa5-b66e-4e5e-b542-28d7c3e9d3cd"
          }
        },
        {
          "source": {
            "block": "ceadef15-e833-414a-93e7-aea6f85a882b",
            "port": "ef743d41-5941-4831-becd-0d930c4eed54"
          },
          "target": {
            "block": "00824624-3f88-4f18-9983-3e45d52b19c7",
            "port": "95f8c313-6e18-4ee3-b9cf-7266dec53c93"
          },
          "size": 4
        }
      ]
    },
    "state": {
      "pan": {
        "x": -54.0302,
        "y": 9.0372
      },
      "zoom": 1.1006
    }
  },
  "dependencies": {
    "894ab7f455e1e77e336f2e96457b1da7381a61bd": {
      "package": {
        "name": "Assign",
        "version": "1.0",
        "description": "Assign the value plus an offset to the 4bit output",
        "author": "Jesús Arroyo",
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
            "x": -64.05,
            "y": -22.58
          },
          "zoom": 1.1175
        }
      }
    },
    "88119a9ec745ebab0cf9098d339d2bbdd803db40": {
      "package": {
        "name": "Mux4:1",
        "version": "1.0",
        "description": "Multiplexer 4 to 1",
        "author": "Jesús Arroyo",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2081%2040%22%20width=%2281%22%20height=%2240%22%3E%3Cpath%20d=%22M-191%20419.9v-7.2l-41-11.8v40l41-11.7v-7.4zm-39%2018.5v-35l37%2010.8v13.5z%22/%3E%3C/svg%3E"
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
            "x": -8.7129,
            "y": 19.9356
          },
          "zoom": 1.0149
        }
      }
    },
    "dd6af852895fb14362cdc5cb5f47c76353d7c7ad": {
      "package": {
        "name": "Not",
        "version": "1.0",
        "description": "NOT logic gate",
        "author": "Jesús Arroyo",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2291.33%22%20height=%2245.752%22%20version=%221%22%3E%3Cpath%20d=%22M0%2020.446h27v2H0zm70.322.001h15.3v2h-15.3z%22/%3E%3Cpath%20d=%22M66.05%2026.746c-2.9%200-5.3-2.4-5.3-5.3s2.4-5.3%205.3-5.3%205.3%202.4%205.3%205.3-2.4%205.3-5.3%205.3zm0-8.6c-1.8%200-3.3%201.5-3.3%203.3%200%201.8%201.5%203.3%203.3%203.3%201.8%200%203.3-1.5%203.3-3.3%200-1.8-1.5-3.3-3.3-3.3z%22/%3E%3Cpath%20d=%22M25.962%202.563l33.624%2018.883L25.962%2040.33V2.563z%22%20fill=%22none%22%20stroke=%22#000%22%20stroke-width=%223%22/%3E%3C/svg%3E"
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
            "x": -38.5106,
            "y": 27.9681
          },
          "zoom": 1.0904
        }
      }
    }
  }
}