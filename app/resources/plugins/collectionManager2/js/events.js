//-- When some change in the configuration or in the environment, launch it
function setupEnvironment(env){
    console.log('CollectionManager::ENV::',env);
    iceStudio.bus.events.publish('collectionService.isIndexing');
}

//-- When index event in the collection service fired
function collectionsIndexStatus(status){

    console.log('Chequeando el indexado',status,collectionsTree);
    if(status.queue===0 && status.indexing===false && collectionsTree ===false){
        iceStudio.bus.events.publish('collectionService.getCollections');
    }
}


function collectionsRender(tree){
    collectionsTree = new WafleUITree();
    collectionsTree.setTree(tree);
    console.log('DOM');
    console.log(pluginRoot);
    $(pluginRoot).empty().append(collectionsTree.render());
}

function registerEvents(){

    iceStudio.bus.events.subscribe('pluginManager.getEnvironment', setupEnvironment,false, pluginUUID); 
    iceStudio.bus.events.subscribe('pluginManager.updateEnv', setupEnvironment,false,pluginUUID); 
    iceStudio.bus.events.subscribe('collectionService.indexStatus',collectionsIndexStatus);
    iceStudio.bus.events.subscribe('collectionService.collections',collectionsRender);
}

