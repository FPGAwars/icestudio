/*jshint unused:false*/
"use strict";
class IceGUI {
  constructor(worker) {
    this.worker = worker || false;
    this.vdom = [];
    this.dom = {
      root: this.el("body")[0],
      menu: this.el("#menu"),
      footer: this.el(".footer.ice-bar")[0],
    };

    this.sandbox();
    this.registerEvents();
  }

  publish(evt, data) {
    this.worker.postMessage(
      JSON.stringify({
        type: "guiBus",
        event: evt,
        payload: data,
      })
    );
  }

  sandbox() {
    this.dom.height =
      window.innerHeight -
      (this.elHeight(this.dom.menu) + this.elHeight(this.dom.footer));
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
    let cssComp = getComputedStyle(document.documentElement);
    let cssSandbox = {
      height: cssComp.getPropertyValue("--sandbox-height"),
      width: cssComp.getPropertyValue("--sandbox-width"),
    };
  }

  eventClick(e) {
    // e.preventDefault();
    // e.stopPropagation();
    let args = false;
    if (typeof e.target.dataset.args !== 'undefined') {
      args = JSON.parse(e.target.dataset.args);
    }
    this.publish(`gui.click.${e.target.dataset.handler}`, args);
    // return false;
  }
  eventInput(e) {
    let args = false;
    if (typeof e.target.dataset.args !== 'undefined') {
      args = JSON.parse(e.target.dataset.args);
    }

    args.checked = e.target.checked;
    this.publish(`gui.checkbox.${e.target.dataset.handler}`, args);

  }


