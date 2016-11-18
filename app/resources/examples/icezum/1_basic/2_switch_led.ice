{
  "image": "",
  "state": {
    "pan": {
      "x": 0,
      "y": 0
    },
    "zoom": 0.9999999883960295
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
          "x": 320,
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
      }
    ],
    "wires": [
      {
        "source": {
          "block": "aac1b394-533e-4410-9f35-ba80af8abd63",
          "port": "out"
        },
        "target": {
          "block": "30a83e46-176d-40a8-ac0e-f19a131ea9d9",
          "port": "in"
        }
      }
    ]
  },
  "deps": {}
}