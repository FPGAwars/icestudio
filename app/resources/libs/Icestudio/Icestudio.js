"use strict";
class Icestudio {

    constructor() {
        this.bus = {
            events: new WafleEventBus()

        };
        this.initialized=false;
        this.pluginManager = false;
        this.gui = false;
        this.env={};

    }
    isInitialized(){
        return this.initialized;
    }
    initAfterGUI(env){
        this.pluginManager = new WaflePluginManager();
        this.pluginManager.init();
        this.pluginManager.setEnvironment(env);
        this.pluginManager.setPluginDir( env.DEFAULT_PLUGIN_DIR, function () 
        {
            console.log('New plugin manager initialized');

        });//--END setPluginDir

    }
    init(env){
        let _this=this;
        this.env=env;
        function _initAfterGUI(){
            _this.initAfterGUI(_this.env);
        }
        this.gui = new WafleGUI(_initAfterGUI);
        this.initialized=true;
    }
    updateEnv(env){
        this.env=env;
        if(this.pluginManager !== false &&
            typeof this.pluginManager.setEnvironment !== 'undefined'){
            this.pluginManager.setEnvironment(env);
        }
    }

}