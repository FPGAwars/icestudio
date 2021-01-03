'use strict';
/*jshint unused:false*/


class IcePluginEventBus {

    constructor() {
       console.log('IcePluginEventBus::start');
       this.eventBus = new IceEventBus();
        //Capture messages from Icestudio 
        self.addEventListener('message', function (e) {
            let  data = JSON.parse(e.data);
             if(typeof data.type !== 'undefined' && data.type==='eventBus'){
                console.log('IcePluginEventBus::'+data.event,data.payload);
                if(data.event === 'exit'){
                    self.close();
                }
              }
            //self.close();
        }, false);
    }

    subscribe(evt,callback,target){
        this.eventBus.subscribe(evt,callback,target);
    }

    publish(evt, data) {
        let message = {
            type: "eventBus",
            event: evt,
            payload: data
        };
        self.postMessage(JSON.stringify(message));
    }
}