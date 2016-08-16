{
  "image": "",
  "state": {
    "pan": {
      "x": 0,
      "y": 0
    },
    "zoom": 0.9999999813303895
  },
  "board": "icezum",
  "graph": {
    "blocks": [
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
      },
      {
        "id": "e657ee6f-9430-4fce-a539-72d12d32f5bb",
        "type": "bit.1",
        "data": {},
        "position": {
          "x": 80,
          "y": 64
        }
      },
      {
        "id": "949075cb-26c0-49da-ba76-2496ea9aa7cc",
        "type": "basic.output",
        "data": {
          "label": "led",
          "pin": {
            "name": "LED0",
            "value": "95"
          }
        },
        "position": {
          "x": 352,
          "y": 64
        }
      }
    ],
    "wires": [
      {
        "source": {
          "block": "e657ee6f-9430-4fce-a539-72d12d32f5bb",
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
      "graph": {
        "blocks": [
          {
            "id": "b959fb96-ac67-4aea-90b3-ed35a4c17bf5",
            "type": "basic.code",
            "data": {
              "code": "// Bit 1\n\nassign v = 1'b1;",
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
              "label": ""
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
      "image": "resources/images/1.svg",
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