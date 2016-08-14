/**
 * @license Copyright (c) 2016 Ethan Shields and other contributors
 * Released under the MIT license. For more details, please visit
 * https://github.com/gefs-plugins/fmc-requirejs/blob/master/LICENSE
 */

"use strict";

(function (initUI, initFMC, setup) {
	// Places ui elements
	initUI();

	var timer = setInterval(function () {
		if ($('.fmc-modal')[0] && $('.fmc-btn')) {
			clearInterval(timer);
			setup(initFMC);
		}
	}, 4);
})(function () {
	require(['ui/position']);
}, function () {
	require(['ui/main']);
}, function (initFMC) {
	// Check if gefs.init has already been called
	if (window.gefs && gefs.canvas) initFMC();
	else {
		var oldInit = gefs.init;
		var timer = setInterval(function () {
			if (!window.gefs || !gefs.init) return;

			clearInterval(timer);
			// The original gefs.init function might have already run between two checks.
			if (window.gefs && gefs.canvas) initFMC();
			else gefs.init = function () {
				oldInit();
				initFMC();
			};
		}, 4);
	}
});
