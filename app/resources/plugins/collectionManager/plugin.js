
importScripts(  '/resources/libs/iceeventbus.js',
                '/resources/libs/Icestudio/Plugin/IcePluginGUI.js',
                '/resources/libs/Icestudio/Plugin/IcePluginEventBus.js'
              );


let gui  = new IcePluginGUI();
let ebus = new IcePluginEventBus();


ebus.publish('txt-text', {text:'WORKER INIT'});
