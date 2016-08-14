"use strict";

define([
    'minify!./button.css', 'minify!./externaldist.css', 'minify!./modal.css',
    'minify!./route.css', 'minify!./waypoints.css', 'minify!./dep-arr.css',
    'minify!./vnav.css', 'minify!./progress.css', 'minify!./map.css',
    'minify!./load-route.css', 'minify!./log.css'
], function (
    button, externalDist, modal, route, waypoints,
    depArr, vnav, progress, map, loadRoute, log
) {
    return [
        button, externalDist, modal, route, waypoints,
        depArr, vnav, progress, map, loadRoute, log
    ].join('');
});
