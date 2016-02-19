
angular.module('mouseCapture', [])

//
// Service used to acquire 'mouse capture' then receive dragging events while the mouse is captured.
//
.factory('mouseCapture', [ '$rootScope', function ($rootScope) {

	//
	// Element that the mouse capture applies to, defaults to 'document' 
	// unless the 'mouse-capture' directive is used.
	//
	var $element = document; 

	//
	// Set when mouse capture is acquired to an object that contains 
	// handlers for 'mousemove' and 'mouseup' events.
	//
	var mouseCaptureConfig = null;

	//
	// Handler for mousemove events while the mouse is 'captured'.
	//
	var mouseMove = function (evt) {

		if (mouseCaptureConfig && mouseCaptureConfig.mouseMove) {
			
			mouseCaptureConfig.mouseMove(evt);

			$rootScope.$digest();
		}
	};

	//
	// Handler for mouseup event while the mouse is 'captured'.
	//
	var mouseUp = function (evt) {

		if (mouseCaptureConfig && mouseCaptureConfig.mouseUp) {
			
			mouseCaptureConfig.mouseUp(evt);

			$rootScope.$digest();
		}
	};

	return {

		// 
		// Register an element to use as the mouse capture element instead of 
		// the default which is the document.
		//
		registerElement: function(element) {

			$element = element;
		},

		//
		// Acquire the 'mouse capture'.
		// After acquiring the mouse capture mousemove and mouseup events will be 
		// forwarded to callbacks in 'config'.
		//
		acquire: function (evt, config) {

			//
			// Release any prior mouse capture.
			//
			this.release();

			mouseCaptureConfig = config;

	  		// 
	  		// In response to the mousedown event register handlers for mousemove and mouseup 
	  		// during 'mouse capture'.
	  		//
  			$element.mousemove(mouseMove);
  			$element.mouseup(mouseUp);
		},

		//
		// Release the 'mouse capture'.
		//
		release: function () {

			if (mouseCaptureConfig) {

				if (mouseCaptureConfig.released) {
					//
					// Let the client know that their 'mouse capture' has been released.
					//
					mouseCaptureConfig.released();
				}

				mouseCaptureConfig = null;
  			}

			$element.unbind("mousemove", mouseMove);
			$element.unbind("mouseup", mouseUp);
		},
	};
}]
)

//
// Directive that marks the mouse capture element.
//
.directive('mouseCapture', function () {
  return {
  	restrict: 'A',

  	controller: ['$scope', '$element', '$attrs', 'mouseCapture',
        function($scope, $element, $attrs, mouseCapture) {

  		// 
  		// Register the directives element as the mouse capture element.
  		//
  		mouseCapture.registerElement($element);

  	    }],

  };
})
;

