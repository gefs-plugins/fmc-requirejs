"use strict";

define(['distance', 'flight', 'math', 'waypoints', 'ui/elements', 'exports'], function (distance, flight, math, waypoints, E, exports) {

	var container = E.container,
		input = E.input;

	var timer = null; // setInterval(updateProgress, 5000);

	/**
	 * Updates the plane's progress during flying, set on a timer
	 */
	function update () {
		var route = waypoints.route;
		var nextWaypoint = waypoints.nextWaypoint;
		var lat1 = gefs.aircraft.llaLocation[0] || null;
		var lon1 = gefs.aircraft.llaLocation[1] || null;
		var lat2 = flight.arrival[1] || null;
		var lon2 = flight.arrival[2] || null;
		var times = [[], [], [], [], []]; // flightete, flighteta, todete, todeta, nextete
		var nextdist = distance.route(waypoints, nextWaypoint) || '--';
		var flightdist;
		// Checks if the whole route is complete
		for (var i = 0, valid = true; i < route.length; i++) {
			if (!route[i][1] || !route[i][2]) valid = false;
		}
		if (valid) flightdist = distance.route(waypoints, route.length + 1);
		else flightdist = math.getDistance(lat1, lon1, lat2, lon2);

		if (!gefs.aircraft.groundContact && flight.arrival) {
			times[0] = flight.getETE(flightdist, true);
			times[1] = flight.getETA(times[0][0], times[0][1]);
			times[4] = flight.getETE(nextdist, false);
			if ((flightdist - flight.tod) > 0) {
				times[2] = flight.getETE((flightdist - flight.tod), false);
				times[3] = flight.getETA(times[2][0], times[2][1]);
			}
		}

		print(flightdist, nextdist, times);
		printNextWaypointInfo(nextWaypoint, [lat1, lon1]);
	}

	/**
	 * Updates plane's phase of flying: climb, cruise, or descent
	 *
	 * @description Phase contains "climb," "cruise," and "descent"
	 * @param {Object} waypoints FMC waypoints object
	 * @TODO add a better logic, especially near the cruise phase
	 */
	function updatePhase () {
		var currentAlt = 100 * Math.round(gefs.aircraft.animationValue.altitude / 100);
		if (flight.phase === "climb" && currentAlt === Number(flight.cruise)) {
			$('#phaseBtn').click();
		} else if (flight.phase === "cruise") {
			var dist = distance.route(waypoints, waypoints.route.length + 1);
			if (currentAlt !== Number(flight.cruise)) {
				$('#phaseBtn').click();
			} else if (dist <= flight.tod) {
				$('#phaseBtn').click();
			}
		}
	}

	/**
	 * Prints plane's progress to the UI
	 *
	 * @param {Number} flightdist The total flight distance
	 * @param {Number} nextdist The distance to the next waypoint
	 * @param {Array} times An array of the time: [hours, minutes]
	 */
	function print (flightdist, nextdist, times) {
		for (var i = 0; i < times.length; i++) {
			times[i] = flight.formatTime(times[i]);
		}

		if (flightdist && !isNaN(flightdist)) { // If flightdist exists and is valid
			if (flightdist < 10) {
				flightdist = Math.round(flightdist * 10) / 10;
			} else flightdist = Math.round(flightdist);
			// If TOD is entered and TOD has not been passed
			if (flight.tod && flight.tod < flightdist) var toddist = flightdist - flight.tod;
			else var toddist = '--';
		} else {
			flightdist = '--';
			var toddist = '--';
		}

		if (nextdist && !isNaN(nextdist)) { // If nextdist exists and is valid
			if (nextdist < 10) {
				nextdist = (Math.round(10 * nextdist)) / 10;
			} else nextdist = Math.round(nextdist);
		} else nextdist = '--';

		$('#flightete').text('ETE: ' + times[0]);
		$('#flighteta').text('ETA: ' + times[1]);
		$('#todete').text('ETE: ' + times[2]);
		$('#todeta').text('ETA: ' + times[3]);
		$('#flightdist').text(flightdist + ' nm');
		$('#externaldist').text(flightdist + ' nm');
		$('#toddist').text(toddist + ' nm');
		$('#nextDist').text(nextdist + ' nm');
		$('#nextETE').text(times[4]);
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

		if (empty) element.text('');
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
