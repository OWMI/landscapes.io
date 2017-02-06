const path = require('path')
const precss = require('precss')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')

const ROOT_PATH = path.resolve(__dirname)
const assetsDir = path.resolve(ROOT_PATH, 'public/assets')
const nodeModulesDir = path.resolve(ROOT_PATH, 'node_modules')

const config = {
    entry: [path.resolve(ROOT_PATH, 'app/index.js')],
    output: {
        path: assetsDir,
        filename: 'bundle.js',
        publicPath: '/'
    },
    resolve: {
        extensions: [ '', '.js', '.jsx' ],
        alias: {
            components: path.resolve(ROOT_PATH, 'app/components'),
            containers: path.resolve(ROOT_PATH, 'app/containers'),
            views: path.resolve(ROOT_PATH, 'app/views'),
            public: path.resolve(ROOT_PATH, 'public')
        }
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel',
                exclude: [ nodeModulesDir ]
            }, {
                test: /\.scss$/,
                loader: 'style!css!postcss!sass'
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
                test: /\.json$/,
                loader: 'json'
            }, {
                test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
                loader: 'url?limit=100000@name=[name][ext]'
            }, {
                test: /\.svg$/,
                loader: 'babel!svg-react'
            }
        ]
    },
    postcss: function() {
        return [
            precss,
            autoprefixer({ browsers: ['last 2 versions'] })
        ]
    },
    plugins: [new webpack.optimize.OccurenceOrderPlugin(), getImplicitGlobals(), setNodeEnv()]
}

function getImplicitGlobals() {
    return new webpack.ProvidePlugin({$: 'jquery', jQuery: 'jquery'})
}

function setNodeEnv() {
    return new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('development')
        }
    })
}

module.exports = config
