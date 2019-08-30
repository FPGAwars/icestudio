{
  "version": "1.2",
  "package": {
    "name": "Not",
    "version": "1.0",
    "description": "NOT logic gate",
    "author": "Jesús Arroyo",
    "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2291.33%22%20height=%2245.752%22%20version=%221%22%3E%3Cpath%20d=%22M0%2020.446h27v2H0zm70.322.001h15.3v2h-15.3z%22/%3E%3Cpath%20d=%22M66.05%2026.746c-2.9%200-5.3-2.4-5.3-5.3s2.4-5.3%205.3-5.3%205.3%202.4%205.3%205.3-2.4%205.3-5.3%205.3zm0-8.6c-1.8%200-3.3%201.5-3.3%203.3%200%201.8%201.5%203.3%203.3%203.3%201.8%200%203.3-1.5%203.3-3.3%200-1.8-1.5-3.3-3.3-3.3z%22/%3E%3Cpath%20d=%22M25.962%202.563l33.624%2018.883L25.962%2040.33V2.563z%22%20fill=%22none%22%20stroke=%22#000%22%20stroke-width=%223%22/%3E%3C/svg%3E"
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "a4058fa5-b66e-4e5e-b542-28d7c3e9d3cd",
          "type": "basic.input",
          "data": {
            "name": "",
            "pins": [
              {
                "index": "0",
                "name": "",
                "value": 0
              }
            ],
            "virtual": true
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
            "name": "",
            "pins": [
              {
                "index": "0",
                "name": "",
                "value": 0
              }
            ],
            "virtual": true
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
  },
  "dependencies": {}
}