/**
 * @license Copyright (c) 2016-2017 Harry Xue, (c) 2016-2017 Ethan Shields
 * Released under the GNU Affero General Public License, v3.0 or later
 * https://github.com/geofs-plugins/fmc-requirejs/blob/master/LICENSE.md
 */

"use strict";

(function () {

	if (!window.Promise) throw new Error('Browser is outdated.');

	var VALID_VERSION = 'v0.11.0';

	// Error if FMC is loaded without Autopilot++ or with outdated Autopilot++
	function errorNotCompatible () {
		console.error('Incompatible: You must have Autopilot++ ' +
			'{>= %s} installed in order to use FMC.', VALID_VERSION);
	}

	// Check if Autopilot++ is installed (version >= v0.10.6)
	function hasAutopilot () {
		if (window.autopilot_pp) {
			var apVersion = autopilot_pp.version.split('.');
			var vlVersion = VALID_VERSION.substring(1).split('.');
			if (apVersion[0] === vlVersion[0] &&
				apVersion[1] === vlVersion[1] &&
				apVersion[2] >= vlVersion[2] ||
				apVersion[0] > vlVersion[0] ||
				apVersion[1] > vlVersion[1]) return true;
		}
		return false;
	}

	// Check if game has completed loading
	var timer = setInterval(function () {
		if (!(window.L &&
			window.geofs && geofs.aircraft &&
			geofs.aircraft.instance &&
			geofs.aircraft.instance.object3d)) return;

		clearInterval(timer);

		if (!hasAutopilot()) errorNotCompatible();
		else require(['ui/main']);
	}, 250);

})();
