//-- GLOBAL Variables
let collectionsTree = false;

registerEvents();

//Getting environment config, event that start everything inside the plugin
iceStudio.bus.events.publish('pluginManager.getEnvironment',false,pluginUUID); 

