{
  "version": "1.2",
  "package": {
    "name": "Debouncer",
    "version": "1.0.0",
    "description": "Remove the rebound on a mechanical switch",
    "author": "Juan González",
    "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-252%20400.9%2090%2040%22%3E%3Cpath%20d=%22M-251.547%20436.672h22.802v-30.353h5.862v30.353h5.259v-30.353h3.447v30.353h2.984v-30.353h3.506v30.523h6.406V405.77h38.868%22%20fill=%22none%22%20stroke=%22#000%22%20stroke-width=%221.4%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22/%3E%3Cpath%20d=%22M-232.57%20403.877l26.946%2032.391M-205.624%20403.877l-26.946%2032.391%22%20fill=%22none%22%20stroke=%22red%22%20stroke-width=%223%22%20stroke-linecap=%22round%22/%3E%3C/svg%3E"
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "4bf41c17-a2da-4140-95f7-2a80d51b1e1a",
          "type": "basic.input",
          "data": {
            "name": "",
            "pins": [
              {
                "index": "0",
                "name": "",
                "value": "0"
              }
            ],
            "virtual": true,
            "clock": true
          },
          "position": {
            "x": 48,
            "y": 144
          }
        },
        {
          "id": "22ff3fa1-943b-4d1a-bd89-36e1c054d077",
          "type": "basic.output",
          "data": {
            "name": "",
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
            "x": 768,
            "y": 208
          }
        },
        {
          "id": "c9e1af2a-6f09-4cf6-a5b3-fdf7ec2c6530",
          "type": "basic.input",
          "data": {
            "name": "",
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
            "x": 48,
            "y": 272
          }
        },
        {
          "id": "92490e7e-c3ba-4e9c-a917-2a771d99f1ef",
          "type": "basic.code",
          "data": {
            "code": "//-- Debouncer Circuit\n//-- It produces a stable output when the\n//-- input signal is bouncing\n\nreg btn_prev = 0;\nreg btn_out_r = 0;\n\nreg [16:0] counter = 0;\n\n\nalways @(posedge clk) begin\n\n  //-- If btn_prev and btn_in are differents\n  if (btn_prev ^ in == 1'b1) begin\n    \n      //-- Reset the counter\n      counter <= 0;\n      \n      //-- Capture the button status\n      btn_prev <= in;\n  end\n    \n  //-- If no timeout, increase the counter\n  else if (counter[16] == 1'b0)\n      counter <= counter + 1;\n      \n  else\n    //-- Set the output to the stable value\n    btn_out_r <= btn_prev;\n\nend\n\nassign out = btn_out_r;\n",
            "params": [],
            "ports": {
              "in": [
                {
                  "name": "clk"
                },
                {
                  "name": "in"
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
            "x": 264,
            "y": 112
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
            "block": "92490e7e-c3ba-4e9c-a917-2a771d99f1ef",
            "port": "out"
          },
          "target": {
            "block": "22ff3fa1-943b-4d1a-bd89-36e1c054d077",
            "port": "in"
          }
        },
        {
          "source": {
            "block": "4bf41c17-a2da-4140-95f7-2a80d51b1e1a",
            "port": "out"
          },
          "target": {
            "block": "92490e7e-c3ba-4e9c-a917-2a771d99f1ef",
            "port": "clk"
          }
        },
        {
          "source": {
            "block": "c9e1af2a-6f09-4cf6-a5b3-fdf7ec2c6530",
            "port": "out"
          },
          "target": {
            "block": "92490e7e-c3ba-4e9c-a917-2a771d99f1ef",
            "port": "in"
          }
        }
      ]
    }
  },
  "dependencies": {}
}