'use strict';
/*jshint unused:false*/


class IcePluginEventBus {

    constructor() {
       this.eventBus = new IceEventBus();
        //Capture messages from Icestudio 
        let _this=this;
        self.addEventListener('message', function (e) {
            let  data = JSON.parse(e.data);
             if(typeof data.type !== 'undefined' && data.type==='eventBus'){
                if(data.event === 'exit'){
                    self.close();
                }else{
                    _this.eventBus.fire(data.event,data.payload);
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