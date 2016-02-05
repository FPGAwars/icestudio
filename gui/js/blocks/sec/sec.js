
angular.module('app')

.service('SecService', function SecService () {

    var fs = require('fs');
    var flipflopv = fs.readFileSync('js/blocks/sec/flipflop.v').toString();
    var counterv = fs.readFileSync('js/blocks/sec/counter.v').toString();

    var exports = {};

    exports.addNewFlipflopNode = function (nodeID, callback) {
        var block = {
            label: "FF",
            type: "flipflop",
            params: [],
            vcode: flipflopv,
            id: nodeID,
            x: 50, y: 100,
            width: 150,
            inputConnectors: [
                { name: "clk", label: "clk" },
                { name: "rst", label: "rst" },
                { name: "d", label: "D" },
                { name: "ena", label: "ena" },
            ],
            outputConnectors: [
                { name: "q", label: "Q" }
            ]
        };
        callback(block);
    };

    exports.addNewCounterNode = function (nodeID, callback) {
        var block = {
            label: "CNT",
            type: "counter",
            params: [],
            vcode: counterv,
            id: nodeID,
            x: 50, y: 100,
            width: 150,
            inputConnectors: [
                { name: "clk", label: "clk" }
            ],
            outputConnectors: [
                { name: "c0", label: "c0" },
                { name: "c1", label: "c1" },
                { name: "c2", label: "c2" },
                { name: "c3", label: "c3" }
            ]
        };
        callback(block);
    };

    return exports;
});
