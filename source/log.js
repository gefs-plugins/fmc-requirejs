"use strict";

define(['knockout', 'ui/elements', 'flight', 'exports'], function (ko, E, flight, exports) {

	var animationValue = geofs.aircraft.instance.animationValue;

	exports.mainTimer = null;
	exports.speedTimer = null;

	exports.data = ko.observableArray();

	/**
	 * Updates plane's flight log, set on a timer
	 *
	 * @param {String} [other] Updates the log with other as extra info
	 */
	exports.update = function (other) {
		if (!geofs.pause && !(window.flight.recorder.playing || window.flight.recorder.paused)) {
			var spd = Math.round(animationValue.ktas);
			var hdg = Math.round(animationValue.heading360);
			var alt = Math.round(animationValue.altitude);
			var fps = geofs.debug.fps;
			var lat = (Math.round(10000 * geofs.aircraft.instance.llaLocation[0])) / 10000;
			var lon = (Math.round(10000 * geofs.aircraft.instance.llaLocation[1])) / 10000;
			var date = new Date();
			var h = date.getUTCHours();
			var m = date.getUTCMinutes();
			var time = flight.formatTime(flight.timeCheck(h, m));
			other = other || "--";

			var dataObject = {
				time: time,
				spd: spd,
				hdg: hdg,
				alt: alt,
				lat: lat,
				lon: lon,
				fps: fps,
				other: other
			};

			exports.data.push(dataObject);
		}
		clearInterval(exports.mainTimer);
		if (animationValue.altitude > 18000) {
			exports.mainTimer = setInterval(exports.update, 120000);
		} else exports.mainTimer = setInterval(exports.update, 30000);
	};

	/**
	 * Checks for overspeed under 10000 feet AGL for log, set on a timer
	 */
	exports.speed = function () {
		var kcas = animationValue.kcas;
		var altitude = animationValue.altitude + geofs.groundElevation * METERS_TO_FEET;
		if (kcas > 255 && altitude < 10000) {
			exports.update('Overspeed');
		}
		clearInterval(exports.speedTimer);
		if (altitude < 10000) exports.speedTimer = setInterval(exports.speed, 15000);
		else exports.speedTimer = setInterval(exports.speed, 30000);
	};

	/**
	 * Clears the log
	 */
	exports.removeData = function () {
		exports.data.destroyAll();
	};

	/**
	 * Prints warning statements to FMC warning section, lasting 5 seconds
	 */
	exports.warn = function (warning) {
		var $container = $(E.container.warning).text(warning);
		setTimeout(function () { $container.text(''); }, 5000);
	};
});
