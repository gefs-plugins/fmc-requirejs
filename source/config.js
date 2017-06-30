(function () {
    "use strict";

    requirejs.config({
    	urlArgs: '_=' + Date.now(), // Cache bust
    	paths: {
    		text: '../node_modules/minify/node_modules/text/text',
    		minify: '../node_modules/minify/minify'
    	},
        shim: {
            // Adds UserScript
            'init': {
                deps: ['userscript']
            }
        }
    });
})();
