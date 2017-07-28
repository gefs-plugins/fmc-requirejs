/**
 * @license Copyright (c) 2016-2017 Harry Xue, (c) 2016 Ethan Shields
 * Released under the MIT license. For more details, please visit
 * https://github.com/geofs-plugins/fmc-requirejs/blob/master/LICENSE
 */

"use strict";

(function () {

	// Error if FMC is loaded without Autopilot++ or with outdated Autopilot++
	function errorNotCompatible () {
		console.error('You must have Autopilot++ {>= v0.10.6} installed in order to use FMC.');
	}

	// Check if Autopilot++ is installed (version >= v0.10.6)
	function hasAutopilot () {
		if (window.autopilot_pp) {
			var version = autopilot_pp.version.split('.');
			if ((+version[1] === 10 && +version[2] >= 6) || +version[1] > 10) return true;
		}
		return false;
	}

	// Check if game has completed loading
	var timer = setInterval(function () {
		if (!(window.geofs && geofs.aircraft &&
			geofs.aircraft.instance &&
			geofs.aircraft.instance.object3d)) return;

		clearInterval(timer);

		if (!hasAutopilot()) errorNotCompatible();
		else require(['ui/main']);
	}, 4);

})();
