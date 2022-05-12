class CollectionServiceMainThread 
{
    constructor() {
        this.version = '1.0';
        this.blockManager = new IceBlock();
        iceStudio.bus.events.subscribe('collectionService.block.loadFromFile', 'busLoadFromFile', this.blockManager);
    }
}

let collectionSrv = false;

function setupEnvironment(env) 
{
    if (collectionSrv === false) {
        collectionSrv = new CollectionServiceMainThread();
    }
}

function registerEvents() 
{
    iceStudio.bus.events.subscribe('pluginManager.env', setupEnvironment);
    iceStudio.bus.events.subscribe('pluginManager.updateEnv', setupEnvironment);
}

registerEvents();