
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
			inputPlaceholder: "44"
		},
		function(value) {
			if ((value === false) || (value === "")) {
                return false;
            }
			var block = {
				label: "",
				type: "input",
				params: [ value ],
				id: nodeID,
				x: 50, y: 100,
				width: 60,
				outputConnectors: [ {
                    label: value
                }]
			};
            callback(block);
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
			inputPlaceholder: "95"
		},
		function(value) {
			if ((value === false) || (value === "")) {
                return false;
            }
			var block = {
				label: "",
				type: "output",
				params: [ value ],
				id: nodeID,
				x: 50, y: 100,
				width: 60,
				inputConnectors: [ {
                    label: value
                }]
			};
            callback(block);
		});
	};

    return exports;
});
