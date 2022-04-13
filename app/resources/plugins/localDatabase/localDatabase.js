importScripts(
  '/resources/libs/Icestudio/Services/WafleEventBus.js',
  '/resources/libs/Icestudio/Plugin/Api/Worker/BindingWafleEventBus.js',
  '/resources/libs/Icestudio/Plugin/Api/IcestudioPlugin.js',
  'js/DbEngineIndexDB.js'
);

let db = false;

db = new DbEngineIndexDB();
let queue = [];
let queueQuery=[];
let retryingStorage = false;
let retryingRetrieve = false;

function setEnvironment(data) {
}
function onRetrieve(item) {
  if (!db.isReady(item.database.dbId)) {
    queueQuery.push(item);
    if (!retryingRetrieve) {
      retryingRetrieve = true;
      db.openDatabase(item.database, retryStore);
    }

  } else {
    db.retrieve(item);
    retryRetrieve();
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
function retryRetrieve() {
  retryingRetrieve = false;
  if (queueQuery.length > 0) {
    let item = queueQuery[0];
    queueQuery.splice(0, 1);
    onRetrieve(item);
  }
}
iceStudio.bus.events.subscribe('localDatabase.store', onStore);
iceStudio.bus.events.subscribe('localDatabase.retrieve', onRetrieve);
iceStudio.bus.events.subscribe('pluginManager.env', setEnvironment);
iceStudio.bus.events.subscribe('pluginManager.updateEnv', setEnvironment); 

