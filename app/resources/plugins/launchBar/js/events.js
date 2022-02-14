function setupEnvironment(env){
    console.log('launchBar::ENV::',env);
}

function getPlugins(plist){

    render(plist);
}

function registerEvents(){

    console.log('Registradndo eventos desde plugin embebido');

    iceStudio.bus.events.subscribe('pluginManager.env', setupEnvironment); 
    iceStudio.bus.events.subscribe('pluginManager.updateEnv', setupEnvironment); 
    iceStudio.bus.events.subscribe('pluginManager.pluginList', getPlugins); 
}
