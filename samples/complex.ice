{
  "version": "1.2",
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
            "x": 704,
            "y": 224
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
            "x": 112,
            "y": 320
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
            "x": 704,
            "y": 320
          }
        },
        {
          "id": "bfebb831-8b03-43e1-9b87-013f1b5a9cdf",
          "type": "basic.constant",
          "data": {
            "name": "C",
            "value": "4'b1010",
            "local": false
          },
          "position": {
            "x": 112,
            "y": 88
          }
        },
        {
          "id": "83038d5e-e513-4677-9621-86982a8451e2",
          "type": "020b28e4cf51f767c7a70ef39afda26bbc780652",
          "position": {
            "x": 368,
            "y": 224
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "f18340fe-86cb-4cb4-8d4c-38abcdf9ac5d",
          "type": "c6871b49e229a4923964e3e03a842f9d8dd4e640",
          "position": {
            "x": 536,
            "y": 224
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "2f51c3f2-24ea-4a05-b6ce-fba02ebd165b",
          "type": "ea66cd513caebe3f7faa727d2a9d7e49f8d4e73c",
          "position": {
            "x": 112,
            "y": 208
          },
          "size": {
            "width": 96,
            "height": 64
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
            "block": "f18340fe-86cb-4cb4-8d4c-38abcdf9ac5d",
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
            "block": "83038d5e-e513-4677-9621-86982a8451e2",
            "port": "f6528039-852b-41f9-aa41-268994b3f631"
          },
          "vertices": [
            {
              "x": 288,
              "y": 288
            }
          ],
          "size": 2
        },
        {
          "source": {
            "block": "83038d5e-e513-4677-9621-86982a8451e2",
            "port": "60d40fc8-3388-4066-8f0a-af17e179a9bd"
          },
          "target": {
            "block": "f18340fe-86cb-4cb4-8d4c-38abcdf9ac5d",
            "port": "a4058fa5-b66e-4e5e-b542-28d7c3e9d3cd"
          }
        },
        {
          "source": {
            "block": "bfebb831-8b03-43e1-9b87-013f1b5a9cdf",
            "port": "constant-out"
          },
          "target": {
            "block": "2f51c3f2-24ea-4a05-b6ce-fba02ebd165b",
            "port": "909655b9-5ef0-4c45-9494-c0238d2e4732"
          }
        },
        {
          "source": {
            "block": "2f51c3f2-24ea-4a05-b6ce-fba02ebd165b",
            "port": "ef743d41-5941-4831-becd-0d930c4eed54"
          },
          "target": {
            "block": "83038d5e-e513-4677-9621-86982a8451e2",
            "port": "95f8c313-6e18-4ee3-b9cf-7266dec53c93"
          },
          "size": 4
        }
      ]
    }
  },
  "dependencies": {
    "020b28e4cf51f767c7a70ef39afda26bbc780652": {
      "package": {
        "name": "Mux4:1",
        "version": "1.1",
        "description": "Multiplexer 4 to 1",
        "author": "Jesús Arroyo",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2081%2040%22%20width=%2281%22%20height=%2240%22%3E%3Cpath%20d=%22M-191%20419.9v-7.2l-41-11.8v40l41-11.7v-7.4zm-39%2018.5v-35l37%2010.8v13.5z%22/%3E%3C/svg%3E"
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "95f8c313-6e18-4ee3-b9cf-7266dec53c93",
              "type": "basic.input",
              "data": {
                "name": "d",
                "range": "[3:0]",
                "size": 4
              },
              "position": {
                "x": 64,
                "y": 160
              }
            },
            {
              "id": "60d40fc8-3388-4066-8f0a-af17e179a9bd",
              "type": "basic.output",
              "data": {
                "name": "out"
              },
              "position": {
                "x": 720,
                "y": 192
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
                "x": 64,
                "y": 232
              }
            },
            {
              "id": "5e1563d7-86de-4618-a9b0-2a08075af9ec",
              "type": "basic.code",
              "data": {
                "code": "// Multiplexer 4 to 1\n\nassign out = data[sel];",
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
                "x": 312,
                "y": 152
              },
              "size": {
                "width": 272,
                "height": 144
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
              "vertices": [],
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
        }
      }
    },
    "c6871b49e229a4923964e3e03a842f9d8dd4e640": {
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
            },
            {
              "id": "364b95cc-e8ff-4c65-b332-d6125c5968ee",
              "type": "basic.code",
              "data": {
                "code": "// NOT logic gate\n\nassign b = ~a;",
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
              },
              "size": {
                "width": 384,
                "height": 256
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
        }
      }
    },
    "ea66cd513caebe3f7faa727d2a9d7e49f8d4e73c": {
      "package": {
        "name": "Assign",
        "version": "1.1",
        "description": "Assign the value plus an offset to the 4bit output",
        "author": "Jesús Arroyo",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22557.531%22%20height=%22417.407%22%20viewBox=%220%200%20522.68539%20391.31919%22%3E%3Ctext%20style=%22line-height:125%25;text-align:center%22%20x=%22388.929%22%20y=%22571.69%22%20font-weight=%22400%22%20font-size=%22382.156%22%20font-family=%22sans-serif%22%20letter-spacing=%220%22%20word-spacing=%220%22%20text-anchor=%22middle%22%20transform=%22translate(-127.586%20-256.42)%22%3E%3Ctspan%20x=%22388.929%22%20y=%22571.69%22%3E=%3C/tspan%3E%3C/text%3E%3C/svg%3E"
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "ef743d41-5941-4831-becd-0d930c4eed54",
              "type": "basic.output",
              "data": {
                "name": "out",
                "range": "[3:0]",
                "size": 4
              },
              "position": {
                "x": 616,
                "y": 240
              }
            },
            {
              "id": "909655b9-5ef0-4c45-9494-c0238d2e4732",
              "type": "basic.constant",
              "data": {
                "name": "value",
                "value": "4'b1110",
                "local": false
              },
              "position": {
                "x": 192,
                "y": 112
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
                "x": 328,
                "y": 112
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
                "x": 168,
                "y": 232
              },
              "size": {
                "width": 272,
                "height": 80
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
        }
      }
    }
  }
}