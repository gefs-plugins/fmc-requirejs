"use strict"; // jshint unused:false

define(['consts', 'distance', 'lib', 'log', 'math', 'toggles', 'vnav-profile', 'waypoints', 'nav/LNAV', 'nav/progress', 'nav/VNAV', 'redefine'], 
function (consts, distance, lib, log, math, toggles, vnavProfile, waypoints, lnav, progress, vnav) {

	/* ---- UI actions binding ---- */

	
	
	/* ---- All Initializations ---- */

	// Initializes all timers
	lnav.timer = setInterval(lnav.update, 5000);
	progress.timer = setInterval(progress.update, 5000);
	log.mainTimer = setInterval(log.update, 120000);
	log.gearTimer = setInterval(log.gear, 12000);
	log.flapsTimer = setInterval(log.flaps, 5000);
	log.speedTimer = setInterval(log.speed, 15000);
	
	// Adds one input field on start
	waypoints.addWaypoint();
	
	window.fmc = {
		version: "",
		requirejs: requirejs,
		require: require,
		define: define
	};
});
