/**
 * Icetudio > Sigrok > Pulseview integration
 *
 * @category   icestudio Plugins
 * @package    iceRok
 * @author     Carlos Venegas (cavearr at github, @cavearr at twitter)
 * @copyright  2020 FPGAwars
 * @license    https://github.com/FPGAwars/icestudio/blob/develop/LICENSE  GPL v2
 * @version    1.0
 * @link       https://github.com/FPGAwars/icestudio/
 **/

let SerialManager = function () {

    this.devices = [];
    this.info = {
        status: false,
        dev: -1,
        conn: false
    };
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    this.receiverUserF = false;
    this.registeredCallbacks = {};

    this.refreshDevices = function (callback) {
        chrome.serial.getDevices(function (dev) {
            this.devices = dev;
            if (typeof callback !== 'undefined') callback(dev);

        }.bind(this));
    }

    this.unplug = function (callback) {
        let dummyCallback = function(){};       
        if(typeof callback === 'undefined') callback=dummyCallback;

        chrome.serial.disconnect(this.info.conn.connectionId, callback);

        this.info.status = false;
        this.info.dev = -1;
        this.info.conn = false;
    }

    this.plug = function (id, userOptions, callback_onconnect, callback_onreceive) {
        let options = {
            bitrate: 12000000,
           // bitrate: 115200,
            dataBits: "eight",
            parityBit: "no",
            stopBits: "one"
        };
        if (typeof userOptions !== 'undefined' ) {
            for (let prop in userOptions) {
                options[prop] = userOptions[prop];
            }
        }
        chrome.serial.connect(this.devices[id].path, options, function (connectionInfo) {

            if (typeof connectionInfo !== 'undefined' && connectionInfo !== false && typeof connectionInfo.connectionId !== 'undefined') {
                this.info.status = true;
                this.info.dev = id;
                this.info.conn = connectionInfo;
                let reader_callback = this.reader.bind(this);
                if (typeof callback_onreceive !== 'undefined') {
                    this.receiverUserF = callback_onreceive;
                } else {
                    this.receiverUserF = false;
                }
                if (typeof this.registeredCallbacks[reader_callback.name] === 'undefined') {
                    chrome.serial.onReceive.addListener(reader_callback);
                    this.registeredCallbacks[reader_callback.name] = true;
                }
                if (typeof callback_onconnect !== 'undefined') callback_onconnect(connectionInfo);
            }


        }.bind(this));
    }

    this.reader = function (info) {

        if (typeof info.connectionId !== 'undefined' && info.connectionId !== false ) {
            if (this.receiverUserF !== false) {
                //this.receiverUserF(this.decoder.decode(info.data));
                this.receiverUserF(info.data);
            }

        }

    }

    this.write = function (data) {
        if (this.info.status === true) {
            chrome.serial.send(this.info.conn.connectionId, this.encoder.encode(data), function (sendInfo) {});
        }
    }

};

