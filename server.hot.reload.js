/* eslint-disable no-var, no-console */
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.hot.reload.config')
const PORT = 3000

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
    stats: {
        colors: true
    }
}).listen(PORT, 'localhost', err => {
    if (err) {
        console.log(err)
    }
    console.log(`Listening at localhost:${PORT}`)
})
