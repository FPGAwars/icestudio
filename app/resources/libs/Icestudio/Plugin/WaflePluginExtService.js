'use strinct';

class WaflePluginExtService extends WaflePlugin {

    constructor(args) {
        super(args);
        this.providerUri = `${this.baseUrl()}${args.manifest.gui.provider}`;
        this.worker = false;
        this.subscriptions = {};
    }
    
    run() {
        if (this.isRunning()) {

            console.log('Plugin is running');
        } else {

            this.running = true;

            let assets = new WafleRemoteFile();
            let _this = this;
            if (typeof this.manifest.gui.providerMainThread !== 'undefined') {
                const jsfiles = _this.manifest.gui.providerMainThread.map(file => `${this.baseUrl()}${file}`);
                assets.getAll(jsfiles).then(pluginScripts => {
                    iceStudio.gui.setNodeScript(_this.manifest.id, _this.uuid, false, pluginScripts);
                });
            }
            this.worker = new Worker(this.providerUri);
            this.worker.onmessage = function (event) {
                if (typeof event.data.endpoint !== 'undefined') {
                    switch (event.data.endpoint) {
                        case 'bus.subscribe':
                            _this.subscriptions['handler_' + event.data.eventId] = {
                                id: event.data.eventId,
                                handler: function (data) {
                                    if (typeof data === 'undefined') {
                                        data = {};
                                    }
                                    _this.worker.postMessage({
                                        endpoint: 'bus.publish',
                                        eventId: this.id,
                                        data: JSON.stringify(data)
                                    });
                                }
                            };
                            iceStudio.bus.events.subscribe(event.data.eventId, 'handler',
                                _this.subscriptions['handler_' + event.data.eventId],
                                this.uuid);
                            break;
                        case 'bus.publish':
                            iceStudio.bus.events.publish(event.data.eventId, event.data.eventArgs, event.data.ownerId);
                        break;
                        case 'worker.API':
                            switch(event.data.eventId){
                                case 'getUUID':
                                    _this.worker.postMessage({
                                        endpoint: 'worker.API',
                                        eventId: 'getUUID',
                                        data: JSON.stringify({uuid:_this.uuid})
                                    }); 
                                break;
                            }

                        

                    }
                }
            }
        }
    }
    terminate() {
        this.running = false;
    }
}