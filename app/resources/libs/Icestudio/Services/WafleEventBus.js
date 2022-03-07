'use strict';

class WafleEventBus {

    constructor() {
        this.events = {};
        this.ver = '2.0';
    }

    subscribe(eventId, handler, owner, uuid) {
        if (typeof uuid === 'undefined') {
            uuid = -1;
        }

        if (typeof this.events[eventId] === 'undefined') {
            this.events[eventId] = [];
        }
        if (typeof owner === 'undefined') {
            owner = false;
        }

        this.events[eventId].push({
            'owner': owner,
            'handler': handler,
            'uuid': uuid
        });
    }

    publish(eventId, eventArgs, ownerId) {
        let fire = false;
        if (typeof ownerId === 'undefined') ownerId = 'all';

        if (typeof this.events[eventId] !== 'undefined') {

            for (let i = (this.events[eventId].length - 1), n = -1; i > n; i--) {
                fire = false;
                //-- If event has not owner, only call it if no owner of the event is defined or if 
                //-- the message is for all registered handlers
                if (ownerId === 'all') {
                    fire = true;
                } else if (typeof this.events[eventId][i].uuid !== 'undefined' && this.events[eventId][i].uuid === ownerId) {
                    fire = true;
                }
                
                if (fire) {
                    if (this.events[eventId][i].owner === false) {
                        this.events[eventId][i].handler(eventArgs);
                    } else {
                        this.events[eventId][i].owner[this.events[eventId][i].handler](eventArgs);
                    }
                }
            }
        }
    }

    version() {
        return this.ver;
    }
}