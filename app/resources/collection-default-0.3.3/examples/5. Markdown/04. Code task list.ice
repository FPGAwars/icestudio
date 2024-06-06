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
          "id": "d43c7fc2-5639-4b16-b505-82575f2e6866",
          "type": "basic.info",
          "data": {
            "info": "## Code\n\n",
            "readonly": true
          },
          "position": {
            "x": 56,
            "y": 0
          },
          "size": {
            "width": 224,
            "height": 32
          }
        },
        {
          "id": "020c3c96-e6dc-4a71-84f8-e50c7c89cf93",
          "type": "basic.info",
          "data": {
            "info": "```verilog\nreg [7:0] value;\n\nalways @(posedge clk)\n  value <= value + 1;\n```",
            "readonly": true
          },
          "position": {
            "x": 48,
            "y": 120
          },
          "size": {
            "width": 328,
            "height": 160
          }
        },
        {
          "id": "d8358969-c3e6-4bb0-8ef3-c98d97097017",
          "type": "basic.info",
          "data": {
            "info": "```javascript\nfunction fancyAlert(arg) {\n  if(arg) {\n    $.facebox({div:'#foo'})\n  }\n}\n```",
            "readonly": true
          },
          "position": {
            "x": 440,
            "y": 112
          },
          "size": {
            "width": 312,
            "height": 120
          }
        },
        {
          "id": "dd72ad0b-3582-4728-8e7c-2f0d4f4eac69",
          "type": "basic.info",
          "data": {
            "info": "- [x] Task 1\n- [x] Task 2\n- [x] Task 3\n- [ ] this is an incomplete item\n",
            "readonly": true
          },
          "position": {
            "x": 40,
            "y": 320
          },
          "size": {
            "width": 272,
            "height": 88
          }
        },
        {
          "id": "7b35a10c-b653-429a-bff4-dbbba0d1e105",
          "type": "basic.info",
          "data": {
            "info": "**Verilog**",
            "readonly": true
          },
          "position": {
            "x": 48,
            "y": 72
          },
          "size": {
            "width": 128,
            "height": 32
          }
        },
        {
          "id": "41ed2a4a-f53d-46a2-8eb6-8d3223a997c5",
          "type": "basic.info",
          "data": {
            "info": "**Javascript**",
            "readonly": true
          },
          "position": {
            "x": 456,
            "y": 64
          },
          "size": {
            "width": 128,
            "height": 32
          }
        },
        {
          "id": "d60ba29e-ad9f-420e-859d-27cd9e9b87d8",
          "type": "basic.info",
          "data": {
            "info": "## Task lists\n\n",
            "readonly": true
          },
          "position": {
            "x": 48,
            "y": 272
          },
          "size": {
            "width": 224,
            "height": 32
          }
        }
      ],
      "wires": []
    }
  },
  "dependencies": {}
}