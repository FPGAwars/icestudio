{
  "image": "",
  "state": {
    "pan": {
      "x": 0,
      "y": 0
    },
    "zoom": 1
  },
  "board": "icezum",
  "graph": {
    "blocks": [
      {
        "id": "327f1a9e-ba42-4d25-adcd-f7f16ac8f451",
        "type": "basic.input",
        "data": {
          "label": "button",
          "pin": {
            "name": "SW1",
            "value": "10"
          }
        },
        "position": {
          "x": 104,
          "y": 176
        }
      },
      {
        "id": "58c892ba-89a3-4da7-9d0a-56f2523bfd98",
        "type": "cnot",
        "data": {},
        "position": {
          "x": 352,
          "y": 240
        }
      },
      {
        "id": "88b3c210-c6f5-4cd3-a578-2e5ab8aa1562",
        "type": "not",
        "data": {},
        "position": {
          "x": 352,
          "y": 112
        }
      },
      {
        "id": "4c4d2ddd-a97d-4fcb-9c68-ba1149f25082",
        "type": "basic.output",
        "data": {
          "label": "led0",
          "pin": {
            "name": "LED0",
            "value": "95"
          }
        },
        "position": {
          "x": 552,
          "y": 112
        }
      },
      {
        "id": "0e777320-de37-4dca-a077-51fbf10a6565",
        "type": "basic.output",
        "data": {
          "label": "led1",
          "pin": {
            "name": "LED1",
            "value": "96"
          }
        },
        "position": {
          "x": 552,
          "y": 240
        }
      }
    ],
    "wires": [
      {
        "source": {
          "block": "327f1a9e-ba42-4d25-adcd-f7f16ac8f451",
          "port": "out"
        },
        "target": {
          "block": "88b3c210-c6f5-4cd3-a578-2e5ab8aa1562",
          "port": "18c2ebc7-5152-439c-9b3f-851c59bac834"
        }
      },
      {
        "source": {
          "block": "327f1a9e-ba42-4d25-adcd-f7f16ac8f451",
          "port": "out"
        },
        "target": {
          "block": "58c892ba-89a3-4da7-9d0a-56f2523bfd98",
          "port": "55c6c056-3630-4482-ad47-f4d9ee83b835"
        }
      },
      {
        "source": {
          "block": "88b3c210-c6f5-4cd3-a578-2e5ab8aa1562",
          "port": "664caf9e-5f40-4df4-800a-b626af702e62"
        },
        "target": {
          "block": "4c4d2ddd-a97d-4fcb-9c68-ba1149f25082",
          "port": "in"
        }
      },
      {
        "source": {
          "block": "58c892ba-89a3-4da7-9d0a-56f2523bfd98",
          "port": "c8c6eed3-548c-49c7-a162-282179d427b1"
        },
        "target": {
          "block": "0e777320-de37-4dca-a077-51fbf10a6565",
          "port": "in"
        }
      }
    ]
  },
  "deps": {
    "logic.not": {
      "graph": {
        "blocks": [
          {
            "id": "18c2ebc7-5152-439c-9b3f-851c59bac834",
            "type": "basic.input",
            "data": {
              "label": ""
            },
            "position": {
              "x": 64,
              "y": 144
            }
          },
          {
            "id": "664caf9e-5f40-4df4-800a-b626af702e62",
            "type": "basic.output",
            "data": {
              "label": ""
            },
            "position": {
              "x": 752,
              "y": 144
            }
          },
          {
            "id": "5365ed8c-e5db-4445-938f-8d689830ea5c",
            "type": "basic.code",
            "data": {
              "code": "// NOT logic gate\n\nassign c = ~ a;",
              "ports": {
                "in": [
                  "a"
                ],
                "out": [
                  "c"
                ]
              }
            },
            "position": {
              "x": 256,
              "y": 48
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
              "block": "5365ed8c-e5db-4445-938f-8d689830ea5c",
              "port": "a"
            }
          },
          {
            "source": {
              "block": "5365ed8c-e5db-4445-938f-8d689830ea5c",
              "port": "c"
            },
            "target": {
              "block": "664caf9e-5f40-4df4-800a-b626af702e62",
              "port": "in"
            }
          }
        ]
      },
      "deps": {},
      "image": "resources/images/not.svg",
      "state": {
        "pan": {
          "x": 0,
          "y": 0
        },
        "zoom": 1
      }
    },
    "cnot": {
      "image": "",
      "state": {
        "pan": {
          "x": 0,
          "y": 0
        },
        "zoom": 1
      },
      "graph": {
        "blocks": [
          {
            "id": "db6b84db-bc29-46d6-86a4-f48cc50c8076",
            "type": "not",
            "data": {},
            "position": {
              "x": 280,
              "y": 248
            }
          },
          {
            "id": "ba7c5fb1-172d-4fa0-8a59-1905c4a71332",
            "type": "or",
            "data": {},
            "position": {
              "x": 464,
              "y": 136
            }
          },
          {
            "id": "55c6c056-3630-4482-ad47-f4d9ee83b835",
            "type": "basic.input",
            "data": {
              "label": "a"
            },
            "position": {
              "x": 88,
              "y": 248
            }
          },
          {
            "id": "c8c6eed3-548c-49c7-a162-282179d427b1",
            "type": "basic.output",
            "data": {
              "label": "b"
            },
            "position": {
              "x": 640,
              "y": 136
            }
          },
          {
            "id": "d2a2eac1-f8b0-4e5b-a693-626f6d14b8e5",
            "type": "low",
            "data": {},
            "position": {
              "x": 280,
              "y": 120
            }
          }
        ],
        "wires": [
          {
            "source": {
              "block": "d2a2eac1-f8b0-4e5b-a693-626f6d14b8e5",
              "port": "19c8f68d-5022-487f-9ab0-f0a3cd58bead"
            },
            "target": {
              "block": "ba7c5fb1-172d-4fa0-8a59-1905c4a71332",
              "port": "18c2ebc7-5152-439c-9b3f-851c59bac834"
            }
          },
          {
            "source": {
              "block": "55c6c056-3630-4482-ad47-f4d9ee83b835",
              "port": "out"
            },
            "target": {
              "block": "db6b84db-bc29-46d6-86a4-f48cc50c8076",
              "port": "18c2ebc7-5152-439c-9b3f-851c59bac834"
            }
          },
          {
            "source": {
              "block": "db6b84db-bc29-46d6-86a4-f48cc50c8076",
              "port": "664caf9e-5f40-4df4-800a-b626af702e62"
            },
            "target": {
              "block": "ba7c5fb1-172d-4fa0-8a59-1905c4a71332",
              "port": "97b51945-d716-4b6c-9db9-970d08541249"
            }
          },
          {
            "source": {
              "block": "ba7c5fb1-172d-4fa0-8a59-1905c4a71332",
              "port": "664caf9e-5f40-4df4-800a-b626af702e62"
            },
            "target": {
              "block": "c8c6eed3-548c-49c7-a162-282179d427b1",
              "port": "in"
            }
          }
        ]
      },
      "deps": {
        "or": {
          "graph": {
            "blocks": [
              {
                "id": "18c2ebc7-5152-439c-9b3f-851c59bac834",
                "type": "basic.input",
                "data": {
                  "label": "x"
                },
                "position": {
                  "x": 64,
                  "y": 80
                }
              },
              {
                "id": "97b51945-d716-4b6c-9db9-970d08541249",
                "type": "basic.input",
                "data": {
                  "label": "y"
                },
                "position": {
                  "x": 64,
                  "y": 208
                }
              },
              {
                "id": "664caf9e-5f40-4df4-800a-b626af702e62",
                "type": "basic.output",
                "data": {
                  "label": "o"
                },
                "position": {
                  "x": 752,
                  "y": 144
                }
              },
              {
                "id": "00925b04-5004-4307-a737-fa4e97c8b6ab",
                "type": "basic.code",
                "data": {
                  "code": "// OR logic gate\n\nassign c = a | b;",
                  "ports": {
                    "in": [
                      "a",
                      "b"
                    ],
                    "out": [
                      "c"
                    ]
                  }
                },
                "position": {
                  "x": 256,
                  "y": 48
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
          "deps": {},
          "image": "",
          "state": {
            "pan": {
              "x": 0,
              "y": 0
            },
            "zoom": 1
          }
        },
        "not": {
          "graph": {
            "blocks": [
              {
                "id": "18c2ebc7-5152-439c-9b3f-851c59bac834",
                "type": "basic.input",
                "data": {
                  "label": "x"
                },
                "position": {
                  "x": 64,
                  "y": 144
                }
              },
              {
                "id": "664caf9e-5f40-4df4-800a-b626af702e62",
                "type": "basic.output",
                "data": {
                  "label": "y"
                },
                "position": {
                  "x": 752,
                  "y": 144
                }
              },
              {
                "id": "5365ed8c-e5db-4445-938f-8d689830ea5c",
                "type": "basic.code",
                "data": {
                  "code": "// NOT logic gate\n\nassign c = ! a;",
                  "ports": {
                    "in": [
                      "a"
                    ],
                    "out": [
                      "c"
                    ]
                  }
                },
                "position": {
                  "x": 256,
                  "y": 48
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
                  "block": "5365ed8c-e5db-4445-938f-8d689830ea5c",
                  "port": "a"
                }
              },
              {
                "source": {
                  "block": "5365ed8c-e5db-4445-938f-8d689830ea5c",
                  "port": "c"
                },
                "target": {
                  "block": "664caf9e-5f40-4df4-800a-b626af702e62",
                  "port": "in"
                }
              }
            ]
          },
          "deps": {},
          "image": "",
          "state": {
            "pan": {
              "x": 0,
              "y": 0
            },
            "zoom": 1
          }
        },
        "low": {
          "graph": {
            "blocks": [
              {
                "id": "b959fb96-ac67-4aea-90b3-ed35a4c17bf5",
                "type": "basic.code",
                "data": {
                  "code": "// Bit 0\n\nassign v = 1'b0;",
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
                  "label": "o"
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
          "image": "",
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
    "not": {
      "graph": {
        "blocks": [
          {
            "id": "18c2ebc7-5152-439c-9b3f-851c59bac834",
            "type": "basic.input",
            "data": {
              "label": "x"
            },
            "position": {
              "x": 64,
              "y": 144
            }
          },
          {
            "id": "664caf9e-5f40-4df4-800a-b626af702e62",
            "type": "basic.output",
            "data": {
              "label": "y"
            },
            "position": {
              "x": 752,
              "y": 144
            }
          },
          {
            "id": "5365ed8c-e5db-4445-938f-8d689830ea5c",
            "type": "basic.code",
            "data": {
              "code": "// NOT logic gate\n\nassign c = ! a;",
              "ports": {
                "in": [
                  "a"
                ],
                "out": [
                  "c"
                ]
              }
            },
            "position": {
              "x": 256,
              "y": 48
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
              "block": "5365ed8c-e5db-4445-938f-8d689830ea5c",
              "port": "a"
            }
          },
          {
            "source": {
              "block": "5365ed8c-e5db-4445-938f-8d689830ea5c",
              "port": "c"
            },
            "target": {
              "block": "664caf9e-5f40-4df4-800a-b626af702e62",
              "port": "in"
            }
          }
        ]
      },
      "deps": {},
      "image": "",
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