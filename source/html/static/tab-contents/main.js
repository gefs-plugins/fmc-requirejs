"use strict";

define([
    'minify!./route.html', 'minify!./dep-arr.html', 'minify!./vnav.html',
    'minify!./progress.html', 'minify!./load-route.html', 'minify!./log.html'
], function (route, depArr, vnav, progress, loadRoute, log) {
    return [route, depArr, vnav, progress, loadRoute, log].join('');
});
