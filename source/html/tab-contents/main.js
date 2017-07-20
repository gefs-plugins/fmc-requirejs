"use strict";

define([
    'minify!./route.html', 'minify!./arr.html', 'minify!./legs.html',
    'minify!./vnav.html', 'minify!./ils.html', 'minify!./progress.html',
    'minify!./map.html', 'minify!./load.html', 'minify!./log.html'
], function (route, arr, legs, vnav, ils, progress, map, load, log) {
    return [route, arr, legs, vnav, ils, progress, map, load, log].join('');
});
