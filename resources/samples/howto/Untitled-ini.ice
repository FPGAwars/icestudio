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
          "id": "149b01c2-1ec3-4156-bd16-741baa64cedd",
          "type": "basic.input",
          "data": {
            "name": "a",
            "pins": [
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
            "x": -600,
            "y": 80
          }
        },
        {
          "id": "242b2a8b-7032-4376-a149-89e574437195",
          "type": "basic.output",
          "data": {
            "name": "e",
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
            "x": -232,
            "y": 80
          }
        },
        {
          "id": "c85f1b95-eddf-4e42-b49e-91be81aff216",
          "type": "2fa1b5e2ab379d4aa2f25ff2ff5a6874c24d3cab",
          "position": {
            "x": 152,
            "y": 88
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "2f83fc57-fe27-4a28-9d2d-4412357a7695",
          "type": "b976cb296df6f254be669646980f6ddb8504dbbc",
          "position": {
            "x": 368,
            "y": 88
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "65c3e360-92cf-4713-ac6b-dcdb924d3042",
          "type": "20a1db0a310fc90e729971eb2f687b93980e728a",
          "position": {
            "x": 592,
            "y": 88
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "f481a906-15f8-454a-b49d-0a87653fbbd6",
          "type": "basic.constant",
          "data": {
            "name": "C",
            "value": "4'b1010",
            "local": false
          },
          "position": {
            "x": 1832,
            "y": 88
          }
        },
        {
          "id": "f8ba15a9-476a-488b-ad4e-b13e5d8eac52",
          "type": "basic.constant",
          "data": {
            "name": "D",
            "value": "3",
            "local": true
          },
          "position": {
            "x": 2088,
            "y": 88
          }
        },
        {
          "id": "cb2cc751-181d-4f20-bc9a-358a3a7a1c29",
          "type": "862d2a36c72ddee13ea44bf906fe1b60efa90941",
          "position": {
            "x": 1000,
            "y": 144
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "7053e8b4-1ce5-4e79-bd68-8cf6f7d636f7",
          "type": "basic.output",
          "data": {
            "name": "f",
            "range": "[2:1]",
            "pins": [
              {
                "index": "2",
                "name": "",
                "value": "0"
              },
              {
                "index": "1",
                "name": "",
                "value": "0"
              }
            ],
            "virtual": true
          },
          "position": {
            "x": -232,
            "y": 160
          }
        },
        {
          "id": "ae7b1837-44d2-44e8-aafc-4b95f721dff0",
          "type": "basic.input",
          "data": {
            "name": "b",
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
            "x": -600,
            "y": 168
          }
        },
        {
          "id": "6657ee95-3587-4a3d-bb6a-a5057a6b39a9",
          "type": "basic.input",
          "data": {
            "name": "button",
            "pins": [
              {
                "index": "0",
                "name": "",
                "value": "0"
              }
            ],
            "virtual": false,
            "clock": false
          },
          "position": {
            "x": 1272,
            "y": 184
          }
        },
        {
          "id": "db5df01f-3d10-49fa-beef-f22c3092dab9",
          "type": "d3eb33feb70713f2e692b013d6d566bdfa08c12a",
          "position": {
            "x": 1472,
            "y": 184
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "191a71dc-3d6e-474e-97e1-a7fd67e4baab",
          "type": "basic.output",
          "data": {
            "name": "g",
            "pins": [
              {
                "index": "0",
                "name": "D10",
                "value": "141"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": -232,
            "y": 248
          }
        },
        {
          "id": "54e0fdc4-0a39-46ac-b0ca-c0c26c9a7772",
          "type": "basic.input",
          "data": {
            "name": "c",
            "pins": [
              {
                "index": "0",
                "name": "D9",
                "value": "139"
              }
            ],
            "virtual": false,
            "clock": false
          },
          "position": {
            "x": -600,
            "y": 264
          }
        },
        {
          "id": "ef983381-ce6e-4128-86e1-a131bf8fd1da",
          "type": "d4cb6d2864f9eb5cf1bfde915b8338af38d9753a",
          "position": {
            "x": 248,
            "y": 272
          },
          "size": {
            "width": 96,
            "height": 128
          }
        },
        {
          "id": "3d9f978e-20ea-4158-b358-53a2c348abcf",
          "type": "ddd2fad062ba832388938ba74bb3f6c211b8e440",
          "position": {
            "x": 496,
            "y": 288
          },
          "size": {
            "width": 96,
            "height": 96
          }
        },
        {
          "id": "cd4d4d8c-108c-4532-a04e-1739433c9a87",
          "type": "3e6c249e205080168c1bf4ee8dbc33b50653d5f4",
          "position": {
            "x": 1000,
            "y": 320
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "a195c6ec-4f1f-4c2d-92c6-4fc4ddbe394e",
          "type": "basic.output",
          "data": {
            "name": "h",
            "range": "[3:0]",
            "pins": [
              {
                "index": "3",
                "name": "LED3",
                "value": "98"
              },
              {
                "index": "2",
                "name": "LED2",
                "value": "97"
              },
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
            "x": -232,
            "y": 328
          }
        },
        {
          "id": "f70ee0e4-44e8-474d-a969-0e6cf5fdb28a",
          "type": "basic.input",
          "data": {
            "name": "d",
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
            "virtual": false,
            "clock": false
          },
          "position": {
            "x": -600,
            "y": 360
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "6657ee95-3587-4a3d-bb6a-a5057a6b39a9",
            "port": "out"
          },
          "target": {
            "block": "db5df01f-3d10-49fa-beef-f22c3092dab9",
            "port": "bb4a1ca9-1b30-471e-92ca-ca7ff2fc1150"
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
    "2fa1b5e2ab379d4aa2f25ff2ff5a6874c24d3cab": {
      "package": {
        "name": "OR",
        "version": "1.0.0",
        "description": "OR logic gate",
        "author": "Jesús Arroyo",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2290%22%20height=%2240%22%20version=%221%22%3E%3Cpath%20d=%22M65%2020h25M26%2010H0M27%2030H0%22%20fill=%22none%22%20stroke=%22#000%22%20stroke-width=%222%22/%3E%3Cpath%20d=%22M19.094%200l2%202.438s5.656%207%205.656%2017.562c0%2010.562-5.656%2017.563-5.656%2017.563l-2%202.437H36.25c2.408%200%207.69.025%2013.625-2.406s12.537-7.344%2017.688-16.875L66.25%2020l1.313-.719C57.258.216%2041.007%200%2036.25%200H19.094zm5.875%203H36.25c4.684%200%2018.287-.13%2027.969%2017-4.767%208.43-10.522%2012.684-15.719%2014.813C43.14%2037.008%2038.658%2037%2036.25%2037H25c1.874-3.108%204.75-9.05%204.75-17%200-7.973-2.909-13.9-4.781-17z%22%20fill-rule=%22evenodd%22/%3E%3C/svg%3E"
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "00925b04-5004-4307-a737-fa4e97c8b6ab",
              "type": "basic.code",
              "data": {
                "code": "// OR logic gate\n\nassign c = a | b;",
                "params": [],
                "ports": {
                  "in": [
                    {
                      "name": "a"
                    },
                    {
                      "name": "b"
                    }
                  ],
                  "out": [
                    {
                      "name": "c"
                    }
                  ]
                }
              },
              "position": {
                "x": 256,
                "y": 48
              }
            },
            {
              "id": "18c2ebc7-5152-439c-9b3f-851c59bac834",
              "type": "basic.input",
              "data": {
                "name": ""
              },
              "position": {
                "x": 64,
                "y": 80
              }
            },
            {
              "id": "664caf9e-5f40-4df4-800a-b626af702e62",
              "type": "basic.output",
              "data": {
                "name": ""
              },
              "position": {
                "x": 752,
                "y": 144
              }
            },
            {
              "id": "97b51945-d716-4b6c-9db9-970d08541249",
              "type": "basic.input",
              "data": {
                "name": ""
              },
              "position": {
                "x": 64,
                "y": 208
              }
            }
          ],
          "wires": [
            {
              "source": {
                "block": "18c2ebc7-5152-439c-9b3f-851c59bac834",
                "port": "out"
              },
              "target": {
                "block": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "port": "a"
              }
            },
            {
              "source": {
                "block": "97b51945-d716-4b6c-9db9-970d08541249",
                "port": "out"
              },
              "target": {
                "block": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "port": "b"
              }
            },
            {
              "source": {
                "block": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "port": "c"
              },
              "target": {
                "block": "664caf9e-5f40-4df4-800a-b626af702e62",
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
    "b976cb296df6f254be669646980f6ddb8504dbbc": {
      "package": {
        "name": "NAND",
        "version": "1.0.0",
        "description": "NAND logic gate",
        "author": "Carlos Diaz",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2090%2040%22%3E%3Cpath%20d=%22M-252%20409.9h26v2h-26zM-252%20429.9h27v2h-27z%22/%3E%3Cpath%20d=%22M-227%20400.9v39.9h20.4c11.3%200%2020-9%2020-20s-8.7-20-20-20H-227zm2.9%202.8h17.6c9.8%200%2016.7%207.6%2016.7%2017.1%200%209.5-7.4%2017.1-17.1%2017.1H-224c-.1.1-.1-34.2-.1-34.2zM-177.3%20419.9h15.3v2h-15.3z%22/%3E%3Cpath%20d=%22M-181.4%20426.3c-2.9%200-5.3-2.4-5.3-5.3s2.4-5.3%205.3-5.3%205.3%202.4%205.3%205.3-2.4%205.3-5.3%205.3zm0-8.6c-1.8%200-3.3%201.5-3.3%203.3%200%201.8%201.5%203.3%203.3%203.3s3.3-1.5%203.3-3.3c0-1.8-1.5-3.3-3.3-3.3z%22/%3E%3C/svg%3E"
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "00925b04-5004-4307-a737-fa4e97c8b6ab",
              "type": "basic.code",
              "data": {
                "code": "// NAND logic gate\n\nassign c = ~(a & b);",
                "params": [],
                "ports": {
                  "in": [
                    {
                      "name": "a"
                    },
                    {
                      "name": "b"
                    }
                  ],
                  "out": [
                    {
                      "name": "c"
                    }
                  ]
                }
              },
              "position": {
                "x": 256,
                "y": 48
              }
            },
            {
              "id": "18c2ebc7-5152-439c-9b3f-851c59bac834",
              "type": "basic.input",
              "data": {
                "name": ""
              },
              "position": {
                "x": 64,
                "y": 80
              }
            },
            {
              "id": "664caf9e-5f40-4df4-800a-b626af702e62",
              "type": "basic.output",
              "data": {
                "name": ""
              },
              "position": {
                "x": 752,
                "y": 144
              }
            },
            {
              "id": "97b51945-d716-4b6c-9db9-970d08541249",
              "type": "basic.input",
              "data": {
                "name": ""
              },
              "position": {
                "x": 64,
                "y": 208
              }
            }
          ],
          "wires": [
            {
              "source": {
                "block": "18c2ebc7-5152-439c-9b3f-851c59bac834",
                "port": "out"
              },
              "target": {
                "block": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "port": "a"
              }
            },
            {
              "source": {
                "block": "97b51945-d716-4b6c-9db9-970d08541249",
                "port": "out"
              },
              "target": {
                "block": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "port": "b"
              }
            },
            {
              "source": {
                "block": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "port": "c"
              },
              "target": {
                "block": "664caf9e-5f40-4df4-800a-b626af702e62",
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
    "20a1db0a310fc90e729971eb2f687b93980e728a": {
      "package": {
        "name": "XNOR",
        "version": "1.0.0",
        "description": "XNOR logic gate",
        "author": "Carlos Diaz",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2090%2040%22%3E%3Cpath%20d=%22M-252%20409.9h26v2h-26zM-252%20429.9h27v2h-27zM-177.3%20419.9h15.3v2h-15.3z%22/%3E%3Cpath%20d=%22M-181.4%20426.2c-2.9%200-5.3-2.4-5.3-5.3s2.4-5.3%205.3-5.3%205.3%202.4%205.3%205.3-2.4%205.3-5.3%205.3zm0-8.6c-1.8%200-3.3%201.5-3.3%203.3%200%201.8%201.5%203.3%203.3%203.3s3.3-1.5%203.3-3.3c0-1.8-1.5-3.3-3.3-3.3z%22/%3E%3Cpath%20d=%22M-185.3%20422.6l-.3-2.1.4-1.6c-10.3-17.8-26-18-30.6-18H-233l2%202.4s5.7%207%205.7%2017.6c0%2010.6-5.7%2017.6-5.7%2017.6l-2%202.4h17.2c2.4%200%207.7%200%2013.6-2.4%205.7-2.3%2012-6.9%2017-15.7l-.1-.2zm-18.2%2013.1c-5.4%202.2-9.8%202.2-12.3%202.2H-227c1.9-3.1%204.8-9%204.8-17s-2.9-13.9-4.8-17h11.3c4.7%200%2018.3-.1%2028%2017-4.8%208.4-10.6%2012.7-15.8%2014.8z%22/%3E%3Cpath%20d=%22M-238.3%20440.9h3.6c2.3-3.7%206.5-11.6%206.5-19.8%200-8.5-4.4-16.5-6.8-20.2h-3.6c1.4%202%207.4%2011%207.4%2020.2%200%208.9-5.7%2017.7-7.1%2019.8z%22/%3E%3C/svg%3E"
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "00925b04-5004-4307-a737-fa4e97c8b6ab",
              "type": "basic.code",
              "data": {
                "code": "// XNOR logic gate\n\nassign c = ~(a ^ b);",
                "params": [],
                "ports": {
                  "in": [
                    {
                      "name": "a"
                    },
                    {
                      "name": "b"
                    }
                  ],
                  "out": [
                    {
                      "name": "c"
                    }
                  ]
                }
              },
              "position": {
                "x": 256,
                "y": 48
              }
            },
            {
              "id": "18c2ebc7-5152-439c-9b3f-851c59bac834",
              "type": "basic.input",
              "data": {
                "name": ""
              },
              "position": {
                "x": 64,
                "y": 80
              }
            },
            {
              "id": "664caf9e-5f40-4df4-800a-b626af702e62",
              "type": "basic.output",
              "data": {
                "name": ""
              },
              "position": {
                "x": 752,
                "y": 144
              }
            },
            {
              "id": "97b51945-d716-4b6c-9db9-970d08541249",
              "type": "basic.input",
              "data": {
                "name": ""
              },
              "position": {
                "x": 64,
                "y": 208
              }
            }
          ],
          "wires": [
            {
              "source": {
                "block": "18c2ebc7-5152-439c-9b3f-851c59bac834",
                "port": "out"
              },
              "target": {
                "block": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "port": "a"
              }
            },
            {
              "source": {
                "block": "97b51945-d716-4b6c-9db9-970d08541249",
                "port": "out"
              },
              "target": {
                "block": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "port": "b"
              }
            },
            {
              "source": {
                "block": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "port": "c"
              },
              "target": {
                "block": "664caf9e-5f40-4df4-800a-b626af702e62",
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
    "862d2a36c72ddee13ea44bf906fe1b60efa90941": {
      "package": {
        "name": "Bit 0",
        "version": "1.0.0",
        "description": "Assign 0 to the output wire",
        "author": "Jesús Arroyo",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2247.303%22%20height=%2227.648%22%20viewBox=%220%200%2044.346456%2025.919999%22%3E%3Ctext%20style=%22line-height:125%25%22%20x=%22325.37%22%20y=%22315.373%22%20font-weight=%22400%22%20font-size=%2212.669%22%20font-family=%22sans-serif%22%20letter-spacing=%220%22%20word-spacing=%220%22%20transform=%22translate(-307.01%20-298.51)%22%3E%3Ctspan%20x=%22325.37%22%20y=%22315.373%22%20style=%22-inkscape-font-specification:'Courier%2010%20Pitch'%22%20font-family=%22Courier%2010%20Pitch%22%3E0%3C/tspan%3E%3C/text%3E%3C/svg%3E"
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "b959fb96-ac67-4aea-90b3-ed35a4c17bf5",
              "type": "basic.code",
              "data": {
                "code": "// Bit 0\n\nassign v = 1'b0;",
                "params": [],
                "ports": {
                  "in": [],
                  "out": [
                    {
                      "name": "v"
                    }
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
                "name": ""
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
        "state": {
          "pan": {
            "x": 0,
            "y": 0
          },
          "zoom": 1
        }
      }
    },
    "d3eb33feb70713f2e692b013d6d566bdfa08c12a": {
      "package": {
        "name": "Pull up inv",
        "version": "1.0.0",
        "description": "FPGA internal pull up configuration on the connected input port plus a logic inverter",
        "author": "Juan González",
        "image": "%3Csvg%20id=%22svg2%22%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-265%20401.5%2063.5%2038.4%22%3E%3Cstyle%3E.st0%7Bdisplay:none%7D.st1%7Bfill:none;stroke:#000;stroke-width:.75;stroke-linejoin:round;stroke-miterlimit:10%7D.st2%7Bfill:#010002%7D%3C/style%3E%3Cpath%20class=%22st0%22%20d=%22M-242.5%20411.8v11.8h-5.4v-11.8h5.4m1-1h-7.4v13.8h7.4v-13.8z%22/%3E%3Cpath%20d=%22M-207.6%20425.4c-.3-.9-1.1-1.6-2.1-1.6-1.1%200-2%20.8-2.2%201.8l-15.4-8.7v8.5h-17.4v-2.7c0-.2-.1-.4-.3-.4l-2.3-1.2%205.6-2.9c.2-.1.3-.3.3-.5s-.1-.4-.3-.4l-5.7-2.7%202.4-1.6c.1-.1.2-.2.2-.4v-2.7h3.1l-3.5-6.1-3.5%206.1h3v2.5l-2.9%202c-.1.1-.2.3-.2.5s.1.3.3.4l5.6%202.6-5.6%202.9c-.2.1-.3.3-.3.4s.1.4.3.4l2.9%201.5V425.5H-265v1.2h37.6v8.5l15.4-8.7c.2%201%201.1%201.8%202.2%201.8%201%200%201.9-.7%202.1-1.6h6.1v-1.2h-6zm-37.7-20.2l2.2%203.9h-4.5l2.3-3.9zm19.2%2027.7v-13.8l12.3%206.9-12.3%206.9zm16.3-5.5c-.8%200-1.4-.6-1.4-1.4%200-.8.6-1.4%201.4-1.4s1.4.6%201.4%201.4c0%20.8-.6%201.4-1.4%201.4z%22/%3E%3C/svg%3E"
      },
      "design": {
        "config": "true",
        "pullup": "true",
        "graph": {
          "blocks": [
            {
              "id": "2b245a71-2d80-466b-955f-e3d61839fe25",
              "type": "basic.code",
              "data": {
                "code": "// Pull up inv\n\nwire din, dout, outen;\n\nassign o = ~din;\n\nSB_IO #(\n    .PIN_TYPE(6'b 1010_01),\n    .PULLUP(1'b 1)\n) io_pin (\n    .PACKAGE_PIN(i),\n    .OUTPUT_ENABLE(outen),\n    .D_OUT_0(dout),\n    .D_IN_0(din)\n);",
                "params": [],
                "ports": {
                  "in": [
                    {
                      "name": "i"
                    }
                  ],
                  "out": [
                    {
                      "name": "o"
                    }
                  ]
                }
              },
              "position": {
                "x": 256,
                "y": 104
              }
            },
            {
              "id": "bb4a1ca9-1b30-471e-92ca-ca7ff2fc1150",
              "type": "basic.input",
              "data": {
                "name": ""
              },
              "position": {
                "x": 64,
                "y": 200
              }
            },
            {
              "id": "a139fa0d-9b45-4480-a251-f4a66b49aa23",
              "type": "basic.output",
              "data": {
                "name": ""
              },
              "position": {
                "x": 760,
                "y": 200
              }
            }
          ],
          "wires": [
            {
              "source": {
                "block": "bb4a1ca9-1b30-471e-92ca-ca7ff2fc1150",
                "port": "out"
              },
              "target": {
                "block": "2b245a71-2d80-466b-955f-e3d61839fe25",
                "port": "i"
              }
            },
            {
              "source": {
                "block": "2b245a71-2d80-466b-955f-e3d61839fe25",
                "port": "o"
              },
              "target": {
                "block": "a139fa0d-9b45-4480-a251-f4a66b49aa23",
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
    "d4cb6d2864f9eb5cf1bfde915b8338af38d9753a": {
      "package": {
        "name": "DFF",
        "version": "1.0.0",
        "description": "Delay flip-flop with synchronous reset",
        "author": "Carlos Diaz",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2090%2040%22%3E%3Ctext%20style=%22line-height:125%25%22%20x=%22-231.121%22%20y=%22429.867%22%20font-weight=%22400%22%20font-size=%2224.601%22%20font-family=%22sans-serif%22%20letter-spacing=%220%22%20word-spacing=%220%22%3E%3Ctspan%20x=%22-231.121%22%20y=%22429.867%22%3EDFF%3C/tspan%3E%3C/text%3E%3C/svg%3E"
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "b32a6101-5bd1-4bcf-ae5f-e569b958a6a2",
              "type": "basic.input",
              "data": {
                "name": "D"
              },
              "position": {
                "x": 168,
                "y": 104
              }
            },
            {
              "id": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
              "type": "basic.code",
              "data": {
                "code": "// D flip-flop with synchronous reset\n\nreg _q = 1'b0;\n\nalways @(posedge clk)\nbegin\n    if(rst_n == 0)\n        _q = 1'b0;\n    else if(en)\n        _q <= d;\nend\n\nassign {q, q_n} = {_q, ~_q};\n",
                "params": [],
                "ports": {
                  "in": [
                    {
                      "name": "d"
                    },
                    {
                      "name": "en"
                    },
                    {
                      "name": "rst_n"
                    },
                    {
                      "name": "clk"
                    }
                  ],
                  "out": [
                    {
                      "name": "q"
                    },
                    {
                      "name": "q_n"
                    }
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
                "name": "Q"
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
                "name": "en"
              },
              "position": {
                "x": 168,
                "y": 176
              }
            },
            {
              "id": "07105e68-401b-49e9-b85f-2cddbfee9fbe",
              "type": "basic.input",
              "data": {
                "name": "rst_n"
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
                "name": "Q_n"
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
                "name": "clk"
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
                "block": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
                "port": "q"
              },
              "target": {
                "block": "ffdd9aa2-aea3-4aa9-8431-80e799226774",
                "port": "in"
              }
            },
            {
              "source": {
                "block": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
                "port": "q_n"
              },
              "target": {
                "block": "4a261f0b-523c-4fe0-ae1c-de05b8eb7e8a",
                "port": "in"
              }
            },
            {
              "source": {
                "block": "b32a6101-5bd1-4bcf-ae5f-e569b958a6a2",
                "port": "out"
              },
              "target": {
                "block": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
                "port": "d"
              }
            },
            {
              "source": {
                "block": "50d69ac2-949d-476e-a711-420ba9f510cd",
                "port": "out"
              },
              "target": {
                "block": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
                "port": "en"
              }
            },
            {
              "source": {
                "block": "07105e68-401b-49e9-b85f-2cddbfee9fbe",
                "port": "out"
              },
              "target": {
                "block": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
                "port": "rst_n"
              }
            },
            {
              "source": {
                "block": "6855f64f-fa1c-4371-b2e1-a98970674a96",
                "port": "out"
              },
              "target": {
                "block": "17c79db9-4b5b-4a7c-9f13-c4c9f9e5a4e5",
                "port": "clk"
              }
            }
          ]
        },
        "state": {
          "pan": {
            "x": -100,
            "y": 0
          },
          "zoom": 1
        }
      }
    },
    "ddd2fad062ba832388938ba74bb3f6c211b8e440": {
      "package": {
        "name": "Mux 2:1",
        "version": "1.0.0",
        "description": "Multiplexer 2:1",
        "author": "Carlos Diaz",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2090%2040%22%3E%3Cpath%20d=%22M-162%20419.9h-24v-7.2l-41-11.8v9h-25v2h25v18h-25v2h25v9l41-11.7v-7.4h24v-1.9zm-63%2018.5v-35l37%2010.8v13.5l-37%2010.7z%22/%3E%3C/svg%3E"
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "ba573190-2ead-411a-a323-1b15a22d46db",
              "type": "basic.code",
              "data": {
                "code": "reg _o;\n\nalways @(*) begin\n    case(sel0)\n        0: _o = in0;\n        1: _o = in1;\n        default: _o = in0;\n    endcase\nend\n\nassign o = _o;",
                "params": [],
                "ports": {
                  "in": [
                    {
                      "name": "in0"
                    },
                    {
                      "name": "in1"
                    },
                    {
                      "name": "sel0"
                    }
                  ],
                  "out": [
                    {
                      "name": "o"
                    }
                  ]
                }
              },
              "position": {
                "x": 312,
                "y": 112
              }
            },
            {
              "id": "c3f73f68-1074-4355-b69f-6a20f7bea3e7",
              "type": "basic.input",
              "data": {
                "name": "i0"
              },
              "position": {
                "x": 80,
                "y": 120
              }
            },
            {
              "id": "5fb29465-2ee7-45bb-afa4-9a3de895c774",
              "type": "basic.input",
              "data": {
                "name": "i1"
              },
              "position": {
                "x": 80,
                "y": 208
              }
            },
            {
              "id": "061aa997-2f30-4591-8841-fb6abf5c3b2e",
              "type": "basic.output",
              "data": {
                "name": "o"
              },
              "position": {
                "x": 792,
                "y": 208
              }
            },
            {
              "id": "67ed5e09-486d-4f97-929f-aefea9c43951",
              "type": "basic.input",
              "data": {
                "name": "sel"
              },
              "position": {
                "x": 80,
                "y": 296
              }
            }
          ],
          "wires": [
            {
              "source": {
                "block": "ba573190-2ead-411a-a323-1b15a22d46db",
                "port": "o"
              },
              "target": {
                "block": "061aa997-2f30-4591-8841-fb6abf5c3b2e",
                "port": "in"
              }
            },
            {
              "source": {
                "block": "c3f73f68-1074-4355-b69f-6a20f7bea3e7",
                "port": "out"
              },
              "target": {
                "block": "ba573190-2ead-411a-a323-1b15a22d46db",
                "port": "in0"
              }
            },
            {
              "source": {
                "block": "5fb29465-2ee7-45bb-afa4-9a3de895c774",
                "port": "out"
              },
              "target": {
                "block": "ba573190-2ead-411a-a323-1b15a22d46db",
                "port": "in1"
              }
            },
            {
              "source": {
                "block": "67ed5e09-486d-4f97-929f-aefea9c43951",
                "port": "out"
              },
              "target": {
                "block": "ba573190-2ead-411a-a323-1b15a22d46db",
                "port": "sel0"
              }
            }
          ]
        },
        "state": {
          "pan": {
            "x": -21.0375,
            "y": 29.4792
          },
          "zoom": 1
        }
      }
    },
    "3e6c249e205080168c1bf4ee8dbc33b50653d5f4": {
      "package": {
        "name": "Bit 1",
        "version": "1.0.0",
        "description": "Assign 1 to the output wire",
        "author": "Jesús Arroyo",
        "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2247.303%22%20height=%2227.648%22%20viewBox=%220%200%2044.346456%2025.919999%22%3E%3Ctext%20style=%22line-height:125%25%22%20x=%22325.218%22%20y=%22315.455%22%20font-weight=%22400%22%20font-size=%2212.669%22%20font-family=%22sans-serif%22%20letter-spacing=%220%22%20word-spacing=%220%22%20transform=%22translate(-307.01%20-298.51)%22%3E%3Ctspan%20x=%22325.218%22%20y=%22315.455%22%20style=%22-inkscape-font-specification:'Courier%2010%20Pitch'%22%20font-family=%22Courier%2010%20Pitch%22%3E1%3C/tspan%3E%3C/text%3E%3C/svg%3E"
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "b959fb96-ac67-4aea-90b3-ed35a4c17bf5",
              "type": "basic.code",
              "data": {
                "code": "// Bit 1\n\nassign v = 1'b1;",
                "params": [],
                "ports": {
                  "in": [],
                  "out": [
                    {
                      "name": "v"
                    }
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
                "name": ""
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