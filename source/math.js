"use strict";

define(['consts'], function (consts) {
	return {
		/**
		 * Turns degrees to radians
		 *
		 * @param {Number} d The degree to be converted
		 * @returns {Number} Radians of the degree
		 */
		toRadians: function (d) {
			return d * Math.PI / 180;
		},

		/**
		 * Converts radians to degrees
		 *
		 * @param {Number} r The radian to be converted
		 * @returns {Number} Degree of the radian
		 */
		toDegrees: function (r) {
			return r * 180 / Math.PI;
		},

		/**
		 * Computes the ground speed of the aircraft
		 *
		 * @returns {Number} The ground speed of the aircraft
		 */
		getGroundSpeed: function () {
			var tas = gefs.aircraft.animationValue.ktas;
			var vs = (60 * gefs.aircraft.animationValue.climbrate) * consts.feetToNM;
			console.log("tas: " + tas + ", vs: " + vs);
			return Math.sqrt(tas * tas - vs * vs);
		},

		/**
		 * Computes the distance between two sets of coordinates
		 *
		 * @param {Number} lat1 Latitude of first coordinate
		 * @param {Number} lon1 Longetude of first coordinate
		 * @param {Number} lat2 Latitude of second coordinate
		 * @param {Number} lon2 Longetude of second coordinate
		 * @returns {Number} The distance computed, in nautical miles
		 */
		getDistance: function (lat1, lon1, lat2, lon2) {
			var dlat = this.toRadians(lat2 - lat1);
			var dlon = this.toRadians(lon2 - lon1);
			lat1 = this.toRadians(lat1);
			lat2 = this.toRadians(lat2);
			var a = Math.sin(dlat / 2) * Math.sin(dlat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			return this.earthRadiusNM * c;
		},

		/**
		 * Computes the bearing between two sets of coordinates
		 *
		 * @param {Number} lat1 Latitude of first coordinate
		 * @param {Number} lon1 Longetude of first coordinate
		 * @param {Number} lat2 Latitude of second coordinate
		 * @param {Number} lon2 Longetude of second coordinate
		 * @returns {Number} The bearing computed, in degrees 360 format
		 */
		getBearing: function (lat1, lon1, lat2, lon2) {
			lat1 = this.toRadians(lat1);
			lat2 = this.toRadians(lat2);
			lon1 = this.toRadians(lon1);
			lon2 = this.toRadians(lon2);
			var y = Math.sin(lon2 - lon1) * Math.cos(lat2);
			var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
			var brng = this.toDegrees(Math.atan2(y, x));
			return brng;
		},

		/**
		 * Computes the climb rate with an altitude restriction
		 *
		 * @param {Number} deltaAlt The altitude difference
		 * @param {Number} nextDist The distance to the restriction point
		 * @returns {Number} The climb rate necessary to attain the restriction
		 */
		getClimbrate: function (deltaAlt, nextDist) {
			var gs = this.getGroundSpeed();
			var vs = 100 * Math.round((gs * (deltaAlt / (nextDist * consts.nmToFeet)) * consts.nmToFeet / 60) / 100);
			return vs;
		},

		/**
		 * Earth's radius in nautical miles, used to calculate Great Circle Distance
		 */
		earthRadiusNM: 3440.06
	};
});
