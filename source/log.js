"use strict";

define(['ui/elements', 'flight'], function (E, flight) {

	var animationValue = geofs.aircraft.instance.animationValue;

	var log = {
		mainTimer: null, // = setInterval(updateLog, 120000);
		speedTimer: null, // = setInterval(checkSpeed, 15000);

		/**
		 * Updates plane's flight log, set on a timer
		 *
		 * @param {String} [other] Updates the log with other as extra info
		 */
		update: function (other) {
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
				$('<tr>')
					.addClass('log-data')
					.append(
						$('<td>' + time + '</td>'),
						$('<td>' + spd + '</td>'),
						$('<td>' + hdg + '</td>'),
						$('<td>' + alt + '</td>'),
						$('<td>' + lat + '</td>'),
						$('<td>' + lon + '</td>'),
						$('<td>' + fps + '</td>'),
						$('<td>' + other + '</td>')
					).appendTo($(E.container.logTable).find('tbody'));
			}
			clearInterval(this.mainTimer);
			if (animationValue.altitude > 18000) {
				this.mainTimer = setInterval(this.update, 120000);
			} else this.mainTimer = setInterval(this.update, 30000);
		},

		/**
		 * Checks for overspeed under 10000 feet AGL for log, set on a timer
		 */
		speed: function () {
			var kcas = animationValue.kcas;
			var altitude = animationValue.altitude + geofs.groundElevation * METERS_TO_FEET;
			if (kcas > 255 && altitude < 10000) {
				this.update('Overspeed');
			}
			clearInterval(this.speedTimer);
			if (altitude < 10000) this.speedTimer = setInterval(this.speed, 15000);
			else this.speedTimer = setInterval(this.speed, 30000);
		},

		/**
		 * Clears the log
		 */
		removeData: function () {
			$(E.container.logData).remove();
		}
	};

	return log;
});
