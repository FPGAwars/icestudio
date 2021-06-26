/* exported iprof */

'use strict';

var IceProfiler=function(){
    
    this.measures={};
    this.stats={};

    this.start=function(label){
       this.measures[label]={
                                t0: performance.now(),
                                t1:0,
                                elapsed:-1
                            };
    };

    this.end=function(label){

        this.measures[label].t1= performance.now();
        this.measures[label].elapsed = this.measures[label].t1 - this.measures[label].t0;

        if(typeof this.stats[label] === 'undefined'){
            this.stats[label]={acc:0.0,
                               n:0};            
        }
      
        this.stats[label].acc += this.measures[label].elapsed;
        this.stats[label].n++;
    };
};

var iprof = new IceProfiler();



