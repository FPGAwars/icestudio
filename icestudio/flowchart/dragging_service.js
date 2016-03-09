
angular.module('dragging', ['mouseCapture', ] )

//
// Service used to help with dragging and clicking on elements.
//
.factory('dragging', ['$rootScope', 'mouseCapture',function ($rootScope, mouseCapture) {

	//
	// Threshold for dragging.
	// When the mouse moves by at least this amount dragging starts.
	//
	var threshold = 5;

	return {


		//
		// Called by users of the service to register a mousedown event and start dragging.
		// Acquires the 'mouse capture' until the mouseup event.
		//
  		startDrag: function (evt, config) {

  			var dragging = false;
			var x = evt.pageX;
			var y = evt.pageY;

			//
			// Handler for mousemove events while the mouse is 'captured'.
			//
	  		var mouseMove = function (evt) {

				if (!dragging) {
					if (Math.abs(evt.pageX - x) > threshold ||
						Math.abs(evt.pageY - y) > threshold)
					{
						dragging = true;

						if (config.dragStarted) {
							config.dragStarted(x, y, evt);
						}

						if (config.dragging) {
							// First 'dragging' call to take into account that we have 
							// already moved the mouse by a 'threshold' amount.
							config.dragging(evt.pageX, evt.pageY, evt);
						}
					}
				}
				else {
					if (config.dragging) {
						config.dragging(evt.pageX, evt.pageY, evt);
					}

					x = evt.pageX;
					y = evt.pageY;
				}
	  		};

	  		//
	  		// Handler for when mouse capture is released.
	  		//
	  		var released = function() {

	  			if (dragging) {
  					if (config.dragEnded) {
  						config.dragEnded();
  					}
	  			}
	  			else {
  					if (config.clicked) {
  						config.clicked();
  					}
	  			}
	  		};

			//
			// Handler for mouseup event while the mouse is 'captured'.
			// Mouseup releases the mouse capture.
			//
	  		var mouseUp = function (evt) {

	  			mouseCapture.release();

	  			evt.stopPropagation();
	  			evt.preventDefault();
	  		};

	  		//
	  		// Acquire the mouse capture and start handling mouse events.
	  		//
			mouseCapture.acquire(evt, {
				mouseMove: mouseMove,
				mouseUp: mouseUp,
				released: released,
			});

	  		evt.stopPropagation();
	  		evt.preventDefault();
  		},

	};

}])

;

