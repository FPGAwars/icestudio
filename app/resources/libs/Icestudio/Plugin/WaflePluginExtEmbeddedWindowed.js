'use strict';

class WaflePluginExtEmbeddedWindowed extends WaflePlugin {
    constructor(args) {
        super(args);
        this.dom = {
            host: false,
            shadow: false
        };
        this.windowId=false;
    }
    
    baseUrl() {
        return `/resources/plugins/${this.manifest.id}/`;
    }

    run() {
        if (this.isRunning()) {

            console.log('Plugin is running');
        } else {
            this.running = true;
            let _this = this;
            this.windowId=this.manifest.id;
            this.dom.shadow = iceStudio.gui.addNode(this.manifest.id, 'plugin-wrapper plugin-windowed');
            this.dom.host = iceStudio.gui.getNode(this.manifest.id);
            

            let assets = new WafleRemoteFile();
            if(this.manifest.gui.scripts === 'undefined') this.manifest.gui.scripts=[];
            if(this.manifest.gui.views === 'undefined') this.manifest.gui.views=[];

            assets.get(`${this.baseUrl()}${this.manifest.gui.layout}`).then(html => {
                assets.get(`${_this.baseUrl()}${_this.manifest.gui.style}`).then(css => {
                    assets.get(`${_this.baseUrl()}${_this.manifest.gui.styleHost}`).then(css2 => {
                        
                        iceStudio.gui.addGlobalStyle(_this.manifest.id,css2);
                        iceStudio.gui.setNodeContent(_this.dom.shadow, html);
                        iceStudio.gui.setNodeStyle(_this.dom.shadow, css);
                        
                        const jsfiles=_this.manifest.gui.scripts.map(file=> `${this.baseUrl()}${file}`);
                        assets.getAll(jsfiles).then(pluginScripts=>{
                                    const viewfiles=_this.manifest.gui.views.map(view=> `${this.baseUrl()}${view}`);
                                    assets.getAll(viewfiles).then(pluginViews=>{
                                            let oviews={};
                                            let vid='';
                                            for(let i=0;i<viewfiles.length;i++){
                                                vid=viewfiles[i].replace('.html','').split('/');
                                                
                                                oviews[vid[vid.length-1]]={id: vid[vid.length-1],
                                                                           tpl:pluginViews[i]};
                                            }

                                            iceStudio.gui.setNodeScript(_this.manifest.id,_this.dom.shadow,pluginScripts,oviews);
                                            iceStudio.gui.wm.addWindow(_this.manifest.name,_this.windowId,_this.dom.host);
                                    });                                   

                        });

                    });
                });
            });
        }
    }//--END run
}