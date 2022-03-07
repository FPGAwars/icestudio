'use strinct';

class WaflePlugin {

    constructor(args) {
        this.manifest = args.manifest;
        this.dir = args.dir;
        this.pluginUri = args.pluginUri;
        this.running = false;
        this.uuid= UniqueIdGenerator.UUID();

    }
    baseUrl() {
        return `/resources/plugins/${this.manifest.id}/`;
    }


    isRunning() {
        return this.running;
    }

    uri(){
        return this.pluginUri;
    }

    id(){
        return this.manifest.id;
    }

    run() {
        if(this.isRunning()){
            
            console.log('Plugin is running');
        }else{
            this.running=true;
           
            console.log('Generic plugin running');
        }
    }
    terminate(){
        this.running=false;
    }
}