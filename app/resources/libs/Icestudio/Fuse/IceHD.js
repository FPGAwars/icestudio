'use strict';
/*jshint unused:false*/

class IceHD {

    constructor() {

        this.fs = require('fs');
        this.path = require('path');
    }
    
    isValidPath(path){
        return this.fs.existsSync(path);
    }

    isDir(path) {
        return  this.fs.lstatSync(path).isDirectory();
    }
    isFile(path) {
        return this.fs.lstatSync(path).isFile();
    }

    isSymbolicLink(path) {
        return this.fs.lstatSync(path).isSymbolicLink();
    }

    joinPath(folder,name){
        return this.path.join(folder, name);
    }

    basename(filepath) {
        let b = this.path.basename(filepath);
        return (b.indexOf('.')<0)? b : b.substr(0, b.lastIndexOf('.'));
    }

    readDir(folder){
        let content=[];
        if(this.isValidPath(folder) && (this.isDir(folder) || this.isSymbolicLink(folder))){
            content=this.fs.readdirSync(folder);
        }
        return content;
        
    }

    getFilesRecursive(folder, level) {
        let _this=this;
        let fileTree = [];
        const validator = /.*\.(ice|json|md)$/;
        try {
            let content = this.fs.readdirSync(folder);
            level--;

            content.forEach(function (name) {
                let path = _this.joinPath(folder, name);
                if (_this.isValidPath(path) && _this.isDir(path)) {
                    fileTree.push({
                        name: name,
                        path: path,
                        children: (level >= 0) ? _this.getFilesRecursive(path, level) : []
                    });
                } else if (validator.test(name)) {
                    fileTree.push({
                        name: _this.basename(name),
                        path: path
                    });
                }
            });
        } catch (e) {
            console.warn(e);
        }

        return fileTree;
    }

    readFile(path, callback,callbackErr){
        if(this.isValidPath(path)){
            let content = this.fs.readFileSync(path).toString();
            callback(path,content);
        }else{
           if(typeof calbackErr !== 'undefined') callbackErr(path);
        }
    }
}