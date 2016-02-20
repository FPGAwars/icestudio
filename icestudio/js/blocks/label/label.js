
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
    				id: nodeID,
    				x: 50, y: 100 + i * 60,
    				width: 37 + item.length * 7,
    				outputConnectors: [ {
                        value: item,
                        label: item
                    }]
    			};
                callback(block);
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
    				id: nodeID,
    				x: 50, y: 100 + i * 60,
    				width: 38 + item.length * 7,
    				inputConnectors: [ {
                        value: item,
                        label: item
                    }]
    			};
                callback(block);
            };
		});
	};

    return exports;
});
