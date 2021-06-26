'use strict';

const marked = require('marked');
const openurl = require('openurl');
const fs = require('fs');

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

var renderer = new marked.Renderer();
renderer.link = function (href, title, text) {
    var out = '<a href="javascript:void(0);"';
    if (title) {
    out += ' title="' + title + '"';
    }
    out += ' onclick="openurl.open(\'' + href + '\')"';
    out += '>' + text + '</a>';
    return out;
};

window.onload = function() {
    
    const options = { renderer: renderer };

    //-- Get the readme filename
    const readme_filename = getURLParameter('readme');
    
    //-- Read the readme file
    const text = fs.readFileSync(readme_filename,'utf8'); 

    //-- Render de markdown file
    if (text) {
      document.getElementById('content').innerHTML = marked(text, options);
    }
};
