"use strict";

define(['knockout', 'utils', 'exports'], function (ko, utils, exports) {

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
			var fps = +geofs.debug.fps;
			var lat = (Math.round(10000 * geofs.aircraft.instance.llaLocation[0])) / 10000;
			var lon = (Math.round(10000 * geofs.aircraft.instance.llaLocation[1])) / 10000;
			var date = new Date();
			var h = date.getUTCHours();
			var m = date.getUTCMinutes();
			var time = utils.formatTime(utils.timeCheck(h, m));
			other = other || "--";

			var dataArray = [ time, spd, hdg, alt, lat, lon, fps, other ];
			exports.data.push(dataArray);
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
		exports.data.removeAll();
	};

});
