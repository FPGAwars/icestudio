
angular.module('app')

.service('SecService', function SecService () {

    var fs = require('fs');
    var divv = fs.readFileSync('js/blocks/sec/div.v').toString();
    var flipflopv = fs.readFileSync('js/blocks/sec/flipflop.v').toString();
    var counterv = fs.readFileSync('js/blocks/sec/counter.v').toString();
    var notesv = fs.readFileSync('js/blocks/sec/notes.v').toString();

    var exports = {};

    exports.addNewDivNode = function (nodeID, callback) {
		swal({
            title: "Divider",
			text: "Enter the number of divisions",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: true,
			animation: "none",
			inputPlaceholder: "22 23"
		},
		function(value) {
			if ((value === false) || (value === "")) {
                return false;
            }
            array = value.split(' ');
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                var N = item;
    			var M = Math.pow(2, item);

    			var block = {
    				label: "DIV (" + item.toString() + ")",
    				type: "div",
                    params: [
                        { name: "N", value: N },
                        { name: "M", value: M }
                    ],
    				id: nodeID++,
    				x: 50, y: 100 + i * 60,
    				width: 150 + item.length * 8,
    				vcode: divv,
    				inputConnectors: [
                        { name: "clk", label: "clk" }
                    ],
    				outputConnectors: [
                        { name: "o", label: "out" }
                    ]
    			};
                callback(block, nodeID);
            };
		});
	};

    exports.addNewCounterNode = function (nodeID, callback) {
        var block = {
            label: "CNT",
            type: "counter",
            params: [],
            vcode: counterv,
            id: nodeID++,
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
        callback(block, nodeID);
    };

    exports.addNewFlipflopNode = function (nodeID, callback) {
        var block = {
            label: "FF",
            type: "flipflop",
            params: [],
            vcode: flipflopv,
            id: nodeID++,
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
        callback(block, nodeID);
    };

    exports.addNewNotesNode = function (nodeID, callback) {
        var block = {
            label: "Notes",
            type: "romnotes",
            params: [],
            vcode: notesv,
            id: nodeID++,
            x: 50, y: 100,
            width: 150,
            inputConnectors: [
                { name: "clk", label: "clk" }
            ],
            outputConnectors: [
                { name: "ch_out", label: "o" }
            ]
        };
        callback(block, nodeID);
    };

    return exports;
});
