"use strict"; // jshint unused:false

define(['text!ui/button.html', 'text!ui/externaldist.html', 'text!ui/modal.html','text!ui/ui.css'], function (button, externalDist, modal, css) {
	// Main FMC stylesheet
	$('<style>').text(css).appendTo('head');

	// FMC toggle button
	$(button).insertAfter('button.gefs-f-standard-ui[data-panel=".gefs-map-list"]');

	// Modal dialog
	$(modal).appendTo('body');
	// TODO
});
