"use strict";

define([
    'minify!./route.html', 'minify!./arr.html', 'minify!./vnav.html',
    'minify!./progress.html', 'minify!./map.html', 'minify!./load.html',
    'minify!./log.html'
], function (route, arr, vnav, progress, map, load, log) {
    return [route, arr, vnav, progress, map, load, log].join('');
});
