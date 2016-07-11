"use strict";

// jshint node:true
var heads = require('robohydra').heads;
var RoboHydraHeadFilesystem = heads.RoboHydraHeadFilesystem;
var RoboHydraHeadStatic = heads.RoboHydraHeadStatic;
var RoboHydraHeadFilter = heads.RoboHydraHeadFilter;
var RoboHydraHeadProxy = heads.RoboHydraHeadProxy;
var path = require('path');
var script = '<script data-main="/fmc/main" src="/requirejs/require.js"></script></head>';

exports.getBodyParts = function (conf) { //jshint unused:false
	return {
		heads: [
			new RoboHydraHeadFilesystem({
				mountPath: '/fmc',
				documentRoot: path.join(__dirname, '../source')
			}),
			
			new RoboHydraHeadFilesystem({
				mountPath: '/requirejs',
				documentRoot: path.join(__dirname, '../node_modules/requirejs')
			}),

			new RoboHydraHeadFilter({
				path: '/gefs.php*',
				filter: function (buffer) {
					return buffer.toString().replace('</head>', script);
				}
			}),

			new RoboHydraHeadProxy({
				mountPath: '/',
				proxyTo: 'http://www.gefs-online.com',
				setHostHeader: true
			})
		]
	};
};

console.log('Please go to http://127.0.0.1:3000/gefs.php to start Cesium-GEFS.');
console.log('To exit, press Ctrl+C or close this window.');
