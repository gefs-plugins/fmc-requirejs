"use strict";

define([
    'minify!./button.css', 'minify!./externaldist.css', 'minify!./modal.css',
    'minify!./route.css', 'minify!./waypoints.css', 'minify!./arr.css',
    'minify!./vnav.css', 'minify!./progress.css', 'minify!./map.css',
    'minify!./load.css', 'minify!./log.css'
], function (
    button, externalDist, modal, route, waypoints,
    arr, vnav, progress, map, load, log
) {
    return [
        button, externalDist, modal, route, waypoints,
        arr, vnav, progress, map, load, log
    ].join('');
});
