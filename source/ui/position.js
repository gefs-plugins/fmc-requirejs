"use strict";

define([
	'./elements', 'polyfill/dialog-polyfill', 'minify!polyfill/dialog-polyfill.css',
	'minify!html/static/button.html', 'minify!html/static/externaldist.html',
	'minify!html/static/modal.html', 'html/static/tab-contents/main', 'style/main'
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
	})(document.querySelector(E.modal));

	// Inits tab contents
	$(tabContents).appendTo(E.container.modalContent);

	// FMC toggle button
	$(button).insertAfter('button.geofs-f-standard-ui[data-toggle-panel=".geofs-map-list"]');

	// External Distance indicator
	$(externalDist).appendTo('.geofs-ui-bottom');
});
