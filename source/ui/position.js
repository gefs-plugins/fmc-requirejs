"use strict";

define([
	'./elements', 'minify!html/static/button.html', 'minify!html/static/externaldist.html',
	'minify!html/static/modal.html', 'html/static/tab-contents/main', 'style/main'
], function (E, button, externalDist, modal, tabContents, mainCSS) {
	// Main FMC stylesheet
	$('<style>').text(mainCSS).appendTo('head');

	// Inits Modal dialog
	$(modal).appendTo('body');

	// Inits tab contents
	$(tabContents).appendTo(E.container.modalContent);

	// FMC toggle button
	$(button).insertAfter('button.geofs-f-standard-ui[data-toggle-panel=".geofs-map-list"]');

	// External Distance indicator
	$(externalDist).appendTo('.geofs-ui-bottom');
});
