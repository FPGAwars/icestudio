'use strict';

class BindingWafleEventBus {

    constructor() {
        this.ver = '2.0';
        this.bus = new WafleEventBus();
        let _this=this;
        self.addEventListener('message', function (e) {
           if(typeof e.data.endpoint !== 'undefined'){
            let data=false;
            switch(e.data.endpoint){
                case 'bus.publish':
                     data=JSON.parse(e.data.data);
                    _this.bus.publish(e.data.eventId,data);    
                break;
                case 'worker.API':

                    data=JSON.parse(e.data.data);
                    switch(e.data.eventId){
                    case 'getUUID': onPluginGetUUID(data); break;
                    }  
                break;
            }
           }
        }, false);
        if(typeof onPluginGetUUID !== 'undefined'){
            self.postMessage({endpoint:'worker.API',eventId:'getUUID'});
        }
    }

    subscribe(eventId, handler, owner,uuid) {
      this.bus.subscribe(eventId,handler,owner,uuid);
      self.postMessage({endpoint:'bus.subscribe',eventId:eventId, uuid:uuid});
     }

    publish(eventId, eventArgs, ownerId) {
    //  this.bus.publish(eventId,eventArgs,ownerId);
      self.postMessage({endpoint:'bus.publish',eventId:eventId, eventArgs:eventArgs, ownerId:ownerId});
    }

    version() {
        return this.ver;
    }
}