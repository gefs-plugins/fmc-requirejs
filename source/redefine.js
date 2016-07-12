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
	gefs.resetFlight = function () {
		if (window.confirm('Reset Flight?')) {
			if (gefs.lastFlightCoordinates) {
				gefs.flyTo(gefs.lastFlightCoordinates, true);
				log.update('Flight reset');
			}
		}
	};
	
	// Tracks pause event to log
	gefs.togglePause = function () {
		if (!gefs.pause) {
			log.update('Flight paused');
			gefs.doPause();
		} else {
			gefs.undoPause();
			log.update('Flight resumed');
		}
	};
	
	// ============== FMC Modal debug ================
	/*
	// Hides backdrop for the modal	
	$('#fmcModal').modal({
		backdrop: false,
		show: false
	});

	// Stops immediate keyup actions in the FMC Modal
	$('#fmcModal').keyup(function (event) {
		event.stopImmediatePropagation();
	});
	*/
});
