//---------------------------------------------------------------------------
//-- Module for working with Blocks
//---------------------------------------------------------------------------
'use strict';

//-- Disable the jshint Warning: "xxxx defined but never used"
/* jshint unused:false */

angular.module('icestudio')
  .service('blocks', 
    function () 
{

  //-------------------------------------------------------------------------
  //-- CONSTANTS for the blocks
  //-------------------------------------------------------------------------
  //-- TYPE of blocks
  const BASIC_INPUT = 'basic.input';   //-- Input ports
  const BASIC_OUTPUT = 'basic.output'; //-- Output ports
  const BASIC_INPUT_LABEL = 'basic.inputLabel';    //-- Input labels
  const BASIC_OUTPUT_LABEL = 'basic.outputLabel';  //-- OUtput labels
  const BASIC_PAIRED_LABELS = "basic.pairedLabel"; //-- Paired labels
  const BASIC_CODE = 'basic.code';     //-- Verilog code
  const BASIC_MEMORY = 'basic.memory'; //-- Memory parameter
  const BASIC_CONSTANT = 'basic.constant'; //-- Constant parameter
  const BASIC_INFO = 'basic.info'; //-- Info block


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

  class LabelBlock extends Block {

    //-- Parameters:
    //-- type: Select the type of LabelBlock:
    //--    -BASIC_INPUT_LABEL
    //--    -BASIC_OUTPUT_LABEL
    constructor(type, name, range, color) {

      //-- Build the block common fields
      super(type);

      //-- Particular information
      this.data.name = name;         //-- Label name
      this.data.range = range;       //-- If the lable is single or bus. 
                                     //--  Ej. "[1:0]"    
      this.data.blockColor = color;  //-- Label color
      this.data.virtual = true;      //-- Labels are a kind of virtual pin 

    }
  }

  class InputLabelBlock extends LabelBlock {

    constructor(name, range, color) {

      //-- Build the port common fields
      super(BASIC_INPUT_LABEL, name, range, color);

      //-- No particular information
    }

  }

  class OutputLabelBlock extends LabelBlock {

    constructor(name, range, color) {

      //-- Build the port common fields
      super(BASIC_OUTPUT_LABEL, name, range, color);

      //-- No particular information
    }

  }

  class CodeBlock extends Block {

    //-----------------------------------------------------------------------
    //-- INPUTS:
    //--   * inPortsInfo: Array of PortInfos
    //--   * outPortsInfo: Array of PortInfos
    //--   * inParamsInfo: Array of PortInfos
    //--
    //--  PortInfos:
    //--    * name: String
    //--    * rangestr: String
    //--    * size: Integer
    //-----------------------------------------------------------------------
    constructor(inPortsInfo, outPortsInfo, inParamsInfo) {

      //-- Build the block common fields
      super(BASIC_CODE);

      //-- Block size
      this.size = {
        width: 192,
        height: 128
      };

      //-- Block ports
      this.data.ports = {
        in: [],
        out: []
      };
     
      //-- Block input params
      this.data.params = [];

      //-- Block code
      this.data.code = '';

      //-- Insert the Input portInfo
      inPortsInfo.forEach(portInfo => {

        let info = {
          name: portInfo.name,
          range: portInfo.rangestr,
          size: portInfo.size > 1 ? portInfo.size : undefined
        };

        this.data.ports.in.push(info);
      });

      //-- Insert the Output portInfo
      outPortsInfo.forEach(portInfo => {

        let info = {
          name: portInfo.name,
          range: portInfo.rangestr,
          size: portInfo.size > 1 ? portInfo.size : undefined
        };

        this.data.ports.out.push(info);
      });

      //-- Insert the input params
      inParamsInfo.forEach(portInfo => {

        let info = {
          name: portInfo.name,
          range: portInfo.rangestr,
          size: portInfo.size > 1 ? portInfo.size : undefined
        };

        this.data.params.push(info);

      });

    }
    
  }


  class MemoryBlock extends Block {

    constructor(name='', list='', local=false, format=10) {

      //-- Build the block common fields
      super(BASIC_MEMORY);

      //-- Block size
      this.size = {
        width: 20 * 8,
        height: 22 * 8
      };

      //-- Name
      this.data.name = name;

      //-- List
      this.data.list = list;

      //-- Local parameter
      this.data.local = local;

      //-- Format
      this.data.format = format;
    }

  }


  class ConstantBlock extends Block {

    constructor(name='', value='', local=false) {

      //-- Build the block common fields
      super(BASIC_CONSTANT);

      //-- Name
      this.data.name = name;

      //-- Constant value
      this.data.value = value;

      //-- Local parameter
      this.data.local = local;

    }
  }


  class InfoBlock extends Block {

    constructor() {

      //-- Build the block common fields
      super(BASIC_INFO);

      this.data.info = '';
      this.data.readonly = false;

      //-- Block size
      this.size = {
        width: 192,
        height: 128
      };

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

    //-- If pinsSrc is not defined, there is nothing
    //-- to copy
    if (!pinsSrc) {
      return;
    }

    //-- Get the target and destination lengths
    let dlen = pinsDest.length || 0;
    let slen = pinsSrc.length || 0;

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
  //--
  //-- INPUTS:
  //--   * portBlock: Input or output port block
  //--
  //-- RETURNS:
  //--   -The size in pins
  //-------------------------------------------------------------------------
  function getSize(portBlock) {

    //-- Size by default
    let size = 1;

    //-- If there exist pins, the size is the number of pins
    if (portBlock.data.pins) {
      size = portBlock.data.pins.length;
    }

    //-- Return the portBlock size
    return size;

  }

  //-----------------------------------------------------------------------
  //-- Convert an array of portsInfo to a String
  //-- Ej. portsInfo --> "a,b[1:0],c"
  //--
  //-- INPUTS:
  //--   * An array of portsInfo
  //--
  //-- RETURNS:
  //--   * A string with the names and range string separated by commas
  //-----------------------------------------------------------------------
  function portsInfo2Str(portsInfo) {

    let portNamesArray = [];

    //-- Get the portnames as an Array
    portsInfo.forEach(port => {

      let range = port.range || port.rangestr || '';
      let name = port.name + range;

      portNamesArray.push(name);
    });

    //-- Convert the portnames as strings
    let portsNameStr = portNamesArray.join(',');

    //-- Return the string
    return portsNameStr;
  }


  //-- Public classes
  this.Block = Block;
  this.InputPortBlock = InputPortBlock;
  this.OutputPortBlock = OutputPortBlock;

  this.InputLabelBlock = InputLabelBlock;
  this.OutputLabelBlock = OutputLabelBlock;

  this.CodeBlock = CodeBlock;
  this.MemoryBlock = MemoryBlock;
  this.ConstantBlock = ConstantBlock;
  this.InfoBlock = InfoBlock;

  //-- Public functions
  this.getPins = getPins;
  this.copyPins = copyPins;
  this.getSize = getSize;
  this.portsInfo2Str = portsInfo2Str;
  

  //-- Public constants 
  this.BASIC_INPUT = BASIC_INPUT;
  this.BASIC_OUTPUT = BASIC_OUTPUT;
  this.BASIC_INPUT_LABEL = BASIC_INPUT_LABEL;
  this.BASIC_OUTPUT_LABEL = BASIC_OUTPUT_LABEL;
  this.BASIC_PAIRED_LABELS = BASIC_PAIRED_LABELS;
  this.BASIC_CODE = BASIC_CODE;
  this.BASIC_MEMORY = BASIC_MEMORY;
  this.BASIC_CONSTANT = BASIC_CONSTANT;
  this.BASIC_INFO = BASIC_INFO;
  
  

});
