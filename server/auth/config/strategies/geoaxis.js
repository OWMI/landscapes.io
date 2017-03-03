'use strict'

let passport        = require('passport'),
    path            = require('path'),
    winston         = require('winston'),
    User            = require('mongoose').model('User'),
    Configuration   = require('mongoose').model('Configuration'),
    GeoaxisStrategy = require('passport-geoaxis-oauth20').Strategy,
    config          = require(path.resolve('./server/config/config'))

module.exports = () => {

    const { clientID, clientSecret, callbackURL } = config.oauthCreds.geoaxis

    passport.use(new GeoaxisStrategy({ clientID, clientSecret, callbackURL },
        (accessToken, refreshToken, profile, done) => {

            const { uid, email, firstname, lastname, username } = profile._json

            return new Promise((resolve, reject) => {
                Configuration.find().exec((err, configuration) => {
                    if (err) return done(err)
                    resolve(configuration)
                })
            }).then(configuration => {
                User.findOne({ username }, (err, user) => {

                    if (err) return done(err)

                    if (!user) {
                        console.log(' ---> creating geoaxis user')

                        delete profile._raw
                        profile.accessToken = accessToken
                        profile.refreshToken = refreshToken

                        user = new User({
                            username,
                            firstName: firstname,
                            lastName: lastname,
                            displayName: `${firstname} ${lastname}`,
                            provider: 'geoaxis',
                            providerData: profile
                        })

                        if (configuration && configuration.length && configuration[0].isFirstUser) {
                            user.role = 'admin'
                        }

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
