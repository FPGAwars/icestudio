
angular.module('app')

.service('CombService', function CombService () {

    var fs = require('fs');
    var muxv = fs.readFileSync('js/blocks/comb/mux.v').toString();
    var decv = fs.readFileSync('js/blocks/comb/dec.v').toString();

    var exports = {};

    exports.addNewMuxNode = function (nodeID, callback) {
        var block = {
            label: "MUX",
            type: "mux",
            params: [],
            vcode: muxv,
            id: nodeID++,
            x: 50, y: 100,
            width: 150,
            inputConnectors: [
                { name: "c0", label: "c0" },
                { name: "c1", label: "c1" },
                { name: "sel", label: "sel" }
            ],
            outputConnectors: [
                { name: "o", label: "out" }
            ]
        };
        callback(block, nodeID);
    };

    exports.addNewDecNode = function (nodeID, callback) {
        var block = {
            label: "DEC",
            type: "dec",
            params: [],
            vcode: decv,
            id: nodeID++,
            x: 50, y: 100,
            width: 140,
            inputConnectors: [
                { name: "c", label: "c" }
            ],
            outputConnectors: [
                { name: "o0", label: "o0" },
                { name: "o1", label: "o1" }
            ]
        };
        callback(block, nodeID);
    };

    return exports;
});
