({
    baseUrl: "./source",
    name: "../node_modules/requirejs/require",
    include: "init",
    mainConfigFile: "./source/config.js",
    out: "./build/fmc.min.js",
    optimize: "uglify2"
});
