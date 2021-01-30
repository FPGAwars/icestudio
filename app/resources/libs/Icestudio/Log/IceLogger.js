'use strict';
/*jshint unused:false*/

class IceLogger {

    constructor(logfile, path) {
        this.fs = require('fs');
        this.path = require('path');
        this.file = logfile || 'icestudio.log';
        this.logPath = path || '';
        this.logFile = this.path.join(this.logPath, this.file);
        this.isEnable = false;
    }

    enable() {
        this.isEnable = true;
        console.log('Debug enable');
    }

    disable() {
        this.isEnable = false;
        console.log('Debug disable');
    }

    setPath(path, file) {
        this.logPath = path || this.logPath;
        this.file = file || this.file;
        this.logFile = this.path.join(this.logPath, this.file);
    }

    prettyPrint(obj) {
        let output = '';
        if (typeof obj != 'string') {
            output = JSON.stringify(obj, undefined, 2);
        } else {
            output = obj;
        }
        return output;
    }

    log(msg) {
        if (this.isEnable) {
            const txt = this.prettyPrint(msg);
            this.fs.appendFileSync(this.logFile, `${txt}\n`);
        }
    }
}
