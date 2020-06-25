/**
 * Icetudio > Sigrok > Pulseview integration
 *
 * @category   icestudio Plugins
 * @package    iceRok
 * @author     Carlos Venegas (cavearr at github, @cavearr at twitter)
 * @copyright  2020 FPGAwars
 * @license    https://github.com/FPGAwars/icestudio/blob/develop/LICENSE  GPL v2
 * @version    1.0
 * @link       https://github.com/FPGAwars/icestudio/
 **/
//-- like jQuery, no compatibility with older browsers
window.$ = function(selector) {

    let selectorType = 'querySelectorAll';
    
    if (selector.indexOf('#') === 0) {
        selectorType = 'getElementById';
        selector = selector.substr(1, selector.length);
    }
  
    return document[selectorType](selector);
};

function elToggleClass(el,classname){
    if(el.classList){
        el.classList.toggle(classname);
    }else{
        if(elHasClass(el,classname)){

            elRemoveClass(el,classname);
        }else{
            elAddClass(el,classname);
        }

    }
}
function elHasClass(el, className) {
    if (el.classList){
        return el.classList.contains(className);
    }
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function elAddClass(el, className) {
    if (el.classList){
        el.classList.add(className)
    }else if (!hasClass(el, className)){
        el.className += " " + className;
    }
}

function elRemoveClass(el, className) {
    if (el.classList){
        el.classList.remove(className)
    }else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
}


