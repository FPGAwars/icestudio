
angular.module('app')

.service('SecService', function SecService () {

    var fs = require('fs');
    var flipflopv = fs.readFileSync('js/blocks/sec/flipflop.v').toString();

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

    return exports;
});
