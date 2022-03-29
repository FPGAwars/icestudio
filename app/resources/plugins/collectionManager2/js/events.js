function setupEnvironment(env){
    console.log('CollectionManager::ENV::',env);
    iceStudio.bus.events.publish('collectionService.isIndexing');
}

function getPlugins(plist){

    render(plist);
}

function collectionsIndexStatus(status){

    console.log('Chequeando el indexado',status);
}


function registerEvents(){

    console.log('Registradndo eventos desde plugin embebido',pluginUUID);

    iceStudio.bus.events.subscribe('pluginManager.getEnvironment', setupEnvironment,false, pluginUUID); 
    iceStudio.bus.events.subscribe('pluginManager.updateEnv', setupEnvironment,false,pluginUUID); 
    iceStudio.bus.events.subscribe('pluginManager.pluginList', getPlugins,false,pluginUUID); 
    iceStudio.bus.events.subscribe('collectionService.indexStatus',collectionsIndexStatus);
}

