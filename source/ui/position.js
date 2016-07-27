"use strict"; // jshint unused:false

define([
	'ui/elements', 'polyfill/dialog-polyfill', 'minify!polyfill/dialog-polyfill.css',
	'minify!static/button.html', 'minify!static/externaldist.html', 'minify!static/modal.html',
	'static/tab-contents/main', 'style/main', 'ui/polyfill-license'
], function (
	E, dialogPolyfill, dialogPolyfillCSS, button,
	externalDist, modal, tabContents, mainCSS
) {
	// Main FMC stylesheet
	$('<style>').text(mainCSS).appendTo('head');

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
	$(tabContents).appendTo(E.container.modalContent);

	// FMC toggle button
	$(button).insertAfter('button.gefs-f-standard-ui[data-panel=".gefs-map-list"]');

	// TODO externalDist
});
