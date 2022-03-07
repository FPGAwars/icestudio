'use strinct';

class WaflePluginExtService extends WaflePlugin {

    constructor(args) {
        super(args);
        this.providerUri = `${this.baseUrl()}${args.manifest.gui.provider}`;
        this.worker = false;
        console.log('SERVICE::', this);
        this.subscriptions={};
    }


    run() {
        if (this.isRunning()) {

            console.log('Plugin is running');
        } else {

            this.running = true;

            this.worker = new Worker(this.providerUri);
            let _this=this;
            this.worker.onmessage = function (event) {
                console.log('WORKER RECIBIDO', event);
                if(typeof event.data.endpoint !== 'undefined'){
                    switch(event.data.endpoint){
                        case 'bus.subscribe':
                            _this.subscriptions['handler_'+event.data.eventId] = {
                                id: event.data.eventId,
                                handler: function (data){
                                    console.log('EVENT::'+this.id,data);
                                    if(typeof data === 'undefined'){
                                        data={};
                                    }
                                    _this.worker.postMessage({
                                        endpoint:'bus.publish',
                                        eventId:this.id,
                                        data:JSON.stringify(data)
                                    });
                                    }
                            };
                            iceStudio.bus.events.subscribe(event.data.eventId,'handler',
                            _this.subscriptions['handler_'+event.data.eventId],
                            this.uuid);
                        break;
                    }
                }
            }
        }
    }
    terminate() {
        this.running = false;
    }
}