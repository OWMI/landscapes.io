'use strict'

/**
 * Module dependencies.
 */

var config = require('../config'),
    mongoose = require('./mongoose'),
    express = require('./express'),
    chalk = require('chalk'),
    seed = require('./seed')

const SERVER_PORT = config.port || 8080
const WEBSOCKET_PORT = 8090

function seedDB() {
    if (config.seedDB && config.seedDB.seed) {
        console.log(chalk.bold.red('+ Info: Database seeding is turned on\n'))
        seed.start()
    }
}

// Initialize Models
mongoose.loadModels(seedDB)

module.exports.init = function init(callback) {
    mongoose.Promise = global.Promise
    mongoose.connect(function(db) {
        // Initialize express
        var app = express.init(db)
        if (callback)
            callback(app, db, config)

    })
}

module.exports.start = function start(callback) {

    this.init(function(app, db, config) {
        // Start the app by listening on <port> at <host>
        app.listen(SERVER_PORT, config.host, function() {

            // Create server URL
            var server = (process.env.NODE_ENV === 'secure'
                ? 'https://'
                : 'http://') + config.host + ':' + SERVER_PORT

            // Logging initialization
            console.log(chalk.green(config.app.title))
            console.log()
            console.log(chalk.green('Environment:     ' + process.env.NODE_ENV))
            console.log(chalk.green('Authentication:  ' + config.authStrategy))
            console.log(chalk.green('Server:          ' + server))
            console.log(chalk.green('GraphQL:         ' + `${server}/graphql`))
            console.log(chalk.green('GraphiQL:        ' + `${server}/graphiql`))
            console.log(chalk.green('Database:        ' + config.db.uri))
            console.log(chalk.green('Version:         ' + config.landscapes.version))
            console.log()

            if (callback)
                callback(app, db, config)
        })

    })

}
