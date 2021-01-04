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
    let initialHtml='<div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';

    fetch('assets/css/style.css')
    .then(response => response.text())
    .then( cssText => {
        console.log('CSS',cssText)
        gui.publish('createRootNode',{id:pConfig.id, initialContent: initialHtml, stylesheet: cssText, node:args.manifest.gui});
    });
    

}

ebus.subscribe('plugin.initialSetup',init);

/* Send  test message to icestudio */
ebus.publish('txt-test', {text:'WORKER INIT'});

