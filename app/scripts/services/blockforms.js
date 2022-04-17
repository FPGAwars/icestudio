//---------------------------------------------------------------------------
//-- Functions for creating and editing icestudio blocks using forms
//---------------------------------------------------------------------------
'use strict';

angular.module('icestudio')
  .service('blockforms', 
    function (

      //-- Access to the JointJS API
      //-- More infor: https://www.npmjs.com/package/jointjs
      //-- Tutorial: https://resources.jointjs.com/tutorial/
      joint, 
      
      forms,  //-- Create and display forms for user inputs

      utils,
      blocks,
      common,
      gettextCatalog,
      sparkMD5
    )
{

    var gridsize = 8;
    var resultAlert = null;
 
    this.newBasic = newBasic;
    this.newGeneric = newGeneric;

    this.loadBasic = loadBasic;
    this.loadGeneric = loadGeneric;
    this.loadWire = loadWire;

    this.editBasic = editBasic; // this is double clicking
    this.editBasicLabel = editBasicLabel; // this is from "label-Finder"


  //-------------------------------------------------------------------------
  //-- Create a new Basic Block. A form is displayed for the user to
  //-- enter the data of the block
  //--
  //-- Inputs:
  //--   * type: Type of Basic block:
  //--     -BASIC_INPUT --> Input port
  //--     -BASIC_OUTPUT --> Output port
  //--     -BASIC_OUTPUT_LABEL
  //--     -BASIC_INPUT_LABEL
  //--     -'basic.constant'
  //--     -BASIC_MEMORY
  //--     -BASIC_CODE
  //--     -'basic.info'
  //--
  //--   * callback(cells): The function is called when the user clic on
  //--      the OK button and all the data is ok.
  //--      -cells: Array of blocks passed as arguments
  //-------------------------------------------------------------------------
  function newBasic(type, callback) {

    let form;

    //-- Create the block by calling the corresponding function
    //-- according to the given type
    switch (type) {

      //-- Input port
      case blocks.BASIC_INPUT:

        form = new forms.FormBasicInput();
        newBasicPort(form, callback);
        break;

      //-- Output port
      case blocks.BASIC_OUTPUT:

        form = new forms.FormBasicOutput();
        newBasicPort(form, callback);
        break;

      //-- Output label
      case blocks.BASIC_OUTPUT_LABEL:

        form = new forms.FormBasicOutputLabel();
        newBasicLabel(form, callback);
        break;

      //-- Input label
      case blocks.BASIC_INPUT_LABEL:
        form = new forms.FormBasicInputLabel();
        newBasicLabel(form, callback);
        break;

      //-- Paired Labels
      case blocks.BASIC_PAIRED_LABELS:
        
        form = new forms.FormBasicPairedLabels();
        newBasicPairedLabels(form, callback);
        break;

      //-- Constant parameter block
      case blocks.BASIC_CONSTANT:
        newBasicConstant2(callback);
        break;

      case blocks.BASIC_MEMORY:
        newBasicMemory2(callback);
        break;

      //-- Code block
      case blocks.BASIC_CODE:
        
        form = new forms.FormBasicCode();
        newBasicCode(form, callback);
        break;

      case 'basic.info':
        newBasicInfo(callback);
        break;

      default:
        break;
    }
  }

  //-------------------------------------------------------------------------
  //-- Create one or more New Basic Ports. A form is displayed first 
  //-- for the user to enter the block data: (name, pin type and clock pin..)
  //--
  //-- Inputs:
  //--   * form: Form for that block...
  //--   * callback(cells):  Call the function when the block is read. The
  //--      cells are passed as a parameter
  //-------------------------------------------------------------------------
  function newBasicPort(form, callback) {

    //-- Display the form
    form.display((evt) => {

      //-- The callback is executed when the user has pressed the OK button

      //-- Process the inforation in the form
      //-- The results are stored inside the form
      //-- In case of error the corresponding notifications are raised
      form.process(evt);

      //-- If there were errors, the form is not closed
      //-- Return without clossing
      if (evt.cancel) {
        return;
      }

      //--------- Everything is ok so far... Let's create the blocks!

      //-- Array for storing the blocks
      let cells = [];

      //-- Store the acumulate y position
      let positionY = 0;

      //-- Get all the blocks created from the form
      //-- Only the block data, not the final block
      let blocks = form.newBlocks();

      //-- Create an array with the final blocks!
      blocks.forEach( block => {

        //-- update the block position
        block.position.y = positionY;

        //-- Build the cell
        let cell = loadBasic(block);

        //-- Insert the block into the array
        cells.push(cell);

        //-- Calculate the Next block position
        //-- The position is different for virtual and real pins
        positionY += 
          (form.virtual ? 10 : (6 + 4 * block.data.pins.length)) * gridsize;
          
      });

      //-- We are done! Execute the callback function 
      callback(cells);
      
    });
  }

  //-------------------------------------------------------------------------
  //-- Create one or more New Basic Labels. A form is displayed first 
  //-- for the user to enter the block data: (name, pin type and clock pin..)
  //--
  //-- Inputs:
  //--   * form: Form for that block...
  //--   * callback(cells):  Call the function when the block is read. The
  //--      cells are passed as a parameter
  //-------------------------------------------------------------------------
  function newBasicLabel(form, callback) {

    //-- Display the form
    form.display((evt) => {

      //-- The callback is executed when the user has pressed the OK button

      //-- Process the inforation in the form
      //-- The results are stored inside the form
      //-- In case of error the corresponding notifications are raised
      form.process(evt);

      //-- If there were errors, the form is not closed
      //-- Return without clossing
      if (evt.cancel) {
        return;
      }

      //--------- Everything is ok so far... Let's create the blocks!

      //-- Array for storing the blocks
      let cells = [];

      //-- Store the acumulate y position
      let positionY = 0;

      //-- Get all the blocks created from the form
      //-- Only the block data, not the final block
      let blocks = form.newBlocks();

      //-- Create an array with the final blocks!
      blocks.forEach( block => {

        //-- update the block position
        block.position.y = positionY;

        //-- Build the cell
        let cell = loadBasic(block);

        //-- Insert the block into the array
        cells.push(cell);

        //-- Calculate the Next block position
        positionY += 10 * gridsize;
          
      });

      //-- We are done! Execute the callback function 
      callback(cells);

    });
  }


  //-------------------------------------------------------------------------
  //-- Create two paired labels: An input and output labels with the
  //-- same name 
  //--
  //-- Inputs:
  //--   * callback(cells):  Call the function when the block is read. The
  //--      cells are passed as a parameter
  //-------------------------------------------------------------------------
  function newBasicPairedLabels(form, callback) {

    //-- Display the form
    form.display((evt) => {

      //-- The callback is executed when the user has pressed the OK button

      //-- Process the inforation in the form
      //-- The results are stored inside the form
      //-- In case of error the corresponding notifications are raised
      form.process(evt);

      //-- If there were errors, the form is not closed
      //-- Return without clossing
      if (evt.cancel) {
        return;
      }

      //--------- Everything is ok so far... Let's create the blocks!

      //-- Array for storing the blocks
      let cells = [];

      //-- Store the acumulate y position
      let positionY = 0;

      //-- Get all the blocks created from the form
      //-- Only the block data, not the final block
      let blocks = form.newBlocks();

      //-- Create an array with the final blocks!
      //-- Get all the paired Labels
      blocks.forEach( pair => {

        //-- update the pair position
        pair[0].position.y = positionY;
        pair[1].position.y = positionY;
        pair[1].position.x += 130;

        //-- Build the two cells of the paired labels
        let cell0 = loadBasic(pair[0]);
        let cell1 = loadBasic(pair[1]);

        //-- Insert the blocks into the array
        cells.push(cell0);
        cells.push(cell1);

         //-- Calculate the Next paired block position
         positionY += 10 * gridsize;
          
      });

      //-- We are done! Execute the callback function 
      callback(cells);
    });

  }


  function newBasicConstant2(callback) {

    //-- Create the form
    let form = new forms.FormBasicConstant();

      //-- Display the form
      form.display((evt) => {

      //-- The callback is executed when the user has pressed the OK button

      //-- Process the inforation in the form
      //-- The results are stored inside the form
      //-- In case of error the corresponding notifications are raised
      form.process(evt);

      //-- If there were errors, the form is not closed
      //-- Return without clossing
      if (evt.cancel) {
        return;
      }   

      //-- OK. All the values are ok. Proceed!!

      //-- Array for storing the blocks
      let cells = [];

      //-- Store the acumulate x position
      let positionX = 0;

      //-- Get all the blocks created from the form
      //-- Only the block data, not the final block
      let blocks = form.newBlocks();

       //-- Create an array with the final blocks!
       blocks.forEach( block => {

       //-- update the block position
       block.position.x = positionX;

       //-- Build the cell
       let cell = loadBasicConstant(block);

       //-- Insert the block into the array
       cells.push(cell);

       //-- update the block position
       positionX += 15 * gridsize;

       });

       if (callback) {
        callback(cells);
      }

     });

  }


    function newBasicMemory2(callback) {

      let form = new forms.FormBasicMemory();

      //-- Display the form
      form.display((evt) => {

        //-- The callback is executed when the user has pressed the OK button

        //-- Process the inforation in the form
        //-- The results are stored inside the form
        //-- In case of error the corresponding notifications are raised
        form.process(evt);

        //-- If there were errors, the form is not closed
        //-- Return without clossing
        if (evt.cancel) {
          return;
        }   

        //-- OK. All the values are ok. Proceed!!

        //-- Array for storing the blocks
        let cells = [];

        //-- Store the acumulate x position
        let positionX = 0;

        //-- Get all the blocks created from the form
        //-- Only the block data, not the final block
        let blocks = form.newBlocks();

        //-- Create an array with the final blocks!
        blocks.forEach( block => {

          //-- update the block position
          block.position.x = positionX;

          //-- Build the cell
          let cell = loadBasicMemory(block);

          //-- Insert the block into the array
          cells.push(cell);

          //-- update the block position
          positionX += 22 * gridsize;
          
        });

        if (callback) {
          callback(cells);
        }

      });

    }


    function newBasicCode(form, callback) {

      //-- Display the form
      form.display((evt) => {

        //-- The callback is executed when the user has pressed the OK button

        //-- Process the inforation in the form
        //-- The results are stored inside the form
        //-- In case of error the corresponding notifications are raised
        form.process(evt);

        //-- If there were errors, the form is not closed
        //-- Return without clossing
        if (evt.cancel) {
          return;
        }       

        //-- OK. There are no duplicated names. Proceed!!

        //-- Create a blank block
        let blockInstance = new blocks.CodeBlock(
          form.inPortsInfo,
          form.outPortsInfo,
          form.inParamsInfo
        );

        //-- Build the cell
        let cell = loadBasicCode(blockInstance);

        //-- Execute the callback function passing the
        //-- new cell as an argument (An array of one cell)
        callback([cell]);

      });
    }  


    function newBasicInfo(callback) {

      //-- Create the info Block
      let block = new blocks.InfoBlock();

      if (callback) {

        //-- Build the cell
        let cell = loadBasicInfo(block);

        //-- Execute the callback function passing the 
        //-- new cell as an argument (An array of one cell)
        callback([cell]);
      }
    }

    function newGeneric(type, block, callback) {

      var blockInstance = {
        id: null,
        type: type,
        position: { x: 0, y: 0 }
      };
      if (resultAlert) {
        resultAlert.dismiss(false);
      }
      if (block &&
        block.design &&
        block.design.graph &&
        block.design.graph.blocks &&
        block.design.graph.wires) {
        if (callback) {
          callback(loadGeneric(blockInstance, block));
        }
      }
      else {
        resultAlert = alertify.error(gettextCatalog.getString('Wrong block format: {{type}}', { type: type }), 30);
      }
    }


    //-- Load

    function loadBasic(instance, disabled) {

      switch (instance.type) {
        case blocks.BASIC_INPUT:
          return loadBasicInput(instance, disabled);
          
        case blocks.BASIC_OUTPUT:
          return loadBasicOutput(instance, disabled);

        case blocks.BASIC_OUTPUT_LABEL:
          return loadBasicOutputLabel(instance, disabled);

        case blocks.BASIC_INPUT_LABEL:
          return loadBasicInputLabel(instance, disabled);

        case 'basic.constant':
          return loadBasicConstant(instance, disabled);

        case blocks.BASIC_MEMORY:
          return loadBasicMemory(instance, disabled);

        case blocks.BASIC_CODE:
          return loadBasicCode(instance, disabled);
          
        case 'basic.info':
          return loadBasicInfo(instance, disabled);
        default:
          break;
      }
    }

    function loadBasicInput(instance, disabled) {
      var data = instance.data;
      var rightPorts = [{
        id: 'out',
        name: '',
        label: '',
        size: data.pins ? data.pins.length : (data.size || 1)
      }];

      var cell = new joint.shapes.ice.Input({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled,
        rightPorts: rightPorts,
        choices: common.pinoutInputHTML
      });

      return cell;
    }

    function loadBasicOutputLabel(instance, disabled) {
      var data = instance.data;
      var rightPorts = [{
        id: 'outlabel',
        name: '',
        label: '',
        size: data.pins ? data.pins.length : (data.size || 1)
      }];

      var cell = new joint.shapes.ice.OutputLabel({
        id: instance.id,
        blockColor: instance.blockColor,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled,
        rightPorts: rightPorts,
        choices: common.pinoutInputHTML
      });
      console.log("DEBUG! ETIQUETA SALIDA CREADA!!!");
      return cell;
    }


    function loadBasicOutput(instance, disabled) {
      var data = instance.data;
      var leftPorts = [{
        id: 'in',
        name: '',
        label: '',
        size: data.pins ? data.pins.length : (data.size || 1)
      }];
      var cell = new joint.shapes.ice.Output({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled,
        leftPorts: leftPorts,
        choices: common.pinoutOutputHTML
      });
      return cell;
    }
    function loadBasicInputLabel(instance, disabled) {
      var data = instance.data;
      var leftPorts = [{
        id: 'inlabel',
        name: '',
        label: '',
        size: data.pins ? data.pins.length : (data.size || 1)
      }];

      //var cell = new joint.shapes.ice.Output({
      var cell = new joint.shapes.ice.InputLabel({
        id: instance.id,
        blockColor: instance.blockColor,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled,
        leftPorts: leftPorts,
        choices: common.pinoutOutputHTML
      });
      return cell;
    }


    function loadBasicConstant(instance, disabled) {
      var bottomPorts = [{
        id: 'constant-out',
        name: '',
        label: ''
      }];
      var cell = new joint.shapes.ice.Constant({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        disabled: disabled,
        bottomPorts: bottomPorts
      });
      return cell;
    }

    function loadBasicMemory(instance, disabled) {
      var bottomPorts = [{
        id: 'memory-out',
        name: '',
        label: ''
      }];
      var cell = new joint.shapes.ice.Memory({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        size: instance.size,
        disabled: disabled,
        bottomPorts: bottomPorts
      });
      return cell;
    }

    function loadBasicCode(instance, disabled) {
      var port;
      var leftPorts = [];
      var rightPorts = [];
      var topPorts = [];

      for (var i in instance.data.ports.in) {
        port = instance.data.ports.in[i];
        if (!port.range) {
          port.default = utils.hasInputRule(port.name);
        }
        leftPorts.push({
          id: port.name,
          name: port.name,
          label: port.name + (port.range || ''),
          size: port.size || 1
        });
      }

      for (var o in instance.data.ports.out) {
        port = instance.data.ports.out[o];
        rightPorts.push({
          id: port.name,
          name: port.name,
          label: port.name + (port.range || ''),
          size: port.size || 1
        });
      }

      for (var p in instance.data.params) {
        port = instance.data.params[p];
        topPorts.push({
          id: port.name,
          name: port.name,
          label: port.name
        });
      }

      var cell = new joint.shapes.ice.Code({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        size: instance.size,
        disabled: disabled,
        leftPorts: leftPorts,
        rightPorts: rightPorts,
        topPorts: topPorts
      });

      return cell;
    }

    function loadBasicInfo(instance, disabled) {
      // Translate info content
      if (instance.data.info && instance.data.readonly) {
        instance.data.text = gettextCatalog.getString(instance.data.info);
      }
      var cell = new joint.shapes.ice.Info({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        position: instance.position,
        size: instance.size,
        disabled: disabled
      });
      return cell;
    }

    function loadGeneric(instance, block, disabled) {


      var i;
      var leftPorts = [];
      var rightPorts = [];
      var topPorts = [];
      var bottomPorts = [];
      let virtualBlock= new IceBlock({cacheDirImg:common.IMAGE_CACHE_DIR});
      instance.data = { ports: { in: [] } };

      for (i in block.design.graph.blocks) {
        var item = block.design.graph.blocks[i];
        if (item.type === blocks.BASIC_INPUT) {
          if (!item.data.range) {
            instance.data.ports.in.push({
              name: item.id,
              default: utils.hasInputRule((item.data.clock ? 'clk' : '') || item.data.name)
            });
          }
          leftPorts.push({
            id: item.id,
            name: item.data.name,
            label: item.data.name + (item.data.range || ''),
            size: item.data.pins ? item.data.pins.length : (item.data.size || 1),
            clock: item.data.clock
          });
        }

        else if (item.type === blocks.BASIC_OUTPUT) {
          rightPorts.push({
            id: item.id,
            name: item.data.name,
            label: item.data.name + (item.data.range || ''),
            size: item.data.pins ? item.data.pins.length : (item.data.size || 1)
          });
        }
        else if (item.type === 'basic.constant' || item.type === blocks.BASIC_MEMORY) {
          if (!item.data.local) {
            topPorts.push({
              id: item.id,
              name: item.data.name,
              label: item.data.name
            });
          }
        }
      }

      //      var size = instance.size;
      var size = false;
      if (!size) {
        var numPortsHeight = Math.max(leftPorts.length, rightPorts.length);
        var numPortsWidth = Math.max(topPorts.length, bottomPorts.length);

        size = {
          width: Math.max(4 * gridsize * numPortsWidth, 12 * gridsize),
          height: Math.max(4 * gridsize * numPortsHeight, 8 * gridsize)
        };
      }

      var blockLabel = block.package.name;
      var blockImage = '';
      let blockImageSrc='';
      let hash='';
      if (block.package.image) {
        if (block.package.image.startsWith('%3Csvg')) {
          blockImage = decodeURI(block.package.image);
        }
        else if (block.package.image.startsWith('<svg')) {
          blockImage = block.package.image;
        }
        if(blockImage.length>0){
          hash=sparkMD5.hash(blockImage);
          blockImageSrc=virtualBlock.svgFile(hash,blockImage);
        }
      }

      var cell = new joint.shapes.ice.Generic({
        id: instance.id,
        blockType: instance.type,
        data: instance.data,
        config: block.design.config,
        pullup: block.design.pullup,
        image: blockImageSrc,
        label: blockLabel,
        tooltip: gettextCatalog.getString(block.package.description),
        position: instance.position,
        size: size,
        disabled: disabled,
        leftPorts: leftPorts,
        rightPorts: rightPorts,
        topPorts: topPorts
      });
      return cell;
    }

    function loadWire(instance, source, target) {

      // Find selectors
      var sourceSelector, targetSelector;
      var leftPorts = target.get('leftPorts');
      var rightPorts = source.get('rightPorts');

      for (var _out = 0; _out < rightPorts.length; _out++) {
        if (rightPorts[_out] === instance.source.port) {
          sourceSelector = _out;
          break;
        }
      }
      for (var _in = 0; _in < leftPorts.length; _in++) {
        if (leftPorts[_in] === instance.target.port) {
          targetSelector = _in;
          break;
        }
      }

      var _wire = new joint.shapes.ice.Wire({
        source: {
          id: source.id,
          selector: sourceSelector,
          port: instance.source.port
        },
        target: {
          id: target.id,
          selector: targetSelector,
          port: instance.target.port
        },
        vertices: instance.vertices
      });
      return _wire;
    }


    //-- Edit

    //-----------------------------------------------------------------------
    //-- Edit a Basic Block
    //--
    //-- INPUTS:
    //--   * type: Type of Basic Block
    //--   * cellView: Access to the graphics library
    //--   * callback: Function to call when the block is Edited
    //-----------------------------------------------------------------------
    function editBasic(type, cellView, callback) {

      //-- Get information from the joint graphics library
      let block = cellView.model.attributes;

      //-- Get the input port data
      let name = block.data.name + (block.data.range || '');
      let virtual = block.data.virtual;
      let clock = block.data.clock;
      let form;
      let color = block.data.blockColor;

      //-- Call the corresponding function depending on the type of block
      switch (type) {

        //-- Input port
        case blocks.BASIC_INPUT:

          //-- Build the form, and pass the actual block data
          form = new forms.FormBasicInput(name, virtual, clock);
          editBasicPort(form, cellView, callback);
          break;
  
        //-- Output port
        case blocks.BASIC_OUTPUT:

          //-- Build the form, and pass the actual block data
          form = new forms.FormBasicOutput(name, virtual);
          editBasicPort(form,cellView, callback);
          break;

        //-- Output Label
        case blocks.BASIC_OUTPUT_LABEL:

          //-- Build the form, and pass the actual block data
          form = new forms.FormBasicOutputLabel(name, color);
          editBasicLabel2(form, cellView);
          break;

        //-- Input Label
        case blocks.BASIC_INPUT_LABEL:

          //-- Build the form, and pass the actual block data
          form = new forms.FormBasicInputLabel(name, color);
          editBasicLabel2(form, cellView);
          break;

        case blocks.BASIC_CONSTANT:
          editBasicConstant(cellView);
          break;

        case blocks.BASIC_MEMORY:
          editBasicMemory(cellView);
          break;

        case blocks.BASIC_CODE:
          editBasicCode(cellView, callback);
          break;

        case 'basic.info':
          editBasicInfo(cellView);
          break;
        default:
          break;
      }
    }

    //-----------------------------------------------------------------------
    //-- Change a Label block and launch a success notification to the user
    //-- 
    //-- INPUTS:
    //--   * data:  New particular data of the block (it depens on the type
    //--            of block)
    //--   * cellView: Graphical information for block to change
    //--                                                                      
    //------------------------------------------------------------------------
    function changeLabelBlock(cellView, data) {

      //-- Get the graphical information of the block
      let graph = cellView.paper.model;

      //-- Change the block!
      graph.startBatch('change');
      cellView.model.set('data', data);
      graph.stopBatch('change');

      //-- Apply the changes
      cellView.apply();

      //-- Notify it to the user!
      resultAlert = alertify.success(
        gettextCatalog.getString('Label updated'));

    }


    //-----------------------------------------------------------------------
    //-- Edit a basic label block (input/output)
    //-- This function is called form the Find panel
    //--
    //-- TODO: It still needs to be refactored and joined with the current
    //-- block classes
    //--
    //-- INPUTS:
    //--
    //--   * cellView: Graphical information of the block
    //--   * newName: New label name to assign to the block
    //--   * newColor: New color for the Label
    //-------------------------------------------------------------------------
    function editBasicLabel(cellView, newName, newColor){
      let block = cellView.model.attributes;

      //-- Create the new block
      let data = utils.clone(block.data);

      //-- Set the new data
      data.name = newName;
      data.blockColor = newColor;

      // Edit block and Notify to the user
     changeLabelBlock(cellView, data);
    }


    //-----------------------------------------------------------------------
    //-- Edit Label. It is called when the user doble clicks on a Label
    //--
    //--  INPUTS:
    //--    * form: New form created
    //--    * cellView: Graphical inforation of the block
    //-----------------------------------------------------------------------
    function editBasicLabel2(form, cellView) {

      //-- Get the information of the current block
      //-- from the graphics library
      let block = cellView.model.attributes;

      //-- Display the form
      form.display((evt) => {

        //-- The callback is executed when the user has pressed the OK button

        //-- Process the inforation in the form
        //-- The results are stored inside the form
        //-- In case of error the corresponding notifications are raised
        form.process(evt);

        //-- If there were errors, the form is not closed
        //-- Return without clossing
        if (evt.cancel) {
          return;
        }

        //-- If there were no changes, return: Nothing to do
        if (!form.changed) {
          return;
        }

        // Create new block
        let newblock = form.newBlock(0);

        //-- Set the same position than the original block
        newblock.position.x = block.position.x;
        newblock.position.y = block.position.y;

        // Edit block
        changeLabelBlock(cellView, newblock.data);
      });
    }

   
    //-------------------------------------------------------------------------
    //-- Edit an Input/Output Port block. The Form is displayed, and the user
    //-- can edit the information
    //--
    //-- Inputs:
    //--   * form
    //--   * cellView: 
    //--   * callback(cells):  Call the function when the user has  
    //--     edited the data and pressed the OK button
    //-------------------------------------------------------------------------
    function  editBasicPort(form, cellView, callback) {

      //-- Get the information from the graphics library
      let graph = cellView.paper.model;
      let block = cellView.model.attributes;

      //-- Display the form. It will show the current block name
      //-- and the state of the virtual and clock checkboxes
      form.display((evt) => {

        //-- The callback is executed when the user has pressed the OK button

        //-- Process the inforation in the form
        //-- The results are stored inside the form
        //-- In case of error the corresponding notifications are raised
        form.process(evt);

        //-- If there wew error, the form is not closed
        //-- Return without clossing
        if (evt.cancel) {
          return;
        }

        //-- If there were no changes, return: Nothing to do
        if (!form.changed) {
          return;
        }

        //-- Now we have two bloks:
        //--   The initial one: block.data
        //--   The new one entered by the user: portInfo

        //-- Get the data for the new block from the Form
        let virtual = form.virtual;
        let portInfo = form.portInfos[0];

        //-- Get an array with the pins used
        let pins = blocks.getPins(portInfo);

        //-- Copy the pins from the original
        //-- block to the new one
        blocks.copyPins(block.data.pins, pins);

        // Create new block
        let newblock = form.newBlock(0);

        // Assign the previous pins to the new pin
        newblock.data.pins = pins;

         //-- Set the same position than the original block
         newblock.position.x = block.position.x;
         newblock.position.y = block.position.y;

        //-- There was a change in size
        if (block.data.range !== portInfo.rangestr) {

          //-- Calculate the new position so that the output
          //-- wire remains in the same place (the port expands or 
          //-- shrink), but the output port is in the same place  

          //-- Size in pins of the initial block
          let oldSize = blocks.getSize(block);

          //-- Size in pins of the new block
          let newSize = blocks.getSize(newblock);

          //-- Offset to applied to the vertical position
          let offset = 16 * (oldSize - newSize);

          //-- If both the initial block and the final are both
          //-- virtual: no offset applied (same position)
          if (form.virtualIni && form.virtual) {
            offset = 0;
          }

          //-- Appy the offset 
          newblock.position.y += offset; 
          
          if (callback) {

            //-- Update the block!
            graph.startBatch('change');

            let cell = loadBasic(newblock);
            callback(cell);
            cellView.model.remove();

            graph.stopBatch('change');

            resultAlert = alertify.success(
                gettextCatalog.getString('Block updated'));
          }

          return;
        }

        //-- Case 2: There was a change, but not in size

        //-- Size in pins of the initial block
        let size = block.data.pins ? block.data.pins.length : 1;

        //-- Previous size
        let oldSize = block.data.virtual ? 1 : size;

        //-- New size
        let newSize = virtual ? 1 : size;

        // Update block position when size changes
        let offset = 16 * (oldSize - newSize);
        
        //-- Edit block
        graph.startBatch('change');

        cellView.model.set('data', newblock.data, { 
                            translateBy: cellView.model.id, 
                            tx: 0, 
                            ty: -offset
                          });

        cellView.model.translate(0, offset);
        graph.stopBatch('change');
        cellView.apply();

        resultAlert = alertify.success(
            gettextCatalog.getString('Block updated'));

      });
     
    }

    function editBasicConstant(cellView) {

      //-- Get the current memory block
      let block = cellView.model.attributes;

      //-- Get the data of the current block
      let name = block.data.name;
      let local = block.data.local;

      //-- Create the form
      let form = new forms.FormBasicConstant(name, local);

      //-- Display the form
      form.display((evt) => {

        //-- The callback is executed when the user has pressed the OK button

        //-- Process the inforation in the form
        //-- The results are stored inside the form
        //-- In case of error the corresponding notifications are raised
        form.process(evt);

        //-- If there were errors, the form is not closed
        //-- Return without clossing
        if (evt.cancel) {
          return;
        }

        //-- If there were no changes, return: Nothing to do
        if (!form.changed()) {
          return;
        }

        //-- Create the new block data and assign values
        let data = utils.clone(block.data);
        data.name = form.names[0];
        data.local = form.local;
        cellView.model.set('data', data);

        //-- Apply the changes!
        cellView.apply();

        //-- Notify the changes to the user
        resultAlert = alertify.success(
          gettextCatalog.getString('Block updated'));

      });

    }


    function editBasicMemory(cellView) {

      //-- Get the current memory block
      let block = cellView.model.attributes;

      //-- Get the data of the current block
      let name = block.data.name;
      let format = block.data.format;
      let local = block.data.local;

      //-- Create the form
      let form = new forms.FormBasicMemory(name, format, local);

      //-- Display the form
      form.display((evt) => {

        //-- The callback is executed when the user has pressed the OK button

        //-- Process the inforation in the form
        //-- The results are stored inside the form
        //-- In case of error the corresponding notifications are raised
        form.process(evt);

        //-- If there were errors, the form is not closed
        //-- Return without clossing
        if (evt.cancel) {
          return;
        }

        //-- If there were no changes, return: Nothing to do
        if (!form.changed()) {
          return;
        }

        //-- Create the new block data and assign values
        let data = utils.clone(block.data);
        data.name = form.names[0];
        data.local = form.local;
        data.format = form.value;
        cellView.model.set('data', data);

        //-- Apply the changes!
        cellView.apply();

        //-- Notify the changes to the user
        resultAlert = alertify.success(
          gettextCatalog.getString('Block updated'));
      });

    }


    function editBasicCode(cellView, callback) {

      //-- Get information from the joint graphics library
      let block = cellView.model.attributes;

      //-- Get the input port names as a string
      let inPortNames = blocks.portsInfo2Str(block.data.ports.in);

      //-- Get the output port names as a string
      let outPortNames = blocks.portsInfo2Str(block.data.ports.out);

      //-- Get the input param names as a string
      let inParamNames = blocks.portsInfo2Str(block.data.params);

      //-- Create the form
      let form = new forms.FormBasicCode(
        inPortNames,
        outPortNames,
        inParamNames
      );

      //-- Display the form
      form.display((evt) => {

        //-- The callback is executed when the user has pressed the OK button

        //-- Process the inforation in the form
        //-- The results are stored inside the form
        //-- In case of error the corresponding notifications are raised
        form.process(evt);

        //-- If there were errors, the form is not closed
        //-- Return without clossing
        if (evt.cancel) {
          return;
        }

        //-- The form values are OK. Proceed!!

        //-- Detect if the user has changed the form
        //-- If no change... return. Nothing to to
        if (!form.changed()) {
          return;
        }

        //-- Create a blank block
        let blockInstance = new blocks.CodeBlock(
          form.inPortsInfo,
          form.outPortsInfo,
          form.inParamsInfo
        );

        //-- Assign the size and possition
        blockInstance.position = block.position;
        blockInstance.size = block.size;
        blockInstance.id = block.id;
        blockInstance.data.code = block.data.code;

        //-- Build the cell
        let cell = loadBasicCode(blockInstance);

        if (cell) {

          //-- Get the graphical model 
          let graph = cellView.paper.model;

          //-- Get all the wires of the current block
          let connectedWires = graph.getConnectedLinks(cellView.model);

          //---------- Chage the block
          graph.startBatch('change');

          //-- Remove the current block
          cellView.model.remove();

          //-- Call the callback to add the new block
          callback(cell);

          //-- Restore previous connections
          for (let w in connectedWires) {

            //-- Get the wire
            let wire = connectedWires[w];

            //-- Get its size
            let size = wire.get('size');

            //-- Get source and target cells
            let source = wire.get('source');
            let target = wire.get('target');

            //-- TODO: This BIG if needs more comments and more
            //--  refactoring. It is too complex

            //-- Check if the current wire should be kept
            if (
                //-- Condition I: Wires that starts from the output ports
                //-- if the port name and size has not been changed, the
                //-- wire is kept
                ( source.id === cell.id && 
                  containsPort(source.port, size, cell.get('rightPorts'))
                ) ||

                //-- Condition II: Wires that ends in the input ports
                //-- if the port name and size has not been changed
                //-- and the source block are not a constant or memory
                //-- blocks
                ( target.id === cell.id && 
                  containsPort(target.port, size, cell.get('leftPorts')) && 
                  ( source.port !== 'constant-out' && 
                    source.port !== 'memory-out'
                  )
                ) ||

                //-- Condition III: Wire that ends in the input param ports
                //-- only if the source blocks are a constant or memory 
                //-- blocks
                ( target.id === cell.id && 
                  containsPort(target.port, size, cell.get('topPorts')) && 
                  (source.port === 'constant-out' || 
                  source.port === 'memory-out')
                )
              ) {

              //-- Add the current wire (the wire is kept)      
              graph.addCell(wire);
            }
          }

          //-- We are done. Block changed
          graph.stopBatch('change');

          //-- Notify to the user
          resultAlert = alertify.success(
            gettextCatalog.getString('Block updated'));

        }  
      });
    }

    //-----------------------------------------------------------------
    //-- Check if the given *port* with the given *size* is inside the  
    //-- list of given *ports*
    //--
    //-- INPUTS:
    //--   * port: Port to check
    //--   * size: Port's size
    //--   * ports: List of ports to check
    //--
    //--- Returns:
    //--   * true: Port located inside ports
    //--   * false: Port NOT inside ports
    //------------------------------------------------------------------
    function containsPort(port, size, ports) {
      var found = false;
      for (var i in ports) {
        if (port === ports[i].name && size === ports[i].size) {
          found = true;
          break;
        }
      }
      return found;
    }


    function editBasicInfo(cellView) {

      //-- Access the current block
      let block = cellView.model.attributes;

      //-- Copy the block data
      let data = utils.clone(block.data);

      //-- Toggle readonly
      data.readonly = !data.readonly;

      // Translate info content
      if (data.info && data.readonly) {
        data.text = gettextCatalog.getString(data.info);
      }

      //-- Set the new data
      cellView.model.set('data', data);

       //-- Apply the changes!
      cellView.apply();
    }

});


