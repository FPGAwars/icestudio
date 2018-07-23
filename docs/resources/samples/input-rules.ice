{
  "version": "1.2",
  "package": {
    "name": "Block",
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
          "id": "f0a23129-4164-4712-938f-741e10d141e7",
          "type": "basic.input",
          "data": {
            "name": "clk",
            "pins": [
              {
                "index": "0",
                "name": "CLK",
                "value": "21"
              }
            ],
            "virtual": false,
            "clock": false
          },
          "position": {
            "x": 376,
            "y": 136
          }
        },
        {
          "id": "16b6a8fe-bdf0-4813-bf61-1c599ea7ff3b",
          "type": "basic.input",
          "data": {
            "name": "clk",
            "pins": [
              {
                "index": "0",
                "name": "CLK",
                "value": "21"
              }
            ],
            "virtual": false,
            "clock": false
          },
          "position": {
            "x": 768,
            "y": 136
          }
        },
        {
          "id": "af56c7ea-910d-40dc-a979-b26c4bd035b0",
          "type": "082acf8e94f612fbdb8110d33d4def9d9d5134ca",
          "position": {
            "x": 192,
            "y": 136
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "02959c00-b43d-4f58-960c-194bc4956e13",
          "type": "082acf8e94f612fbdb8110d33d4def9d9d5134ca",
          "position": {
            "x": 560,
            "y": 136
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "0ed0b181-b8df-44b8-9a81-c666a9ed94aa",
          "type": "082acf8e94f612fbdb8110d33d4def9d9d5134ca",
          "position": {
            "x": 952,
            "y": 136
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "6d42c49a-fb21-4f80-a607-e18d5373e501",
          "type": "082acf8e94f612fbdb8110d33d4def9d9d5134ca",
          "position": {
            "x": 192,
            "y": 232
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "461456f8-527f-416f-989d-48a6a410cdd6",
          "type": "082acf8e94f612fbdb8110d33d4def9d9d5134ca",
          "position": {
            "x": 560,
            "y": 232
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "93689483-6d27-4d9d-b82e-72a70b624b21",
          "type": "082acf8e94f612fbdb8110d33d4def9d9d5134ca",
          "position": {
            "x": 952,
            "y": 232
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "9c061cab-42dc-452c-b15c-fc83b2f56e66",
          "type": "082acf8e94f612fbdb8110d33d4def9d9d5134ca",
          "position": {
            "x": 192,
            "y": 336
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "2a160728-448e-4e5f-bc26-da78f0b2fb17",
          "type": "082acf8e94f612fbdb8110d33d4def9d9d5134ca",
          "position": {
            "x": 560,
            "y": 336
          },
          "size": {
            "width": 96,
            "height": 64
          }
        },
        {
          "id": "5c5ae2e4-5b4f-4916-805c-2ef274ef6962",
          "type": "082acf8e94f612fbdb8110d33d4def9d9d5134ca",
          "position": {
            "x": 952,
            "y": 336
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
            "block": "16b6a8fe-bdf0-4813-bf61-1c599ea7ff3b",
            "port": "out"
          },
          "target": {
            "block": "5c5ae2e4-5b4f-4916-805c-2ef274ef6962",
            "port": "ec6c608b-ddc3-473c-9741-12b054bb0337"
          },
          "vertices": [
            {
              "x": 912,
              "y": 232
            }
          ]
        },
        {
          "source": {
            "block": "16b6a8fe-bdf0-4813-bf61-1c599ea7ff3b",
            "port": "out"
          },
          "target": {
            "block": "0ed0b181-b8df-44b8-9a81-c666a9ed94aa",
            "port": "ec6c608b-ddc3-473c-9741-12b054bb0337"
          },
          "vertices": []
        },
        {
          "source": {
            "block": "16b6a8fe-bdf0-4813-bf61-1c599ea7ff3b",
            "port": "out"
          },
          "target": {
            "block": "93689483-6d27-4d9d-b82e-72a70b624b21",
            "port": "ec6c608b-ddc3-473c-9741-12b054bb0337"
          },
          "vertices": [
            {
              "x": 912,
              "y": 208
            }
          ]
        },
        {
          "source": {
            "block": "f0a23129-4164-4712-938f-741e10d141e7",
            "port": "out"
          },
          "target": {
            "block": "461456f8-527f-416f-989d-48a6a410cdd6",
            "port": "ec6c608b-ddc3-473c-9741-12b054bb0337"
          },
          "vertices": [
            {
              "x": 496,
              "y": 224
            }
          ]
        }
      ]
    }
  },
  "dependencies": {
    "082acf8e94f612fbdb8110d33d4def9d9d5134ca": {
      "package": {
        "name": "Block",
        "version": "",
        "description": "",
        "author": "",
        "image": ""
      },
      "design": {
        "graph": {
          "blocks": [
            {
              "id": "ec6c608b-ddc3-473c-9741-12b054bb0337",
              "type": "basic.input",
              "data": {
                "name": "clk",
                "clock": false
              },
              "position": {
                "x": 120,
                "y": 112
              }
            }
          ],
          "wires": []
        }
      }
    }
  }
}