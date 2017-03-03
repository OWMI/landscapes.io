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
    app.route('/api/auth/signup').post(users.signup)
    app.route('/api/auth/signin').post(users.signin)
    app.route('/api/auth/signout').get(users.signout)


    app.route('/api/github/repo').post(integrations.getGithubRepo)
    app.route('/api/yaml/parse').post(integrations.parseYAML)
    app.route('/api/github/commit').post(integrations.addAndCommitGithub)

    app.route('/api/auth/google').get(users.oauthCall('google', { scope: ['profile'] }))
    // app.route('/api/auth/google').get((req, res) => {
    //     console.log('%c req ', 'background: #1c1c1c; color: deepskyblue', req)
    //     users.oauthCall('google', { scope: ['profile'] })
    // })

    app.route('/api/auth/google/callback').get(users.oauthCallback('google'))

    // app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile'] }))
    //
    // app.get('/api/auth/google/callback',
    //     passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    //         // Successful authentication, redirect home.
    //         res.redirect('/')
    //     }
    // )
}
