"use strict";

define(['flight'], function (flight) {

	return {
		mainTimer: null, // = setInterval(updateLog, 120000);
		gearTimer: null, // = setInterval(checkGear, 12000);
		flapsTimer: null, // = setInterval(checkFlaps, 5000);
		speedTimer: null, // = setInterval(checkSpeed, 15000);

		/**
		 * Updates plane's flight log, set on a timer
		 *
		 * @param [optional]{String} other Updates the log with other as extra info
		 */
		update: function (other) {
			if (!gefs.pause && !window.flight.recorder.playing && !window.flight.recorder.paused) {
				var spd = Math.round(gefs.aircraft.animationValue.ktas);
				var hdg = Math.round(gefs.aircraft.animationValue.heading360);
				var alt = Math.round(gefs.aircraft.animationValue.altitude);
				var fps = gefs.debug.fps;
				var lat = (Math.round(10000 * gefs.aircraft.llaLocation[0])) / 10000;
				var lon = (Math.round(10000 * gefs.aircraft.llaLocation[1])) / 10000;
				var date = new Date();
				var h = date.getUTCHours();
				var m = date.getUTCMinutes();
				var time = flight.formatTime(flight.timeCheck(h, m));
				other = other || "none";
				$('<tr>')
					.addClass('data')
					.append(
						$('<td>' + time + '</td>')
							.css('padding', '0px 10px 0px 10px')
					,	$('<td>' + spd + '</td>')
							.css('padding', '0px 10px 0px 10px')
					,	$('<td>' + hdg + '</td>')
							.css('padding', '0px 10px 0px 10px')
					,	$('<td>' + alt + '</td>')
							.css('padding', '0px 10px 0px 10px')
					,	$('<td>' + lat + '</td>')
							.css('padding', '0px 10px 0px 10px')
					,	$('<td>' + lon + '</td>')
							.css('padding', '0px 10px 0px 10px')
					,	$('<td>' + fps + '</td>')
							.css('padding', '0px 10px 0px 10px')
					,	$('<td>' + other + '</td>')
							.css('padding', '0px 10px 0px 10px')
					)
					.appendTo('#logData');
			}
			clearInterval(this.mainTimer);
			if (gefs.aircraft.animationValue.altitude > 18000) {
				this.mainTimer = setInterval(this.update, 120000);
			} else this.mainTimer = setInterval(this.update, 30000);
		},

		/**
		 * Checks for gear retraction and extension for log, set on a timer
		 */
		gear: function () {
			if (gefs.aircraft.animationValue.gearPosition !== gefs.aircraft.animationValue.gearTarget) {
				if (gefs.aircraft.animationValue.gearTarget === 1) this.update('Gear Up');
				else this.update('Gear Down');
			}
			clearInterval(this.gearTimer);
			if (gefs.aircraft.animationValue.altitude < 10000) this.gearTimer = setInterval(this.gear, 12000);
			else this.gearTimer = setInterval(this.gear, 60000);
		},

		/**
		 * Checks for flaps target and position for log, set on a timer
		 */
		flaps: function () {
			if (gefs.aircraft.animationValue.flapsPosition !== gefs.aircraft.animationValue.flapsTarget) {
				this.update('Flaps set to ' + gefs.aircraft.animationValue.flapsTarget);
			}
		},

		/**
		 * Checks for overspeed under 10000 feet for log, set on a timer
		 */
		speed: function () {
			var kcas = gefs.aircraft.animationValue.kcas;
			var altitude = gefs.aircraft.animationValue.altitude;
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
			$('#logData tr').remove('.data');
		}
	};
});
