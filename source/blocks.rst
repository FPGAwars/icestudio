.. sec-blocks

Blocks
======

Definition
----------

A block is an entity with *input* and *output* ports and some content.

  .. image:: ../resources/images/blocks/definition.png

Basic blocks
------------

Input block
```````````

* Type: ``basic.input``
* States:

  * Virtual: *virtual: true*
  * FPGA I/O: *virtual: false*

Wire
~~~~

E.g.: basic input block with value *in*

.. image:: ../resources/images/blocks/basic-input.png

|

.. code-block:: json

   {
     "data": {
       "label": "in",
       "name": "in",
       "range": "",
       "pins": [
         {
           "index": "0",
           "name": "",
           "value": 0
         }
       ],
       "virtual": false
     }
   }

Bus
~~~

E.g.: basic input block with value *in[1:0]*

.. image:: ../resources/images/blocks/basic-input-bus.png

|

.. code-block:: json

    {
      "data": {
        "label": "in[1:0]",
        "name": "in",
        "range": "[1:0]",
        "pins": [
          {
            "index": "1",
            "name": "SW1",
            "value": "10"
          },
          {
            "index": "0",
            "name": "SW2",
            "value": "11"
          }
        ],
        "virtual": false
      }
    }

Output block
```````````

* Type: ``basic.output``
* States:

  * Virtual: *virtual: true*
  * FPGA I/O: *virtual: false*

Wire
~~~~

E.g.: basic output block with value *out*

.. image:: ../resources/images/blocks/basic-output.png

|

.. code-block:: json

   {
     "data": {
       "label": "out",
       "name": "out",
       "range": "",
       "pins": [
         {
           "index": "0",
           "name": "",
           "value": 0
         }
       ],
       "virtual": false
     }
   }

Bus
~~~

E.g.: basic output block with value *out[1:0]*

.. image:: ../resources/images/blocks/basic-output-bus.png

|

.. code-block:: json

    {
      "data": {
        "label": "out[1:0]",
        "name": "out",
        "range": "[1:0]",
        "pins": [
          {
            "index": "1",
            "name": "LED0",
            "value": "95"
          },
          {
            "index": "0",
            "name": "LED1",
            "value": "96"
          }
        ],
        "virtual": false
      }
    }

Constant block
``````````````

Code block
``````````

Info block
``````````

Generic blocks
--------------

Any project can be added as a read-only **generic block**:

* The *input blocks* become *input ports*
* The *output blocks* become *output ports*
* The *constant blocks* become *parameters*

.. image:: ../resources/images/blocks/generic.png

|

.. container:: toggle

    .. container:: header

        **Show/Hide code**

    |

    .. literalinclude:: ../resources/samples/generic.ice
       :language: json
