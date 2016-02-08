
angular.module('app')

.service('LabelService', function LabelService () {

    var exports = {};

    exports.addNewLabelInputNode = function (nodeID, callback) {
		swal({
			title: "Label input",
			text: "Enter the label name:",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: true,
			animation: "none",
			inputPlaceholder: "signal"
		},
		function(value) {
			if ((value === false) || (value === "")) {
                return false;
            }
			var block = {
				label: "",
				type: "linput",
				params: [ value ],
				id: nodeID,
				x: 50, y: 100,
				width: 80,
				outputConnectors: [ {
                    value: value,
                    label: value
                }]
			};
            callback(block);
		});
	};

    exports.addNewLabelOutputNode = function (nodeID, callback) {
		swal({
			title: "Label output",
			text: "Enter the label name:",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: true,
			animation: "none",
			inputPlaceholder: "signal"
		},
		function(value) {
			if ((value === false) || (value === "")) {
                return false;
            }
			var block = {
				label: "",
				type: "loutput",
				params: [ value ],
				id: nodeID,
				x: 50, y: 100,
				width: 80,
				inputConnectors: [ {
                    value: value,
                    label: value
                }]
			};
            callback(block);
		});
	};

    return exports;
});
