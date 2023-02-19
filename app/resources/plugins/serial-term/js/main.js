//------------------------------------------------------------------------
// Update of main.js for the Serial Terminal Icestudio Plugin 0.2
//------------------------------------------------------------------------

// A lot of added code inspired from localechocontroller.js. Thank to its authors (wavesoft,...)
// Special thanks to Democrito which helped a lot with the debugging of this new version of the serial terminal

function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className);

  return !!el.className.match(
             new RegExp('(\\s|^)' + className + '(\\s|$)')
           );
}

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)

  else if (!hasClass(el, className))
    el.className += " " + className;
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    el.className = el.className.replace(reg, ' ');
  }
}

let dummyUnplug = function() {

}


var serialManager = function () {

    //-- Serial device information:
    //--  DeviceInfo: 
    //--   * displayName (String): Serial device name
    //--   * path (String): Device's system path 
    //--   * productId: USB product ID
    //--   * vendorId: number optional
    this.devices = [];

    //-- Information about the current device state
    this.info = {

        //-- Serial dev status: Opened or not
        //--   * false: Not opened
        //--   * true: Opened
        status: false,

        //-- Device index
        dev: -1,

        //-- Conection information
        //-- ConnectionInfo
        //--   * bitrate (Number)
        //--   * bufferSize (Number)
        //--   * ctsFlowControl (Boolean)
        //--   * dataBits (string)
        //--   * name (String)
        //--   * parityBit (String)
        //--   * persistent (Boolean)
        //--   * receiveTimeout (Number)
        //--   * sendTimeout (Number)
        //--   * stopBits (String)
        conn: false
    };

    //-- Encoder and decoder classes for processing the ASCII strings
    //-- https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();

    //-- Callback function for the data received
    //-- Initially not configured
    this.receiverUserF = false;

    //-- Table with the registers callbacks
    this.registeredCallbacks = {};

    //-----------------------------------------------------------------------
    //-- Function: Read all the available serial devices
    //-- When the devices are ready, the callback(devInfo) function is
    //-- executed
    //-----------------------------------------------------------------------
    this.refreshDevices = function (callback) {

      //-- Call the Serial Chrome API
      //-- TODO: Chrome.Serial API is deprecatedd
      //-- use Web Serial API instead:
      //-- https://developer.chrome.com/docs/extensions/reference/serial/
      //---------------------------------------------------------------------
      //-- Callback(DeviceInfo)
      //---------------------------------------------------------------------
      chrome.serial.getDevices(function (devInfo) {

        //-- Store the serial devices in the serial manager
        this.devices = devInfo;

        //-- Execute the callback function
        callback(devInfo);

      }.bind(this));
    }


    //-----------------------------------------------------------------------
    //-- Disconnect the serial device
    //-----------------------------------------------------------------------
    this.unplug = function (callback) {
        
      if(typeof callback === 'undefined') 
        callback = dummyUnplug;

      if(this.info.status !== false && 
          this.info.dev !== -1 && 
          this.info.conn !== false) 
      {
        chrome.serial.disconnect(this.info.conn.connectionId, callback);
        this.info.status = false;
        this.info.dev = -1;
        this.info.conn = false;
      }
    }

    //-----------------------------------------------------------------------
    //-- Configure the serial device. All the callback functions are set
    //--
    //-- INPUTS:
    //--   * id: Devide identifiction
    //--   * userOptions: User configuration
    //--   * callback_onconnect: Executed when the conection is done
    //--   * callbacl_onreceive: Executed when data is received
    //-----------------------------------------------------------------------
    this.plug = function (id, userOptions, 
                          callback_onconnect, 
                          callback_onreceive) {

      //-- Default options
      let options = {
        bitrate: 115200,
        dataBits: "eight",
        parityBit: "no",
        stopBits: "one"
      };

      //-- Add the parameters chosen by the user
      if (typeof userOptions !== 'undefined') {
        for (let prop in userOptions) {
          options[prop] = userOptions[prop];
        }
      }

      //-- Open the serial device
      chrome.serial.connect(
        this.devices[id].path,   //-- Path
        options,                 //-- User options
        function (connectionInfo) 
      {

        //-- If the connection was ok, configure the serial manager
        if (typeof connectionInfo !== 'undefined' && 
            connectionInfo !== false && 
            typeof connectionInfo.connectionId !== 'undefined') 
        {

          //-- Connection stablished
          this.info.status = true;

          //-- Store the current devide id
          this.info.dev = id;

          //-- Store the connection Information
          this.info.conn = connectionInfo;

          //-- Set the callback function for the data received
          let reader_callback = this.reader.bind(this);
          if (typeof callback_onreceive !== 'undefined') {
            this.receiverUserF = callback_onreceive;
          } else {
            this.receiverUserF = false;
          }

          if (typeof this.registeredCallbacks[reader_callback.name] === 
              'undefined') 
          {
            chrome.serial.onReceive.addListener(reader_callback);
            this.registeredCallbacks[reader_callback.name] = true;
          }

          //-- Set the callback function for the connection
          if (typeof callback_onconnect !== 'undefined') 
            callback_onconnect(connectionInfo);
        }

      }.bind(this));
    }

    //-----------------------------------------------------------------------
    //-- Data received from the serial device
    //-----------------------------------------------------------------------
    this.reader = function (info) {

      if (typeof info.connectionId !== 'undefined' && 
        info.connectionId !== false && 
        info.connectionId == sm.info.conn.connectionId) 
      {
        if (this.receiverUserF !== false) {

            //-- info.data is an arrayBuffer
            //-- Convert it into an array of unsigned bytes
            const bytearray = new Uint8Array(info.data);

            //-- Call the user function with the received data
            if (hexView) {

                //-- Received data as raw bytes
                this.receiverUserF(bytearray);
            }
            else {
                //-- Convert the data received to a string of characters
                let string = this.decoder.decode(info.data);

                //-- Replace all the \n characters by \n\r
                string = string.replace(/(?:\\[n]|[\n])/g, "\n\r");

                //-- Receive data as characteres
                this.receiverUserF(string);
            }
        }
      }
    }

    //-----------------------------------------------------------------------
    //-- Send data to the serial device
    //-----------------------------------------------------------------------
    this.write = function (data) {
      if (this.info.status === true) {

        chrome.serial.send(this.info.conn.connectionId, 
                            this.encoder.encode(data), 
                            function (sendInfo) {});

      }
    }
};


