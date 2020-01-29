
'use strict';
var IcePlugManager=function(){

    this.pluginDir=false;
    this.pluginUri=false;
    this.plugins={};

    this.ebus=new IceEventBus();
    this.toload=0;
    this.onload=false;

    this.version=function(){

        console.log('Icestudio Plugin Manager v0.1');

    }

    this.setPluginDir=function(dir,callback){
        this.pluginDir=dir;
        let tu=dir.indexOf('resources');
        this.pluginUri=dir.substr(tu);
        this.load(callback);
    
    }

    
    this.load=function(callback){
        if(this.pluginDir===false) return false;
        
        this.onload=true;
        const fs = require('fs');

        fs.readdir(this.pluginDir, function(err, files) {
            this.toload=files.length;
            files.forEach(function(file) {
                    console.log('Plugin::add',file);
                    fs.readFile(this.pluginDir+'/'+file+'/manifest.json', 'utf8', function(err, contents) {
                        let mf= JSON.parse(contents);
                        if(mf !== false){
                            this.plugins[file]={'dir':file,'manifest':mf};
                        }
                        this.toload--;
                        if(this.toload==0){
                             this.onload=false;
                             if(typeof callback !== 'undefined'){
                                 callback();
                             }
                        }
                    }.bind(this));
            }.bind(this));
        }.bind(this));
    }

    this.getAll = function(){
        return this.plugins;
    }
    this.getBaseUri = function(){

        return this.pluginUri;
    }

    this.getById = function(id){
        if(typeof this.plugins[id] === 'undefined') return false;

        return this.plugins[id];
    }

    this.run=function(id){

        let plug=this.getById(id);

        if(plug === false){
            return false;
        }

        console.log('IcePlugManager::run '+id);
        nw.Window.open(this.pluginUri+'/'+id+'/index.html', {}, function(new_win) {
                // do something with the newly created window
                if(typeof plug.manifest.width !=='undefined'){
                    console.log('W:'+plug.manifest.width);
                    new_win.width=  plug.manifest.width;
                }
                if(typeof plug.manifest.height !=='undefined'){
                    console.log('H:'+plug.manifest.height);
                    new_win.height=  plug.manifest.height;
                }
                new_win.focus();

        });


    }

    this.init=function(){
        this.version();
    }

    this.init();

};

