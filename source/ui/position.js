"use strict"; // jshint unused:false

define([
	'bugfix/compatible', 'polyfill/dialog-polyfill', 'text!polyfill/dialog-polyfill.css',
	'text!ui/button.html', 'text!ui/externaldist.html', 'text!ui/modal.html',
	'text!ui/ui.css', 'text!ui/tab-contents/route.html', 'text!ui/tab-contents/dep-arr.html',
	'text!ui/tab-contents/vnav.html', 'text!ui/tab-contents/progress.html',
	'text!ui/tab-contents/load-route.html', 'text!ui/tab-contents/log.html', 'polyfill/license'
], function (
	compatible, dialogPolyfill, dialogPolyfillCSS, button,
	externalDist, modal, css, route, depArr, vnav, progress, loadRoute, log
) {
	// Modal dialog
	$(modal).appendTo('body');
	$('.fmc-modal__content main').append(
		$(route).addClass('is-active'),
		$(depArr),
		$(vnav),
		$(progress),
		$(loadRoute),
		$(log)
	);

	// Compatibility check
	if (!compatible) {
		dialogPolyfill.registerDialog(document.querySelector('dialog'));
		$('<style>').text(dialogPolyfillCSS).appendTo('head');
	}

	// Main FMC stylesheet
	$('<style>').text(css).appendTo('head');

	// FMC toggle button
	$(button).insertAfter('button.gefs-f-standard-ui[data-panel=".gefs-map-list"]');

	// TODO externalDist
});
