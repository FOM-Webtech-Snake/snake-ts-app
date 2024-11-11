const webpackCommon = require("./webpack.common.cjs");
const path = require("path");

module.exports = {
    ...webpackCommon,
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        static: path.join(__dirname, 'dist'), // Serve from 'public' directory
        port: 3000, // Port for local development
        hot: true, // Enable HMR (Hot Module Replacement)
    },
};
