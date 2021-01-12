/*----------------------------------------------------------------------------- 
-- Collection manager plugin
-----------------------------------------------------------------------------*/

importScripts(  '/resources/libs/icetemplatesystem.js',
                '/resources/libs/iceeventbus.js',
                '/resources/libs/Icestudio/Plugin/IcePluginGUI.js',
                '/resources/libs/Icestudio/Plugin/IcePluginHelper.js',
                '/resources/libs/Icestudio/Plugin/IcePluginEventBus.js' );

let gui  = new IcePluginGUI();
let ebus = new IcePluginEventBus();
let tpl =  new IceTemplateSystem ();
let plugin =  new IcePluginHelper();
let pConfig = false;

function init(args){
    
    pConfig = args;

    console.log('Initialicing', pConfig);
    let initialHtml='<i class="close-panel" data-guievt="click" data-handler="closePanel"></i><div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div><div style="color:white;text-align:center;margin-top:20px;">Coming soon</div>';

     plugin.styleSheet(['assets/css/style.css','assets/css/style2.css'])
    .then( css => {
                gui.publish('createRootNode',{id:pConfig.id, initialContent: initialHtml, stylesheet: css, node:args.manifest.gui});
            });
}

function guiUpdate(args){

    console.log('GUI updated event example',args)
}


function closePlugin(){

    ebus.publish('plugin.terminate',{id:pConfig.id});
    self.close();
}

ebus.subscribe('plugin.initialSetup',init);
gui.subscribe('gui.update',guiUpdate);
gui.subscribe('gui.click.closePanel',closePlugin);

/* Send  test message to icestudio */
ebus.publish('txt-test', {text:'WORKER INIT'});

