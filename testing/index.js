"use strict";

// jshint node:true
var heads = require('robohydra').heads;
var RoboHydraHeadFilesystem = heads.RoboHydraHeadFilesystem;
var RoboHydraHeadFilter = heads.RoboHydraHeadFilter;
var RoboHydraHeadProxy = heads.RoboHydraHeadProxy;
var path = require('path');
var script = '<script data-main="fmc/source/init" src="/fmc/node_modules/requirejs/require.js"></script>\
	<script src="fmc/source/config.js?_=' + Date.now() + '"></script></head>';

exports.getBodyParts = function () {
	return {
		heads: [
			new RoboHydraHeadFilesystem({
				mountPath: '/fmc',
				documentRoot: path.join(__dirname, '../.')
			}),

			new RoboHydraHeadFilter({
				path: '/geofs.php*',
				filter: function (buffer) {
					return buffer.toString().replace('</head>', script);
				}
			}),

			new RoboHydraHeadProxy({
				mountPath: '/',
				proxyTo: 'http://www.geo-fs.com',
				setHostHeader: true
			})
		]
	};
};

console.log('Please go to http://127.0.0.1:3000/geofs.php to start GeoFS.');
console.log('To exit, press Ctrl+C or close this window.');
