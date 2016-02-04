
angular.module('app')

.service('LogicService', function LogicService () {

    var fs = require('fs');
    var notv = fs.readFileSync('js/blocks/logic/not.v').toString();
    var andv = fs.readFileSync('js/blocks/logic/and.v').toString();
    var orv = fs.readFileSync('js/blocks/logic/or.v').toString();
    var xorv = fs.readFileSync('js/blocks/logic/xor.v').toString();

    var exports = {};

    exports.addNewNotNode = function (nodeID, callback) {
        var block = {
            label: "NOT",
            type: "notx",
            params: [],
            vcode: notv,
            id: nodeID,
            x: 50, y: 100,
            width: 100,
            inputConnectors: [
                { name: "i", label: "" }
            ],
            outputConnectors: [
                { name: "o", label: "" }
            ]
        };
        callback(block);
    };

    exports.addNewAndNode = function (nodeID, callback) {
        var block = {
            label: "AND",
            type: "andx",
            params: [],
            vcode: andv,
            id: nodeID,
            x: 50, y: 100,
            width: 100,
            inputConnectors: [
                { name: "a", label: "" },
                { name: "b", label: "" }
            ],
            outputConnectors: [
                { name: "o", label: "" }
            ]
        };
        callback(block);
    };

    exports.addNewOrNode = function (nodeID, callback) {
        var block = {
            label: "OR",
            type: "orx",
            params: [],
            vcode: orv,
            id: nodeID,
            x: 50, y: 100,
            width: 100,
            inputConnectors: [
                { name: "a", label: "" },
                { name: "b", label: "" }
            ],
            outputConnectors: [
                { name: "o", label: "" }
            ]
        };
        callback(block);
    };

    exports.addNewXorNode = function (nodeID, callback) {
        var block = {
            label: "XOR",
            type: "xorx",
            params: [],
            vcode: xorv,
            id: nodeID,
            x: 50, y: 100,
            width: 100,
            inputConnectors: [
                { name: "a", label: "" },
                { name: "b", label: "" }
            ],
            outputConnectors: [
                { name: "o", label: "" }
            ]
        };
        callback(block);
    };

    return exports;
});
