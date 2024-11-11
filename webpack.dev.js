import webpackCommon from "./webpack.common.js";
import path from "path";

export default {
    ...webpackCommon,
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        static: path.join('dist'), // Serve from 'public' directory
        port: 3000, // Port for local development
        hot: true, // Enable HMR (Hot Module Replacement)
    },
}