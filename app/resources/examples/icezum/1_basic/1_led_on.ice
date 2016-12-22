{
  "version": "1.0",
  "package": {
    "name": "Led on",
    "version": "1.0.0",
    "description": "",
    "author": "",
    "image": ""
  },
  "design": {
    "board": "icezum",
    "graph": {
      "blocks": [
        {
          "id": "eaf792b5-de98-4e2f-b78a-4023eb9a7f2b",
          "type": "bit.1",
          "position": {
            "x": 80,
            "y": 64
          }
        },
        {
          "id": "949075cb-26c0-49da-ba76-2496ea9aa7cc",
          "type": "basic.output",
          "data": {
            "name": "led",
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
            "x": 352,
            "y": 64
          }
        },
        {
          "id": "a538a5b4-d5d5-4ace-a593-efb1fa9b930c",
          "type": "basic.info",
          "data": {
            "info": "LED-ON Hello world circuit example!\n\nThe simplest digital circuit that turns a \nled on\n\nA bit set to 1 is wired directly to the\noutput FPGA pin, where the led is connected\n\nThe blue box is the bit (set to 1)\nIt is inside the FPGA\n\nThe yellow box is the output FPGA pin. Using\nthe bottom menu the pin can be changed\n\nEXERCISE 1:  Upload this circuit into your \nFPGA board and watch the led. \nIt should be turned on\n\nEXERCISE 2: Change the pin number to turn\nanother led on and upload it again"
          },
          "position": {
            "x": 40,
            "y": 208
          }
        },
        {
          "id": "0d05784e-8e32-4c80-b85d-cde4e892dbf3",
          "type": "basic.info",
          "data": {
            "info": "Ejemplo de circuito Hola mundo: LED-ON\n\nEs el circuito digital más sencillo que\nenciende un led\n\nUn bit a 1 se cablea directamente a una\nsalida de la FPGA, donde está conectado\nel LED\n\nLa caja azul es el bit a 1\nEstá dentro de la FPGA\n\nLa caja amarilla es el pin de salida de\nla FPGA. Por medio del menú desplegable\ninferior se puede cambiar el pin\n\nEJERCICIO 1: Carga este circuito en la FPGA\ny observa el LED0. Debe estar encendido\n\nEJERCICIO 2: Cambia el pin de salida para\nencender otro led (por ejemplo el LED1)\ny cárgalo en la FPGA de nuevo"
          },
          "position": {
            "x": 464,
            "y": 208
          }
        }
      ],
      "wires": [
        {
          "source": {
            "block": "eaf792b5-de98-4e2f-b78a-4023eb9a7f2b",
            "port": "19c8f68d-5022-487f-9ab0-f0a3cd58bead"
          },
          "target": {
            "block": "949075cb-26c0-49da-ba76-2496ea9aa7cc",
            "port": "in"
          }
        }
      ]
    },
    "deps": {
      "bit.1": {
        "version": "1.0",
        "package": {
          "name": "Bit 1",
          "version": "1.0.0",
          "description": "Assign 1 to the output wire",
          "author": "Jesús Arroyo",
          "image": "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2247.303%22%20height=%2227.648%22%20viewBox=%220%200%2044.346456%2025.919999%22%3E%3Ctext%20style=%22line-height:125%25%22%20x=%22325.218%22%20y=%22315.455%22%20font-weight=%22400%22%20font-size=%2212.669%22%20font-family=%22sans-serif%22%20letter-spacing=%220%22%20word-spacing=%220%22%20transform=%22translate(-307.01%20-298.51)%22%3E%3Ctspan%20x=%22325.218%22%20y=%22315.455%22%20style=%22-inkscape-font-specification:'Courier%2010%20Pitch'%22%20font-family=%22Courier%2010%20Pitch%22%3E1%3C/tspan%3E%3C/text%3E%3C/svg%3E"
        },
        "design": {
          "board": "icezum",
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
                        "name": "v",
                        "size": 1
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
        "x": 0,
        "y": 0
      },
      "zoom": 1
    }
  }
}