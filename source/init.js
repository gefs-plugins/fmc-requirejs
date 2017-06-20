/**
 * @license Copyright (c) 2016-2017 Harry Xue and other contributors
 * Released under the MIT license. For more details, please visit
 * https://github.com/geofs-plugins/fmc-requirejs/blob/master/LICENSE
 */

"use strict";

// var timer = setInterval(function () {
// 	if(window.geofs && geofs.aircraft && geofs.aircraft.instance) {
// 		clearInterval(timer);
//
// 		require(['ui/position'], function (load) {
// 			load();
// 		});
// 	}
// }, 4);

(function () {
	// Inits FMC ui and main functions
	function initFMC () {
		require(['ui/position'], function (loadUI, loadMain) {
			loadUI();

			var timer = setInterval(function () {
				if ($('.fmc-modal')[0] && $('.fmc-btn')) {
					clearInterval(timer);
					loadMain();
				}
			}, 4);
		});
	}

	// Check if geofs.init has already been called
	if (window.geofs && geofs.canvas) {
		initFMC();
		return;
	}

	var timer = setInterval(function () {
		if (!window.geofs || !geofs.init) return;
		clearInterval(timer);

		if (geofs.canvas) initFMC();
		else {
			var oldInit = geofs.init;

			geofs.init = function () {
				oldInit();
				initFMC();
			}
		}
	}, 4);

})();
