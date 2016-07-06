"use strict";

define(['lib', 'VNAV'], function (lib, vnav) {
	return {
		/**
		 * Enables VNAV if not activated, disables if activated
		 */
		tVNAV: function () {
			if (lib.VNAV) {
				lib.VNAV = false;
				$('#vnavButton').removeClass('btn btn-warning').addClass('btn');
				clearInterval(vnav.timer);
			} else if (lib.cruise) {
				lib.VNAV = true;
				$('#vnavButton').removeClass('btn').addClass('btn btn-warning');
				vnav.timer = setInterval(vnav.update, 5000);
			} else alert('Please enter a cruising altitude.');
		}, 

		/**
		 * Enables or disables the speed control in VNAV
		 */
		tSpd: function () {
			if ($('#tSpd').hasClass('btn-warning')) {
				$('#tSpd')
					.removeClass('btn-warning')
					.addClass('btn-default')
					.text('OFF');
				// FIXME spdControl = false;

			} else {
				$('#tSpd')
					.removeClass('btn-default')
					.addClass('btn-warning')
					.text('ON');
				// FIXME spdControl = true;
			}
		}
	};
});