//-- terminal text colors
//--------------------------------------------------------

let colorRx = '\x1b[1;32m';   // green
let colorTx = '\x1b[1;93m';   // yellow  
let colorinput = '\x1b[1;37m';  // white


let term = false;

//-- Local Echo state. Set the default value
let localEcho = true;

//-- flush on enter state. Set the default value
let flushOnEnter = true;

//-- HexView state:
//-- It determines how the data from the serial device is displayed:
//--   * false:  ASCII
//--   * True: Hexadecimal
let hexView = false;
let onEnterMode = "\r\n";    //by default

let sm = new serialManager();

function renderSerialDevices(dev) {

    let infoLe = document.getElementById('device-info');
    let connectLe = document.getElementById('bt-connect');
    addClass(connectLe, 'hidden');

    html = `<table  class="table-auto">
      <thead>
        <tr>
          <th  class="w-1/2 px-4 py-2">Select</th>
          <th  class="w-1/2 px-4 py-2">Name</th>
          <th  class="w-1/2 px-4 py-2">Path</th>
          <th  class="w-1/2 px-4 py-2">productId</th>
          <th  class="w-1/2 px-4 py-2">vendorId</th></tr>
      </thead>
    <tbody>`;

    if (typeof dev !== 'undefined' && dev !== false && dev.length > 0) {

        /* Each device object is as:
            displayName: "Alhambra_II_v1.0A_-_B06-158"
            path: "/dev/ttyUSB1"
            productId: 24592
            vendorId: 1027
        */

        let checked = 'checked';
        for (let i = dev.length - 1; i > -1; i--) {
            html += '<tr>' +
                `<td class="border px-4 py-2">
                  <input type="radio" name="serial-dev" value="` + 
                    i + '" ' + checked + `>
                </td>` +
                '<td class="border px-4 py-2">' + 
                   dev[i].displayName + '</td>' +
                '<td class="border px-4 py-2">' + 
                   dev[i].path + '</td>' +
                '<td class="border px-4 py-2">' + 
                  dev[i].productId + '</td>' +
                '<td class="border px-4 py-2">' + dev[i].vendorId +
                `</td>
                </tr>`;

            checked = '';
        }

        removeClass(connectLe, 'hidden');
    }
    html += '</tbody></table>';

    infoLe.innerHTML = html;
    removeClass(infoLe, 'hidden');

}

//---------------------------------------------------------------------------
//-- Callback function. It is executed when data is received from the
//-- serial device
//---------------------------------------------------------------------------
function renderRec(data) {

  //-- The information in the terminal is shown either in ASCII
  //-- or in hexadecimal, depending on the configured mode

  //-- Hexadecimal mode
  
  if (hexView) {

    //-- Convert the data to bytes
    const buf = Buffer.from(data, 'utf8');

    //-- Write the bytes to the terminal, using the
    //-- corresponding colors
    term.write(colorRx);

    for (byte of buf) 
      term.write(`${byte.toString(16).padStart(2, '0')} `);
    
    //-- Back to the input color
    term.write(colorinput);
  }
  
  //-- ASCII mode
  else {
    term.write(colorRx + data + colorinput);
    //  print( "<- "+colorRx + data + colorinput);  
    
  }

  _receive_flag = true;
  term.setOption('cursorStyle', 'underline');
  term.setOption('cursorBlink', false);  
}


