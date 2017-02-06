'use strict'

/**
 * Module dependencies.
 */

import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import cors from 'cors'
import YAML from 'yamljs'
import lusca from 'lusca'
import morgan from 'morgan'
import helmet from 'helmet'
import express from 'express'
import hbs from 'express-hbs'
import mongoose from 'mongoose'
import passport from 'passport'
import flash from 'connect-flash'
import compress from 'compression'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import methodOverride from 'method-override'
import { printSchema } from 'graphql/utilities/schemaPrinter'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'

import { describe } from '../../routes/deployments'
import { deploymentsByLandscapeId } from '../../routes/landscapes'

import logger from './logger'
import config from '../config'
import schema from '../../graphql/schema'
import { subscriptionManager } from '../../graphql/subscriptions'

const WEBSOCKET_PORT = 8090
const MongoStore = require('connect-mongo')(session)

/**
 * Initialize local variables
 */
module.exports.initLocalVariables = app => {

    // Setting application local variables
    app.locals.title = config.app.title
    app.locals.description = config.app.description

    if (config.secure && config.secure.ssl === true) {
        app.locals.secure = config.secure.ssl
    }

    app.locals.keywords = config.app.keywords
    app.locals.jsFiles = config.files.client.js
    app.locals.cssFiles = config.files.client.css
    app.locals.livereload = config.livereload
    app.locals.logo = config.logo
    app.locals.env = process.env.NODE_ENV
    app.locals.domain = config.domain

    // Passing the request url to environment locals
    app.use((req, res, next) => {
        res.locals.host = req.protocol + '://' + req.hostname
        res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl
        next()
    })
}

/**
 * Initialize application middleware
 */
module.exports.initMiddleware = app => {
    // Should be placed before express.static
    app.use(compress({
        filter: (req, res) => {
            return (/json|text|javascript|css|font|svg/).test(res.getHeader('Content-Type'))
        },
        level: 9
    }))


    // Enable logger (morgan) if enabled in the configuration file
    if (_.has(config, 'log.format')) {
        app.use(morgan(logger.getLogFormat(), logger.getMorganOptions()))
    }

    // Environment dependent middleware
    if (process.env.NODE_ENV === 'development') {
        // Disable views cache
        app.set('view cache', false)
    } else if (process.env.NODE_ENV === 'production') {
        app.locals.cache = 'memory'
    }

    app.use('/schema', (req, res) => {
        res.set('Content-Type', 'text/plain')
        res.send(printSchema(schema))
    })

    // Initialize graphql subscriptions websocket server
    const websocketServer = createServer((request, response) => {
        response.writeHead(404)
        response.end()
    })

    websocketServer.listen(WEBSOCKET_PORT)

    new SubscriptionServer({ subscriptionManager }, websocketServer)

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({ extended: true }))

    let multer = require('multer')
    let upload = multer({ dest: 'uploads/' })

    // TODO: Move to its own folder
    app.get('/api/deployments/describe/:stackName/:region/:accountName', describe)
    app.get('/api/landscapes/:landscapeId/deployments', deploymentsByLandscapeId)
    app.post('/api/upload/template', upload.single('file'), (req, res) => {

        let user = req.user || {
            name: 'anonymous'
        }

        if (!req.file) {
            return res.status(500).send('No Files Uploaded')
        }

        function tryParseJSON(jsonString) {
            console.log(' ---> validating JSON')
            try {
                let o = JSON.parse(jsonString)
                if (o && typeof o === 'object' && o !== null) {
                    return o
                }
            } catch (e) {}

            return false
        }

        function tryParseYAML(yamlString) {
            console.log(' ---> validating YAML')
            try {
                let o = YAML.parse(yamlString)
                if (o && typeof o === 'object' && o !== null) {
                    console.log('YAML', o)
                    return o
                }
            } catch (e) {}

            return false
        }

        function deleteFile(filePath, callback) {
            console.log(' ---> deleting file')

            fs.unlink(filePath, err => {
                if (err) {
                    callback(err)
                } else {
                    console.log('file deleted --> ' + filePath)
                    callback(null)
                }
            })
        }

        let f = req.file

        let template = fs.readFileSync(f.path, 'utf-8')

        if (tryParseJSON(template)) {
            deleteFile(f.path, err => {
                res.send(template)
            })
        } else if (tryParseYAML(template)) {
            deleteFile(f.path, err => {
                res.send(YAML.parse(template))
            })
        } else {
            deleteFile(f.path, err => {
                res.send(400, {
                    msg: 'File \"' + f.name + '\"' + ' does not contain a valid AWS CloudFormation Template.'
                })
            })
        }
    })

    app.use('/uploads', express.static('uploads'))
    app.use(bodyParser.json({limit: '50mb'}))
    app.use(methodOverride())

    // Add the cookie parser and flash middleware
    app.use(cookieParser())
    app.use(flash())
}

