'use strict';
/*jshint unused:false*/

class IcePluginHelper {

    constructor() {
    }
    remoteFile(url) {
        return new Promise(function (resolve, reject) {
            fetch(url)
                .then(response => response.text())
                .then(cssText => {
                    resolve(cssText);
                });

        });
    }

    styleSheet(urls) {
       
        let _this = this;
        return new Promise(function (resolve, reject) {
            Promise.all(urls.map(function (url) {
                return _this.remoteFile(url);
            })).then(css => {
                const joiner = (accumulator, currentValue) => accumulator + currentValue;
                resolve(css.reduce(joiner));
            });
        });
    }
}