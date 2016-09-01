{
  "image": "",
  "state": {
    "pan": {
      "x": 0,
      "y": 0
    },
    "zoom": 0.999999940395341
  },
  "board": "icezum",
  "graph": {
    "blocks": [
      {
        "id": "aac1b394-533e-4410-9f35-ba80af8abd63",
        "type": "basic.input",
        "data": {
          "label": "button",
          "pin": {
            "name": "SW1",
            "value": "10"
          }
        },
        "position": {
          "x": 48,
          "y": 80
        }
      },
      {
        "id": "30a83e46-176d-40a8-ac0e-f19a131ea9d9",
        "type": "basic.output",
        "data": {
          "label": "led",
          "pin": {
            "name": "LED0",
            "value": "95"
          }
        },
        "position": {
          "x": 424,
          "y": 80
        }
      },
      {
        "id": "9e124703-5a80-4d0d-8c31-945447862085",
        "type": "basic.info",
        "data": {
          "info": "Switch-led basic example\n\nA simple circuit that connects the input pin,\nwhere there is a button switch, with the\noutpun pin, where there is a led\n\nWhen the button is pressed (1), the led is\nturned on. When the button is released (0), the\nled is turned off\n\nNotice the blue box with a gear. It is a\nconfiguration block for activating the \nFPGA internal pull-up resistor in the SW1 pin"
        },
        "position": {
          "x": 32,
          "y": 224
        }
      },
      {
        "id": "f76f55d3-ba32-42d8-8c16-9f4cbbd9d27c",
        "type": "basic.info",
        "data": {
          "info": "Ejemplo básico switch-led\n\nSencillo circuito que conecta directamente\nun pin de entrada de la FPGA, donde hay\nun pulsador, con el pin de salida, donde está\nel led\n\nCuando se aprieta el pulsador (1), se enciende\nel led. Cuando se suelta (0) se apaga\n\nFíjate en la caja azul con el engranaje. Es un\nbloque de configuración que permite activar la\nresistencia de pull-up interna del pin de la \nFPGA"
        },
        "position": {
          "x": 448,
          "y": 224
        }
      },
      {
        "id": "d556c4f6-736a-41a9-9f64-badf2b790010",
        "type": "basic.info",
        "data": {
          "info": "EXERCISE 1: Upload the circuit into your FPGA\nboard and test it!\n\nEXERCISE 2: Change the button to SW2 and test\nit again\n\n---------------------------------------------\nEjercicio 1: Carga el circuito en la FPGA y\n¡pruébalo!\n\nEJERCICIO 2: Cambia el pulsador al SW2 y\npruébalo de nuevo"
        },
        "position": {
          "x": 864,
          "y": 224
        }
      },
      {
        "id": "b3fa5f92-e06c-4354-9784-1f780a04fdf1",
        "type": "config.pull-up-inv",
        "data": {},
        "position": {
          "x": 224,
          "y": 80
        }
      }
    ],
    "wires": [
      {
        "source": {
          "block": "aac1b394-533e-4410-9f35-ba80af8abd63",
          "port": "out"
        },
        "target": {
          "block": "b3fa5f92-e06c-4354-9784-1f780a04fdf1",
          "port": "bb4a1ca9-1b30-471e-92ca-ca7ff2fc1150"
        }
      },
      {
        "source": {
          "block": "b3fa5f92-e06c-4354-9784-1f780a04fdf1",
          "port": "a139fa0d-9b45-4480-a251-f4a66b49aa23"
        },
        "target": {
          "block": "30a83e46-176d-40a8-ac0e-f19a131ea9d9",
          "port": "in"
        }
      }
    ]
  },
  "deps": {
    "config.pull-up-inv": {
      "image": "resources/images/pull-up-inv.svg",
      "state": {
        "pan": {
          "x": -23,
          "y": 8
        },
        "zoom": 1
      },
      "graph": {
        "blocks": [
          {
            "id": "2b245a71-2d80-466b-955f-e3d61839fe25",
            "type": "basic.code",
            "data": {
              "code": "// Pull up inv\n\nwire din, dout, outen;\n\nassign o = ~din;\n\nSB_IO #(\n    .PIN_TYPE(6'b 1010_01),\n    .PULLUP(1'b 1)\n) io_pin (\n    .PACKAGE_PIN(i),\n    .OUTPUT_ENABLE(outen),\n    .D_OUT_0(dout),\n    .D_IN_0(din)\n);",
              "ports": {
                "in": [
                  "i"
                ],
                "out": [
                  "o"
                ]
              }
            },
            "position": {
              "x": 256,
              "y": 104
            }
          },
          {
            "id": "bb4a1ca9-1b30-471e-92ca-ca7ff2fc1150",
            "type": "basic.input",
            "data": {
              "label": ""
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
              "label": ""
            },
            "position": {
              "x": 760,
              "y": 200
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
      },
      "deps": {}
    }
  }
}