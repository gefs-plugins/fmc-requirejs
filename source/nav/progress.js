"use strict";

define(['knockout', 'distance', 'flight', 'math', 'waypoints', 'exports'], function (ko, distance, flight, math, waypoints, exports) {

	exports.timer = null;

	// Progress information
	exports.info = {
		flightETE: ko.observable('--:--'),
		flightETA: ko.observable('--:--'),
		todETE: ko.observable('--:--'),
		todETA: ko.observable('--:--'),
		flightDist: ko.observable('--'),
		todDist: ko.observable('--'),
		nextDist: ko.observable('--'),
		nextETE: ko.observable('--:--')
	};

	/**
	 * Updates the plane's progress during flying, set on a timer
	 */
	exports.update = function () {
		var route = waypoints.route();
		var nextWaypoint = waypoints.nextWaypoint();
		var lat1 = geofs.aircraft.instance.llaLocation[0] || null;
		var lon1 = geofs.aircraft.instance.llaLocation[1] || null;
		var lat2 = flight.arrival[1] || null;
		var lon2 = flight.arrival[2] || null;
		var times = [[], [], [], [], []]; // flightETE, flightETA, todETE, todETA, nextETE
		var nextDist = nextWaypoint === null ? 0 : math.getDistance(lat1, lon1, route[nextWaypoint][1], route[nextWaypoint][2]);
		var flightDist;

		// Checks if the whole route is complete
		for (var i = 0, valid = true; i < route.length; i++) {
			if (!route[i][1] || !route[i][2]) valid = false;
		}
		if (valid) flightDist = distance.route(route.length);
		else flightDist = math.getDistance(lat1, lon1, lat2, lon2);

		// Calculates times
		if (!geofs.aircraft.instance.groundContact && flight.arrival) {
			times[0] = flight.getETE(flightDist, true);
			times[1] = flight.getETA(times[0][0], times[0][1]);
			times[4] = flight.getETE(nextDist, false);
			if ((flightDist - flight.todDist) > 0) {
				times[2] = flight.getETE((flightDist - flight.todDist), false);
				times[3] = flight.getETA(times[2][0], times[2][1]);
			}
		}

		exports.print(flightDist, nextDist, times);
	};

	/**
	 * Prints plane's progress to the UI
	 *
	 * @param {Number} flightDist The total flight distance
	 * @param {Number} nextDist The distance to the next waypoint
	 * @param {Array} times An array of the time: [hours, minutes]
	 */
	exports.print = function (flightDist, nextDist, times) {
		for (var i = 0; i < times.length; i++) {
			times[i] = flight.formatTime(times[i]);
		}

		// Formats flightDist
		if (flightDist < 10) {
			flightDist = Math.round(flightDist * 10) / 10;
		} else flightDist = Math.round(flightDist);

		// If T/D is entered and T/D has not been passed
		if (flight.todDist && flight.todDist < flightDist) var todDist = flightDist - flight.todDist;

		// Formats nextDist
		if (nextDist < 10) {
			nextDist = (Math.round(10 * nextDist)) / 10;
		} else nextDist = Math.round(nextDist);

		// If times and distances are not defined, print default
		var DEFAULT_DIST = '--';

		exports.info.flightETE(times[0]);
		exports.info.flightETA(times[1]);
		exports.info.todETE(times[2]);
		exports.info.todETA(times[3]);
		exports.info.flightDist(flightDist || DEFAULT_DIST);
		exports.info.todDist(todDist || DEFAULT_DIST);
		exports.info.nextDist(nextDist || DEFAULT_DIST);
		exports.info.nextETE(times[4]);
	};
});
