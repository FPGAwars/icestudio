
angular.module('app')

.service('BitService', function BitService () {

    var exports = {};

    exports.addNewDriverNode = function (value, nodeID) {
        return {
            name: "",
            type: "driver"+ value.toString(),
            value: value,
            inline: "assign o0 = 1'b" + value.toString() + ";",
            id: nodeID,
            x: 50,
            y: 100,
            width: 55,
            outputConnectors: [ { name: "\"" + value.toString() + "\"" }]};
    };

    return exports;
});
