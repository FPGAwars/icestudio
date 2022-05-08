
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

          //-- Set the callback function for the conection
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
            this.receiverUserF(
              this.decoder.decode(info.data).
                    replace(/(?:\\[n]|[\n])/g, "\n\r")
            );
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

let term = false;

//-- Local Echo state. Set the default value
let localEcho = true;

//-- HexView state:
//-- It determines how the data from the serial device is displayed:
//--   * false:  ASCII
//--   * True: Hexadecimal
let hexView = false;

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

    //-- Write the bytes to the terminal
    for (byte of buf) {
      term.write(`${byte.toString(16)} `);
    }
  }

  //-- ASCII mode
  else {
    term.write(data);
  }
  
}

function renderPlug(connectionInfo) {
    let configLe = document.getElementById('panel-config');
    let xtermLe = document.getElementById('panel-xterm');
    addClass(configLe, 'hidden');
    removeClass(xtermLe, 'hidden');

    const terminal = document.getElementById('terminal');
    if (term === false) {
        term = new Terminal();
        term.open(terminal);

        term.onData(function (data) {
            if (data == "\u007f") {
                if (localEcho) {
                    term.write("\b");
                }
                sm.write("\b");
            } else if (data == "\r") {
                if (localEcho) {
                    term.write("\n\r");
                }
                sm.write("\n");
            } else {
                if (localEcho) {
                    term.write(data);
                }
                sm.write(data);
            }
        });
    } else {

        term.reset();
    }

}

function renderUnPlug() {
    let configLe = document.getElementById('panel-config');
    let xtermLe = document.getElementById('panel-xterm');
    removeClass(configLe, 'hidden');
    addClass(xtermLe, 'hidden');
}

//---------------------------------------------------------------------------
//-- Callback configuration for the Local echo checkbox button
//---------------------------------------------------------------------------
let confEchoLe = document.getElementById('sconf-localecho');

confEchoLe.addEventListener('change', function (e) {

    e.preventDefault();
    localEcho = e.target.checked;

    return false;

}, false);


//---------------------------------------------------------------------------
//-- Callback configuration for the HEx view checkbox button
//---------------------------------------------------------------------------
let confHex = document.getElementById('sconf-hexview');

confHex.addEventListener('change', e => {

  e.preventDefault();
  hexView = e.target.checked;

  return false;

}, false);


//---------------------------------------------------------------------------
//-- Refresh all the Serial devices
//---------------------------------------------------------------------------
let getDevicesLe = document.querySelectorAll(
  '[data-action="serial-getdevices"]'
);

//-- Callback function for the "Reaload Serial Device" button
getDevicesLe[0].addEventListener('click', e => {

    e.preventDefault();
    sm.refreshDevices(renderSerialDevices);
    return false;

}, false);




let connectLe = document.querySelectorAll('[data-action="serial-connect"]');

connectLe[0].addEventListener('click', function (e) {

    e.preventDefault();
    let listedDevices = document.getElementsByName('serial-dev');
    for (let i = 0; i < listedDevices.length; i++) {
        currentOperator = [i],
            result = '';

        if (listedDevices[i].checked) {

            let opts = {};
            let opt = document.getElementById('sconf-bps');
            let val = parseInt(opt.value);
            switch (val) {
                case -1:
                    opt = document.getElementById('sconf-cbps');
                    val = parseInt(opt.value);
                    opts.bitrate = val;
                    break;
                default:
                    opts.bitrate = val;
            }

            opt = document.getElementById('sconf-databits');
            val = opt.value;
            opts.dataBits = val;
            opt = document.getElementById('sconf-paritybit');
            val = opt.value;
            opts.parityBit = val;
            opt = document.getElementById('sconf-stopbits');
            val = opt.value;
            opts.stopBits = val;
            sm.plug(listedDevices[i].value, opts, renderPlug, renderRec);

        };

    }

    return false;

}, false);

let cleanLe = document.querySelectorAll('[data-action="serial-clean"]');

cleanLe[0].addEventListener('click', function (e) {

    e.preventDefault();
    term.reset();
    return false;

}, false);



let disconnectLe = document.querySelectorAll(
  '[data-action="serial-disconnect"]'
);

disconnectLe[0].addEventListener('click', function (e) {

    e.preventDefault();
    sm.unplug(renderUnPlug);

    return false;

}, false);



function onClose(){

    if(typeof sm !== 'undefined' && sm !== false && sm !== null){ 

                sm.unplug();
    }
}