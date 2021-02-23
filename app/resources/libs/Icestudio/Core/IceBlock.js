'use strict';
/*jshint unused:false*/
class IceBlock {
  constructor(opts) {
    this.constants = {
    };
    this.config = opts || {};
    this.fs = new IceHD();
    this.content=false;
  }

  loadFromFile(path,onLoadOK, onLoadERROR){
    let _this=this;
    this.content= this.fs.readFile(path,function(filepath,content){
            _this.content=content;
            onLoadOK(_this.get());
    },onLoadERROR); 
  }

  busLoadFromFile(args){

    //console.log('BLOCK LOAD FILE FROM BUS',args);
    this.fs.readFile(args.path,function(path,content){

        args.obj=JSON.parse(content);
        ICEpm.publishAt(args.id,'block.loadedFromFile',args);
    });
  }

  get(){

    return this.content;
  }
}