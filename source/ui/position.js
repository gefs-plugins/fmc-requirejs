"use strict"; // jshint unused:false

define([
	'ui/elements', 'polyfill/dialog-polyfill', 'minify!polyfill/dialog-polyfill.css',
	'minify!ui/button.html', 'minify!ui/externaldist.html', 'minify!ui/modal.html',
	'minify!ui/style.css', 'minify!ui/tab-contents/route.html', 'minify!ui/tab-contents/dep-arr.html',
	'minify!ui/tab-contents/vnav.html', 'minify!ui/tab-contents/progress.html',
	'minify!ui/tab-contents/load-route.html', 'minify!ui/tab-contents/log.html', 'polyfill-license'
], function (
	E, dialogPolyfill, dialogPolyfillCSS, button, externalDist,
	modal, css, route, depArr, vnav, progress, loadRoute, log
) {
	// Main FMC stylesheet
	$('<style>').text(css).appendTo('head');

	// Inits Modal dialog
	$(modal).appendTo('body');

	// Compatibility check
	(function (element) {
		if (!element.showModal) {
			$('<style>').text(dialogPolyfillCSS).appendTo('head');
			dialogPolyfill.registerDialog(element);
		}
	})(document.querySelector('.fmc-modal'));

	// Inits tab contents
	$(E.container.modalContent).append(
		$(route).addClass('is-active'),
		$(depArr),
		$(vnav),
		$(progress),
		$(loadRoute),
		$(log)
	);

	// FMC toggle button
	$(button).insertAfter('button.gefs-f-standard-ui[data-panel=".gefs-map-list"]');

	// TODO externalDist
});
