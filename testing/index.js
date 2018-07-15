"use strict";

const heads = require('robohydra').heads;
const RoboHydraHeadFilesystem = heads.RoboHydraHeadFilesystem;
const RoboHydraHeadFilter = heads.RoboHydraHeadFilter;
const RoboHydraHeadProxy = heads.RoboHydraHeadProxy;
const path = require('path');

const script = '<script src="fmc/testing/script.js"></script></head>';

exports.getBodyParts = function () {
	return {
		heads: [
			new RoboHydraHeadFilesystem({
				mountPath: '/fmc',
				documentRoot: path.join(__dirname, '../.')
			}),

			new RoboHydraHeadFilter({
				path: '/geofs.php*',
				filter: buffer => buffer.toString()
					.replace(/geofs\.jsapiKey = '[^]*?'/, 'geofs.jsapiKey = "AIzaSyBlCxVOtJO6rKOmWnIhHSWx2EHzU_7hakQ"')
					.replace('</head>', script)
			}),

			new RoboHydraHeadProxy({
				mountPath: '/',
				proxyTo: 'https://www.geo-fs.com',
				setHostHeader: true
			})
		]
	};
};

console.log('Please go to http://127.0.0.1:3000/geofs.php to start GeoFS.');
console.log('To exit, press Ctrl+C or close this window.');
