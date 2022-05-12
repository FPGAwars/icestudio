'use strict';

class BindingWafleEventBus {

    constructor() {
        this.ver = '2.0';
    }

    subscribe(eventId, handler, owner,uuid) {

        window.opener.iceStudio.bus.events.subscribe(eventId,handler, owner,uuid);
     }

    publish(eventId, eventArgs, ownerId) {
        window.opener.iceStudio.bus.events.publish(eventId,eventArgs, ownerId); 
    }

    version() {
        return this.ver;
    }


}