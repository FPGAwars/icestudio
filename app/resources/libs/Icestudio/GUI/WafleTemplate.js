'use strict';
class WafleTemplate {
    render (template, data) {
        Mustache.parse(template);
        let r = Mustache.render(template, data);
        return r;
    };
    
}