'use strict'

let passport = require('passport')

module.exports = app => {
    // User Routes
    let users = require('../controllers/users.server.controller')
    let integrations = require('../controllers/integrations.server.controller')

    // Setting up the users password api
    app.route('/api/auth/forgot').post(users.forgot)
    app.route('/api/auth/reset/:token').get(users.validateResetToken)
    app.route('/api/auth/reset/:token').post(users.reset)

    // Setting up the users authentication api
    app.route('/api/auth/ldap').post(users.ldap)
    app.route('/api/auth/signup').post(users.signup)
    app.route('/api/auth/signin').post(users.signin)
    app.route('/api/auth/signout').get(users.signout)

    // common oauth
    app.route('/api/auth/google').get(users.oauthCall('google', { scope: ['profile'] }))
    app.route('/api/auth/google/callback').get(users.oauthCallback('google'))

    // geoaxis oauth
    app.route('/api/auth/geoaxis').get(users.oauthCall('geoaxis', {}))
    app.route('/api/auth/geoaxis/callback').get(users.oauthCallback('geoaxis'))

    app.route('/api/github/repo').post(integrations.getGithubRepo)
    app.route('/api/github/repo/files').post(integrations.allFileNames)
    app.route('/api/github/getFile').post(integrations.getFile)
    app.route('/api/github/wGetFile').post(integrations.wGetFile)
    app.route('/api/yaml/parse').post(integrations.parseYAML)
    app.route('/api/yaml/stringify').post(integrations.stringifyYAML)
    app.route('/api/github/commit').post(integrations.addAndCommitGithub)
    app.route('/api/github/publicKey').post(integrations.getPublicKey)

}
