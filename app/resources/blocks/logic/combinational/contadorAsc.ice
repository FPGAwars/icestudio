{
  "version": "1.0",
  "package": {
    "name": "contadorAsc",
    "version": "0.1",
    "description": "Contador ascendente de 4bits",
    "author": "Carlos Diaz",
    "image": ""
  },
  "design": {
    "board": "icestick",
    "graph": {
      "blocks": [
        {
          "id": "579cff99-2d27-41d4-a20b-262ca8a93ca9",
          "type": "basic.constant",
          "data": {
            "label": "INIT_CNT",
            "local": false,
            "value": "4'h2"
          },
          "position": {
            "x": 160,
            "y": 32
          }
        },
        {
          "id": "c299b4e2-ec25-4472-a58c-5dc46056c414",
          "type": "basic.constant",
          "data": {
            "label": "FIN_CNT",
            "local": false,
            "value": "4'h5"
          },
          "position": {
            "x": 352,
            "y": 32
          }
        },
        {
          "id": "c1e3529f-d1eb-4ae5-8345-a43512f21577",
          "type": "basic.output",
          "data": {
            "label": "out0",
            "pin": {
              "name": "D1",
              "value": "99"
            }
          },
          "position": {
            "x": 592,
            "y": 128
          }
        },
        {
          "id": "86492073-e297-4c25-9678-30ab6dd1fa10",
          "type": "basic.code",
          "data": {
            "code": "// INIT_CNT: Valor inicial de la cuenta\n// FIN_CNT: Valor final de la cuenta\n\n// El registro interno inicia su\n// cuenta a partir del valor del\n// parametro INIT_CNT\nreg [3:0] _o = INIT_CNT;\n\nalways @(posedge clk) begin\n    if (en) begin\n        _o <= _o + 1;\n        // cuando _o vale igual que\n        // el parametro FIN_CNT\n        // se \"reinicia\" la cuenta\n        // a partir de INIT_CNT\n        if (_o == FIN_CNT || _o == 4'hFF) begin\n            _o <= INIT_CNT;\n        end\n    end\nend\n\nassign {o3, o2, o1, o0} = _o;\n\n// (tc) terminal count, un clk de ancho a\n// la salida cuando termina _o vale FIN_CNT o 0\nwire tc = ((_o == FIN_CNT || _o == 4'hFF) ? 1 : 0);",
            "params": [
              "INIT_CNT",
              "FIN_CNT"
            ],
            "ports": {
              "in": [
                "en",
                "clk"
              ],
              "out": [
                "o0",
                "o1",
                "o2",
                "o3",
                "tc"
              ]
            }
          },
          "position": {
            "x": 112,
            "y": 176
          }
        },
        {
          "id": "1e21f6ca-9956-475d-a933-5bb01829f464",
          "type": "basic.output",
          "data": {
            "label": "out1",
            "pin": {
              "name": "D2",
              "value": "98"
            }
          },
          "position": {
            "x": 592,
            "y": 200
          }
        },
        {
          "id": "13b692a2-7ad9-44f7-afb9-83210bd94f28",
          "type": "bit.1",
          "data": {},
          "position": {
            "x": -72,
            "y": 208
          }
        },
        {
          "id": "e83e3ae9-0616-4a17-a145-f14954f3f6e0",
          "type": "basic.output",
          "data": {
            "label": "out2",
            "pin": {
              "name": "D3",
              "value": "97"
            }
          },
          "position": {
            "x": 592,
            "y": 272
          }
        },
        {
          "id": "8d6dece9-e3b8-42d4-b8eb-386c90440923",
          "type": "basic.input",
          "data": {
            "label": "clk",
            "pin": {
              "name": "CLK",
              "value": "21"
            }
          },
          "position": {
            "x": -80,
            "y": 336
          }
        },
        {
          "id": "1f036705-53b5-4833-83ed-adf0a7bf3b98",
          "type": "basic.output",
          "data": {
            "label": "out3",
            "pin": {
              "name": "TR8",
              "value": "117"
            }
          },
          "position": {
            "x": 592,
            "y": 344
          }
        },
        {
          "id": "a9409df4-b096-4ad0-a1c6-c6eb9bfa1d89",
          "type": "basic.output",
          "data": {
            "label": "tc",
            "pin": {
              "name": "D4",
              "value": "96"
            }
          },
          "position": {
            "x": 592,
            "y": 416
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "13b692a2-7ad9-44f7-afb9-83210bd94f28",
            "port": "19c8f68d-5022-487f-9ab0-f0a3cd58bead"
          },
          "target": {
            "block": "86492073-e297-4c25-9678-30ab6dd1fa10",
            "port": "en"
          }
        },
        {
          "source": {
            "block": "86492073-e297-4c25-9678-30ab6dd1fa10",
            "port": "o0"
          },
          "target": {
            "block": "c1e3529f-d1eb-4ae5-8345-a43512f21577",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "86492073-e297-4c25-9678-30ab6dd1fa10",
            "port": "o1"
          },
          "target": {
            "block": "1e21f6ca-9956-475d-a933-5bb01829f464",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "86492073-e297-4c25-9678-30ab6dd1fa10",
            "port": "o2"
          },
          "target": {
            "block": "e83e3ae9-0616-4a17-a145-f14954f3f6e0",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "86492073-e297-4c25-9678-30ab6dd1fa10",
            "port": "o3"
          },
          "target": {
            "block": "1f036705-53b5-4833-83ed-adf0a7bf3b98",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "86492073-e297-4c25-9678-30ab6dd1fa10",
            "port": "tc"
          },
          "target": {
            "block": "a9409df4-b096-4ad0-a1c6-c6eb9bfa1d89",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "579cff99-2d27-41d4-a20b-262ca8a93ca9",
            "port": "constant-out"
          },
          "target": {
            "block": "86492073-e297-4c25-9678-30ab6dd1fa10",
            "port": "INIT_CNT"
          }
        },
        {
          "source": {
            "block": "c299b4e2-ec25-4472-a58c-5dc46056c414",
            "port": "constant-out"
          },
          "target": {
            "block": "86492073-e297-4c25-9678-30ab6dd1fa10",
            "port": "FIN_CNT"
          }
        },
        {
          "source": {
            "block": "8d6dece9-e3b8-42d4-b8eb-386c90440923",
            "port": "out"
          },
          "target": {
            "block": "86492073-e297-4c25-9678-30ab6dd1fa10",
            "port": "clk"
          }
        }
      ]
    },
    "deps": {
      "bit.1": {
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
                "id": "b959fb96-ac67-4aea-90b3-ed35a4c17bf5",
                "type": "basic.code",
                "data": {
                  "code": "// Bit 1\n\nassign v = 1'b1;",
                  "ports": {
                    "in": [],
                    "out": [
                      "v"
                    ]
                  }
                },
                "position": {
                  "x": 96,
                  "y": 96
                }
              },
              {
                "id": "19c8f68d-5022-487f-9ab0-f0a3cd58bead",
                "type": "basic.output",
                "data": {
                  "label": ""
                },
                "position": {
                  "x": 608,
                  "y": 192
                }
              }
            ],
            "wires": [
              {
                "source": {
                  "block": "b959fb96-ac67-4aea-90b3-ed35a4c17bf5",
                  "port": "v"
                },
                "target": {
                  "block": "19c8f68d-5022-487f-9ab0-f0a3cd58bead",
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
        "x": 194.09767648117244,
        "y": 17.47600388566561
      },
      "zoom": 0.9124844670295715
    }
  }
}