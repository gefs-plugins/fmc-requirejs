(function () {
    "use strict";

    requirejs.config({
    	urlArgs: '_=' + Date.now(), // Cache bust
    	paths: {
            knockout: '../node_modules/knockout/build/output/knockout-latest',
    		text: '../node_modules/text/text',
    		minify: '../node_modules/minify/minify'
    	}
    });
})();
