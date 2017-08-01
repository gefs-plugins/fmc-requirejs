"use strict";

define([
    'minify!./route.html', 'minify!./dep-arr.html', 'minify!./legs.html',
    'minify!./vnav.html', 'minify!./ils.html', 'minify!./progress.html',
    'minify!./map.html', 'minify!./load.html', 'minify!./log.html'
], function (route, depArr, legs, vnav, ils, progress, map, load, log) {
    return [route, depArr, legs, vnav, ils, progress, map, load, log].join('');
});
