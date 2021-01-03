/*jshint unused:false*/
'use strict';
class IceGUI {

    constructor() {
        this.vdom = [];
        this.dom = {
            root: this.el('body'),
            menu: this.el('#menu'),
            footer: this.el('.footer.ice-bar')
        };
    
       this.sandbox();
       this.registerEvents();
    }

    sandbox(){

       this.dom.height=window.innerHeight - 
                        (this.elHeight(this.dom.menu) + 
                        this.elHeight(this.dom.footer));
       this.dom.width=window.innerWidth;

    }
    registerEvents(){
        
        let _this=this;

        window.addEventListener('resize', function(){

            _this.sandbox();
        });
    }

    createRootNode(args) {
        let id = args.id;
        let conf = args.node;

        console.log(`GUI::createNode::${id}`, conf);
        this.vdom.push( {
            key: id,
            initial: conf,
            parent: false,
            updated: false,
            rendered:false
        });
        this.update();
    }

    el(selector) {

        let selectorType = 'querySelectorAll';
        let multiple = true;
        if (selector.indexOf('#') === 0) {
            selectorType = 'getElementById';
            selector = selector.substr(1, selector.length);
            multiple = false;
        }
        let list = document[selectorType](selector);
        if (multiple && list.length === 1) list = list[0];
        return list;
    };

    elToggleClass(el, classname) {
        if (el.classList) {
            el.classList.toggle(classname);
        } else {
            if (elHasClass(el, classname)) {

                elRemoveClass(el, classname);
            } else {
                elAddClass(el, classname);
            }

        }
    }
    elHasClass(el, className) {
        if (el.classList) {
            return el.classList.contains(className);
        }
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    }

    elAddClass(el, className) {
        if (el.classList) {
            el.classList.add(className)
        } else if (!hasClass(el, className)) {
            el.className += " " + className;
        }
    }

    elRemoveClass(el, className) {
        if (el.classList) {
            el.classList.remove(className)
        } else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            el.className = el.className.replace(reg, ' ');
        }
    }

    elHeight(el) {
        let style = window.getComputedStyle ? getComputedStyle(el, null) : el.currentStyle;

        return el.offsetHeight + (parseInt(style.marginTop) || 0) + (parseInt(style.marginBottom) || 0);

    }

    update() {
        
        let nodes=this.vdom.length;
        console.log('Actualizando',this,nodes);
        for(let i=0;i<nodes;i++){
            if(this.vdom[i].updated ===false){
                this.render(i);
                this.vdom[i].updated=true;
            }
        }
    }
    
    computeCss(node){
    
        let css={};
    
        console.log('NODE',typeof node.position.right);
    
        css.color = node.color || '#ffffff';
        css['background-color'] = node['background-color'] || '#ffffff';
        css.position = node.size.position || 'absolute';
        css.width = node.size.width || '100px';
        css.height = node.size.height || '100px';
        css.left = node.position.left || 'unset';
        css.right = node.position.right || 'unset';
        css.top = node.position.top || 'unset';
        css.bottom = node.position.bottom || 'unset';
        css['z-index'] = node.position['z-index'] || 555;

        let cssTxt='';
        for(let prop in css){
            cssTxt=`${cssTxt}${prop}:${css[prop]};`;
        }
        return cssTxt;
    }

    render(index){
        let node = this.vdom[index];
        let id  = this.vdom[index].key;
        
        if(node.rendered ===false){
         let embededStyle=this.computeCss(node.initial);
         let html=`<div id="${id}" style="${embededStyle}"></div>`;        
         
         console.log('Renderizando',embededStyle,html);
         this.vdom[index].rendered=true;
         this.dom.root.insertAdjacentHTML('beforeend',html);
        }
    }

}