function handleTermWindowResized(){
    
        const parentElementHeight =  Math.max(0, window.innerHeight);
        const parentElementWidth = Math.max(0, window.innerWidth);
                
        const MINIMUM_ROWS = 5 ;
        const MINIMUM_COLS = 5 ;
        
        const elementPaddingVer = 4;
        const elementPaddingHor = 4 ;
        
        const scrollbarWidth = 20 ;
        const availableHeight =  parentElementHeight - elementPaddingVer - 145;
        const availableWidth = parentElementWidth - elementPaddingHor - scrollbarWidth ;
        
        window_heigth_rows = Math.max(MINIMUM_ROWS, Math.floor(availableHeight / 17));       
        window_width_cols = Math.max(MINIMUM_COLS, Math.floor(availableWidth / 9)-3);
        
      
        if (_receive_flag) {
              term.write("\r\n");
              _receive_flag = false;
              term.setOption('cursorStyle', 'bar');
              term.setOption('cursorBlink', true);
            }
    
        clearInput();

       _termSize.cols =  window_width_cols ;       
       _termSize.rows =  window_heigth_rows ; 
       
        term.reset();  //clear screen when resizing
        term.resize(window_width_cols, window_heigth_rows);
        
  
        setInput(_input, false);

}

function renderPlug(connectionInfo) {
    let configLe = document.getElementById("panel-config");
    let xtermLe = document.getElementById("panel-xterm");
    addClass(configLe, "hidden");
    removeClass(xtermLe, "hidden");

    const terminal = document.getElementById("terminal");
    let inputlengthprev = 0;

    if (term === false) {
        term = new Terminal({ rows: 37, cols: 40 });

        term.open(terminal);
        term.focus();

        term.setOption("cursorBlink", true);
        term.setOption("cursorStyle", "bar");

        _input = "";
        _cursor = 0;
        _receive_flag = false;
        _finishedLastEntry = true;
        endLine = false;
        _ReturnsPosition = [];
        this._nbOfSP1s = [];
        this._posSPmod1 = [];
        this._nbOfSPs2 = [];
        this._activeCharPrompt = null,
        this._termSize = {
                cols: term.cols,
                rows: term.rows,
            };

        handleTermWindowResized();

        _disposables = [];

        // resizing of terminal on a windows resize
        window.onresize = handleTermWindowResized;

        // paste with Ctrl+ V
        term.attachCustomKeyEventHandler((arg) => {
            if (arg.ctrlKey && arg.code === "KeyV" && arg.type === "keydown") {
                // paste with Ctrl+ V
                navigator.clipboard.readText().then((text) => {
                    handleData(text);
                });
            }

            if (arg.ctrlKey && arg.code === "KeyC" && arg.type === "keydown") {
                //  ctrl + c for copy when selecting data,
                const selection = term.getSelection();
                if (selection) {
                    copyText(selection);
                    return false;
                }
            }
            return true;
        });

        term.onData(function (data) {
                                      
            if (_receive_flag) {               
                if (flushOnEnter) term.write("\r\n");
                _receive_flag = false;
                term.setOption("cursorStyle", "bar");
                term.setOption("cursorBlink", true);
            }

            // If we have an active character prompt, satisfy it in priority
            if (this._activeCharPrompt != null) {
                this._activeCharPrompt.resolve(data);
                this._activeCharPrompt = null;
                term.write("\r\n");
                return;
            }

            // If this looks like a pasted input, expand it
            if (data.length > 3 && data.charCodeAt(0) !== 0x1b) {
                const normData = data;
                if (flushOnEnter) {
                    Array.from(normData).forEach((c) =>
                        handleCursorInsert(c)
                    );
                } else {
                    handleData(data);
                }
            } else {
                handleData(data);
            }

            //-- You could view the key code with:
            // console.table([{'char': data, 'code':data.charCodeAt(0), 'hex':data.charCodeAt(0).toString(16)}]);
        });
    } else {
        term.reset();
    }
}

function renderUnPlug() {
    let configLe = document.getElementById("panel-config");
    let xtermLe = document.getElementById("panel-xterm");
    removeClass(configLe, "hidden");
    addClass(xtermLe, "hidden");
}

//---------------------------------------------------------------------------
//-- Callback configuration for the Local echo checkbox button
//---------------------------------------------------------------------------
let confEchoLe = document.getElementById("sconf-localecho");

