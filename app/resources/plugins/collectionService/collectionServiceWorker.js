importScripts(
  '/resources/libs/Icestudio/Crypto/SHA-256.js',
  '/resources/libs/Icestudio/Services/WafleEventBus.js',
  '/resources/libs/Icestudio/Plugin/Api/Worker/BindingWafleEventBus.js',
  '/resources/libs/Icestudio/Plugin/Api/IcestudioPlugin.js',
  'js/CollectionService.js'
);

let pConfig = { env: false };
let pluginUUID = -1;
let colService = false;

function setupEnvironment(env)
{
  if (typeof env === 'undefined' ||
    typeof env.VERSION === 'undefined') {
  
      setTimeout(function () {
      iceStudio.bus.events.publish('pluginManager.getEnvironment');
  
    }, 2000);
  
  } else {
    pConfig.env = env;
    let tmp = pConfig.env.defaultCollection;
    tmp.name = 'Default collection';
  
    if (colService === false) {

      colService = new CollectionService();
      colService.setId(pluginUUID);
      colService.init();
      colService.collectionsToTree(
        [tmp]
          .concat(pConfig.env.externalCollections)
          .concat(pConfig.env.internalCollections));
    }
  }
}

function registerEvents() 
{
  iceStudio.bus.events.subscribe('pluginManager.env', setupEnvironment);
  iceStudio.bus.events.subscribe('pluginManager.updateEnv', setupEnvironment);
}

function onPluginGetUUID(data) 
{
  pluginUUID = data.uuid;
  registerEvents();
  iceStudio.bus.events.publish('pluginManager.getEnvironment');
}

