//-- GLOBAL Variables
let collectionsTree = false;

//-- Connect the events in js/ejents.js to the system bus and listen for hooks
registerEvents();

//Getting environment config, event that start everything inside the plugin
iceStudio.bus.events.publish('pluginManager.getEnvironment');

