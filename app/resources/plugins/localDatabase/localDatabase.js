importScripts(
    '/resources/libs/Icestudio/Services/WafleEventBus.js',
    '/resources/libs/Icestudio/Plugin/Api/Worker/BindingWafleEventBus.js',
    '/resources/libs/Icestudio/Plugin/Api/IcestudioPlugin.js',
    'js/DbEngineIndexDB.js'
  );

  let db = new DbEngineIndexDB();

  function testEvent(data){

    console.log('testEvent::RECIBIDO',data);
  }


iceStudio.bus.events.subscribe('workerTest',testEvent);
iceStudio.bus.events.subscribe('pluginManager.env', testEvent); 
iceStudio.bus.events.subscribe('pluginManager.updateEnv', testEvent); 
