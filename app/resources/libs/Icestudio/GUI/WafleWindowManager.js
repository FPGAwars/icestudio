'use strict';

class WafleWindowManager {
    constructor() {
        this.windows = {};
        this.init();
    }

    _registerWindowDragAndDrop() {

        function draggableFilter(e) {
            if (!e.target.classList.contains("ics-wm__is-draggable")) {
                return;
            }
            let dragContainer = e.target.getAttribute('data-dragcontainerid');
            let target = iceStudio.gui.el(dragContainer);
            target.moving = true;

            //-- First check if mouse input exists, if not , we suppose you have a touch input
            if (e.clientX) {
                target.oldX = e.clientX; 
                target.oldY = e.clientY;
            } else {
                //-- Use the 0 index for the first touch, for the momment we dont use multiple touchs
                target.oldX = e.touches[0].clientX;
                target.oldY = e.touches[0].clientY;
            }

            target.oldLeft = window.getComputedStyle(target).getPropertyValue('left').split('px')[0] * 1;
            target.oldTop = window.getComputedStyle(target).getPropertyValue('top').split('px')[0] * 1;

            // Update Ton drag
            document.onmousemove = dragUpdate;
            document.ontouchmove = dragUpdate;

            function dragUpdate(event) {
                event.preventDefault();

                if (!target.moving) {
                    return;
                }
                if (event.clientX) {
                    target.distX = event.clientX - target.oldX;
                    target.distY = event.clientY - target.oldY;
                } else {
                    target.distX = event.touches[0].clientX - target.oldX;
                    target.distY = event.touches[0].clientY - target.oldY;
                }
                target.style.left = target.oldLeft + target.distX + "px";
                target.style.top = target.oldTop + target.distY + "px";
            }

            function endDrag() {
                target.moving = false;
            }
            target.onmouseup = endDrag;
            target.ontouchend = endDrag;
        }
        document.onmousedown = draggableFilter;
        document.ontouchstart = draggableFilter;
    }
    
    init() {
        this._registerWindowDragAndDrop();
    }
    
    addWindow(title, id) {
        if (typeof this.windows[id] === 'undefined') {
            let _this = this;
            this.windows[id] = new WafleUIWindow({
                id: id,
                title: title,
                top: '30px',
                bottom: '48px',
                htmlClass: 'ics-wm-window'
            });
        }
    }
    closeWindow(id) {
        console.log('Cerrando', id);
        iceStudio.bus.events.publish(`${id}::Terminate`, false, id);
        delete this.windows[id];
    }
}