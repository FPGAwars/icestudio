class IcestudioPlugin
{
    constructor(){
        this.ver='1.0';
        
        this.bus = {
                events: new BindingWafleEventBus()
            };
            this.env={};

               }
    version(){
        return this.ver;
    }
    start(){
         if (typeof onIcestudioPluginLoaded !== 'undefined'){
                onIcestudioPluginLoaded();
            }
        

    }
}

let iceStudio = new IcestudioPlugin();
iceStudio.start();