const { initConfig } = require("grunt");

class WafleUIWindow{

    constructor(params){
        if(typeof params.html === 'undefined'){
        params.html ='';
        }
        if(typeof params.y === 'undefined'){
        params.y ='100px';
        }
        if(typeof params.x === 'undefined'){
        params.x ='100px';
        }
        if(typeof params.height === 'undefined'){
        params.height ='300px';
        }
        if(typeof params.width === 'undefined'){
        params.width ='150px';
        }

        /*-- ¡¡ Be careful !!
        -- If you modify x and - symbols, check that is consisteng with all OS fonts , in this momment we use unicode symbol that is universal and not consume resources.
        -- For the future we could change by svg image for the icons.
        -- */
        let content=`<div class="ics-wm-window--topbar | ics-wm__is-draggable" data-dragcontainerid="#${params.id}"><div class="ics-wm-window--topbar--button | ics-wm-window__minify">-</div><div class="ics-wm-window--topbar--button | ics-wm-window__close">x</div></div>
                     <div class="ics-wm-window--body"></div>
                     <div class="ics-wm-window--bottombar"></div>
                    `;
        
        this.dom = iceStudio.gui.addDiv(params.id,params.htmlClass,content);
        this.dom.style.top=params.y;
        this.dom.style.left=params.x;
        this.dom.style.width=params.width;
        this.dom.style.height=params.height;
    }
}