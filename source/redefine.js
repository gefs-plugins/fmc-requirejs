"use strict";

define(['debug', 'log'], function (debug, log) {

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

	// Tracks gear up/down event to log
	controls.setters.setGear.set = function () {
		if (!geofs.aircraft.instance.groundContact || geofs.debug.on) {
			if (controls.gear.target === 0) {
				controls.gear.target = 1;
				log.update('Gear up');
			} else {
				controls.gear.target = 0;
				log.update('Gear down');
			}

			controls.setPartAnimationDelta(controls.gear);
		}
	};

	// Tracks flaps up event to log
	controls.setters.setFlapsUp.set = function () {
		if (controls.flaps.target > 0) {
			controls.flaps.target--;

			if (geofs.aircraft.instance.setup.flapsPositions) {
				controls.flaps.positionTarget = geofs.aircraft.instance.setup.flapsPositions[controls.flaps.target];
				log.update('Flaps raised to ' + controls.flaps.positionTarget);
			} else log.update('Flaps raised to ' + controls.flaps.target);

			controls.setPartAnimationDelta(controls.flaps);
		}
    };

	// Tracks flaps down event to log
	controls.setters.setFlapsDown.set = function () {
		if (controls.flaps.target < geofs.aircraft.instance.setup.flapsSteps) {
			controls.flaps.target++;

			if (geofs.aircraft.instance.setup.flapsPositions) {
				controls.flaps.positionTarget = geofs.aircraft.instance.setup.flapsPositions[controls.flaps.target];
				log.update('Flaps lowered to ' + controls.flaps.positionTarget);
			} else log.update('Flaps lowered to ' + controls.flaps.target);

			controls.setPartAnimationDelta(controls.flaps);
		}
	};

});
