class Icestudio {

    constructor() {
        this.bus = {
            events: new WafleEventBus()

        };
        this.pluginManager = false;
        this.gui = false;
        this.env={};

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
        let _env=env;
        function _initAfterGUI(){
            _this.initAfterGUI(_env);
        }
        this.gui = new WafleGUI(_initAfterGUI);
    }

}