confEchoLe.addEventListener(
    "change",
    function (e) {
        e.preventDefault();
        localEcho = e.target.checked;
        term.focus();

        return false;
    },
    false
);

//---------------------------------------------------------------------------
//-- Callback configuration for the Flush on enter checkbox button
//---------------------------------------------------------------------------
let confFlush = document.getElementById("sconf-flushenter");

confFlush.addEventListener(
    "change",
    function (e) {
        e.preventDefault();
        flushOnEnter = e.target.checked;
        term.focus();
        return false;
    },
    false
);

//---------------------------------------------------------------------------
//-- Callback configuration for the HEx view checkbox button
//---------------------------------------------------------------------------
let confHex = document.getElementById("sconf-hexview");

confHex.addEventListener(
    "change",
    (e) => {
        e.preventDefault();
        hexView = e.target.checked;
        term.focus();
        return false;
    },
    false
);

//---------------------------------------------------------------------------
//-- Callback configuration for the on Enter select config
//---------------------------------------------------------------------------
let confOnEnter = document.getElementById("sconf-onenter");

confOnEnter.addEventListener(
    "change",
    (e) => {
        e.preventDefault();
        switch (e.target.value) {
            case "CR":
                onEnterMode = "\r";
                break;
            case "LF":
                onEnterMode = "\n";
                break;
            case "None":
                onEnterMode = "";
                break;
            default:
                onEnterMode = "\r\n";
                break;
        }

        console.log("CAMBIO", onEnterMode);
        term.focus();
        return false;
    },
    false
);

//---------------------------------------------------------------------------
//-- Refresh all the Serial devices
//---------------------------------------------------------------------------
let getDevicesLe = document.querySelectorAll(
    '[data-action="serial-getdevices"]'
);

//-- Callback function for the "Reload Serial Device" button
getDevicesLe[0].addEventListener(
    "click",
    (e) => {
        e.preventDefault();
        sm.refreshDevices(renderSerialDevices);
        return false;
    },
    false
);


let connectLe = document.querySelectorAll('[data-action="serial-connect"]');

connectLe[0].addEventListener(
    "click",
    function (e) {
        e.preventDefault();
        let listedDevices = document.getElementsByName("serial-dev");
        for (let i = 0; i < listedDevices.length; i++) {
            (currentOperator = [i]), (result = "");

            if (listedDevices[i].checked) {
                let opts = {};
                let opt = document.getElementById("sconf-bps");
                let val = parseInt(opt.value);
                switch (val) {
                    case -1:
                        opt = document.getElementById("sconf-cbps");
                        val = parseInt(opt.value);
                        opts.bitrate = val;
                        break;
                    default:
                        opts.bitrate = val;
                }

                opt = document.getElementById("sconf-databits");
                val = opt.value;
                opts.dataBits = val;
                opt = document.getElementById("sconf-paritybit");
                val = opt.value;
                opts.parityBit = val;
                opt = document.getElementById("sconf-stopbits");
                val = opt.value;
                opts.stopBits = val;
                sm.plug(listedDevices[i].value, opts, renderPlug, renderRec);
            }
        }

        return false;
    },
    false
);

let cleanLe = document.querySelectorAll('[data-action="serial-clean"]');

cleanLe[0].addEventListener(
    "click",
    function (e) {
        e.preventDefault();
        term.reset();
        term.focus();
        return false;
    },
    false
);

let disconnectLe = document.querySelectorAll(
    '[data-action="serial-disconnect"]'
);

disconnectLe[0].addEventListener(
    "click",
    function (e) {
        e.preventDefault();
        sm.unplug(renderUnPlug);

        return false;
    },
    false
);

function onClose() {
    if (typeof sm !== "undefined" && sm !== false && sm !== null) {
        sm.unplug();
    }
}


//------------- copied and modified from localechocontroller.js -----------------------

/**
 * Prints a message and properly handles new-lines
 */
function print(message) {
    //const normInput = message.replace(/\r/g, "\f");
    const normInput = message.replace(/\r\n/g, "\f");
    term.write(normInput.replace(/\f/g, "\r\n"));
}


/**
 * Modify input by replacing carriage return(\r) with Form Feed (\f , next page char) 
 */
function replace_r_by_f(input) {
   
    //return prompt + input.replace(/\n/g, "\n" + continuationPrompt);  //original
    // return prompt + ">"+ input.replace(/\r/g, "\f" + continuationPrompt);
    return input.replace(/\r/g, "\f"); // best for now
}
 
 
 /**
 * calculate the cursor position  in the input string modified with the replacement of \r by \f 
 */ 
function convertCursor2f(input, CursorPos) {
    const newInput = replace_r_by_f(input.substr(0, CursorPos));
    return newInput.length;
}


