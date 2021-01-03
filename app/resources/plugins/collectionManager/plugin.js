/*----------------------------------------------------------------------------- 
-- Collection manager plugin
-----------------------------------------------------------------------------*/

importScripts(  '/resources/libs/iceeventbus.js',
                '/resources/libs/Icestudio/Plugin/IcePluginGUI.js',
                '/resources/libs/Icestudio/Plugin/IcePluginEventBus.js' );

let gui  = new IcePluginGUI();
let ebus = new IcePluginEventBus();
let pConfig = false;

function init(args){
    
    pConfig = args;

    console.log('Initialicing', pConfig);
    
    if(typeof args.manifest.gui !== 'undefined'){
        gui.publish('createRootNode',{id:pConfig.id, node:args.manifest.gui});
    }

}

ebus.subscribe('plugin.initialSetup',init);

/* Send  test message to icestudio */
ebus.publish('txt-test', {text:'WORKER INIT'});

