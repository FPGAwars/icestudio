'use strict';

class WafleGUI {

  constructor(onLoad) 
  {
    this.dom = {
      root: false,
      menu: false,
      footer: false,
      height: 0,
      width: 0
    };

    this.template = new WafleTemplate();
    this.wm = new WafleWindowManager();
    this.onLoad = (typeof onLoad === 'undefined') ? this.dummy : onLoad;
    this.init();
  }

  dummy() { }

  init() 
  {
    this.dom = {
      root: this.el("body")[0],
      menu: this.el("#menu"),
      footer: this.el(".footer.ice-bar")[0],
      height: 0,
      width: 0
    };

    //-- Its needed  to wait for framework initialization and Icestudio ui elements exists
    let retry = false;

    if (this.dom.root === false || this.dom.root === null ||
      this.dom.menu === false || this.dom.menu === null ||
      this.dom.footer === false || this.dom.footer === null) {

      retry = true;
    }

    if (retry === false) {

      if (this.elHeight(this.dom.menu) === 0) retry = true;

    }

    if (retry) {

      let _this = this;
      setTimeout(function () {
        _this.init();
      }, 1000);

    } else {
      this.sandbox();
      this.registerEvents();
      this.onLoad();
    }
  }

  getNode(id)
  {
    return this.el(`#${id}`);
  }

  addDiv(id, cssClasses,content)
  {
    let html = `<div id="${id}" class="${cssClasses}">${content}</div>`;
    this.dom.root.insertAdjacentHTML("beforeend", html);
    return this.getNode(id);
  }


  addNode(id, cssClasses)
  {
    let html = `<div id="${id}" class="${cssClasses}"></div>`;
    this.dom.root.insertAdjacentHTML("beforeend", html);
    let node = this.el(`#${id}`);
    let shadow = node.attachShadow({ mode: "open" });
    shadow.innerHTML = '';
    return shadow;
  }

  addNodeTo(rootId,id,cssClasses)
  {
    let html = `<div id="${id}" class="${cssClasses}"></div>`;
    let root = this.el(`#${rootId}`);
    root.insertAdjacentHTML("beforeend", html);
    
    let node = this.el(`#${id}`);
    let shadow = node.attachShadow({ mode: "open" });
    shadow.innerHTML = '';
    return shadow;
  }
  addNodeToSelector(selector,id,cssClasses)
  {
    let html = `<div id="${id}" class="${cssClasses}"></div>`;
    let root = this.el(selector);
    console.log('SELECTOR',selector, root);
    root[0].insertAdjacentHTML("beforeend", html);
    let node = this.el(`#${id}`);
    let shadow = node.attachShadow({ mode: "open" });
    shadow.innerHTML = '';
    return shadow;
  }


  removeNode(elNode){
    elNode.parentNode.removeChild(elNode);
  }

  setNodeContent(shadow, html)
  {
    shadow.innerHTML = html;
  }

  setNodeStyle(shadow, css)
  {
    let style = document.createElement("style");
    style.textContent = css;
    shadow.appendChild(style);
  }
  
  setNodeScript(rootId,uuid,shadow, scripts,views) 
  {
    if(typeof views === 'undefined' ){
        views={};
    } 

    let scriptnode = document.createElement('script');
    scriptnode.setAttribute("id", `scriptnode-${uuid}`);
    let code = `(function(win, doc, $,_self) {`;
    if (typeof views !== 'undefined' && views !== false){
         code=`${code}                     
               let pluginViews=${JSON.stringify(views)};`;
    }    
    if (typeof shadow !== 'undefined' && shadow !== false){
        code =`${code}
               let pluginRoot=$('#${rootId}')[0].shadowRoot;`;
    }
    code=`${code}
         let pluginUUID='${uuid}';
         ${scripts.join(';')}
         })(window, document, jQuery);`
    
    scriptnode.textContent = code;
    
    if(typeof shadow !== 'undefined' && shadow !== false){
      shadow.appendChild(scriptnode);
    }else{
      this.dom.root.appendChild(scriptnode);
    }
  }

  addGlobalStyle( id, css ) 
  {
    document.head.insertAdjacentHTML("beforeend", `<style id="plugin-host--${id}">${css}</style>`);
  }

