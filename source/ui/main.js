"use strict"; // jshint unused:false

define(['consts', 'distance', 'lib', 'LNAV', 'log', 'math', 'progress', 'toggle', 'vnav-profile', 'VNAV', 'waypoints', 'text!ui/button.html', 'text!ui/externaldist.html', 'text!ui/modal.html','text!ui/ui.css', 'redefine'], 
function (consts, distance, lib, lnav, log, math, progress, toggle, vnavProfile, vnav, waypoints, ui_button, ui_externaldist, ui_modal, ui_css) {

	/* ---- UI Initialization ---- */
	$('<style>').text(ui_css).appendTo('head');
	// TODO

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