/**
 * Configure view engine
 */
module.exports.initViewEngine = app => {
    app.engine('server.view.html', hbs.express4({extname: '.server.view.html'}))
    app.set('view engine', 'server.view.html')
    app.set('views', path.resolve('./'))
}

/**
 * Configure Express session
 */
module.exports.initSession = (app, db) => {
    // Express MongoDB session storage
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret,
        cookie: {
            maxAge: config.sessionCookie.maxAge,
            httpOnly: config.sessionCookie.httpOnly,
            secure: config.sessionCookie.secure && config.secure.ssl
        },
        name: config.sessionKey,
        store: new MongoStore({mongooseConnection: db.connection, collection: config.sessionCollection})
    }))

    // Add Lusca CSRF Middleware
    app.use(lusca(config.csrf))
}

/**
 * Invoke modules server configuration
 */
module.exports.initModulesConfiguration = (app, db) => {
    config.files.server.configs.forEach(configPath => {
        require(path.resolve(configPath))(app, db)
    })
}

/**
 * Configure Helmet headers configuration
 */
module.exports.initHelmetHeaders = app => {
    // Use helmet to secure Express headers
    let SIX_MONTHS = 15778476000
    app.use(helmet.frameguard())
    app.use(helmet.xssFilter())
    app.use(helmet.noSniff())
    app.use(helmet.ieNoOpen())
    app.use(helmet.hsts({maxAge: SIX_MONTHS, includeSubdomains: true, force: true}))
    app.disable('x-powered-by')
}

/**
 * Configure the modules static routes
 */
module.exports.initModulesClientRoutes = app => {
    // Setting the app router and static folder
    app.use('/', express.static(path.resolve('./public')))

    // Globbing static routing
    config.folders.client.forEach(function(staticPath) {
        app.use(staticPath, express.static(path.resolve('./' + staticPath)))
    })
}

/**
 * Configure the modules ACL policies
 */
module.exports.initModulesServerPolicies = app => {
    // Globbing policy files
    config.files.server.policies.forEach(function(policyPath) {
        require(path.resolve(policyPath)).invokeRolesPolicies()
    })
}

/**
 * Configure the modules server routes
 */
module.exports.initModulesServerRoutes = app => {
    // Globbing routing files
    config.files.server.routes.forEach(function(routePath) {
        require(path.resolve(routePath))(app)
    })
}

/**
 * Initialize GraphQL server
 */
module.exports.initGraphQLServer = app => {
    // Initialize graphql middleware
    app.use('/graphql', bodyParser.json(), graphqlExpress(req => {
        return {
            schema,
            context: {}
    }}))

    // Route for GraphQL graphical interface
    app.use('/graphiql', graphiqlExpress({
        endpointURL: '/graphql',
    }))
}

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = app => {
    app.use(function(err, req, res, next) {
        // If the error object doesn't exists
        if (!err) {
            return next()
        }

        // Log it
        console.error(err.stack)

        // Redirect to error page
        res.redirect('/server-error')
    })
}

/**
 * Configure Socket.io
 */
module.exports.configureSocketIO = (app, db) => {
    // Load the Socket.io configuration
    let server = require('./socket.io')(app, db)

    // Return server object
    return server
}

/**
 * Initialize the Express application
 */
module.exports.init = function (db) {
    // Initialize express app
    let app = express().use('*', cors())

    // Initialize local variables
    this.initLocalVariables(app)

    // Initialize Express middleware
    this.initMiddleware(app)

    // Initialize Express view engine
    this.initViewEngine(app)

    // Initialize Helmet security headers
    this.initHelmetHeaders(app)

    // Initialize modules static client routes, before session!
    this.initModulesClientRoutes(app)

    // Initialize Express session
    this.initSession(app, db)

    // Initialize Modules configuration
    this.initModulesConfiguration(app)

    // Initialize modules server authorization policies
    this.initModulesServerPolicies(app)

    // Initialize modules server routes
    this.initModulesServerRoutes(app)

    // Initialize error routes
    this.initGraphQLServer(app)

    // Initialize error routes
    this.initErrorRoutes(app)

    // Configure Socket.io
    app = this.configureSocketIO(app, db)

    return app
}
