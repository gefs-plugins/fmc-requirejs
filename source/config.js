(function () {
    "use strict";

    requirejs.config({
    	urlArgs: '_=' + Date.now(), // Cache bust
    	paths: {
            geodesic: '../node_modules/Leaflet.Geodesic/Leaflet.Geodesic',
            knockout: '../node_modules/knockout/build/output/knockout-latest',
    		text: '../node_modules/text/text'
    	}
    });
})();
