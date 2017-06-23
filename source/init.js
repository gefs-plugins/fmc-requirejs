/**
 * @license Copyright (c) 2016-2017 Harry Xue and other contributors
 * Released under the MIT license. For more details, please visit
 * https://github.com/geofs-plugins/fmc-requirejs/blob/master/LICENSE
 */

"use strict";

(function () {
	// Check if geofs.init has already been called
	if (window.geofs && geofs.canvas) {
		require(['ui/main']);
		return;
	}

	var timer = setInterval(function () {
		if (!window.geofs || !geofs.init) return;
		clearInterval(timer);

		if (geofs.canvas) require(['ui/main']);
		else {
			var oldInit = geofs.init;

			geofs.init = function () {
				oldInit();
				require(['ui/main']);
			};
		}
	}, 4);

})();
