'use strict';
class WaflePluginExtEmbeddedWindowed extends WaflePlugin {
    
    constructor(args)
    {
        super(args);
        this.dom = {
            host: false,
            shadow: false,
            window:false
        };
    }

      run() 
      {
        if (this.isRunning()) 
        {
            console.log('Plugin is running');
        } else {

            iceStudio.bus.events.subscribe(`${this.uuid}::Terminate`,'terminate',this,this.uuid);
            this.running = true;
            let _this = this;
            
            this.dom.window=iceStudio.gui.wm.addWindow(this.manifest.name, this.uuid);
            this.dom.shadow = iceStudio.gui.addNodeToSelector(`#${this.uuid} .ics-wm-window--body`,this.manifest.id, 'plugin-wrapper plugin-windowed');
            this.dom.host = iceStudio.gui.getNode(this.manifest.id);

            let assets = new WafleRemoteFile();
            if (this.manifest.gui.scripts === 'undefined') this.manifest.gui.scripts = [];
            if (this.manifest.gui.views === 'undefined') this.manifest.gui.views = [];

            const htmlFiles=_this.manifest.gui.layout.map(file=> `${this.baseUrl()}${file}`);
            const styleHostFiles=_this.manifest.gui.styleHost.map(file=> `${this.baseUrl()}${file}`);
            assets.getAll(htmlFiles).then(html => {
                let csslist = _this.manifest.gui.style;

                if (typeof _this.manifest.gui.styleThemed !== 'undefined') {
                    if (typeof iceStudio.env.profile !== 'undefined' &&
                        typeof iceStudio.env.profile.uiTheme !== 'undefined'
                    ) {

                        if (iceStudio.env.profile.uiTheme === 'dark' &&
                            typeof _this.manifest.gui.styleThemed.dark !== 'undefined') {
                                csslist= csslist.concat(_this.manifest.gui.styleThemed.dark);
                            
                            } else if (typeof _this.manifest.gui.styleThemed.light !== 'undefined') {

                                csslist= csslist.concat(_this.manifest.gui.styleThemed.light);
                        }
                    }
                }
            
                const styleFiles=csslist.map(file=> `${_this.baseUrl()}${file}`);
                assets.getAll(styleFiles).then(css => {
                    assets.getAll(styleHostFiles).then(css2 => {
 
                        let mcss2 ='';
                        let i=0;
                        for(i=0;i<css2.length;i++){
                            mcss2+="\n"+css2[i];
                        }
                        let mcss ='';
                        for(i=0;i<css.length;i++){
                            mcss+="\n"+css[i];
                        }       
                        let mhtml ='';
                        for(let i=0;i<html.length;i++){
                            mhtml+="\n"+html[i];
                        }
                        iceStudio.gui.addGlobalStyle(_this.manifest.id, mcss2);
                        iceStudio.gui.setNodeContent(_this.dom.shadow, mhtml);
                        iceStudio.gui.setNodeStyle(_this.dom.shadow, mcss);

                        const jsfiles = _this.manifest.gui.scripts.map(file => `${this.baseUrl()}${file}`);
                        assets.getAll(jsfiles).then(pluginScripts => {
                            const viewfiles = _this.manifest.gui.views.map(view => `${this.baseUrl()}${view}`);
                            assets.getAll(viewfiles).then(pluginViews => {
                                let oviews = {};
                                let vid = '';
                                for (let i = 0; i < viewfiles.length; i++) {
                                    vid = viewfiles[i].replace('.html', '').split('/');

                                    oviews[vid[vid.length - 1]] = {
                                        id: vid[vid.length - 1],
                                        tpl: pluginViews[i]
                                    };
                                }
                                iceStudio.gui.setNodeScript(_this.manifest.id, _this.uuid, _this.dom.shadow, pluginScripts, oviews);
                            });
                        });
                    });
                });
            });
        }
    }//--END run

    terminate(){
        iceStudio.gui.removeNode(this.dom.host);
        this.dom.shadow=false;
        this.dom.host=false;
        this.running=false;
        iceStudio.bus.events.removeById(this.uuid);
    }
}