"use strict";

//----------------------------------------------------------------------
//-- Boards
//----------------------------------------------------------------------
//-- CONFIGURATION FILES
//-----------------------------------------------------------------------
//-- The Boards are described by three .json files, located in the folder  
//-- resources/boards/boardname
//--    * pinout.json:  Pin numbers, names and type (input, output, inout)
//--    * info.json: Board information: resources, board name, interface...
//--    * rules.json: Automatic connection of unused pins
//-- 
//-- In addition there are two more OPTIONAL files:
//--    * pinout.pcf (optional): Board constraints. This is just for documentation
//--      purposes (the actual constraint file is automatically generated on 
//--      the fly when the circuit is being sinthesized)
//--    * pinout.svg (optional): Drawing of all the pins
//----------------------------------------------------------------------------
//-- DATA STRUCTURES
//----------------------------------------------------------------------------
//-- ICESTUDIO converts the .json files into objects. You can access to all   
//-- the boars from the following GLOBAL OBJECT:
//--   
//--  common.boards
//--     * name:  Board name. Ex. alhmabra_ii
//--     * info:  Resources
//--     * pinout: Pin names, number and type
//--     * rules:  If the pin is automatically connected if not used
//--     * type:   FPGA familty and type


//---------------------------------------------------------------
//-- MENU menu.json
//-- This file contains the names of all the available boards
//-- Only the boards located in that file are READ and inserted  
//-- into the common.boards GLOBAL object
//---------------------------------------------------------------

angular
  .module("icestudio")
  .service("boards", function (utils, common, nodeFs, nodePath) {

    //-- Default board
    const DEFAULT = "alhambra-ii";

    //-----------------------------------------------------------------
    //-- Read all the boards FILES and store all the information  
    //-- in the GLOBAL OBJECT: common.boards
    //-----------------------------------------------------------------
    //-- Only the board located in the menu.json FILE are READ
    //-----------------------------------------------------------------
    this.loadBoards = function () {

      var boards = [];

      //-- Construct the Boards path: "resources/boards"
      var path = nodePath.join("resources", "boards");

      //-- Read the board menu json file and convert into an object
      var menu = nodeFs.readFileSync(nodePath.join(path, "menu.json"));
      menu = JSON.parse(menu);
      
      //-- The menu is divided in big sections: The FPGA family: ICE40HX8k, ICE40HX4k, 
      //-- ICE40LPHX, UP5K, ECP5... 
      menu.forEach(FPGAfamily => {

        //-- Access to all the boards from the current family
        FPGAfamily.boards.forEach(function (boardname) {

          //-- The data from every board is located in the  
          //-- folder "resources/boards/<boardname>"
          let boardPath = nodePath.join(path, boardname);

          //-- Every board should have at least their three MANDATORY files:
          //-- info.json, pinout.json and rules.
          //--------------------------------------------------------------------
          //-- TODO: It can be improved: It is better to distinguis between
          //--  among different errores, instead only one. If anyone introduces  
          //--  a bad board, it is difficult to find where is the error....
          //--------------------------------------------------------------------
          try {
            if (
              nodeFs.statSync(boardPath).isDirectory() &&
              nodeFs.statSync(nodePath.join(boardPath, "info.json")).isFile() &&
              nodeFs.statSync(nodePath.join(boardPath, "pinout.json")).isFile() &&
              nodeFs.statSync(nodePath.join(boardPath, "rules.json")).isFile()
            ) {

              //-- Board files ok. READ them!!
              let info = readJSONFile(boardPath, "info.json");
              let pinout = readJSONFile(boardPath, "pinout.json");
              let rules = readJSONFile(boardPath, "rules.json");

              //-- Fill the boards structure will all the information
              //-- obtained from the files
              boards.push({
                name: boardname, 
                info: info,      //-- Board resources
                pinout: pinout,  //-- Board pins
                rules: rules,    //-- Board rules
                type: FPGAfamily.type,  //-- FPGA family type
              });
            }

          //-- There was an error reading the board files
          } catch (error) {
            console.error("Board not well configured", error.message);
          }
        });
      });

      //-- The boards are available through the GLOBAL OBJECT common.boards
      common.boards = boards;
    };


    //---- PENDING: DOCUMENTATION!!!!!!

    function readJSONFile(filepath, filename) {
      var ret = {};
      try {
        var data = nodeFs.readFileSync(nodePath.join(filepath, filename));
        ret = JSON.parse(data);
      } catch (err) {}
      return ret;
    }

    this.selectBoard = function (name) {
      name = name || DEFAULT;
      var i;
      var selectedBoard = null;
      for (i in common.boards) {
        if (common.boards[i].name === name) {
          selectedBoard = common.boards[i];
          break;
        }
      }
      if (selectedBoard === null) {
        // Board not found: select default board
        for (i in common.boards) {
          if (common.boards[i].name === DEFAULT) {
            selectedBoard = common.boards[i];
            break;
          }
        }
      }
      common.selectedBoard = selectedBoard;
      common.pinoutInputHTML = generateHTMLOptions(
        common.selectedBoard.pinout,
        "input"
      );
      common.pinoutOutputHTML = generateHTMLOptions(
        common.selectedBoard.pinout,
        "output"
      );
      utils.rootScopeSafeApply();
      return common.selectedBoard;
    };

    this.boardLabel = function (name) {
      for (var i in common.boards) {
        if (common.boards[i].name === name) {
          return common.boards[i].info.label;
        }
      }
      return name;
    };

    function generateHTMLOptions(pinout, type) {
      var code = "<option></option>";
      for (var i in pinout) {
        if (pinout[i].type === type || pinout[i].type === "inout") {
          code +=
            '<option value="' +
            pinout[i].value +
            '">' +
            pinout[i].name +
            "</option>";
        }
      }
      return code;
    }
  });
