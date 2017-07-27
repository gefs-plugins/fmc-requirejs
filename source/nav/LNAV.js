"use strict";

define(['distance', 'flight', 'waypoints', 'exports'], function (distance, flight, waypoints, exports) {

	exports.timer = null;

	/**
	 * Controls LNAV, plane's lateral navigation, set on a timer
	 */
	exports.update = function () {
		if (waypoints.nextWaypoint() === null || !flight.arrival.airport()) {
			clearInterval(exports.timer);
			exports.timer = null;
			return;
		}

		var d = distance.route(waypoints.nextWaypoint() + 1);
		if (d <= distance.turn(60)) {
			waypoints.activateWaypoint(waypoints.nextWaypoint() + 1);
		}

		clearInterval(exports.timer);
		if (d < geofs.aircraft.instance.animationValue.ktas / 60) exports.timer = setInterval(exports.update, 500);
		else exports.timer = setInterval(exports.update, 5000);
	};
});
