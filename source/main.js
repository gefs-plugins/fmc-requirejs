/*!
 * PUT LICENSE INFORMATION HERE!
 */

"use strict";

// make sure code is run after GEFS is ready
(function (initFMC) {
	// check if gefs.init has already been called
	if (window.gefs && gefs.canvas) require(['ui/main']);
	else {
		var oldInit = gefs.init;
		var timer = setInterval(function () {
			if (!window.gefs || !gefs.init) return;

			clearInterval(timer);
			// The original gefs.init function might have already run between two checks.
			if (window.gefs && gefs.canvas) require(['ui/main']);
			else gefs.init = function () {
				oldInit();
				require(['ui/main']);
			};
		}, 4);
	}
})();
