//-- When some change in the configuration or in the environment, launch it
function setupEnvironment(env){
    iceStudio.bus.events.publish('collectionService.isIndexing');
}

//-- When index event in the collection service fired
function collectionsIndexStatus(status){

    if(status.queue===0 && status.indexing===false && collectionsTree ===false){
        iceStudio.bus.events.publish('collectionService.getCollections');
    }
}

function collectionsRender(tree){
    collectionsTree = new WafleUITree();
    collectionsTree.setId(pluginUUID);
    collectionsTree.setTree(tree);
    $(pluginRoot).empty().append(collectionsTree.render());
    iceStudio.gui.activateEventsFromId(`#tree-view-${pluginUUID}`,pluginHost,mouseEvents);
}

function registerEvents(){

    iceStudio.bus.events.subscribe('pluginManager.getEnvironment', setupEnvironment,false, pluginUUID); 
    iceStudio.bus.events.subscribe('pluginManager.updateEnv', setupEnvironment,false,pluginUUID); 
    iceStudio.bus.events.subscribe('collectionService.indexStatus',collectionsIndexStatus,false,pluginUUID);
    iceStudio.bus.events.subscribe('collectionService.collections',collectionsRender,false,pluginUUID);
}

function mouseEvents(eventType,handler,args){

    switch(eventType)
    {
        case 'click':
            switch(handler){
                case 'this.toggleFolder':
                collectionsTree.toggle(pluginHost,args.id);
                break;
            }
            break;
    }

}