  el(selector, root)
  {
    let selectorType = "querySelectorAll";
    let multiple = true;
  
    if (selector.indexOf("#") === 0 && selector.indexOf('.')<0) {
      selectorType = "getElementById";
      selector = selector.substr(1, selector.length);
      multiple = false;
    }
    let list = (typeof root !== 'undefined') ? root.shadowRoot[selectorType](selector) : document[selectorType](selector);
    return list;
  }

  elGetParents(el, parentSelector)
  {
    var parents = [];
    var p = el.parentNode;

    while (p !== parentSelector) {
      var o = p;
      parents.push(o);
      p = o.parentNode;
    }
    
    parents.push(parentSelector); // Push that parentSelector you wanted to stop at
    return parents;
  }

  elToggleClass(el, classname)
  {
    if (el.classList) {
      el.classList.toggle(classname);
    } else {
      if (this.elHasClass(el, classname)) {
        this.elRemoveClass(el, classname);
      } else {
        this.elAddClass(el, classname);
      }
    }
  }
  
  elHasClass(el, className)
  {
    if (el.classList) {
      return el.classList.contains(className);
    }
    return !!el.className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"));
  }

  elAddClass(el, className)
  {
    if (el.classList) {
      el.classList.add(className);
    } else if (!this.elHasClass(el, className)) {
      el.className += " " + className;
    }
  }

  elRemoveClass(el, className)
  {
    if (el.classList) {
      el.classList.remove(className);
    } else if (this.elHasClass(el, className)) {
      var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
      el.className = el.className.replace(reg, " ");
    }
  }

  elHeight(el)
  {
    let style = window.getComputedStyle
      ? getComputedStyle(el, null)
      : el.currentStyle;

    return (
      el.offsetHeight +
      (parseInt(style.marginTop) || 0) +
      (parseInt(style.marginBottom) || 0)
    );
  }


  sandbox()
  {
    this.dom.height = window.innerHeight - (this.elHeight(this.dom.menu) + this.elHeight(this.dom.footer));
    
    this.dom.width = window.innerWidth;

    document.documentElement.style.setProperty(
      "--sandbox-height",
      `${this.dom.height}px`
    );

    document.documentElement.style.setProperty(
      "--sandbox-footer-height",
      `${this.elHeight(this.dom.footer)}px`
    );

    document.documentElement.style.setProperty(
      "--sandbox-menu-height",
      `${this.elHeight(this.dom.menu)}px`
    );

    document.documentElement.style.setProperty(
      "--sandbox-menu-plus-footer-height",
      `${this.elHeight(this.dom.menu) + this.elHeight(this.dom.footer)}px`
    );

    document.documentElement.style.setProperty(
      "--sandbox-width",
      `${this.dom.width}px`
    );

    /* Only for debug purpouses, check if styles are correct */
    //let cssComp = getComputedStyle(document.documentElement);
   // let cssSandbox = {
   //   height: cssComp.getPropertyValue("--sandbox-height"),
    //  width: cssComp.getPropertyValue("--sandbox-width"),
    //};
    //return cssSandbox;
  }

  eventResize()
  {
    this.sandbox();
  }
  
  registerEvents()
  {
    let _this = this;
    function bindedResize() {
      _this.eventResize();
    }

    window.removeEventListener("resize", bindedResize);
    window.addEventListener("resize", bindedResize);

    // save the click handler so it can be used in multiple places
    /*this.clickHandler = this.eventClick.bind(this);
    let clickel = false;
    for (let i = 0; i < this.vdom.length; i++) {
      clickel = this.el('[data-guievt="click"]', this.vdom[i].dom);
      for (let j = 0; j < clickel.length; j++) {
        clickel[j].removeEventListener("click", this.clickHandler, true);
        clickel[j].addEventListener("click", this.clickHandler, true);
      }
    }
    // save the click handler so it can be used in multiple places
    this.onInputHandler = this.eventInput.bind(this);
    for (let k = 0; k < this.vdom.length; k++) {
      clickel = this.el('[data-guievt="checkbox"]', this.vdom[k].dom);
      for (let l = 0; l < clickel.length; l++) {
        clickel[l].removeEventListener("change", this.onInputHandler, true);
        clickel[l].addEventListener("change", this.onInputHandler, true);
      }
    }*/

  }
}