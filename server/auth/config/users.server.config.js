'use strict'

let passport = require('passport'),
    User = require('mongoose').model('User'),
    path = require('path'),
    config = require(path.resolve('./server/config/config'))

module.exports = (app, db) => {
    // Serialize sessions
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    // Deserialize sessions
    passport.deserializeUser((id, done) => {
        // User.findOne({ _id: id }, '-salt -password')
        //   .populate('role', 'name description permissions')
        //   .populate('groups', 'name description permissions landscapes')
        //   .exec(function (err, user) {

        //   //  user.role = user.role.map((r) => { return r.name })
        //    done(err, user)
        //   })

        User.findOne({ _id: id }, '-salt -password', (err, user) => {
            done(err, user)
        })
    })

    // Initialize strategies
    config.utils.getGlobbedPaths(path.join(__dirname, './strategies/**/*.js')).forEach(strategy => {
        require(path.resolve(strategy))(config)
    })

    // Add passport's middleware
    app.use(passport.initialize())
    app.use(passport.session())
}
