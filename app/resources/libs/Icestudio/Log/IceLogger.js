'use strict';

//------------------------------------------------
//-- LOGGER
//-- Write Debug messages in a text file
//-- The logger can be enabled/disabled anytime
//-- It is disabled after creation
//------------------------------------------------
class IceLogger {

    //----------------------------------------------------------------------------------
    //-- Create the logger
    //-- INPUTS:
    //--   * Logfile: (optional) String. Name of the file to use. Ej. "mytest.log"
    //--     If no logfile passed, the "icestudio.log" is used
    //--   * Path: (optional) String. Path to the log file. Ej. "/home/obijuan/"
    //-- 
    //-- Examples of use:
    //--
    //--   var iceConsole = new Icelogger();  //-- The icestudio.log file is used
    //--   iceConsole.enable();
    //--   iceConsole.log("ey! I am just testing!");
    //--
    constructor(logfile, path) {

        //-- Access to the fs node Module
        this.fs = require('fs');

        //-- Access to the path node Module
        this.path = require('path');

        //-- Set the log filename. If no logfile argument, it is set to "icestudio.log"
        this.file = logfile || 'icestudio.log';

        //-- Set the Path
        this.logPath = path || '';

        //-- Store the full filename: path + logfile
        this.logFile = this.path.join(this.logPath, this.file);

        //-- It is NOT enabled by default
        this.isEnable = false;
    }

    //----------------------------------------
    //-- Enable the logger
    //-- After enabling it, the log method will write messages to the file
    //-- When disabled, no writting to the file
    //---------------------------------------------
    enable() {
        this.isEnable = true;
        console.log('Debug enable');
    }

    //----------------------------------------
    //-- Disable de logger
    //----------------------------------------
    disable() {
        this.isEnable = false;
        console.log('Debug disable');
    }

    //------------------------------------------
    //-- Change the path and/or filename
    //-- INPUTS:
    //--    * path: (Optional) String. New path to use. Ej. "/home/obijuan/test/"
    //--    * file: (Optional) String. New filename to use. Ej. "hello.log"
    //-------------------------------------------
    setPath(path, file) {

        //-- Set the new path if passed as an argument
        this.logPath = path || this.logPath;

        //-- Set the new path if passed as an argument
        this.file = file || this.file;

        //-- Create the new full filename (path + file) and replace the old one
        this.logFile = this.path.join(this.logPath, this.file);
    }

    
    //--------------------------------------------------
    //-- Write a message to the log
    //-- (It only write the message if the logger is enabled)
    //-- INPUT:
    //--   * log: It can be either a String or an Object
    //--      -STRING: Write it to the file
    //--      -Object: Write the object as a Json string
    //--------------------------------------------------------
    log(msg) {

        //-- It just work if the logger is enabled
        if (this.isEnable) {

            //-- Convert the input argument into a string
            const txt = this._prettyPrint(msg);

            //-- Write the string into the log file
            this.fs.appendFileSync(this.logFile, `${txt}\n`);
        }
    }

    //-----------------------------------------------------------
    //--  P R I V A T E    F U N C T I O N S
    //-----------------------------------------------------------


    //----------------------------------------
    //-- Convert the input argument to a string  
    //-- INPUT:
    //--   * obj: Object to convert. If it is a string it is returned as it is
    //--     In any other cases the corresopnding JSON structure is obtained as a string
    //-- OUTPUT:
    //--   * STRING: The input object converted into a string
    //--------------------------------------------
    _prettyPrint(obj) {

        //-- Current conversion
        let output = '';

        //-- It is not a string: converto to a json string
        if (typeof obj != 'string') {
            output = JSON.stringify(obj, undefined, 2);

        //-- It is a string. Do not change
        } else {
            output = obj;
        }

        //-- Return the calculated string
        return output;
    }
}
