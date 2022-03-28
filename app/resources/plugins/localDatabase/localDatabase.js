importScripts(
  '/resources/libs/Icestudio/Services/WafleEventBus.js',
  '/resources/libs/Icestudio/Plugin/Api/Worker/BindingWafleEventBus.js',
  '/resources/libs/Icestudio/Plugin/Api/IcestudioPlugin.js',
  'js/DbEngineIndexDB.js'
);

let db = false;

db = new DbEngineIndexDB();
let queue = [];
let retryingStorage = false;

function setEnvironment(data) {
  if (db === false) {
    console.log('setEnvironment::localDatabase', data);
  }
}

function onStore(item) {
  if (!db.isReady(item.database.dbId)) {
    queue.push(item);
    if (!retryingStorage) {
      retryingStorage = true;
      db.openDatabase(item.database, retryStore);
    }

  } else {
    db.store(item);
    retryStore();
  }
}
function retryStore() {
  retryingStorage = false;
  if (queue.length > 0) {
    let item = queue[0];
    queue.splice(0, 1);
    onStore(item);
  }
}

iceStudio.bus.events.subscribe('localDatabase.store', onStore);
iceStudio.bus.events.subscribe('pluginManager.env', setEnvironment);
iceStudio.bus.events.subscribe('pluginManager.updateEnv', setEnvironment); 

