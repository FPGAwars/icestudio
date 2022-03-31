//---------------------------------------------------------------------------
//-- Temporal utils module
//-- Used for refactoring
//---------------------------------------------------------------------------
'use strict';

//-- Disable the jshint Warning: "xxxx defined but never used"
/* jshint unused:false */

angular.module('icestudio')
  .service('utils2', 
    function (
    ) 
{

  //---------------------------------------------------------------------------
  //-- CONSTANTS for the blocks
  //---------------------------------------------------------------------------
  //-- TYPE of blocks
  const BASIC_INPUT = 'basic.input';   //-- Input ports
  const BASIC_OUTPUT = 'basic.output'; //-- Output ports

  const BASIC_PAIRED_LABELS = "basic.pairedLabel";
  
  //-- Maximum length for the BUSES in ports
  //const MAX_SIZE = 96;

  //-------------------------------------------------------------------------
  //-- Class: Block Object. It represent any graphical object in the
  //--        circuit
  //-- 
  //-------------------------------------------------------------------------
  class Block {

    //-- Information common to all blocks:
    //-- * type: Type of block:
    //--         -BASIC_INPUT: Input port
    //--         -BASIC_OUTPUT: Output port
    //--         -[..]
    //-- * id: unique block identifier
    //-- * position: Position in the grid (x,y)
    //-- * data: Information specific of every block
    constructor(type)  {

      //------- Object structure
      //-- Type of block
      this.type = type;

      //-- Block identifier
      this.id = null;

      //-- Block data. Each block has its own data type
      this.data = {};

      //-- Block position
      this.position = {
        x: 0,
        y: 0  
      };
    }

  }


  //-------------------------------------------------------------------------
  //-- Class: Port. Virtual class for representing both input and output  
  //--              ports. 
  //--
  //--   * Particular information:
  //--      -name (String): Port name 
  //--      -virtual (Bool): Type of pin. Real or Virtual
  //--          * true: It is a virtual port, inside the FPGA
  //--          * false: It is a pin, whichs connects the FPGA with the 
  //--                   the experior
  //--      -range: A String indicating the bus range (it is is a bus)
  //--              Ex: "[1:0]"
  //--      -pins: Array of objects. Available Only if the port is a pin
  //--          -index: Position of the pin in the array (default 0)
  //--          -name: "" : Pin name (From the resources/boards/{board}
  //--                               /pinout.json) (Which comes from .pcf)
  //--          -value: "": Pin value (physical pin assigned by .pcf)
  //-------------------------------------------------------------------------
  class PortBlock extends Block {

    //-- Parameters:
    //-- type: Select the type of PortBlock:
    //--   -BASIC_INPUT
    //--   -BASIC_OUTPUT
    constructor(type, name, virtual, range, pins) {

      //-- Build the block common fields
      super(type);

      //-- Particular information
      this.data.name = name;         //-- Port name. A String
      this.data.virtual = virtual;   //-- Type of port: Real or virtual
      this.data.range = range;       //-- If the port is single or bus. 
                                     //--  Ej. "[1:0]"     
      this.data.pins = pins;         //-- Only if the port is a pin 
    }
  }


  //-------------------------------------------------------------------------
  //-- Class: Input port. The information comes from the outside and
  //--   get inside the FPGA
  //--
  //--   * Particular information:
  //--      -clock: (bool). If the port is a clock or not
  //--         * true: It is a clock signal
  //--         * False: Normal signal
  //-------------------------------------------------------------------------
  class InputPortBlock extends PortBlock {
    constructor(name, virtual, range, pins, clock) {

      //-- Build the port common fields
      super(BASIC_INPUT, name, virtual, range, pins);

      //-- Particular information
      this.data.clock = clock;    //-- Optional. Is the port a clock input?
    }
  }

  //-------------------------------------------------------------------------
  //-- Class: Output port. The information goes from the FPGA to the 
  //--        outside. Or from one block to another the upper level
  //--
  //--   NO particular information
  //-------------------------------------------------------------------------
  class OutputPortBlock extends PortBlock {
    constructor(name, virtual, range, pins) {

      //-- Build the port common fields
      super(BASIC_OUTPUT, name, virtual, range, pins);

      //-- No particular information
    }
  }

  //-----------------------------------------------------------------------
  //-- Return an array with empty pins
  //-- Empty pins have both name and value properties set to "NULL"
  //-- * INPUT:
  //--    -portInfo: Port information structure
  //-- * Returns:
  //--    -An array of pins
  //-----------------------------------------------------------------------
  function getPins(portInfo) {

    //-- The output array of pins. Initially empty
    let pins = [];

    for (let i = 0; i < portInfo.size; i++) {
      pins.push(
        {
          index: i.toString(),
          name: 'NULL',
          value: 'NULL' //-- Pin value
        });
    }

    return pins;
  }


  //-------------------------------------------------------------------------
  //-- Copy the pins from the source object to the target object
  //--
  //-- INPUTS:
  //--   * pinsSrc: Array of source pins
  //--   * pinsDst: Array of destination pins
  //--
  //-- Both arrays can have different sizes
  //-- The numer of pins to copy is, therefore the minimal length
  //-- of the arrays
  //-------------------------------------------------------------------------
  function copyPins(pinsSrc, pinsDest) {

    //-- Get the target and destination lengths
    let dlen = pinsDest.length;
    let slen = pinsSrc.length;

    //-- Calculate the minimum size
    let min = Math.min(dlen, slen);

    //-- Copy the pins (only min pins are copied)
    //-- The copy starts from the highest pins to the lowest 
    for (let i = 0; i < min; i++) {
      pinsDest[dlen - 1 - i].name = pinsSrc[slen - 1 - i].name;
      pinsDest[dlen - 1 - i].value = pinsSrc[slen - 1 - i].value;
    }
  }
  
  //-------------------------------------------------------------------------
  //-- Get the number of poin of the given port block (input or output)
  //-- Virtual pins always have a size of 0
  //--
  //-- INPUTS:
  //--   * portBlock: Input or output port block
  //--
  //-- RETURNS:
  //--   -The size in pins
  //-------------------------------------------------------------------------
  function getSize(portBlock) {

    //-- Size by default
    let size = 0;

    //-- If there exist pins, the size is the number of pins
    if (portBlock.data.pins) {
      size = portBlock.data.pins.length;
    }

    //-- Return the portBlock size
    return size;

  }


  //-- Public classes
  this.Block = Block;
  this.InputPortBlock = InputPortBlock;
  this.OutputPortBlock = OutputPortBlock;

  //-- Public functions
  this.getPins = getPins;
  this.copyPins = copyPins;
  this.getSize = getSize;

  //-- Public constants 
  this.BASIC_INPUT = BASIC_INPUT;
  this.BASIC_OUTPUT = BASIC_OUTPUT;

  this.BASIC_PAIRED_LABELS = BASIC_PAIRED_LABELS;

});
