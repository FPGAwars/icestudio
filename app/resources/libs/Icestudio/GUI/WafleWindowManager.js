'use strict';

class WafleWindowManager
{
    constructor(){
        this.windows={};
    }

    addWindow(title,id,node)
    {
        if(typeof this.windows[id] ==='undefined'){
            let _this=this;
            this.windows[id] = new WinBox({
                title:title,
                top:'30px',
            bottom:'48px',
                onclose:function(){
                    this.unmount();
                    _this.closeWindow(id);

               }});
             this.windows[id].mount(node);
        }
    }
    closeWindow(id){
        console.log('Cerrando',id);
        iceStudio.bus.events.publish(`${id}::Terminate`,false,id);
        delete this.windows[id];
    }
}