{
  "version": "1.2",
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
          "id": "a491fd68-a6ff-4a2b-b4fe-2a79e87762b4",
          "type": "basic.output",
          "data": {
            "name": "LED",
            "pins": [
              {
                "index": "0",
                "name": "LED3",
                "value": "98"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 592,
            "y": 168
          }
        },
        {
          "id": "ed5dae2c-1c49-44e3-849f-cbc536092793",
          "type": "basic.output",
          "data": {
            "name": "LED",
            "pins": [
              {
                "index": "0",
                "name": "LED2",
                "value": "97"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 592,
            "y": 240
          }
        },
        {
          "id": "4de7b09e-a070-410e-b531-10e457471cb3",
          "type": "basic.output",
          "data": {
            "name": "LED",
            "pins": [
              {
                "index": "0",
                "name": "LED1",
                "value": "96"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 592,
            "y": 312
          }
        },
        {
          "id": "106748f0-a49b-46e7-ab6c-a288ff6fdd16",
          "type": "basic.output",
          "data": {
            "name": "LED",
            "pins": [
              {
                "index": "0",
                "name": "LED0",
                "value": "95"
              }
            ],
            "virtual": false
          },
          "position": {
            "x": 592,
            "y": 384
          }
        },
        {
          "id": "2dbe47b7-cde6-47d4-bc39-8942d08a9fbe",
          "type": "basic.info",
          "data": {
            "info": "Displaying a 4-bits fixed value in the LEDs",
            "readonly": true
          },
          "position": {
            "x": 216,
            "y": 112
          },
          "size": {
            "width": 368,
            "height": 32
          }
        },
        {
          "id": "7c5eb584-622c-46be-ac07-bd5eae774a34",
          "type": "basic.code",
          "data": {
            "code": "//-- Assigning indivual bits\n//-- to the outputs\n\nassign o3 = 1;\nassign o2 = 0;\nassign o1 = 1;\nassign o0 = 0;",
            "params": [],
            "ports": {
              "in": [],
              "out": [
                {
                  "name": "o3"
                },
                {
                  "name": "o2"
                },
                {
                  "name": "o1"
                },
                {
                  "name": "o0"
                }
              ]
            }
          },
          "position": {
            "x": 216,
            "y": 192
          },
          "size": {
            "width": 304,
            "height": 240
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "7c5eb584-622c-46be-ac07-bd5eae774a34",
            "port": "o3"
          },
          "target": {
            "block": "a491fd68-a6ff-4a2b-b4fe-2a79e87762b4",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "7c5eb584-622c-46be-ac07-bd5eae774a34",
            "port": "o2"
          },
          "target": {
            "block": "ed5dae2c-1c49-44e3-849f-cbc536092793",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "7c5eb584-622c-46be-ac07-bd5eae774a34",
            "port": "o1"
          },
          "target": {
            "block": "4de7b09e-a070-410e-b531-10e457471cb3",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "7c5eb584-622c-46be-ac07-bd5eae774a34",
            "port": "o0"
          },
          "target": {
            "block": "106748f0-a49b-46e7-ab6c-a288ff6fdd16",
            "port": "in"
          }
        }
      ]
    }
  },
  "dependencies": {}
}