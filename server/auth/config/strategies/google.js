'use strict'

let passport        = require('passport'),
    path            = require('path'),
    winston         = require('winston'),
    User            = require('mongoose').model('User'),
    Configuration   = require('mongoose').model('Configuration'),
    GoogleStrategy  = require('passport-google-oauth20').Strategy,
    config          = require(path.resolve('./server/config/config'))

module.exports = () => {

    let _clientID = 'CLIENT_ID',
        _clientSecret = 'CLIENT_SECRET',
        _callbackURL = process.env.NODE_ENV === 'production'
                        ? `${process.env.PROTOCOL}://${process.env.PUBLIC_IP}/api/auth/${config.authStrategy}/callback`
                        : `http://localhost:8080/api/auth/${config.authStrategy}/callback`

    if (config.oauthCreds[config.authStrategy]) {
        _clientID = config.oauthCreds[config.authStrategy].clientID
        _clientSecret = config.oauthCreds[config.authStrategy].clientSecret
    }

    passport.use(
        new GoogleStrategy({
            clientID: _clientID,
            clientSecret: _clientSecret,
            callbackURL: _callbackURL
        }, (accessToken, refreshToken, profile, done) => {

            return new Promise((resolve, reject) => {
                Configuration.find().exec((err, configuration) => {
                    if (err) return done(err)
                    resolve(configuration)
                })
            }).then(configuration => {
                console.log('configuration', configuration)
                User.findOne({ username: profile.id }, (err, user) => {
                    if (err) return done(err)

                    if (!user) {
                        console.log(' ---> creating google user')

                        delete profile._raw
                        profile.accessToken = accessToken
                        profile.refreshToken = refreshToken

                        let _user = {
                            username: profile.id,
                            firstName: profile.name.givenName,
                            lastName: profile.name.familyName,
                            displayName: profile.displayName,
                            provider: 'google',
                            providerData: profile
                        }

                        if (configuration && configuration.length && configuration[0].isFirstUser) {
                            _user.role = 'admin'
                        }

                        let newUser = new User(_user)

                        newUser.save(error => {
                            if (error) {
                                console.log(error)
                                return err
                            } else {
                                console.log(' ---> created: ', newUser._id)
                                return done(null, newUser)
                            }
                        })
                    }

                    return done(null, user)
                })
            })
        }
    ))
}
