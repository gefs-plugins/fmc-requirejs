"use strict";

(function (init) {
	var timer = setInterval(function () {
		if (window.gefs && gefs.aircraft && gefs.aircraft.object3d) {
			clearInterval(timer);
			init();
		}
	}, 4);
})
(function () {
	define(function (require) {
		var lnav = require('LNAV');
		var progress = require('progress');
		var log = require('log');
		var ui = require('ui');
		
		// Initializes all UI's
		ui.button.appendTo(/*!TODO*/);
		ui.externalDist.appendTo(/*!TODO*/);
		ui.modal.appendTo('body');
		
		// Initializes all timers
		lnav.timer = setInterval(lnav.update, 5000);
		progress.timer = setInterval(progress.update, 5000);
		log.mainTimer = setInterval(log.update, 120000);
		log.gearTimer = setInterval(log.gear, 12000);
		log.flapsTimer = setInterval(log.flaps, 5000);
		log.speedTimer = setInterval(log.speed, 15000);
		
		
		// Adds one input field on start
		require('waypoints').addWaypoint();
	
		// Makes sure debug loads
		require('debug');
	
		// TODO
		// Add main functions, including setting up the timers properly
		// Implement the ui section
	});
	
	window.fmc = {
		require: require,
		requirejs: requirejs,
		define: define,
		version: ""
	};
});
