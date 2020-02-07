'use strict';
var IceTemplateSystem=function(){
    this.render=function(name,template,view,parse){
        Mustache.parse(template);
        let r=  Mustache.render(template, view);
        return r;    
    }
}
