"use strict"; // jshint unused:false

define([
	'text!ui/button.html', 'text!ui/externaldist.html', 'text!ui/modal.html',
	'text!ui/ui.css', 'text!ui/tab-contents/route.html', 'text!ui/tab-contents/dep-arr.html',
	'text!ui/tab-contents/vnav.html', 'text!ui/tab-contents/progress.html',
	'text!ui/tab-contents/load-route.html', 'text!ui/tab-contents/log.html'
], function (button, externalDist, modal, css, route, depArr, vnav, progress, loadRoute, log) {
	// Main FMC stylesheet
	$('<style>').text(css).appendTo('head');

	// FMC toggle button
	$(button).insertAfter('button.gefs-f-standard-ui[data-panel=".gefs-map-list"]');

	// Modal dialog
	$(modal).appendTo('body');
	$(route).addClass('is-active').appendTo('.fmc-modal__content main');
	$(depArr).appendTo('.fmc-modal__content main');
	$(vnav).appendTo('.fmc-modal__content main');
	$(progress).appendTo('.fmc-modal__content main');
	$(loadRoute).appendTo('.fmc-modal__content main');
	$(log).appendTo('.fmc-modal__content main');

	// TODO
});
