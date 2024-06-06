{
  "version": "1.2",
  "package": {
    "name": "Pull-up",
    "version": "1.0.0",
    "description": "FPGA internal pull-up configuration on the connected input port",
    "author": "Juan González",
    "image": "%3Csvg%20id=%22svg2%22%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%22-265%20401.5%2063.5%2038.4%22%3E%3Cstyle%3E.st0%7Bdisplay:none%7D.st1%7Bfill:none;stroke:#000;stroke-width:.75;stroke-linejoin:round;stroke-miterlimit:10%7D.st2%7Bfill:#010002%7D%3C/style%3E%3Cpath%20class=%22st0%22%20d=%22M-242.5%20411.8v11.8h-5.4v-11.8h5.4m1-1h-7.4v13.8h7.4v-13.8z%22/%3E%3Cpath%20d=%22M-212%20425.6l-15.4-8.7v8.5h-17.4v-2.7c0-.2-.1-.4-.3-.4l-2.3-1.2%205.6-2.9c.2-.1.3-.3.3-.5s-.1-.4-.3-.4l-5.7-2.7%202.4-1.6c.1-.1.2-.2.2-.4v-2.7h3.1l-3.5-6.1-3.5%206.1h3v2.5l-2.9%202c-.1.1-.2.3-.2.5s.1.3.3.4l5.6%202.6-5.6%202.9c-.2.1-.3.3-.3.4s.1.4.3.4l2.9%201.5V425.5H-265v1.2h37.6v8.5l15.4-8.7h10.5v-.8H-212zm-33.3-20.4l2.2%203.9h-4.5l2.3-3.9zm19.2%2027.7v-13.8l12.3%206.9-12.3%206.9z%22/%3E%3C/svg%3E"
  },
  "design": {
    "board": "icezum",
    "config": "true",
    "pullup": "true",
    "graph": {
      "blocks": [
        {
          "id": "bb4a1ca9-1b30-471e-92ca-ca7ff2fc1150",
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
            "virtual": true
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
            "x": 760,
            "y": 200
          }
        },
        {
          "id": "2b245a71-2d80-466b-955f-e3d61839fe25",
          "type": "basic.code",
          "data": {
            "code": "// Pull up\n\nwire din, dout, outen;\n\nassign o = din;\n\nSB_IO #(\n    .PIN_TYPE(6'b 1010_01),\n    .PULLUP(1'b 1)\n) io_pin (\n    .PACKAGE_PIN(i),\n    .OUTPUT_ENABLE(outen),\n    .D_OUT_0(dout),\n    .D_IN_0(din)\n);",
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
    }
  },
  "dependencies": {}
}