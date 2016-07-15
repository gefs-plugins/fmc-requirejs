"use strict"; // jshint unused:false

define(['consts', 'distance', 'lib', 'log', 'math', 'toggles', 'waypoints', 'nav/LNAV', 'nav/progress', 'nav/VNAV', 'redefine'],
function (consts, distance, lib, log, math, toggles, waypoints, lnav, progress, vnav) {

	/* ---- UI actions binding ---- */

	// FMC Modal: open and close features
	var modal = document.getElementsByClassName('fmc-modal')[0];
    var button = $('.fmc-btn');

    button.click(function () {
    	if (!modal.open) modal.showModal();
		else modal.close();
    });

    $(modal).find('.close').click(function () {
		modal.close();
	});
	// ----

	// Add waypoint list
	$('button[action="add-wpt"]').click(function () {
		waypoints.addWaypoint();
		componentHandler.upgradeDom();
	});
	/* ---- All Initializations ---- */

	// Initializes all timers
	// FIXME It is annoying when debugging
	/*lnav.timer = setInterval(lnav.update, 5000);
	progress.timer = setInterval(progress.update, 5000);
	log.mainTimer = setInterval(log.update, 120000);
	log.gearTimer = setInterval(log.gear, 12000);
	log.flapsTimer = setInterval(log.flaps, 5000);
	log.speedTimer = setInterval(log.speed, 15000);*/

	// Adds one input field on start
	waypoints.addWaypoint();

	window.fmc = {
		version: "",
		requirejs: requirejs,
		require: require,
		define: define
	};
});
