/* jshint browser:true, jquery:true */
"use strict";

window.addEventListener('deferredload', function () {
    $('<script data-main="fmc/source/init" src="/fmc/node_modules/requirejs/require.js"></script>' +
    '<script src="fmc/source/config.js?_=' + Date.now() + '"></script>').appendTo('head');
});
