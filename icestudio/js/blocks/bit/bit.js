
angular.module('app')

.service('BitService', function BitService () {

    var fs = require('fs');
    var bitv = fs.readFileSync('js/blocks/bit/bit.v').toString();

    var exports = {};

    exports.addNewDriverNode = function (value, nodeID, callback) {
        value = value.toString();
        var block = {
            label: "",
            type: "driver",
            params: [
                { name: "B", value: "1'b" + value }
            ],
            vcode: bitv,
            id: nodeID,
            x: 50, y: 100,
            width: 55,
            outputConnectors: [ {
                name: "o",
                label: "\"" + value + "\""
            }]
        };
        callback(block);
    };

    return exports;
});
