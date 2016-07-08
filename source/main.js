/*!
 * PUT LICENSE INFORMATION HERE!
 */

"use strict";

(function () {
	define(function (require) {
		var timer = setInterval(function () {
			if (window.gefs && gefs.aircraft && gefs.aircraft.object3d) {
				clearInterval(timer);
				require('debug');
				require('ui/main');
			}
		}, 4);
	});
})();
