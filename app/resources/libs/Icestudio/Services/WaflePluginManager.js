'use strict';

class WaflePluginManager {

    constructor() {
        this.ver = "1.0";
        this.env = {};
        this.pluginDir = false;
        this.pluginUri = false;
        this.plugins = {};
        this.toload = 0;
        this.onload = false;


        // We suppose that iceStudio global object exists and it is initialized
        // iceStudio.bus.events.subscribe('plugin.terminate', 'terminate', this);
        //  iceStudio.bus.events.subscribe('plugin.cache', 'cache', this);
        //  iceStudio.bus.events.subscribe('plugin.cached', 'cached', this); 
    }

    init() {
        iceStudio.bus.events.subscribe('pluginManager.getEnvironment', 'getEnvironmentBus', this);
        iceStudio.bus.events.subscribe('pluginManager.getPluginList', 'getPluginListBus', this);
        iceStudio.bus.events.subscribe('pluginManager.launch', 'launch', this);
    }

    version() {
        return this.ver;
    }

    getEnvironmentBus() {
        iceStudio.bus.events.publish('pluginManager.env', this.env);
    }

    getEnvironment() {
        return this.env;
    }


    setEnvironment(env) {
        this.env = env;
        iceStudio.bus.events.publish('pluginManager.updateEnv', this.env);
    }

    setPluginDir(dir, callback) {
        this.pluginDir = dir;
        let tu = dir.indexOf('resources');
        this.pluginUri = dir.substr(tu);
        this.load(callback);
    }

    getPluginListBus() {
        iceStudio.bus.events.publish('pluginManager.pluginList', this.getPluginList());
    }

    getPluginList() {
        let plist = [];
        let tmp = {};

        for (let pluginId in this.plugins) {
            tmp = {};
            tmp.id = this.plugins[pluginId].manifest.id;
            tmp.name = this.plugins[pluginId].manifest.name;
            tmp.author = this.plugins[pluginId].manifest.author;
            tmp.version = this.plugins[pluginId].manifest.version;
            tmp.uri = `/${this.plugins[pluginId].pluginUri}/${this.plugins[pluginId].dir}/`;
            tmp.icon = `${tmp.uri}${this.plugins[pluginId].manifest.icon}`;
            tmp.running = this.plugins[pluginId].running;
            tmp.capability = (typeof this.plugins[pluginId].manifest.capability !== 'undefined') ? this.plugins[pluginId].manifest.capability : [];
            plist.push(tmp);
        }

        return plist;
    }

    load(callback, ownerCallback) {
        if (this.pluginDir === false) {
            return false;
        }

        this.onload = true;
        const fs = require('fs');
        let _this = this;
        fs.readdir(this.pluginDir, function (err, files) {
            _this.toload = files.length;
            files.forEach(function (file) {
                fs.readFile(_this.pluginDir + '/' + file + '/manifest.json', 'utf8', function (err, contents) {
                    let mf = JSON.parse(contents);

                    if (mf !== false) {

                        let args = {
                            'dir': file,
                            'manifest': mf,
                            'pluginUri': _this.pluginUri
                        }

                        if ((typeof args.manifest.gui !== 'undefined' &&
                            typeof args.manifest.gui.type !== 'undefined' &&
                            args.manifest.gui.type === 'window') ||
                            typeof args.manifest.gui === 'undefined') {

                            _this.plugins[file] = new WaflePluginExtWindow(args);

                        } else if (typeof args.manifest.gui !== 'undefined' &&
                            typeof args.manifest.gui.type !== 'undefined' &&
                            args.manifest.gui.type === 'embedded') {

                            if (typeof args.manifest.gui.windowed === 'undefined' ||
                                args.manifest.gui.windowed === false) {

                                _this.plugins[file] = new WaflePluginExtEmbedded(args);

                            } else {
                                _this.plugins[file] = new WaflePluginExtEmbeddedWindowed(args);
                            }
                        } else if(typeof args.manifest.gui !== 'undefined' &&
                                typeof args.manifest.gui.type !== 'undefined' &&
                                args.manifest.gui.type === 'service'){
                                _this.plugins[file] = new WaflePluginExtService(args);
                        }else {
                            _this.plugins[file] = new WaflePlugin(args);
                        }
                    }

                    _this.toload--;

                    if (_this.toload === 0) {
                        _this.onload = false;
                        _this.pluginsLoaded(callback, ownerCallback);
                    }
                });
            });
        });
    }

    pluginsLoaded(callback, ownerCallback) {

        /* Order plugins by key, because plugins loaded asyncronously and 
           object hash maintain creation order and sorting this keys is not
           standard */

        let ordered = [];
        for (let prop in this.plugins) {
            ordered.push({
                key: prop,
                obj: this.plugins[prop]

            });
        }

        ordered.sort(function (a, b) {

            if (a.key > b.key) {
                return 1;
            }
            if (a.key < b.key) {
                return -1;
            }
            return 0;
        });

        let lordered = ordered.length;
        this.plugins = {};
        let i = 0;
        for (i = 0; i < lordered; i++) {
            this.plugins[ordered[i].key] = ordered[i].obj;
        }
        for (let key in this.plugins) {
            if (typeof this.plugins[key].manifest.launchAtStartup !== 'undefined' &&
                this.plugins[key].manifest.launchAtStartup === true) {
                this.plugins[key].run();
            }
        }
        if (typeof callback !== 'undefined') {
            if (typeof ownerCallback === 'undefined' || ownerCallback === false) {
                callback();
            } else {

                ownerCallback[callback]();
            }
        }
    } //--END pluginsLoaded

    launch(pluginId) {
        if (typeof this.plugins[pluginId] !== 'undefined') {
            this.plugins[pluginId].run();
        }
    }
}