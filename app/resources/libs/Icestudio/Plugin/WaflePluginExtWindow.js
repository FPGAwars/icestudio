'use strict';

class WaflePluginExtWindow extends WaflePlugin {
    constructor(args) {
        super(args);
        this.window = false;
    }
    run() {
        if (this.isRunning()) {

            console.log('Plugin is running');
        } else {
            this.running = true;
            let _this = this;
            nw.Window.open(this.uri() + '/' + this.id() + '/index.html', {}, function (newWin) {

                if (typeof _this.manifest.width !== 'undefined') {
                    newWin.width = _this.manifest.width;
                }
                if (typeof _this.manifest.height !== 'undefined') {
                    newWin.height = _this.manifest.height;
                }

                newWin.focus();

                newWin.on('close', function () {
                    if (typeof this.window.onClose !== 'undefined') {
                        this.window.onClose();
                    }
                    this.close(true);
                    _this.running=false;
                });

                newWin.on('loaded', function () {
                    let JSfileNames = ['/resources/libs/Icestudio/Plugin/Api/Window/BindingWafleEventBus.js',
                        '/resources/libs/Icestudio/Plugin/Api/Window/IcestudioPlugin.js'

                    ];
                    this.window.pluginID = _this.id();
                    let js = [];
                    for (let i = 0; i < JSfileNames.length; i++) {
                        js[i] = document.createElement('script');
                        js[i].setAttribute('type', 'text/javascript');

                        js[i].src = JSfileNames[i];
                        newWin.window.document.body.appendChild(js[i]);
                    }

                    if (typeof this.window.onLoad !== 'undefined') {
                        this.window.onLoad();
                    }
                });

                _this.window = newWin;
            });
        }//--END run
    }
}