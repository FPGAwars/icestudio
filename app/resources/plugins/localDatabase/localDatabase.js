importScripts(
  '/resources/libs/Icestudio/Services/WafleEventBus.js',
  '/resources/libs/Icestudio/Plugin/Api/Worker/BindingWafleEventBus.js',
  '/resources/libs/Icestudio/Plugin/Api/IcestudioPlugin.js',
  'js/DbEngineIndexDB.js'
);

let db = false;

function setEnvironment(data) {
  if (db === false) {
    console.log('setEnvironment::localDatabase', data);
    db = new DbEngineIndexDB();
  }
}

iceStudio.bus.events.subscribe('pluginManager.env', setEnvironment);
iceStudio.bus.events.subscribe('pluginManager.updateEnv', setEnvironment); 

