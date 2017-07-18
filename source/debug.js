"use strict";

define(['ui/elements'], function (E) {

    // Production flag to determine if debug info is printed
    var PRODUCTION = false;

    // Stops event propagation
    function stopPropagation (event) {
        event.stopImmediatePropagation();
    }


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
            $(E.modal).find('input')
                .keyup(stopPropagation)
                .keydown(stopPropagation)
                .keypress(stopPropagation);
        },

        /**
         * Logs debug statement into console when needed if not PRODUCTION
         */
         log: function (text) {
             if (!PRODUCTION) console.log(text);
         }
    };
});
