'use strict';

class WafleRemoteFile {

    get(url) 
    {
        return new Promise(function (resolve, reject) {
            fetch(url)
                .then(response => response.text())
                .then(text => {
                    resolve(text);
                });
        });
    }

    getAll(urls)
    {
        let _this=this;
        let queries= urls.map(url => _this.get(url));
        return Promise.all(queries);
    }
}