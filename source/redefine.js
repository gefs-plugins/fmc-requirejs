"use strict";

define(['log'], function (log) {

	/**
	 * Defines Array prototype to move an array
	 *
	 * @param {Number} index1 The start index
	 * @param {Number} index2 The end/target index
	 */
	Array.prototype.move = function (index1, index2) {
		if (index2 >= this.length) {
			var k = index2 - this.length;
			while ((k--) + 1) {
				this.push(undefined);
			}
		}
		this.splice(index2, 0, this.splice(index1, 1)[0]);
		return this;
	};

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
