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


  

  //-- Public classes
  this.Block = Block;
  this.InputPortBlock = InputPortBlock;
  this.OutputPortBlock = OutputPortBlock;

  //-- Public constants 
  this.BASIC_INPUT = BASIC_INPUT;
  this.BASIC_OUTPUT = BASIC_OUTPUT;

  this.BASIC_PAIRED_LABELS = BASIC_PAIRED_LABELS;

});
