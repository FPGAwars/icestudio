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
          "id": "12af58f1-3f20-4e0f-98ff-6cd45ffa12ba",
          "type": "basic.code",
          "data": {
            "code": "reg b;\n\nalways @(a)\nbegin\n  if (a == 1)\n    b = C;\n  else\n    b = D;\nend",
            "params": [
              {
                "name": "C"
              },
              {
                "name": "D"
              }
            ],
            "ports": {
              "in": [
                {
                  "name": "a"
                }
              ],
              "out": [
                {
                  "name": "b",
                  "range": "[3:0]",
                  "size": 4
                }
              ]
            }
          },
          "position": {
            "x": -40,
            "y": -112
          },
          "size": {
            "width": 256,
            "height": 160
          }
        }
      ],
      "wires": []
    }
  },
  "dependencies": {}
}