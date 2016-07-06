"use strict";

define(function () {
	// Default VNAV profile
	var DEFAULT_PROFILE = {
		"climb": [
			[1500, 4000, 210, 3000],
			[4000, 10000, 250, 2500],
			[10000, 18000, 295, 2200],
			[18000, 27000, 295, 1800],
			[27000, 30000, 295, 1500],
			[30000, 1e99, 0.78, 1500]
		],
		"descent": [
			[30000, 1e99, 0.78, -2300],
			[18000, 30000, 295, -2100],
			[12000, 18000, 280, -1800],
			[10000, 12000, 250, -1500]
		]
	};

	return {
		forceUpdate: function () {
			return gefs.aircraft.setup.fmc || DEFAULT_PROFILE;
		}
	};
});
