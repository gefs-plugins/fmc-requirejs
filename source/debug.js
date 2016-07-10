"use strict"; 

require(['log', 'vnav-profile'], function (log, vnavProfile) {
	
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
	
	/* 
	 * Redefines load function to make sure functionality
	 */
	var oldLoad = Aircraft.prototype.load;
	Aircraft.prototype.load = function (aircraftName, coordinates, bJustReload) {
		// Obtains the old aircraft parts {Object} before loading
		var oldParts = gefs.aircraft.object3d._children;

		// Calls the original function to load an aircraft
		oldLoad.call(this, aircraftName, coordinates, bJustReload);

		// Checks if the old parts refer to a different object compared 
		// with the current parts. It's crucial to set on a timer because 
		// it takes time for the models to load completely
		var timer = setInterval(function () {
			if (oldParts !== gefs.aircraft.object3d._children) {
				clearInterval(timer);
				vnavProfile.forceUpdate();
			}
		}, 16);
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
