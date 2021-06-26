/*jshint unused:false*/
'use strict';
let IceTemplateSystem = function () {
    this.render = function (name, template, view, parse) {
        Mustache.parse(template);
        let r = Mustache.render(template, view);
        return r;
    };
};