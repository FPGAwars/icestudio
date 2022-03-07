'use strict';

class BindingWafleEventBus {

    constructor() {
        this.ver = '2.0';
        this.bus = new WafleEventBus();
        let _this=this;
        self.addEventListener('message', function (e) {
           if(typeof e.data.endpoint !== 'undefined'){
            switch(e.data.endpoint){
                case 'bus.publish':
                let data=JSON.parse(e.data.data);
                _this.publish(e.data.eventId,data);    
                break;
            }
           }
        }, false);
    }

    subscribe(eventId, handler, owner,uuid) {
      this.bus.subscribe(eventId,handler,owner,uuid);
      self.postMessage({endpoint:'bus.subscribe',eventId:eventId, uuid:uuid});
     }

    publish(eventId, eventArgs, ownerId) {
      this.bus.publish(eventId,eventArgs,ownerId);
    }

    version() {
        return this.ver;
    }
}