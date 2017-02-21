'use strict'

/**
 * Module dependencies.
 */
let _ = require('lodash'),
    chalk = require('chalk'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path'),
    winston = require('winston')

/**
 * Get files by glob patterns
 */
let getGlobbedPaths = (globPatterns, excludes) => {
    // URL paths regex
    let urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i')

    // The output array
    let output = []

    // If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(globPattern => {
            output = _.union(output, getGlobbedPaths(globPattern, excludes))
        })
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns)
        } else {
            let files = glob.sync(globPatterns)
            if (excludes) {
                files = files.map(file => {
                    if (_.isArray(excludes)) {
                        for (let i in excludes) {
                            if (excludes.hasOwnProperty(i)) {
                                file = file.replace(excludes[i], '')
                            }
                        }
                    } else {
                        file = file.replace(excludes, '')
                    }
                    return file
                })
            }
            output = _.union(output, files)
        }
    }

    return output
}

/**
 * Validate NODE_ENV existence
 */
let validateEnvironmentVariable = () => {
    let environmentFiles = glob.sync('./server/config/env/' + process.env.NODE_ENV + '.js')

    if (!environmentFiles.length) {
        if (process.env.NODE_ENV) {
            winston.info('+ Error: No configuration file found for "' + process.env.NODE_ENV + '" environment using development instead')
        } else {
            winston.info('+ Error: NODE_ENV is not defined! Using default development environment')
        }
        process.env.NODE_ENV = 'development'
    }
}

/** Validate config.domain is set
 */
let validateDomainIsSet = config => {
    if (!config.app.domain) {
        // winston.info('+ Warning: config.domain is empty and should be set to the fully qualified domain of the app.\n')
    }
}

/**
 * Validate Secure=true parameter can actually be turned on
 * because it requires certs and key files to be available
 */
let validateSecureMode = config => {

    if (!config.secure || config.secure.ssl !== true) {
        return true
    }

    let privateKey = fs.existsSync(path.resolve(config.secure.privateKey))
    let certificate = fs.existsSync(path.resolve(config.secure.certificate))

    if (!privateKey || !certificate) {
        winston.info('+ Error: Certificate file or key file is missing, falling back to non-SSL mode')
        winston.info('  To create them, simply run the following from your shell: sh ./scripts/generate-ssl-certs.sh')
        config.secure.ssl = false
    }
}

/**
 * Validate Session Secret parameter is not set to default in production
 */
let validateSessionSecret = (config, testing) => {

    if (process.env.NODE_ENV !== 'production') {
        return true
    }

    if (config.sessionSecret === 'MEAN') {
        if (!testing) {
            winston.info('+ WARNING: It is strongly recommended that you change sessionSecret config while running in production!')
            winston.info('  Please add `sessionSecret: process.env.SESSION_SECRET || \'super amazing secret\'` to ')
            winston.info('  `server/config/env/production.js` or `server/config/env/local.js`')
        }
        return false
    } else {
        return true
    }
}

/**
 * Initialize global configuration files
 */
let initGlobalConfigFolders = (config, assets) => {
    // Appending files
    config.folders = {
        server: {},
        client: {}
    }

    // Setting globbed client paths
    config.folders.client = getGlobbedPaths(path.join(process.cwd(), 'app/'), process.cwd().replace(new RegExp(/\\/g), '/'))
}

/**
 * Initialize global configuration files
 */
let initGlobalConfigFiles = (config, assets) => {
    // Appending files
    config.files = {
        server: {},
        client: {}
    }

    // Setting Globbed model files
    config.files.server.models = getGlobbedPaths(assets.server.models)

    // Setting Globbed route files
    config.files.server.routes = getGlobbedPaths(assets.server.routes)

    // Setting Globbed config files
    config.files.server.configs = getGlobbedPaths(assets.server.config)

    // Setting Globbed socket files
    config.files.server.sockets = getGlobbedPaths(assets.server.sockets)

    // Setting Globbed policies files
    config.files.server.policies = getGlobbedPaths(assets.server.policies)
}

/**
 * Initialize global configuration
 */
let initGlobalConfig = () => {
    // Validate NODE_ENV existence
    validateEnvironmentVariable()

    // Get the default assets
    let defaultAssets = require(path.join(process.cwd(), 'server/config/assets/default'))

    // Get the current assets
    let environmentAssets = require(path.join(process.cwd(), 'server/config/assets/', process.env.NODE_ENV)) || {}

    // Merge assets
    let assets = _.merge(defaultAssets, environmentAssets)

    // Get the default config
    let defaultConfig = require(path.join(process.cwd(), 'server/config/env/default'))

    // Get the current config
    let environmentConfig = require(path.join(process.cwd(), 'server/config/env/', process.env.NODE_ENV)) || {}

    // Merge config files
    let config = _.merge(defaultConfig, environmentConfig)

    // Include values from package.json
    let pkg = require(path.resolve('./package.json'))
    config.landscapes = pkg

    // Extend the config object with the local-NODE_ENV.js custom/local environment. This will override any settings present in the local configuration.
    config = _.merge(config, (fs.existsSync(path.join(process.cwd(), 'server/config/env/local-' + process.env.NODE_ENV + '.js')) && require(path.join(process.cwd(), 'server/config/env/local-' + process.env.NODE_ENV + '.js'))) || {})

    // Initialize global globbed files
    initGlobalConfigFiles(config, assets)

    // Initialize global globbed folders
    initGlobalConfigFolders(config, assets)

    // Validate Secure SSL mode can be used
    validateSecureMode(config)

    // Validate session secret
    validateSessionSecret(config)

    // Print a warning if config.domain is not set
    validateDomainIsSet(config)

    // Expose configuration utilities
    config.utils = {
        getGlobbedPaths: getGlobbedPaths,
        validateSessionSecret: validateSessionSecret
    }

    return config
}

/**
 * Set configuration object
 */
module.exports = initGlobalConfig()
