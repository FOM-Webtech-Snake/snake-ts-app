const {resolve} = require("path");
const {DefinePlugin} = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const pkg = require("./package.json");
const buildTimestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 12); // 02411120919
const buildNumber = pkg.version + "-" + buildTimestamp; // 1.0.0-202411120919
const repoUrl = pkg.repository.url;

module.exports = {
    entry: './src/client/index.ts', // Entry point for Phaser game
    output: {
        filename: 'bundle.[contenthash].js', // ensure to have unique bundle name (that you always see up to date version in your browser window and not something cached.)
        path: resolve(__dirname, 'dist'), // Output to './dist'
        clean: true, // Clean output directory on each build
    }, resolve: {
        extensions: ['.ts', '.js'], // Resolve TypeScript and JavaScript files
    }, module: {
        rules: [
            {
                test: /\.ts$/, use: 'ts-loader', // Use ts-loader for TypeScript files
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpe?g|gif|svg|mp3|wav)$/i, // Asset handling for assets and audio
                type: 'asset/resource', generator: {
                    filename: 'assets/[name][ext]', // Output assets to 'public/assets'
                },
            }
        ],
    }, plugins: [
        new DefinePlugin({
            BUILD_NUMBER: JSON.stringify(buildNumber),
            REPO_URL: JSON.stringify(repoUrl),
        }),
        new HtmlWebpackPlugin({
            template: './public/templates/index.html'
        })
    ]
};