  registerEvents() {
    let _this = this;

    function eventResize(e) {
      _this.sandbox();
    }

    window.removeEventListener("resize", eventResize);
    window.addEventListener("resize", eventResize);

    // save the click handler so it can be used in multiple places
    this.clickHandler = this.eventClick.bind(this);
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
    }

  }

  terminate() {

    for (let i = 0; i < this.vdom.length; i++) {
      if (this.vdom[i].parent === false) {
        this.vdom[i].dom.remove();
      }
    }

  }

  updateEl(args) {
    let aux = false;
    for (let i = 0; i < this.vdom.length; i++) {
      aux = this.el(args.el, this.vdom[i].dom);
      for (let j = 0; j < aux.length; j++) {
        aux[j].innerHTML = args.content;
      }
    }
    this.update();
  }

  createRootNode(args) {
    let id = args.id;
    let conf = args.node;
    let vnode = {
      key: id,
      initial: conf,
      parent: false,
      updated: false,
      rendered: false,
      stylesheet: false,
      html: false,
    };

    if (typeof args.stylesheet !== "undefined") {
      vnode.stylesheet = args.stylesheet;
    }
    if (typeof args.initialContent !== "undefined") {
      vnode.html = args.initialContent;
    }

    this.vdom.push(vnode);

    this.update();
  }

  gbusToggleClass(args) {
    let root = false;
    for (let i = 0; i < this.vdom.length; i++) {
      if (this.vdom[i].key === args.id) {
        root = i;
        i = this.vdom.length + 1;
      }
    }
    let domNodes = this.el(args.el, this.vdom[root].dom);
    for (let j = 0; j < domNodes.length; j++) {
      this.elToggleClass(domNodes[j], args.elClass);
    }
  }

  gbusAddClass(args) {
    let root = false;
    for (let i = 0; i < this.vdom.length; i++) {
      if (this.vdom[i].key === args.id) {
        root = i;
        i = this.vdom.length + 1;
      }
    }
    let domNodes = this.el(args.el, this.vdom[root].dom);
    for (let j = 0; j < domNodes.length; j++) {
      this.elAddClass(domNodes[j], args.elClass);
    }
  }

  gbusAddClassToParents(args) {
    let root = false;
    for (let i = 0; i < this.vdom.length; i++) {
      if (this.vdom[i].key === args.id) {
        root = i;
        i = this.vdom.length + 1;
      }
    }
    let domNodes = this.el(args.el, this.vdom[root].dom);
    let parents=false;
    let parentRoot = this.el(args.parentRoot,this.vdom[root].dom);
    for (let j = 0; j < domNodes.length; j++) {
      parents=this.elGetParents(domNodes[j], parentRoot);
      for(let k=0;k<parents.length;k++){
        if(this.elHasClass(parents[k],args.parentClass)){
          this.elAddClass(parents[k], args.elClass);
        }
      }
      
    }
  }


  el(selector, root) {
    let selectorType = "querySelectorAll";
    let multiple = true;
    if (selector.indexOf("#") === 0) {
      selectorType = "getElementById";
      selector = selector.substr(1, selector.length);
      multiple = false;
    }
    let list = (typeof root !== 'undefined') ? root.shadowRoot[selectorType](selector) : document[selectorType](selector);
    return list;
  }

  elGetParents(el, parentSelector) {

  console.log(el,parentSelector)

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

  elToggleClass(el, classname) {
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
  elHasClass(el, className) {
    if (el.classList) {
      return el.classList.contains(className);
    }
    return !!el.className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"));
  }

  elAddClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else if (!this.elHasClass(el, className)) {
      el.className += " " + className;
    }
  }

  elRemoveClass(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else if (this.elHasClass(el, className)) {
      var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
      el.className = el.className.replace(reg, " ");
    }
  }

  elHeight(el) {
    let style = window.getComputedStyle
      ? getComputedStyle(el, null)
      : el.currentStyle;

    return (
      el.offsetHeight +
      (parseInt(style.marginTop) || 0) +
      (parseInt(style.marginBottom) || 0)
    );
  }

  update() {
    let nodes = this.vdom.length;

    for (let i = 0; i < nodes; i++) {
      if (this.vdom[i].updated === false) {
        this.render(i);
        this.vdom[i].updated = true;
      }
    }
    this.registerEvents();
    this.publish("gui.update", { log: true });
  }

  computeCss(node) {
    let css = {};

    css.color = node.color || false;
    css["background-color"] = node["background-color"] || false;
    css.position = node.size.position || false;
    css.width = node.size.width || false;
    css.height = node.size.height || false;
    css.left = node.position.left || false;
    css.right = node.position.right || false;
    css.top = node.position.top || false;
    css.bottom = node.position.bottom || false;
    css["z-index"] = node.position["z-index"] || 555;

    if (css.height) {
      css.height = `calc(${css.height} - var(--sandbox-menu-plus-footer-height))`;
    }

    if (css.top) {
      css.top = `calc(${css.top} + var(--sandbox-menu-height))`;
    }

    if (css.bottom) {
      css.bottom = `calc(${css.bottom} + var(--sandbox-footer-height))`;
    }

    let cssTxt = "";
    for (let prop in css) {
      if (css[prop]) cssTxt = `${cssTxt}${prop}:${css[prop]};`;
    }
    return cssTxt;
  }

  render(index) {
    let node = this.vdom[index];
    let id = this.vdom[index].key;

    if (node.rendered === false) {
      let embededStyle = this.computeCss(node.initial);
      let html = `<div id="${id}" style="${embededStyle}"></div>`;

      this.vdom[index].rendered = true;
      this.dom.root.insertAdjacentHTML("beforeend", html);
      this.vdom[index].dom = this.el(`#${id}`);

      let wrapper = document.createElement("div");
      wrapper.setAttribute("class", "wrapper");

      if (node.html) {
        wrapper.innerHTML = node.html;
      }

      let shadow = this.vdom[index].dom.attachShadow({ mode: "open" });
      if (node.stylesheet) {
        let style = document.createElement("style");

        style.textContent = node.stylesheet;
        shadow.appendChild(style);
      }
      shadow.appendChild(wrapper);
    }
  }
}
