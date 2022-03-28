class DbEngineIndexDB {

  constructor(config) {
    this.config = (typeof config === 'undefined') ? {  } : config;
    this.databases={};
  }

  isReady(dbId) {
    return (typeof this.databases[dbId] !== 'undefined');
  }

  openDatabase(schema, onOpen) {
    let _this = this;

    if (!this.isReady(schema.dbId)) {
      this.databases[schema.dbId]={db:false,version:schema.version};
        this.databases[schema.dbId].openRequest = indexedDB.open(
          schema.dbId,
          schema.version
        );

        this.databases[schema.dbId].openRequest.onupgradeneeded = function (e) {
          var db = e.target.result;
          for(let i=0;i<schema.storages.length;i++){
          if (!db.objectStoreNames.contains(schema.storages[i])) {
            let storage = db.createObjectStore(schema.storages[i], { keyPath: "id" });
            storage.createIndex("id", "id", { unique: true });
            }
          }
        };

        this.databases[schema.dbId].openRequest.onsuccess = function (e) {
          _this.databases[schema.dbId].db = e.target.result;
          if(typeof onOpen !== 'undefined') {
            onOpen();
          }
        };
      
      }else{
        if(typeof onOpen !== 'undefined') {
        onOpen();
        }
      }
    }

    store(item){
      if(this.isReady(item.database.dbId)){
      let transaction = this.databases[item.database.dbId].db.transaction(
        [item.data.store],
        "readwrite"
      );

      transaction.onerror = function (event) {
        console.log(
          "There has been an error with retrieving your data: " +
          transaction.error
        );
      };

      transaction.oncomplete = function (event) { };
      let store = transaction.objectStore(item.data.store);

      let request = store.put(item.data);

      request.onerror = function (event) {
        if (request.error.name == "ConstraintError") {
          event.preventDefault(); // don't abort the transaction
        } else {
          // unexpected error, can't handle it
          // the transaction will abort
        }
      };

      request.onsuccess = function (e) {      
          iceStudio.bus.events.publish('localDatabase.stored', item);
      };
    }
    }
}