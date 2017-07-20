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
         * Fixes MDL input: is-dirty and/or is-focused
         *
         * @param {HTMLElement} e The HTML Element to be checked
         */
         mdlInput: function (e) {debugger;
             var materialTextfield = e.parentNode.MaterialTextfield;
             if (!materialTextfield) return;

             materialTextfield.checkDirty();
             materialTextfield.checkFocus();
         },

         /**
          * Updates MDL checkbox switch manually
          *
          * @param {HTMLElement} e
          */
          mdlSwitch: function (e) {
              var materialSwitch = e.parentNode.MaterialSwitch;
              if (!materialSwitch) return;

              materialSwitch.checkDisabled();
              materialSwitch.checkToggleState();
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
