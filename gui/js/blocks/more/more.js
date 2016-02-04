
angular.module('app')

.service('MoreService', function MoreService () {

    var fs = require('fs');
    var divv = fs.readFileSync('js/blocks/more/div.v').toString();

    var exports = {};

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
