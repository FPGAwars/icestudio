'use strict';
/*jshint unused:false*/

class IcePluginGUI {

    constructor() {
        console.log('IcePluginGUI::start');
        this.eventBus = new IceEventBus();
        let _this=this;
        //Capture messages from Icestudio 
        self.addEventListener('message', function (e) {
            let  data = JSON.parse(e.data);
            if (typeof data.type !== 'undefined' && data.type === 'guiBus') {
                console.log('guiBus::' + data.event, data.payload);
                _this.eventBus.fire(data.event,data.payload);
            }
        }, false);
    }

    subscribe(evt,callback,target){
        this.eventBus.subscribe(evt,callback,target);
    }

    publish(evt, data) {
        let message = {
            type: "guiBus",
            event: evt,
            payload: data
        };
        self.postMessage(JSON.stringify(message));
    }
}