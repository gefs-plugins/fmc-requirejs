/**
 * @license Copyright (c) 2016-2017 Harry Xue and other contributors
 * Released under the MIT license. For more details, please visit
 * https://github.com/geofs-plugins/fmc-requirejs/blob/master/LICENSE
 */

"use strict";

(function () {

	// Error function if FMC is loaded without Autopilot++
	function error () {
		console.error('You must have Autopilot++ installed in order to use FMC.');
	}

	// Check if geofs.init has already been called
	if (window.geofs && geofs.canvas) {
		if (window.autopilot_pp)
			require(['ui/main']);
		else error();

		return;
	}

	var timer = setInterval(function () {
		if (!window.geofs || !geofs.init) return;
		clearInterval(timer);

		if (geofs.canvas && window.autopilot_pp) require(['ui/main']);
		else if (!window.autopilot_pp) error();
		else {
			var oldInit = geofs.init;

			geofs.init = function () {
				oldInit();
				require(['ui/main']);
			};
		}
	}, 4);

})();