/**
 * Clears the current prompt
 *
 * This function will erase all the lines that display the current prompt
 * and move the cursor in the beginning of the first line of the prompt.
 */
function clearInput() {
    
    const input_f = replace_r_by_f(_input);
    const [cursorMod, PromptMod] = UpdateCursorwithReturns(input_f); 
    const highestRow =  CursorPosToColRow(PromptMod, PromptMod.length).row;    // get cursor row when he is at the end of the string, = number of lines to clear    
    const { col, row } = CursorPosToColRow(PromptMod, cursorMod);                    

    // First move on the last line
    const moveRows = highestRow - row;
    for (var i = 0; i < moveRows; ++i) {
        term.write("\x1B[E");
    }

    // Clear current input line(s)
    term.write("\r\x1B[2K");
    for (var i = 0; i < highestRow; ++i) term.write("\x1B[F\x1B[2K");
}

function handleCursorShift(direction) {
    const ESC = "\u001B[";

    if (direction > 0) term.write(ESC + direction + "C");
    if (direction < 0) term.write(ESC + Math.abs(direction) + "D");
}

/**
 * Replace input with the new input given
 *
 * This function clears all the lines that the current input occupies and
 * then replaces them with the new input.
 */
function setInput(newInput, clearInputF = true) {
    
    const newInput_f = replace_r_by_f(newInput);
    const matches = newInput_f.matchAll(/\f/g);
    _ReturnsPosition = [];
    _ReturnsPosition[0] = 0;
    i = 1;
    for (const match of matches) {
        _ReturnsPosition[i] = match.index + 1;
        i++;
    }

    // Move the cursor to the appropriate row/col
    [newCursor, newInput_f2] = UpdateCursorwithReturns(newInput_f);
  
    print(newInput_f2.replace(/\n/g, "\f"));
    
    const newLines =  CursorPosToColRow(newInput_f2, newInput_f2.length).row;  // get cursor row when he is at the end of the string, = number of new lines  
    const { col, row } = CursorPosToColRow( newInput_f2, newCursor);

    const moveUpRows = newLines - row;
 //   console.log(newInput_f2, moveUpRows, newLines, row);

    if (newCursor > 0 && newInput_f2.length % _termSize.cols == 0) {
        term.write("\r\n"); //go to next line after reaching an end of line
    }
    term.write("\r");

    for (var i = 0; i < moveUpRows; ++i) {
        term.write("\x1B[F"); //Move cursor to the previous line.
    }

    for (var i = 0; i < col; ++i) {
        term.write("\x1B[C"); //shift cursor one to the right
    }
    _input = newInput_f;
}

  
/**
 * This function:
 * - Converts the input string by adding to it, spaces after every return and up to the right side of the terminal
 * - it also calculates a new cursor position, as an offset on that "spaces modified" input string
 */
function UpdateCursorwithReturns(InputRetMod) {
    _nbOfSPs = Array(25).fill(0);
    _posSPmod = Array(25).fill(0);
    cursormod =_cursor;
    cpt = 0;
    _nbOfSPs2 = [];
    sum_nbOfSPs = 0;
    NbrsReturns = (InputRetMod.match(/\f/g) || []).length; //total number of \f which replace de \r   returns
   
    for (var i = 1; i <= NbrsReturns; ++i) {
        
        // prepare a table _nbOfSPs containing the number of spaces added up to the right side border of the terminal for a string between two successive returns
        // prepare a table _posSPmod containing the positions of the returns( starting position of the spaces addition)
         
        if (i == 1) {
            nbOfSPs = _termSize.cols - ((_ReturnsPosition[i] - 1) % _termSize.cols); 
            posSPmod = _ReturnsPosition[i] - 1 + nbOfSPs;
        } else {
            nbOfSPs = _termSize.cols - ((posSPmod + _ReturnsPosition[i] -
                    _ReturnsPosition[i - 1] - 1) % _termSize.cols);
            posSPmod = posSPmod + _ReturnsPosition[i] -
                    _ReturnsPosition[i - 1] - 1 + nbOfSPs;
        }
        _nbOfSPs[i - 1] = nbOfSPs;
        _posSPmod[i - 1] = posSPmod;

        var n = posSPmod - nbOfSPs;

        if (i > 1) n = posSPmod - nbOfSPs - _posSPmod[i - 2];
        
        // prepare the table _nbOfSPs2 containing the nb of spaces added up to the right side border of the terminal for each terminal row

        while (n >= _termSize.cols) {
            _nbOfSPs2.push(0);      
            n = n - _termSize.cols;
        }
        if (n > 0) _nbOfSPs2.push(_termSize.cols - n);
        if ((_ReturnsPosition[i] - _ReturnsPosition[i - 1] - 1) % _termSize.cols == 0 )
            _nbOfSPs2.push(5);

        for (var i2 = 1; i2 <= nbOfSPs; ++i2) {
            
            if (_cursor > _ReturnsPosition[i] - 1 && i2 > 1)            //-1 to remove the return char
                cursormod++;

            if (i2 == 1)
                InputRetMod =
                    InputRetMod.substr(0, posSPmod - nbOfSPs) + "|" +
                    InputRetMod.substr( posSPmod - nbOfSPs + 1 ); //adds the | and deletes the /f (corresponding to /r ) on the first iteration of i2
            else
                InputRetMod =
                    InputRetMod.substr(0, posSPmod - nbOfSPs + i2 - 1) + " " + 
                    InputRetMod.substr(posSPmod - nbOfSPs + i2 - 1); //adds " ", spaces/X up to the end of line
        }
        sum_nbOfSPs = sum_nbOfSPs + nbOfSPs;
    }
    _nbOfSPs2.push(0);
    _nbOfSPs2.push(0);
    return [cursormod, InputRetMod];
}
 

