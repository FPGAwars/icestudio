/*jshint unused:false*/
'use strict';
var IceEventBus = function () {

    this.events = {};


    this.subscribe = function (event, callback, target) {

        if (typeof this.events[event] === 'undefined') {
            this.events[event] = [];
        }
        if (typeof target === 'undefined') {
            target = false;
        }
        this.events[event].push({
            'target': target,
            'callback': callback
        });

    };

    this.fire = function (event, args) {
        if (typeof this.events[event] !== 'undefined') {

            for (let i = (this.events[event].length - 1), n = -1; i > n; i--) {
                if (this.events[event][i].target === false) {
                    this.events[event][i].callback(args);
                } else {
                    this.events[event][i].target[this.events[event][i].callback](args);
                }
            }
        }
    };

    this.version = function () {
        console.log('Icestudio event bus 1.0');
    };

    this.init = function () {
    };

    this.init();
};