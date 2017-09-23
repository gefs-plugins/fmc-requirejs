"use strict";

define([
	'./elements', 'minify!html/button.html', 'minify!html/externaldist.html',
	'minify!html/modal.html', 'html/tab-contents/main', 'style/main'
], function (E, button, externalDist, modal, tabContents, mainCSS) {

	return new Promise(function (resolve) {
		// Main FMC stylesheet
		$('<style>').addClass('fmc-stylesheet').text(mainCSS).appendTo('head');

		// Inits Modal dialog
		$(modal).appendTo('body');

		// Inits tab contents
		$(tabContents).appendTo(E.container.modalContent);

		// FMC toggle button
		$(button).insertAfter('button.geofs-f-standard-ui[data-toggle-panel=".geofs-map-list"]');

		// External Distance indicator
		$(externalDist).appendTo('.geofs-ui-bottom');

		resolve();
	});

});