/**
   * Move cursor at given direction
   */
function MoveCursortoNewRow(dir) {   

    const input_f = replace_r_by_f(_input);    
    const [cursormod,InputRetMod] = UpdateCursorwithReturns(input_f);  
    const { col: prevCol, row: prevRow } =  CursorPosToColRow(InputRetMod, cursormod);
    
    if (dir==1)   {             
            cursor =_cursor + Math.min (( _termSize.cols - (_nbOfSPs2[prevRow] || 0)), 
                     2*_termSize.cols - prevCol -(_nbOfSPs2[prevRow] || 0)- (_nbOfSPs2[prevRow+1] || 0) );       //glue cursor to end of next row
            if (_nbOfSPs2[prevRow]>0) cursor +=1      // +1 if return
        }

    if ( (dir ==-1) &&  (prevRow > 0)) {
           cursor = _cursor -  Math.max(( _termSize.cols - _nbOfSPs2[prevRow-1]), prevCol ); //move cursor to end of previous row              
           if (_nbOfSPs2[prevRow-1]>0)  cursor-=1     //-1 if return 
        }
    setCursor(cursor);
}


/**
 * Move cursor at given direction
 */
function setCursor(newCursor) {
 
    if (newCursor < 0) newCursor = 0;
    if (newCursor > _input.length) newCursor = _input.length;
    var input_f = replace_r_by_f(_input);

    // Estimate previous/current cursor position
    const prevCursorPos = convertCursor2f(_input, _cursor);
    const { col: prevCol, row: prevRow } = CursorPosToColRow( input_f, prevCursorPos);

    // Estimate new cursor position
    const newCursorPos = convertCursor2f(_input, newCursor);
    const { col: newCol, row: newRow } = CursorPosToColRow( input_f, newCursorPos );   
    
    // Adjust cursor position vertically
    if (newRow > prevRow) {
        for (let i = prevRow; i < newRow; ++i) term.write("\x1B[B");
    } else {
        for (let i = newRow; i < prevRow; ++i) term.write("\x1B[A");
    }

    // Adjust cursor position horizontally
    if (newCol > prevCol) {
        for (let i = prevCol; i < newCol; ++i) term.write("\x1B[C");
    } else {
        for (let i = newCol; i < prevCol; ++i) term.write("\x1B[D");
    }
    // Set new CursorPos
    _cursor = newCursor;
}


/**
 * Move cursor at given direction
 */ 
function handleCursorMove(dir) {

    var num = Math.min(dir, _input.length - _cursor);    // if dir =  1   --> 
    if (dir == -1) {                                     // if dir = -1   <--
         num = Math.max(dir, - _cursor);
    }
    setCursor(_cursor + num);
}


/**
 * Erase a character at cursor location
 */
function handleCursorErase(backspace) {

    if (backspace) {
        if (_cursor <= 0) return;
        const newInput = _input.substr(0, _cursor - 1) + _input.substr(_cursor); //for Backspace key
        clearInput();
        _cursor -= 1;
        setInput(newInput, false);
    } else {
        clearInput();
        const newInput = _input.substr(0, _cursor) + _input.substr(_cursor + 1); //for Delete key
        setInput(newInput);
    }
}

  
/**
 * Insert character at cursor location
 */
