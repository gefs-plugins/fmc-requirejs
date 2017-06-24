"use strict";

define(['ui/elements'], function (E) {

     return {
        /**
        * Fixes MDL input changes that use .change() function
        *
        * @param {jQuery} e jQuery element
        */
        input: function (e) {
        	e.parent().addClass('is-dirty');
        },

        /**
         * Stops input key propagation
         */
        stopPropagation: function () {
            function stopPropagation (event) {
                event.stopImmediatePropagation();
            }

            $(E.modal).find('input')
                .keyup(stopPropagation)
                .keydown(stopPropagation)
                .keypress(stopPropagation);
        }
    };
});
