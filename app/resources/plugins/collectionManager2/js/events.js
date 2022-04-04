function setupEnvironment(env){
    console.log('CollectionManager::ENV::',env);
    iceStudio.bus.events.publish('collectionService.isIndexing');
}


function collectionsIndexStatus(status){

    console.log('Chequeando el indexado',status,collectionsTree);
    if(status.queue===0 && status.indexing===false && collectionsTree ===false){
        iceStudio.bus.events.publish('collectionService.getCollections');
    }
}

function collectionsRender(tree){
    collectionsTree = tree;
    console.log(collectionsTree);
}

function registerEvents(){

    console.log('Registradando eventos desde plugin embebido',pluginUUID);

    iceStudio.bus.events.subscribe('pluginManager.getEnvironment', setupEnvironment,false, pluginUUID); 
    iceStudio.bus.events.subscribe('pluginManager.updateEnv', setupEnvironment,false,pluginUUID); 
    iceStudio.bus.events.subscribe('collectionService.indexStatus',collectionsIndexStatus);
    iceStudio.bus.events.subscribe('collectionService.collections',collectionsRender);
}

