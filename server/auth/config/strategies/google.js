'use strict'

let passport        = require('passport'),
    path            = require('path'),
    winston         = require('winston'),
    User            = require('mongoose').model('User'),
    Configuration   = require('mongoose').model('Configuration'),
    GoogleStrategy  = require('passport-google-oauth20').Strategy,
    config          = require(path.resolve('./server/config/config'))

module.exports = () => {

    const { clientID, clientSecret, callbackURL } = config.oauthCreds.google

    passport.use(
        new GoogleStrategy({ clientID, clientSecret, callbackURL }, (accessToken, refreshToken, profile, done) => {

            const { displayName, familyName, givenName, id, name } = profile

            return new Promise((resolve, reject) => {
                Configuration.find().exec((err, configuration) => {
                    if (err) return done(err)
                    resolve(configuration)
                })
            }).then(configuration => {
                User.findOne({ username: profile.id }, (err, user) => {
                    if (err) return done(err)

                    if (!user) {
                        console.log(' ---> creating google user')

                        delete profile._raw
                        profile.accessToken = accessToken
                        profile.refreshToken = refreshToken

                        user = new User({
                            username: id,
                            firstName: name.givenName,
                            lastName: name.familyName,
                            displayName: displayName,
                            provider: 'google',
                            providerData: profile,
                            role: configuration && configuration.length && configuration[0].isFirstUser
                                  ? 'admin'
                                  : 'user'
                        })

                        user.save(err => {
                            console.log(err ? err : ' ---> created: ' + user._id)
                            return done(err, user)
                        })
                    } else {
                        return done(err, user)
                    }
                })
            })
        }
    ))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        User.findOne({ _id: id }).exec((err, user) => {
            winston.log('passport.deserializeUser:', user)
            done(err, user)
        })
    })

}
