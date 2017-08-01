"use strict";

define([
    'minify!./button.css', 'minify!./externaldist.css', 'minify!./modal.css',
    'minify!./route.css', 'minify!./waypoints.css', 'minify!./dep-arr.css',
    'minify!./legs.css', 'minify!./vnav.css', 'minify!./ils.css',
    'minify!./progress.css', 'minify!./map.css', 'minify!./load.css', 'minify!./log.css'
], function (
    button, externalDist, modal, route, waypoints,
    depArr, legs, vnav, ils, progress, map, load, log
) {
    return [
        button, externalDist, modal, route, waypoints,
        depArr, legs, vnav, ils, progress, map, load, log
    ].join('');
});
