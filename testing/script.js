/* jshint browser:true, jquery:true, varstmt: false */
/* global geofs */

"use strict";

(function (load) {
    var timer = setInterval(function () {
        if (!(window.geofs && geofs.canvas)) return;

        clearInterval(timer);
        load();

    }, 250);
})(function load () {
    // Loads FMC
    $('<script data-main="fmc/source/init" src="/fmc/node_modules/requirejs/require.js"></script>' +
    '<script src="fmc/source/config.js?_=' + Date.now() + '"></script>').appendTo('head');
    
    // Sets up body class
    $('body').addClass('geofs-authenticated geofs-editor-role').removeClass('geofs-loggedout');

    // Removes authentication (no spinning wheel)
    $('.geofs-auth').remove();

    // Removes ui right frames
    $('.geofs-adsBlockedMessage').remove();
    $('.geofs-adbanner').remove();

    // Loads Imagery
    $('<script src="fmc/testing/imagery.js?_=' + Date.now() + '"></script>').appendTo('head');
});

