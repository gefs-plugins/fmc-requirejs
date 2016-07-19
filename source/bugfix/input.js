"use strict";

define(function () {
    /**
     * Fixes MDL input changes that use .change() function
     *
     * @param {jQuery} e jQuery element
     */
    return function (e) {
    	e.parent().addClass('is-dirty');
    };
});
