"use strict";

define(['log'], function (log) {

	// Adds a confirm window to prevent accidental reset
	geofs.resetFlight = function () {
		if (window.confirm('Reset Flight?')) {
			if (geofs.lastFlightCoordinates) {
				geofs.flyTo(geofs.lastFlightCoordinates, true);
				log.update('Flight reset');
			}
		}
	};

	// Tracks pause event to log
	geofs.togglePause = function () {
		if (!geofs.pause) {
			log.update('Flight paused');
			geofs.doPause();
		} else {
			geofs.undoPause();
			log.update('Flight resumed');
		}
	};

});
