"use strict";

define(['distance', 'waypoints', 'text!vnav-profile.json'], function (distance, waypoints, vnavProfile) {

	var tod;
	var VNAV = false;
	var arrival = [];
	var cruise;
	var phase = "climb";
	var todCalc = false;
	var fieldElev = 0;

	/**
	 * Updates plane's phase of flying: climb, cruise, or descent
	 *
	 * @description Phase contains "climb," "cruise," and "descent"
	 * @param <restricted>[optional]{String} p Updates the phase to "p"
	 * @TODO add a better logic, especially near the cruise phase
	 */
	function updatePhase () {
		var currentAlt = 100 * Math.round(gefs.aircraft.animationValue.altitude / 100);
		if (phase === "climb" && currentAlt === Number(cruise)) {
			$('#phaseBtn').click();
		} else if (phase === "cruise") {
			var dist = distance.route(waypoints.route.length + 1);
			if (currentAlt !== Number(cruise)) {
				$('#phaseBtn').click();
			} else if (dist <= tod) {
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
			times[i] = formatTime(times[i]);
		}
		if (flightdist < 10) {
			flightdist = Math.round(flightdist * 10) / 10;
		} else flightdist = Math.round(flightdist);
		$('#flightete').text('ETE: ' + times[0]);
		$('#flighteta').text('ETA: ' + times[1]);
		$('#todete').text('ETE: ' + times[2]);
		$('#todeta').text('ETA: ' + times[3]);
		$('#flightdist').text(flightdist + ' nm');
		$('#externaldist').text(flightdist + ' nm');
		$('#toddist').text((flightdist - tod) + ' nm');
		$('#nextDist').text(nextdist + ' nm');
		$('#nextETE').text(times[4]);
	}

	/**
	 * Gets each plane's flight parameters, for VNAV
	 *
	 * @returns {Array} vertical speed and speed
	 */
	function getFlightParameters () {
		var spd, vs;
		// var gndElev = gefs.groundElevation * metersToFeet;
		var a = gefs.aircraft.animationValue.altitude;
		var isMach = $('#Qantas94Heavy-ap-spd span:last-child').text().trim() === 'M.';
		var switchMode = function() {
			$('#Qantas94Heavy-ap-spd span:last-child').click();
		};

		// CLIMB
		if (phase == "climb") {
			if (a < 30000) {
				if (isMach) switchMode();
			} else if (a >= 30000) {
				if (!isMach) switchMode();
			}

			var profile = getVNAVProfile().climb;
			var index;
			for (var i=0; i<profile.length; i++) {
				if (a > profile[i][0] && a <= profile[i][1]) {
					index = i;
					break;
				}
			}
			spd = profile[index][2];
			vs = profile[index][3];
		}

		// DESCENT
		else if (phase == "descent") {
			if (a > 30000) {
				if (!isMach) switchMode();
			} else {
				if (isMach) switchMode();
			}

			var profile = getVNAVProfile().descent;
			var index;
			for (var i=0; i<profile.length; i++) {
				if (a > profile[i][0] && a <= profile[i][1]) {
					index = i;
					break;
				}
			}
			spd = profile[index][2];
			vs = profile[index][3];
		}
		return [spd, vs];
	}

	/**
	 * Activates a waypoint or deactivates if the waypoint is already activated
	 *
	 * @param {Number} n The index to be activated or deactivated
	 */
	function activateLeg (n) {
		if (waypoints.nextWaypoint != n) {
			if (n <= waypoints.route.length) {
				waypoints.nextWaypoint = n;
				var wpt = waypoints.route[waypoints.nextWaypoint - 1];
				if (wpt[4]) {
					$('#Qantas94Heavy-ap-icao > input').val(wpt[0]).change();
				} else {
					$('#Qantas94Heavy-ap-gc-lat > input').val(wpt[1]).change();
					$('#Qantas94Heavy-ap-gc-lon > input').val(wpt[2]).change();
				}
				$('.activate').removeClass('btn-warning');
				$('#waypoints tr:nth-child(' + (n + 1) + ') .btn').addClass('btn-warning');
			} else {
				$('#Qantas94Heavy-ap-icao > input').val(arrival[0]).change();
				$('.activate').removeClass('btn-warning');
			}
			console.log('Waypoint activated');
		} else {
			$('.activate').removeClass('btn-warning');
			waypoints.nextWaypoint = undefined;
			$('#Qantas94Heavy-ap-icao > input').val('').change();
		}
	}

	/**
	 * Gets the next waypoint that has an altitude restriction
	 *
	 * @returns The index of the waypoint if eligible,
	 * 		   -1 if not eligible
	 */
	function getNextWaypointWithAltRestriction () {
		for (var i = waypoints.nextWaypoint; i <= waypoints.route.length; i++) {
			if (waypoints.route[i - 1][3]) return i;
		}
		return -1;
	}

	/**
	 * Helper method for log, formats the time
	 *
	 * @param {Array} time An array of the time: [hours, minutes]
	 * @returns {String} Formatted time: "hours : minutes"
	 */
	function formatTime (time) {
		time[1] = checkZeros(time[1]); // FIXME Cannot assign to read only property '1' of string '--'
		return time[0] + ":" + time[1];
	}

	/**
	 * Helper method, format zeros
	 *
	 * @param {Number} i The number to be checked
	 * @returns {String} The original number with 0's added
	 */
	function checkZeros (i) {
		if (i < 10) i = "0" + i;
		return i;
	}

	/**
	 * Helper method to make sure that a time is eligible
	 *
	 * @param {Number} h The hours
	 * @param {Number} m The minutes
	 * @returns {Array} Array of eligible time, [h, m]
	 */
	function timeCheck (h, m) {
		if (m >= 60) {
			m -= 60;
			h++;
		}
		if (h >= 24) h -= 24;
		return [h, m];
	}

	/**
	 * Gets "Estimated Time En-Route"
	 *
	 * @param {Number} d The distance to the destination
	 * @param {Boolean} a Is the aircraft in arrival
	 * @returns {Array} The time after <code>timeCheck(h, m)</code>
	 */
	function getETE (d, a) {
		var hours = d / gefs.aircraft.animationValue.ktas;
		var h = parseInt(hours);
		var m = Math.round(60 * (hours - h));
		if (a) m += Math.round(gefs.aircraft.animationValue.altitude / 4000);
		return timeCheck(h, m);
	}

	/**
	 * Gets "Estimated Time of Arrival"
	 *
	 * @param {Number} hours Hours
	 * @param {Number} minutes Minutes
	 * @returns {Array} The timer after <code>timeCheck(hours, minutes)</code>
	 */
	function getETA (hours, minutes) {
		var date = new Date();
		var h = date.getHours();
		var m = date.getMinutes();
		h += hours;
		m += Number(minutes);
		return timeCheck(h, m);
	}

	/**
	 * Gets the climb/descent profile for VNAV
	 *
	 * @local
	 * @returns {Object} The profile needed by VNAV
	 */
	function getVNAVProfile () {
		return gefs.aircraft.setup.fmc
			|| JSON.parse(vnavProfile)[gefs.aircraft.name]
			|| JSON.parse(vnavProfile)['DEFAULT'];
	}

	return {
		// Variables
		tod: tod,
		VNAV: VNAV,
		arrival: arrival,
		cruise: cruise,
		phase: phase,
		todCalc: todCalc,
		fieldElev: fieldElev,
		// Functions
		updatePhase: updatePhase,
		print: print,
		flightParams: getFlightParameters,
		activateLeg: activateLeg,
		nextWptAltRes: getNextWaypointWithAltRestriction,
		formatTime: formatTime,
		checkZeros: checkZeros,
		timeCheck: timeCheck,
		getETE: getETE,
		getETA: getETA
	};
});
