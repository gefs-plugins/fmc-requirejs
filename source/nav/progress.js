"use strict";

define([
	'knockout', 'distance', 'flight', 'utils', 'waypoints', 'exports'
], function (ko, distance, flight, utils, waypoints, exports) {

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
		var lat1 = geofs.aircraft.instance.llaLocation[0];
		var lon1 = geofs.aircraft.instance.llaLocation[1];
		var lat2 = flight.arrival.coords()[0];
		var lon2 = flight.arrival.coords()[1];
		var times = [[], [], [], [], []]; // flightETE, flightETA, todETE, todETA, nextETE
		var nextDist =
			nextWaypoint === null ? 0 : route[nextWaypoint].distFromPrev();
		var flightDist;

		// Checks if the whole route is complete
		for (var i = 0, valid = true; i < route.length; i++) {
			if (!route[i].lat() || !route[i].lon()) valid = false;
		}
		if (valid) flightDist = distance.route(route.length);
		else flightDist = utils.getDistance(lat1, lon1, lat2, lon2);

		// Calculates times if aircraft is flying and has an arrival airport
		if (!geofs.aircraft.instance.groundContact && flight.arrival.airport()) {
			times[0] = utils.getETE(flightDist, true);
			times[1] = utils.getETA(times[0][0], times[0][1]);
			times[4] = utils.getETE(nextDist, false);
			if ((flightDist - flight.todDist()) > 0) {
				times[2] = utils.getETE((flightDist - flight.todDist()), false);
				times[3] = utils.getETA(times[2][0], times[2][1]);
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
			times[i] = utils.formatTime(times[i]);
		}

		// Formats flightDist
		if (flightDist < 10) {
			flightDist = Math.round(flightDist * 10) / 10;
		} else flightDist = Math.round(flightDist);

		// If T/D is entered and T/D has not been passed
		var todDist;
		if (flight.todDist() && flight.todDist() < flightDist) todDist = flightDist - flight.todDist();

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
