const {resolve} = require("path");
const {DefinePlugin} = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const pkg = require("./package.json");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const buildVersion = process.env.APP_VERSION || "development";
const repoUrl = pkg.repository.url;

module.exports = {
    entry: './src/client/index.tsx', // Entry point for Phaser game
    output: {
        filename: 'bundle.[contenthash].js', // ensure to have unique bundle name (that you always see up to date version in your browser window and not something cached.)
        path: resolve(__dirname, 'dist/client'), // Output to './dist'
        assetModuleFilename: 'assets/[name].[hash][ext]',
        clean: true, // Clean output directory on each build
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'], // Resolve TypeScript and JavaScript files
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader', // Use ts-loader for TypeScript files
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpe?g|gif|svg|webp)$/i, // Image handling
                type: 'asset', // Automatically determines inlining or emitting
            },
        ],
    }, plugins: [
        new DefinePlugin({
            APP_VERSION: JSON.stringify(buildVersion), // Inject version
            REPO_URL: JSON.stringify(repoUrl),
        }),
        new HtmlWebpackPlugin({
            template: './public/templates/index.html',
            inject: 'body', // inject the scripts at the end of the body tag
            scriptLoading: 'blocking', // Ensure external js is loaded before the bundle.js
            favicon: "./public/assets/snake_logo.png",
        }),
        new ImageMinimizerPlugin({
            minimizer: {
                implementation: ImageMinimizerPlugin.sharpMinify, // Use sharp for image optimization
                options: {
                    encodeOptions: {
                        jpeg: {quality: 80},
                        png: {quality: 80},
                        webp: {quality: 80},
                        avif: {quality: 80},
                        svg: {quality: 80},
                        gif: {quality: 80},
                    },
                },
            },
        })
    ]
};
