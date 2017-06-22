(function () {
    "use strict";

    requirejs.config({
    	urlArgs: '_=' + Date.now(), // Cache bust
    	paths: {
    		text: '../node_modules/text/text',
    		minify: '../node_modules/minify/minify',
    		polyfill: '../node_modules/dialog-polyfill'
    	},
        shim: {
            // Adds UserScript
            'init': {
                deps: ['userscript']
            },

            // Requires license info
            'polyfill/dialog-polyfill': {
                deps: ['ui/polyfill-license']
            },
        }
    });
})();
