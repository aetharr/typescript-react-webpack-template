const gulp = require("gulp");
const path = require("path");
const del = require("del");
const gutil = require("gulp-util");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");

const webpack_client_config = require("./webpack.config").createConfig;
const server_settings = require("./devenv-settings");

function getWebpackConsoleStats(isProduction) {
    return({
        colors: true,
        chunks: false,
        assets: isProduction || false,
        assets: true,
        timings: true,
        modules: false,
        hash: false,
        version: false
    });
}
function printBuildType(name) {
    console.log(`Building ${name} for ${isProduction() ? "Production" : "Development"}`)
};

gulp.task("clean", callback => {
    del([
        "./html/build",
        "./html/index.html"
    ]).then(result => { callback(); });
});
gulp.task("build",
    gulp.series(
        "clean",
        complileClient
    )
);
gulp.task("dev",
    gulp.series(
        "clean",
        setDevelopmentEnv,
        watchClient
    )
);
gulp.task("prod",
    gulp.series(
        "clean",
        setProductionEnv,
        complileClient
    )
);
gulp.task("default",
    gulp.series("dev")
);

function setDevelopmentEnv(callback) {
    process.env.NODE_ENV = "development";
    callback();
}
function setProductionEnv(callback) {
    process.env.NODE_ENV = "production";
    callback();
}
function isProduction() {
    return process.env.NODE_ENV === "production";
}

function complileClient(callback) {
    printBuildType("Client");
    webpack(webpack_client_config(!isProduction()), (err, stats) => {
        if (err) {
            callback(err);
            return;
        }
        console.log(stats.toString(getWebpackConsoleStats(isProduction())));
        callback();
    })
};
function watchClient() {
    const compiler = webpack(webpack_client_config(!isProduction()));
    const server = new WebpackDevServer(compiler, {
        contentBase: path.resolve(__dirname, "html"),
        publicPath: "/",
        disableHostCheck: true,
        hot: true,
        stats:getWebpackConsoleStats(isProduction()),
        //headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Credentials": "true" }
    });

    server.listen(server_settings.clientDevPort, () => {});
};