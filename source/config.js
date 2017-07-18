(function () {
    "use strict";

    requirejs.config({
    	urlArgs: '_=' + Date.now(), // Cache bust
    	paths: {
    		text: '../node_modules/text/text',
    		minify: '../node_modules/minify/minify'
    	}
    });
})();
