'use strict';

class WafleEventBus
{

    constructor()
    {
        this.events={};
        this.ver='2.0';
    }

    subscribe (eventId,  handler, owner) {

        if (typeof this.events[eventId] === 'undefined') {
            this.events[eventId] = [];
        }
        if (typeof owner === 'undefined') {
            owner = false;
        }
        this.events[eventId].push({
            'owner': owner,
            'handler': handler
        });

    }
    
    publish(eventId, eventArgs,ownerId) 
    {
        if(typeof ownerId === 'undefined') ownerId='all';

        if (typeof this.events[eventId] !== 'undefined') {

            for (let i = (this.events[eventId].length - 1), n = -1; i > n; i--) {
                
                //-- If event has not owner, only call it if no owner of the event is defined or if 
                //-- the message is for all registered handlers
                if (ownerId === 'all' && this.events[eventId][i].owner === false  ) {
                    this.events[eventId][i].handler(eventArgs);
                } else {
                    if( ownerId==='all'){

                        console.log('0',eventId,i,eventArgs);
                        console.log('1',this.events[eventId][i]);
                        console.log('2',this.events[eventId][i].owner);
                        console.log('3',typeof this.events[eventId][i].handler);
                        this.events[eventId][i].owner[this.events[eventId][i].handler](eventArgs);
                        
                    }else if( typeof this.events[eventId][i].owner.uuid !== 'undefined' && this.events[eventId][i].owner.uuid === ownerId){
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