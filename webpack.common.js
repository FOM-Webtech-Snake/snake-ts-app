import path from 'path';
import HtmlWebpackPlugin from "html-webpack-plugin";

export default {
    entry: './src/client/index.ts', // Entry point for Phaser game
    output: {
        filename: 'bundle.[contenthash].js', // ensure to have unique bundle name (that you always see up to date version in your browser window and not something cached.)
        path: path.resolve('./dist'), // Output to 'public/dist'
        clean: true, // Clean output directory on each build
    },
    resolve: {
        extensions: ['.ts', '.js'], // Resolve TypeScript and JavaScript files
    },
    module: {
        rules: [{
            test: /\.ts$/, use: 'ts-loader', // Use ts-loader for TypeScript files
            exclude: /node_modules/,
        }, {
            test: /\.(png|jpe?g|gif|svg|mp3|wav)$/i, // Asset handling for assets and audio
            type: 'asset/resource', generator: {
                filename: 'assets/[name][ext]', // Output assets to 'public/assets'
            },
        }],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/templates/index.html',
        })
    ]
};
