/*jshint unused:false*/
'use strict';
var IceParametricHelper = function () {

    this.pair = function (A, B) {
        if (A.length !== B.length) {
            return false;
        }
        let paired = [];
        for (let i = 0; i < A.length; i++) {
            paired.push({
                source: {
                    id: A[i].id, 
                    port: A[i].name
                },
                target: {
                    id: B[i].id,
                    port: B[i].name
                }
            });
        }
        return paired;

    };
    this.place = function(block,x,y,x0,y0,w,h,padw,padh){
        
        if(typeof block.position === 'undefined') {
            block.position={x:0,y:0};
        }
        w=w+padw;
        h=h+padh;
        block.position.x=x*w+x0;
        block.position.y=y*h+y0;

        return block;

    };
    this.newId = function(prefix){
    
        const nodeSha1 = require('sha1');
      
        if (typeof prefix === 'undefined') {
            prefix='';
        }
        return nodeSha1(prefix + (new Date().getTime()) + Math.floor(Math.random() * 1000)).toString();
    };

    this.pins = function (n, prefix) {
        if (typeof prefix === 'undefined') {
            prefix = 'pin';
        }
       let group = [];
        for (let i = 0; i < n; i++) {
            group.push({
                id: this.newId(i),
                lastnode: false,
                index: i,
                name: prefix + i
            });

        }
        if (group.length > 0) {
            group[group.length - 1].lastnode = true;
        }
        return group;
    };

    this.inout = function (n, direction, xi, yi) {
        if (typeof xi === 'undefined') {
            xi = 64;
        }
        if (typeof yi === 'undefined') {
            yi = 80;
        }
        if (typeof direction === 'undefined') {
            direction = 'in';
        }
        let diffy = 80;
        let diffx = 0;
        const nodeSha1 = require('sha1');
        let group = [];
        for (let i = 0; i < n; i++) {
            group.push({
                id: nodeSha1(i + (new Date().getTime()) + Math.floor(Math.random() * 1000)).toString(),
                lastnode: false,
                index: i,
                name: direction,
                x: xi,

                y: yi
            });
            xi += diffx;
            yi += diffy;

        }
        if (group.length > 0) {
            group[group.length - 1].lastnode = true;
        }
        return group;
    };
};
