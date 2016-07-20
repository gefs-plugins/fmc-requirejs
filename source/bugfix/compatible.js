"use strict";

define(['bugfix/bowser'], function (bowser) {
    /**
     * Finds if the browser in use is compatible
     *
     * @description Compatible Browsers:
     * - Chrome: >= 37.0
     * - Opera: >= 24.0
     * FIXME: Find out why bowser.check does not produce the result
     */
    return bowser.name === 'Chrome' && bowser.chrome && Number(bowser.version) >= 37
        || bowser.name === 'Opera' && bowser.opera && Number(bowser.version) >= 24;
});
