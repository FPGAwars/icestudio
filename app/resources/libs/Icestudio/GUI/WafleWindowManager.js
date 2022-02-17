'use strict';

class WafleWindowManager
{
    constructor(){
        this.windows={};
    }

    addWindow(title,id,node)
    {
        if(typeof this.windows[id] ==='undefined'){
            this.windows[id] = new WinBox({
                title:title,
                top:'30px',
            bottom:'68px'});
             this.windows[id].mount(node);
        }
    }
}