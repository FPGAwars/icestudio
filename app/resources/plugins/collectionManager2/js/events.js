function setupEnvironment(env){
    console.log('CollectionManager::ENV::',env);
}

function getPlugins(plist){

    render(plist);
}

function registerEvents(){

    console.log('Registradndo eventos desde plugin embebido',pluginUUID);

    iceStudio.bus.events.subscribe('pluginManager.getEnvironment', setupEnvironment,false, pluginUUID); 
    iceStudio.bus.events.subscribe('pluginManager.updateEnv', setupEnvironment,false,pluginUUID); 
    iceStudio.bus.events.subscribe('pluginManager.pluginList', getPlugins,false,pluginUUID); 
}
