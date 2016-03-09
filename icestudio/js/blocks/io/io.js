
angular.module('app')

.service('IOService', function IOService () {

    var exports = {};

    exports.addNewInputNode = function (nodeID, callback) {
		swal({
			title: "FPGA pin",
			text: "Enter the input pin:",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: true,
			animation: "none",
			inputPlaceholder: "21 44"
		},
		function(value) {
			if ((value === false) || (value === "")) {
                return false;
            }
            array = value.split(' ');
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                var block = {
                    label: "",
                    type: "input",
                    params: [ item ],
                    id: nodeID++,
                    x: 50, y: 100 + i * 60,
                    width: 40 + item.length * 8,
                    outputConnectors: [ {
                        label: item
                    }]
                };
                callback(block, nodeID);
            };
		});
	};

    exports.addNewOutputNode = function (nodeID, callback) {
		swal({
			title: "FPGA pin",
			text: "Enter the output pin:",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: true,
			animation: "none",
			inputPlaceholder: "95 96 97"
		},
		function(value) {
			if ((value === false) || (value === "")) {
                return false;
            }
            array = value.split(' ');
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
    			var block = {
    				label: "",
    				type: "output",
    				params: [ item ],
    				id: nodeID++,
    				x: 50, y: 100 + i * 60,
    				width: 40 + item.length * 8,
    				inputConnectors: [ {
                        label: item
                    }]
    			};
                callback(block, nodeID);
            };
		});
	};

    return exports;
});
