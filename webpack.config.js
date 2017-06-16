const path = require('path')
const process = require('process')
const webpack = require('webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const pkg = require('./package')

const banner = `/**
 * @preserve jquery.Slwy.Selector.js
 * @author ${pkg.author}
 * @version v${pkg.version}
 * @description ${pkg.description}
 */`
module.exports = {
    entry: './js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: './dist/',
        filename: 'jquery.Slwy.Selector.bundle.js',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [path.resolve(__dirname, 'js')],
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["es2015"]
                    }
                }
            },
            {
                test: /\.scss$/,
                include: [path.resolve(__dirname, 'sass')],
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: true
                        }
                    },
                    {
                        loader: 'sass-loader'
                    },
                ]
            },
            {
                test: /\.js$/,
                enforce: 'post',
                loader: 'es3ify-loader' //针对IE8及以下不支持default 、 class、catch等关键字
            }
        ]
    },
    resolve: {
        alias: {
            'jQuery': path.resolve(__dirname, 'js', 'jquery.1.8.3.min.js')
        }
    },
    devServer: {
        hot: true,
        port: 9999
    },
    amd: {
        jQuery: true
    },
    plugins: (function () {
        var plugins = [
            new webpack.BannerPlugin({
                banner: banner,
                raw: true
            })
        ]
        if (process.env.Node_ENV === 'production') {
            plugins.push(new UglifyJSPlugin({
                compress: {
                    properties: false
                }
            }))
        }
        return plugins
    })()

}