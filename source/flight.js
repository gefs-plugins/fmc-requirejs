"use strict";

define(['vnav-profile', 'exports'], function (vnavProfile, exports) {

	var tod;
	var VNAV = false;
	var arrival = [];
	var cruise;
	var phase = "climb";
	var todCalc = false;
	var fieldElev = 0;

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
	 * Helper method for log, formats the time
	 *
	 * @param {Array} time An array of the time: [hours, minutes]
	 * @returns {String} Formatted time: "hours : minutes"
	 */
	function formatTime (time) {
		if (!time[0] || !time[1]) return '-:-';
		time[1] = checkZeros(time[1]);
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
	 * @private
	 * Gets the climb/descent profile for VNAV
	 *
	 * @returns {Object} The profile needed by VNAV
	 */
	function getVNAVProfile () {
		return gefs.aircraft.setup.fmc
			|| vnavProfile[gefs.aircraft.name]
			|| vnavProfile.DEFAULT;
	}

	// Variables
	exports.tod = tod;
	exports.VNAV = VNAV;
	exports.arrival = arrival;
	exports.cruise = cruise;
	exports.phase = phase;
	exports.todCalc = todCalc;
	exports.fieldElev = fieldElev;

	// Functions
	exports.flightParams = getFlightParameters;
	exports.formatTime = formatTime;
	exports.checkZeros = checkZeros;
	exports.timeCheck = timeCheck;
	exports.getETE = getETE;
	exports.getETA = getETA;

});
