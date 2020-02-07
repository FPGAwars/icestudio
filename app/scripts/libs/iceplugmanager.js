'use strict';
var IcePlugManager=function(){

    this.pluginDir=false;
    this.pluginUri=false;
    this.plugins={};

    this.ebus=new IceEventBus();
    this.tpl=new IceTemplateSystem();
    this.parametric = new IceParametricHelper();
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

    this.isFactory = function(name){
        if(typeof this.plugins[name] !== 'undefined' &&
            this.plugins[name].manifest.type =='factory') return true;
        return false; 
    }
    
    this.runFactory= function (name,str,callback){
                str=this.plugins[name].factory(str);
                let b= JSON.parse(str);
                callback(b);
    }

   this.factory = function(name, str,callback){
                let b=false;
                if(this.isFactory(name)){
                   if(typeof this.plugins[name].factory ==='undefined'){

                        const fs = require('fs');
                        let contents=fs.readFileSync(this.pluginDir+'/'+name+'/main.js');
                        function ab2str(buf) {
                             return String.fromCharCode.apply(null, new Uint16Array(buf));
                         }
                        let code=ab2str(contents);
                        eval(code);
                        this.runFactory(name,str,callback);
                   
                   
                    }else{
                        this.runFactory(name,str,callback);
                    }
         
            }
        callback(b);
    }
    this.registerFactory=function(name,callback){
        if(!this.isFactory(name)) return false;

        this.plugins[name].factory=callback;
    }

    this.load=function(callback){
        if(this.pluginDir===false) return false;
        
        this.onload=true;
        const fs = require('fs');

        fs.readdir(this.pluginDir, function(err, files) {
            this.toload=files.length;
            files.forEach(function(file) {
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

        nw.Window.open(this.pluginUri+'/'+id+'/index.html', {}, function(new_win) {
         
                if(typeof plug.manifest.width !=='undefined'){
                    new_win.width=  plug.manifest.width;
                }
                if(typeof plug.manifest.height !=='undefined'){
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

