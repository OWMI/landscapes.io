const path = require('path')
const precss = require('precss')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')

const ROOT_PATH = path.resolve(__dirname)
const assetsDir = path.resolve(ROOT_PATH, 'dist/assets')
const nodeModulesDir = path.resolve(ROOT_PATH, 'node_modules')

const config = {
    entry: [path.resolve(ROOT_PATH, 'app/index.js')],
    output: {
        path: assetsDir,
        filename: 'bundle.js',
        publicPath: '/'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: [ nodeModulesDir ],
                loader: 'babel'
            }, {
                test: /\.css$/,
                loader: 'style-loader!css-loader?modules=true',
                include: /flexboxgrid/
            }, {
                test: /\.css$/,
                loader: 'style!css!postcss',
                include: path.join(__dirname, 'node_modules'),
                exclude: /flexboxgrid/
            }, {
                test: /\.scss$/,
                loader: 'style!css!postcss!sass'
            }, {
                test: /\.json$/,
                loader: 'json'
            }, {
                test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
                loader: 'url?limit=100000&name=[name].[ext]'
            }, {
                test: /\.svg$/,
                loader: 'babel!svg-react'
            }
        ]
    },
    plugins: [
        getImplicitGlobals(), setNodeEnv()
    ],
    postcss: function() {
        return [
            precss,
            autoprefixer({ browsers: ['last 2 versions'] })
        ]
    }
}

function getImplicitGlobals() {
    return new webpack.ProvidePlugin({$: 'jquery', jQuery: 'jquery'})
}

function setNodeEnv() {
    return new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        },
        PROTOCOL: JSON.stringify(process.env.PROTOCOL || 'http'),
        SERVER_IP: JSON.stringify(process.env.PUBLIC_IP || '0.0.0.0'),
        SERVER_PORT: JSON.stringify(process.env.PORT || '8080'),
    })
}

module.exports = config