function handleCursorInsert(data) {
    clearInput();

    const newInput = _input.substr(0, _cursor) + data + _input.substr(_cursor);
    _cursorH = Math.max(0, this.entries.length - 1);
    this.entries[_cursorH] = newInput;
    
   // const newInput_f = replace_r_by_f(newInput);

    //update table with return positions
    //const matches = newInput_f.matchAll(/\f/g);
    const matches = newInput.matchAll(/\r/g);
    _ReturnsPosition = [];
    _ReturnsPosition[0] = 0;
    i = 1;
    for (const match of matches) {
        _ReturnsPosition[i] = match.index + 1;
        i++;
    }
    _cursor += data.length;
    setInput(newInput);
    console.log(data, _cursor);
}

  
/**
 * Handle a single piece of information from the terminal.
 */
function handleData(data) {
    //       if (!this._active) return;
    const ord = data.charCodeAt(0);
    let ofs;
    if (flushOnEnter) {
        // if ( (_cursor==0)&&!(data.substr(1)=="[1;5D")&&!(data.substr(1)=="[1;5C")
        // &&!(data.substr(1)=="[C")&&!(data.substr(1)=="[D")
        // &&!(data.substr(1)=="[A")&&!(data.substr(1)=="[B") )   term.write("\r\n");

        if (ord == 27) {
            // Handle ANSI escape sequences

            switch (data.substr(1)) {
                case "[A": // Up arrow
                    if (_cursor == 0 || _cursor == _input.length)  getPrevious();
                    else MoveCursortoNewRow(-1); // move up  line (down row)                    
                    break;

                case "[B": // Down arrow
                    if (_cursor == 0 || _cursor == _input.length)  getNext();
                    else MoveCursortoNewRow(1); // move Down line ( up row )
                    break;

                case "[D": // Left arrow
                    handleCursorMove(-1);
                    break;

                case "[C": // Right arrow
                    handleCursorMove(1);
                    break;

                case "[3~": // Delete  key
                    handleCursorErase(false);
                    break;

                case "[F": // End
                    setCursor(_input.length);
                    break;

                case "[H": // Home
                    setCursor(0);
                    break;

                case "b": // ALT + LEFT
                case "[1;5D": // ALT + LEFT
                    ofs = closestLeftBoundary(_input, _cursor);
                    if (ofs != null) setCursor(ofs);
                    break;

                case "f": // ALT + RIGHT
                case "[1;5C": // ALT + RIGHT
                    ofs = closestRightBoundary(_input, _cursor);
                    if (ofs != null) setCursor(ofs);
                    break;

                case "[1;5A": // ALT + UP
                    getPrevious();
                    break;
                    
                case "[1;5B": // ALT + DOWN
                    getNext();
                    break;

                case "\x7F": // ALT + BACKSPACE
                    ofs = closestLeftBoundary(_input, _cursor);
                    if (ofs != null) {
                        clearInput();
                        setInput(
                            _input.substr(0, ofs) +
                                _input.substr(_cursor)
                        );
                        setCursor(ofs);
                    }
                    break;
            }
        }
        // Handle special characters
        else if (ord < 32 || ord === 0x7f) {
            switch (data) {
                case "\x7F": // BACKSPACE
                    handleCursorErase(true);
                    break;

                case "\r": // ENTER
                
                    if (isIncompleteInput(_input)) {
                        handleCursorInsert("\r");
                    } else {
                        _finishedLastEntry = true;
                                                                 
                        push1 ("");
                        _cursorH = this.entries.length-1; 
                                    
                        clearInput(); // clear and go to "home"
                        _cursor = 0;

                        if (localEcho) {
                            term.write("-> ");
                            //print(colorTx + _input + colorinput );
                            term.write( colorTx + _input.replace(/\f/g, "\r\n") +  colorinput );
                            // term.write (colorTx + _input.replace(/\f/g, "\r") + colorinput );
                            // term.write (colorTx + _input + colorinput );
                        }                        
                        term.write("\r\n");                        
                        sm.write(_input.replace(/\f/g, "\r") + onEnterMode);
                        _input = "";
                        _ReturnsPosition = [];
                        this.InputRetMod = "";
                    }

                    break;
            }
        } else {
            _cursorH = this.entries.length - 1;
            handleCursorInsert(data);
        }
    } else {
        //send directly every key press to the serial port (no flush on enter = 0 )

        if (data.charCodeAt(0) == 13) {     //enter key           
            sm.write(onEnterMode);
                          
            if (hexView) setTimeout(() => {  term.write("\r\n"); }, 15); // wait a bit to let the time to receive and display all (up to 3) the "OnEnterSend Mode" chars  
            else term.write("\r\n");
                
        } else {
            // terminal echoing of cursor movements avoided outside the "flush on enter" mode
            if (
                localEcho &&
                data.substr(1) != "[A" &&
                data.substr(1) != "[B" &&
                data.substr(1) != "[C"
            ) {
                print(colorTx + data + colorinput);
            }
            sm.write(data);
            console.log(data);
        }
    }
}

