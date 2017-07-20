"use strict";

define(['knockout', 'vnav-profile', 'exports'], function (ko, vnavProfile, exports) {

	// Autopilot++ Dependencies
	var apModes = autopilot_pp.require('autopilot').modes;

	// Top Of Descent distance
	var todDist = ko.observable();

	// If VNAV is enabled
	var vnavEnabled = ko.observable(false);

	// Speed control
	var spdControl = ko.observable(true);

	// Departure airport name and coords
	var departure = ko.observableArray([]);

	// Arrival airport name and coords
	var arrival = ko.observableArray([]);

	// Cruise altitude
	var cruiseAlt = ko.observable();

	// Flight phase
	var phase = ko.observable(0);

	// Automatic TOD calculation
	var todCalc = ko.observable(false);

	// Arrival Airport field altitude
	var fieldElev = ko.observable();

	/**
	 * Gets each plane's flight parameters, for VNAV
	 *
	 * @returns {Array} [speed, vertical speed]
	 */
	function getFlightParameters () {
		var spd, vs;
		var a = geofs.aircraft.instance.animationValue.altitude;

		// Defaults to KIAS mode
		apModes.speed.isMach(false);

		// CLIMB
		if (phase == 'climb') {
			var profile = getVNAVProfile().climb;

			for (var i = 0, index = 0; i < profile.length; i++) {
				if (a > profile[i][0] && a <= profile[i][1]) {
					index = i;
					break;
				}
			}

			spd = profile[index][2];
			vs = profile[index][3];

			switchIfMach(spd);
		}

		// DESCENT
		else if (phase == 'descent') {
			var profile = getVNAVProfile().descent;

			for (var i = 0, index = 0; i < profile.length; i++) {
				if (a > profile[i][0] && a <= profile[i][1]) {
					index = i;
					break;
				}
			}

			spd = profile[index][2];
			vs = profile[index][3];

			switchIfMach(spd);
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
		if (isNaN(time[0]) || isNaN(time[1])) return '--:--';
		time[1] = checkZeros(time[1]);
		return time[0] + ':' + time[1];
	}

	/**
	 * Helper method, format zeros
	 *
	 * @param {Number} i The number to be checked
	 * @returns {String} The original number with 0's added
	 */
	function checkZeros (i) {
		if (i < 10) i = '0' + i;
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
		var hours = d / geofs.aircraft.instance.animationValue.ktas;
		var h = parseInt(hours);
		var m = Math.round(60 * (hours - h));
		if (a) m += Math.round(geofs.aircraft.instance.animationValue.altitude / 4000);
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
		return geofs.aircraft.instance.setup.fmc
			|| vnavProfile[geofs.aircraft.instance.id]
			|| vnavProfile.DEFAULT;
	}


	/**
	 * @private
	 * Checks if the speed input is mach and switches mode
	 *
	 * @param {Number} spd The speed to be checked
	 */
	function switchIfMach (spd) {
		if (spd <= 10) apModes.speed.isMach(true);
	}

	// Variables
	exports.todDist = todDist;
	exports.vnavEnabled = vnavEnabled;
	exports.spdControl = spdControl;
	exports.departure = departure;
	exports.arrival = arrival;
	exports.cruiseAlt = cruiseAlt;
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
