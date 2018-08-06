'use strict';

define(['text'], function (text) {

    var buildMap = {};

    /**
     * Removes white space from a string (HTML and CSS only) on load
     *
     * @param {String} content The string to be trimmed and minified
     * @returns {String} Content that has been minified
     */
    function minifyOnLoad (content) {
        return content.replace(/\r/g, "") // Carriage return
            .replace(/\n\s+/g, "") // New line followed by white space
            .replace(/\n/g, "") // Extra new lines
            .replace(/\t/g, "") // Extra tabs
            .replace(/\s*{/g, "{") // CSS open brace
            .replace(/\s*\:\s*/g, ":") // CSS definition colons
            .replace(/\s*;\s*/g, ";") // CSS semi-colons
            .replace(/\s*\/\*[^]*?\*\/\s*/g, "") // CSS comments
            .replace(/\s*<!--[^\/?ko]*?-->\s*/g, "") // HTML comments (no ko)
            .replace(/\s*<!--/g, "<!--") // ko comment open tag
            .replace(/-->\s*/g, "-->"); // ko comment close tag
    }

    /**
     * Properly escapes javascript's String on module build
     *
     * @param {String} content The string to be escaped during build
     * @returns {String} Content that has been optimized for build
     */
    function minifyOnBuild (content) {
        return content
            .replace(/\\/g, "\\\\") // Escapes backslash (\)
            .replace(/'/g, "\\'"); // Single quotes
    }

    return {
        /**
         * Executes minify() when module is required
         *
         * @param {String} name Name of this module
         * @param {Object} require The require object passed in by requirejs
         * @param {Function} onLoad Callback function to update content
         * @param {Object} config Determine require type
         */
        load: function (name, require, onLoad, config) {
            if (config && config.isBuild && !config.inlineText) {
                onLoad(null);
            } else {
                text.get(require.toUrl(name), function (content) {
                    buildMap[name] = minifyOnLoad(content);
                    onLoad(buildMap[name]);
                });
            }
        },

        /**
         * Turns passed in content into a requirejs module when being built
         *
         * @param {String} pluginName Name of this module when it is required
         * @param {String} moduleName Name of the module that required this one
         * @param {Function} write Callback function to write as module
         */
        write: function (pluginName, moduleName, write) {
            if (moduleName in buildMap) {
                var content = minifyOnBuild(buildMap[moduleName]);
                write("define('" + pluginName + "!" + moduleName
                    + "', function () { return '" + content + "';});\n");
            }
        }
    };
});
