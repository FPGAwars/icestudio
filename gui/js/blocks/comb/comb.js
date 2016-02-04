
angular.module('app')

.service('CombService', function CombService () {

    var fs = require('fs');
    var muxv = fs.readFileSync('js/blocks/comb/mux.v').toString();
    var decv = fs.readFileSync('js/blocks/comb/dec.v').toString();
    var divv = fs.readFileSync('js/blocks/comb/div.v').toString();

    var exports = {};

    exports.addNewMuxNode = function (nodeID, callback) {
        var block = {
            label: "MUX",
            type: "mux",
            params: [],
            vcode: muxv,
            id: nodeID,
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
        callback(block);
    };

    exports.addNewDecNode = function (nodeID, callback) {
        var block = {
            label: "DEC",
            type: "dec",
            params: [],
            vcode: decv,
            id: nodeID,
            x: 50, y: 100,
            width: 150,
            inputConnectors: [
                { name: "c", label: "c" }
            ],
            outputConnectors: [
                { name: "o0", label: "o0" },
                { name: "o1", label: "o1" }
            ]
        };
        callback(block);
    };

    exports.addNewDivNode = function (nodeID, callback) {
		swal({
            title: "Divider",
			text: "Enter the number of divisions",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: true,
			animation: "none",
			inputPlaceholder: "22"
		},
		function(value) {
			if ((value === false) || (value === "")) {
                return false;
            }
            var N = value;
			var M = Math.pow(2, value);

			var block = {
				label: "DIV (" + value.toString() + ")",
				type: "div",
                params: [
                    { name: "N", value: N },
                    { name: "M", value: M }
                ],
				id: nodeID,
				x: 50, y: 100,
				width: 170,
				vcode: divv,
				inputConnectors: [
                    { name: "clk", label: "clk" }
                ],
				outputConnectors: [
                    { name: "o", label: "out" }
                ]
			};
            callback(block);
		});
	};

    return exports;
});
