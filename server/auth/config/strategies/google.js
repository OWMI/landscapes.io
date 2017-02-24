'use strict'

let passport        = require('passport'),
    path            = require('path'),
    winston         = require('winston'),
    User            = require('mongoose').model('User'),
    Configuration   = require('mongoose').model('Configuration'),
    GoogleStrategy  = require('passport-google-oauth20').Strategy,
    config          = require(path.resolve('./server/config/config'))

module.exports = () => {
    passport.use(
        new GoogleStrategy({
            clientID: '',
            clientSecret: '',
            callbackURL: 'http://localhost:8080/api/auth/google/callback'
        }, (accessToken, refreshToken, profile, done) => {
            console.log('logged into google!')
            // console.log('accessToken', accessToken)
            // console.log('refreshToken', refreshToken)
            // console.log('profile', profile)

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
