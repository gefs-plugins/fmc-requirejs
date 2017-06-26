"use strict";

define(['distance', 'flight', 'math', 'waypoints', 'ui/elements', 'exports'], function (distance, flight, math, waypoints, E, exports) {

	var container = E.container,
		input = E.input,
		textarea = E.textarea;

	var timer = null;

	/**
	 * Updates the plane's progress during flying, set on a timer
	 */
	function update () {
		var route = waypoints.route;
		var nextWaypoint = waypoints.nextWaypoint;
		var lat1 = geofs.aircraft.instance.llaLocation[0] || null;
		var lon1 = geofs.aircraft.instance.llaLocation[1] || null;
		var lat2 = flight.arrival[1] || null;
		var lon2 = flight.arrival[2] || null;
		var times = [[], [], [], [], []]; // flightETE, flightETA, todETE, todETA, nextETE
		var nextDist = distance.route(nextWaypoint + 1) || '--';
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

		print(flightDist, nextDist, times);
		printNextWaypointInfo(nextWaypoint, [lat1, lon1]);
	}

	/**
	 * Updates plane's phase of flying: climb, cruise, or descent
	 *
	 * @description Phase contains "climb," "cruise," and "descent"
	 */
	function updatePhase () {
		// @TODO add a better logic, especially near the cruise phase
	}

	/**
	 * Prints plane's progress to the UI
	 *
	 * @param {Number} flightDist The total flight distance
	 * @param {Number} nextDist The distance to the next waypoint
	 * @param {Array} times An array of the time: [hours, minutes]
	 */
	function print (flightDist, nextDist, times) {
		for (var i = 0; i < times.length; i++) {
			times[i] = flight.formatTime(times[i]);
		}

		// Formats flightDist
		if (flightDist < 10) {
			flightDist = Math.round(flightDist * 10) / 10;
		} else flightDist = Math.round(flightDist);

		// If TOD is entered and TOD has not been passed
		if (flight.todDist && flight.todDist < flightDist) var todDist = flightDist - flight.todDist;

		// Formats nextDist
		if (nextDist < 10) {
			nextDist = (Math.round(10 * nextDist)) / 10;
		} else nextDist = Math.round(nextDist);

		// If times and distances are not defined, print default
		var DEFAULT_TIME = '--:--';
		var DEFAULT_DIST = '--';

		$(textarea.flightETE).text(times[0] || DEFAULT_TIME);
		$(textarea.flightETA).text(times[1] || DEFAULT_TIME);
		$(textarea.todETE).text(times[2] || DEFAULT_TIME);
		$(textarea.todETA).text(times[3] || DEFAULT_TIME);
		$(textarea.flightDist).text(flightDist || DEFAULT_DIST);
		$(textarea.todDist).text(todDist || DEFAULT_DIST);
		$(textarea.nextDist).text(nextDist || DEFAULT_DIST);
		$(textarea.nextETE).text(times[4] || DEFAULT_TIME);
	}

	/**
	 * Prints the distance and bearing of the next waypoint under current one
	 *
	 * @param {Number} n The index of the nextWaypoint (current)
	 * @param {Array} [currentCoords] Current plane coordinates
	 *
	 * TODO Implement arrival airport distance/bearing field
	 */
	function printNextWaypointInfo (n, currentCoords) {

		var infoContainer = $(container.wptInfo);
		var depAirport = $(input.dep).val().trim();
		var arrAirport = $(input.arr).val().trim();
		var route = waypoints.route;

		// Function call by progress.update;
		// This means that there might be current coordinates, therefore
		// the waypoint `n` should show distance to next waypoint.
		if (currentCoords) {
			// If aircraft does not have an activated waypoint,
			// do not execute the function
			if (!n || !currentCoords[0] || !currentCoords[1]) return;

			var nextWptCoords = [route[n][1], route[n][2]];

			// Removes progress info from previous waypoints (including this one)
			for (var i = n; i >= 0; i--) infoContainer.eq(i).text('');
			var dist = calc(math.getDistance, currentCoords, nextWptCoords);
			var brng = calc(math.getBearing, currentCoords, nextWptCoords);

			writeProgress(infoContainer.eq(n), dist, formatBrng(brng));
		}

		// Function called when waypoint inputs have physically changed
		// Or called by waypoints.shiftWaypoint
		else {

			// If nextWaypoint is the first one in the list
			// Needs to consider distance from departure airport to waypoint
			if (n === 0) {

				// If there is a next waypoint following
				if (route.length > 1) {
					var cur = [route[0][1], route[0][2]];
					var next = [route[1][1], route[1][2]];

					var dist = calc(math.getDistance, cur, next);
					var brng = calc(math.getBearing, cur, next);
					writeProgress(infoContainer.eq(0), dist, formatBrng(brng));
				}

				// If there is no dep airport or its coordinates don't exist
				// Exit function call. Removes any information
				if (!depAirport || !waypoints.getCoords(depAirport)) {
					writeProgress(infoContainer.eq(0), false);
					return;
				}

				var airportCoords = waypoints.getCoords(depAirport);
				var nextWptCoords = [route[n][1], route[n][2]];

				var dist = calc(math.getDistance, airportCoords, nextWptCoords);
				var brng = calc(math.getBearing, airportCoords, nextWptCoords);
				writeProgress(infoContainer.eq(0), dist, formatBrng(brng));
			}

			// If nextWaypoint is the last one in the list
			// Needs to consider prev to current
			// Needs to consider distance from waypoint to arrival airport
			else if (n === route.length - 1) {
				// TODO Find a place to put the distance info
				// jshint unused:false

				if (!arrAirport || !waypoints.getCoords(arrAirport)) {
					// TODO Prints empty string to info section, TBD
				}

				var prevWptCoords = [route[n-1][1], route[n-1][2]];
				var nextWptCoords = [route[n][1], route[n][2]];
				// var airportCoords = waypoints.getCoords(arrAirport);

				var dist = calc(math.getDistance, prevWptCoords, nextWptCoords);
				var brng = calc(math.getBearing, prevWptCoords, nextWptCoords);
				writeProgress(infoContainer.eq(n), dist, formatBrng(brng));

				// TODO current to arrival airport
			}

			// If waypoint is in the middle of the list
			// Needs to consider progress from previous to current
			// and progress from current to next
			else {
				var prev = [route[n-1][1], route[n-1][2]];
				var cur = [route[n][1], route[n][2]];
				var next = [route[n+1][1], route[n+1][2]];

				var prevToCurDist = calc(math.getDistance, prev, cur);
				var prevToCurBrng = calc(math.getBearing, prev, cur);
				writeProgress(infoContainer.eq(n), prevToCurDist, formatBrng(prevToCurBrng));

				var curToNextDist = calc(math.getDistance, cur, next);
				var curToNextBrng = calc(math.getBearing, cur, next);
				writeProgress(infoContainer.eq(n+1), curToNextDist, formatBrng(curToNextBrng));
			}
		}
	}

	/**
	 * @private
	 * Formats bearing: turns into heading 360
	 *
	 * @param {Number} brng The bearing to be converted
	 * @returns {Number} Bearing in terms of 360 degrees
	 */
	function formatBrng (brng) {
		if (brng <= 0) return Number(360 + brng);
		else return Number(brng);
	}

	/**
	 * @private
	 * Calculates coordinates data specified `method`, rounded to one decimal point
	 *
	 * @param {Function} method The function to use to Calculates
	 * @param {Array} coords1 First set of coordinates
	 * @param {Array} coords2 Second set of coordinates
	 * @returns {Number} Calculated result
	 */
	function calc (method, coords1, coords2) {
		return Math.round(method(coords1[0], coords1[1], coords2[0], coords2[1]) * 10) / 10;
	}

	/**
	 * @private
	 * Writes progress to a specific element
	 *
	 * @param {jQuery} element The element to be written
	 * @param {Number} dist Distance to the next waypoint
	 * @param {Number} brng Bearing to the next waypoint
	 * @param {Boolean} [empty] If empty progress should be written
	 */
	function writeProgress (element, dist, brng, empty) {
		if (arguments.length === 2 && typeof arguments[1] === 'boolean') {
			empty = !arguments[1];
			dist = brng = undefined;
		}

		if (empty || !dist || !brng) element.text('');
		else element.text(dist + ' NM / ' + brng + '°');
	}

	// Variables
	exports.timer = timer;

	// Functions
	exports.update = update;
	exports.updatePhase = updatePhase;
	exports.print = print;
	exports.printNextWaypointInfo = printNextWaypointInfo;

});
