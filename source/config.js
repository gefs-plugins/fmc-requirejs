(function () {
    "use strict";

    requirejs.config({
    	urlArgs: '_=' + Date.now(), // Cache bust
    	paths: {
            geodesic: '../node_modules/leaflet.geodesic/dist/leaflet.geodesic',
            knockout: '../node_modules/knockout/build/output/knockout-latest',
    		text: '../node_modules/text/text'
    	}
    });
})();
