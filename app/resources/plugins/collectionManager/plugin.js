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
    let initialHtml='<i class="close-panel" data-guievt="click" data-handler="closePanel"></i><div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div><div style="color:white;text-align:center;margin-top:20px;">Coming soon</div>';

    fetch('assets/css/style.css')
    .then(response => response.text())
    .then( cssText => {
        gui.publish('createRootNode',{id:pConfig.id, initialContent: initialHtml, stylesheet: cssText, node:args.manifest.gui});
    });
    

}

function guiUpdate(args){

    console.log('GUI updated event example',args)
}

function closePlugin(){

    console.log('Terminating plugin');
    ebus.publish('plugin.terminate',{id:pConfig.id});
    self.close();

}

ebus.subscribe('plugin.initialSetup',init);
gui.subscribe('gui.update',guiUpdate);
gui.subscribe('gui.click.closePanel',closePlugin);

/* Send  test message to icestudio */
ebus.publish('txt-test', {text:'WORKER INIT'});

