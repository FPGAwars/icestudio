/*jshint unused:false*/
/*jshint evil:true */
'use strict';


var IcePlugManager = function () {

    this.pluginDir = false;
    this.pluginUri = false;
    this.env = false;
    this.plugins = {};
    this.ebus = new IceEventBus();
    this.tpl = new IceTemplateSystem();
    this.parametric = new IceParametricHelper();
    this.toload = 0;
    this.onload = false;
    this.embeds = [];

    this.version = function () {
        console.log('Icestudio Plugin Manager v0.1');
    };

    this.UUID = function () {
        let array = new Uint32Array(8)
        window.crypto.getRandomValues(array)
        let str = ''
        for (let i = 0; i < array.length; i++) {
          str += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4)
        }
        return str
      };

    this.setEnvironment = function (common) {
        this.env = common;
    };

    this.pluginsLoaded = function (callback) {
        
        /* Order plugins by key, because plugins loaded asyncronously and 
           object hash maintain createion order and sorting this keys is not
           standard */
        
           let ordered=[];
        for(let prop in this.plugins){
            ordered.push({
                key:prop,
                obj:this.plugins[prop]

            });
        }

        ordered.sort(function(a,b){

            if (a.key > b.key) {
                return 1;
              }
              if (a.key < b.key) {
                return -1;
              }
              return 0;            
        });

        let lordered = ordered.length;
        this.plugins={};

        for(let i=0;i<lordered;i++){
            this.plugins[ordered[i].key]=ordered[i].obj;
        }
        if (typeof callback !== 'undefined') callback();
    }

    this.setPluginDir = function (dir, callback) {
        this.pluginDir = dir;
        let tu = dir.indexOf('resources');
        this.pluginUri = dir.substr(tu);
        this.load(callback);
    };

    this.isFactory = function (name) {
        if (typeof this.plugins[name] !== 'undefined' &&
            this.plugins[name].manifest.type === 'factory') {
            return true;
        }
        return false;
    };

    this.runFactory = function (name, str, params, callback) {
        str = this.plugins[name].factory(str, params);
        let b = JSON.parse(str);

        if (b) {
            callback(b);

        } else {
            callback(false);
        }
    };

    this.promptFactory = function (name, str, callback) {

        //get the closable setting value.
        let _currentFactory = this.plugins[name];
        let excel = false;
        let _this = this;
        alertify.alert().setting({
            'label': 'Generate',
            'modal': true,
            'movable': true,
            'maximizable': true,
            'message': '<div class="icepm-params-desc" style="margin-bottom:20px;"><p>Configure your parametric block:</p></div><div id="icepm-params-table"></div>',
            'onok': function () {
                let p = excel.getData();

                excel.destroy(true);
                _this.runFactory(name, str, p, callback);
                // alertify.success('Parametric block ready');
            },
            onshow: function () {

                $('#icepm-params-table').empty();
                excel = jexcel(document.getElementById('icepm-params-table'), _currentFactory.params);
            }
        }).show();
    };

    this.factory = function (name, str, callback) {
        if (this.isFactory(name)) {
            if (typeof this.plugins[name].factory === 'undefined') {

                const fs = require('fs');
                let contents = fs.readFileSync(this.pluginDir + '/' + name + '/main.js', "utf8");
                /* function ab2str(buf) {
                      return String.fromCharCode.apply(null, new Uint16Array(buf));
                  }*/
                //let code=ab2str(contents);
                eval(contents);
                this.promptFactory(name, str, callback);
            } else {
                this.promptFactory(name, str, callback);
            }
        } else {
            callback(false);
        }
    };

    this.paramsFactory = function (name, paramsDef) {
        if (!this.isFactory(name)) {
            return false;
        }
        this.plugins[name].params = paramsDef;
    };

    this.registerFactory = function (name, callback) {
        if (!this.isFactory(name)) {
            return false;
        }
        this.plugins[name].factory = callback;
    };

    this.load = function (callback) {
        if (this.pluginDir === false) {
            return false;
        }

        this.onload = true;
        const fs = require('fs');
        let _this = this;
        fs.readdir(this.pluginDir, function (err, files) {
            this.toload = files.length;
            files.forEach(function (file) {
                fs.readFile(this.pluginDir + '/' + file + '/manifest.json', 'utf8', function (err, contents) {
                    let mf = JSON.parse(contents);
                    if (mf !== false) {
                        this.plugins[file] = {
                            'dir': file,
                            'manifest': mf
                        };
                    }
                    this.toload--;
                    if (this.toload === 0) {
                        this.onload = false;
                        _this.pluginsLoaded(callback);
                    }
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };

    this.getAll = function () {
        return this.plugins;
    };

    this.getBaseUri = function () {
        return this.pluginUri;
    };

    this.getById = function (id) {
        if (typeof this.plugins[id] === 'undefined') {
            return false;
        }
        return this.plugins[id];
    };

    this.isRunEmbedded = function(id){

        for(let i=0;i<this.embeds.length;i++){
            if(this.embeds[i].key===id) return true;
        }        
        return false;
    };

    this.launchEmbedded = function (id, plug, env) {
        
        let pid=`${id}-${this.UUID()}`;
        let _this=this;
        plug.id = pid;
        plug.key=id;
        plug.env = env;
        plug.worker = new Worker(`${this.pluginUri}/${plug.key}/${plug.key}.js`);
        plug.gui = new IceGUI(plug.worker);
        plug.worker.addEventListener('message', function (e) {

            let data = JSON.parse(e.data);

            if (data) {
                if (typeof data.type !== 'undefined') {
                    if (data.type === 'eventBus') {
                    
                        console.log(`EBUS::${data.event}`, data.payload);
                        _this.ebus.fire(data.event,data.payload);
                    
                    } else if (data.type === 'guiBus') {
                       
                        console.log(`GBUS::${data.event}`, data.payload);
                    
                        let nplugins = _this.embeds.length;
                      
                        for(let i=0;i<nplugins;i++){
                            if(_this.embeds[i].id === data.payload.id){
                                if(typeof _this.embeds[i].gui[data.event] !== 'undefined'){
                                    _this.embeds[i].gui[data.event](data.payload);
                                }
                                i=nplugins;
                            }
                        }
                    } else {
                        console.log(`UNKNOWN BUS ${data.type}::${data.event}`, data.payload);
                    }
                }
            }
        }, false);
       
        this.embeds.push(plug);
        
        /* Send config parameters */

        plug.worker.postMessage(JSON.stringify(
                            {
                                type: "eventBus",
                                event: 'plugin.initialSetup',
                                payload:{
                                            env:plug.env,
                                            id:plug.id,
                                            manifest:plug.manifest       
                                        }
                                }
                           ));

    };

    this.launchOnNewWindow = function (id, plug, env) {

        nw.Window.open(this.pluginUri + '/' + id + '/index.html', {}, function (newWin) {

            if (typeof plug.manifest.width !== 'undefined') {
                newWin.width = plug.manifest.width;
            }
            if (typeof plug.manifest.height !== 'undefined') {
                newWin.height = plug.manifest.height;
            }
            newWin.focus();
            // Listen to main window's close event
            newWin.on('close', function () {
                if (typeof this.window.onClose !== 'undefined') {
                    this.window.onClose();
                }
                this.close(true);
            });

            newWin.on('loaded', function () {
                let filter = ['WIN32', 'LINUX', 'DARWIN', 'VERSION', 'LOGFILE', 'BUILD_DIR'];
                let envFiltered = {};
                for (let prop in env) {
                    if (filter.indexOf(prop) > -1) {
                        envFiltered[prop] = env[prop];
                    }
                }
                if (typeof this.window.onLoad !== 'undefined') {
                    this.window.onLoad(envFiltered);
                }
            });
        });
    };

    this.run = function (id) {

        let plug = this.getById(id);
        if (plug === false) {
            return false;
        }
        console.log('Plugin::run::', plug);
        if (typeof plug.manifest.gui !== 'undefined' && plug.manifest.gui.type === 'embedded') {
            let launch=true;
            if(typeof plug.manifest.multipleInstances !=='undefined' && 
            plug.manifest.multipleInstances === false &&
            this.isRunEmbedded(id)){
                 launch=false;
            }
            
            if(launch) this.launchEmbedded(id, plug, this.env);
            else console.log('Its running yet');
        } else {
            this.launchOnNewWindow(id, plug, this.env);
        }
    };

    this.terminate = function(data){
        for(let i=0;i<this.embeds.length;i++){

            if(this.embeds[i].id===data.id){
                this.embeds[i].gui.terminate();
                this.embeds.splice(i, 1);
                return;
            }
        }
    };

    this.init = function () {
        this.version();
        this.ebus.subscribe('plugin.terminate','terminate',this);
    };

    this.init();
};