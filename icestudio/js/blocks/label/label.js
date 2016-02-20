
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
            array = value.split(' ');
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
    			var block = {
    				label: "",
    				type: "linput",
    				params: [ item ],
    				id: nodeID++,
    				x: 50, y: 100 + i * 60,
    				width: 40 + item.length * 8,
    				outputConnectors: [ {
                        value: item,
                        label: item
                    }]
    			};
                callback(block, nodeID);
            };
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
            array = value.split(' ');
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
    			var block = {
    				label: "",
    				type: "loutput",
    				params: [ item ],
    				id: nodeID++,
    				x: 50, y: 100 + i * 60,
    				width: 40 + item.length * 8,
    				inputConnectors: [ {
                        value: item,
                        label: item
                    }]
    			};
                callback(block, nodeID);
            };
		});
	};

    return exports;
});
