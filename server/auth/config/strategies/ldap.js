'use strict'

let passport        = require('passport'),
    winston         = require('winston'),
    LdapStrategy    = require('passport-ldapauth'),
    User            = require('mongoose').model('User'),
    path            = require('path'),
    config          = require(path.resolve('./server/config/config'))

module.exports = () => {
    passport.use(new LdapStrategy({
        server: {
            url: config.ldap.url,
            bindDn: config.ldap.bindDn,
            bindCredentials: config.ldap.bindCredentials,
            searchBase: config.ldap.searchBase,
            searchFilter: config.ldap.searchFilter,
            // searchAttributes: config.ldap.searchAttributes
        },
        usernameField: 'username',
        passwordField: 'password'
    }, loginSuccess))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        User.findOne({_id: id}).exec((err, user) => {
            winston.log('passport.deserializeUser:', user)
            done(err, user)
        })
    })
}

let loginSuccess = (userLdap, done) => {
    User.findOne({ username: userLdap.uid }, (err, user) => {
        if (err) return done(err)

        if (!user) {
            winston.log('userLdap -->', userLdap)

            user = new User({
                firstName: userLdap.givenName,
                lastName: userLdap.sn,
                username: userLdap.uid,
                displayName: userLdap.displayName,
                email: userLdap.mail,
                provider: 'ldap',
                role: 'user'
            })

            user.save(err => {
                console.log(err ? err : ' ---> created: ' + user._id)
                return done(err, user)
            })

        } else {
            return done(err, user)
        }
    })
}