////--------------- copied from utils.js --------------------------------------------------

/**
 * Detects all the word boundaries on the given input
 */
function wordBoundaries(input, leftSide = true) {
    let match;
    const words = [];
    const rx = /\w+/g;

    while ((match = rx.exec(input))) {
        if (leftSide) {
            words.push(match.index);
        } else {
            words.push(match.index + match[0].length);
        }
    }
    return words;
}


/**
 * The closest left (or right) word boundary of the given input at the
 * given CursorPos.
 */
function closestLeftBoundary(input, CursorPos) {
    const found = wordBoundaries(input, true)
        .reverse()
        .find((x) => x < CursorPos);
    return found == null ? 0 : found;
}

function closestRightBoundary(input, CursorPos) {
    const found = wordBoundaries(input, false).find((x) => x > CursorPos);
    return found == null ? input.length : found;
}


/**
 * Convert CursorPos at the given input to col/row location
 *
 * This function is not optimized and practically emulates via brute-force
 * the navigation on the terminal, wrapping when they reach the column width.
 */
function CursorPosToColRow(input, CursorPos) {
  let row = 0,
    col = 0;

  for (let i = 0; i < CursorPos; ++i) {
    const chr = input.charAt(i);
   // if (chr == "\n") {
      if (chr == "\f") {
      col = 0;
      row += 1;
    } else {
      col += 1;
      if (col >= _termSize.cols ) {
        col = 0;
        row += 1;
      }
    }
  }  
  return { col , row };
}


/**
 * Checks if there is an incomplete input
 *
 * An incomplete input is considered:
 * - An input that contains unterminated single quotes
 * - An input that contains unterminated double quotes
 * - An input that ends with "\"
 * - An input that has an incomplete boolean shell expression (&& and ||)
 * - An incomplete pipe expression (|)
 */
function isIncompleteInput(input) {
    // Empty input is not incomplete
    if (input.trim() == "")     return false ;

    // Check for dangling single-quote strings
    if ((input.match(/'/g) || []).length % 2 !== 0)  return true ;

    // Check for dangling double-quote strings
    if ((input.match(/"/g) || []).length % 2 !== 0)  return true ;
    
    // Check for dangling boolean or pipe operations
    if (input.split(/(\|\||\||&&)/g).pop().trim() == "" )  return true ;
    
    // Check for tailing slash
    if (input.endsWith("\\") && !input.endsWith("\\\\"))  return true ;

    return false;
}


////-------------- copied and modified from HistoryController.js  -------------------------------

/**
 * The history controller provides an ring-buffer
 */
 
this.HistorySize = 50; //number of entries stored in the an "history" ring buffer
this.entries = [];

/**
 * Push an entry and maintain ring buffer size
 */
function push1(entry) {
    // Skip empty entries
    //   if (entry.trim() === "") return;
    // Skip duplicate entries
    const lastEntry = this.entries[this.entries.length - 1];
    const SecEntryAgo = this.entries[this.entries.length - 2];
    if (entry == lastEntry || entry == SecEntryAgo) return;
    // Keep track of entries
    if (lastEntry === "") entries[this.entries.length - 1] = entry;
    else this.entries.push(entry);

    if (this.entries.length > this.HistorySize) {
        this.entries.pop(0);
    }
    this._cursorH = this.entries.length - 1; //Rewind history cursor on the last entry
    console.log(_cursorH, this.entries);
}


/**
 * Returns the previous entry from the history ring buffer
 */
function getPrevious() {
    const SecEntryAgo = this.entries[this.entries.length - 2];
    if (_finishedLastEntry) {
        if (_cursorH == this.entries.length - 1 && _input != SecEntryAgo) {
            _finishedLastEntry = false;
        }
    } else {
        if (_cursorH > this.entries.length - 2) {
            if (
                _input !=
                this.entries[this.entries.length - 1 && _input != ""]
            ) {
                this.entries[this.entries.length - 1] = _input; //replace the last entry which was not followed by
            }
        }
    }
    _cursorH = Math.max(0, this._cursorH - 1);
    let inputFromHistory = this.entries[_cursorH];

    if (inputFromHistory) {
        clearInput();
        _cursor = inputFromHistory.length;
        setInput(inputFromHistory);
//      console.table(inputFromHistory); 
    }
}


/**
 * Returns the next entry from the history ring buffer
 */
function getNext() {
    _cursorH = Math.min(this.entries.length-1, this._cursorH + 1);
    inputFromHistory = this.entries[_cursorH];

    if (!inputFromHistory) inputFromHistory = "";
    if (inputFromHistory == "") push1(_input);

    clearInput();
    _cursor = inputFromHistory.length;
    setInput(inputFromHistory);
}