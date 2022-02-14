
registerEvents();

//Getting environment config
iceStudio.bus.events.publish('pluginManager.getEnvironment'); 
iceStudio.bus.events.publish('pluginManager.getPluginList'); 

