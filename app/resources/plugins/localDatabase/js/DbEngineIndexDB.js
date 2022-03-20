class DbEngineIndexDB {

  constructor(config) {
    this.config = (typeof config === 'undefined') ? { dbVersion: 1 } : config;
    if (typeof this.config.dbVersion === 'undefined') {
      this.config.dbVersion = 1;
    }
    this.assetsDB = { db: false };
    this.openAssetsDatabase();
  }

  openAssetsDatabase() {
    let _this = this;
    this.assetsDB.openRequest = indexedDB.open(
      "Collections",
      this.config.dbVersion
    );
    
    this.assetsDB.openRequest.onupgradeneeded = function (e) {
      var db = e.target.result;

      if (!db.objectStoreNames.contains("blockAssets")) {
        let assetsOS = db.createObjectStore("blockAssets", { keyPath: "id" });
        assetsOS.createIndex("id", "id", { unique: true });
      }
    };

    this.assetsDB.openRequest.onsuccess = function (e) {
      _this.assetsDB.db = e.target.result;
    };
  }



}