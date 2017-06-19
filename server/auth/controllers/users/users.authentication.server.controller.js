'use strict'
import jwt from 'jsonwebtoken'

let axios = require('axios')
let path = require('path')
let mongoose = require('mongoose')
let passport = require('passport')
let winston = require('winston')
let User = mongoose.model('User')
let config = require(path.resolve('./server/config/config'))
let errorHandler = require(path.resolve('./server/auth/controllers/errors.server.controller'))
const customGraph = require(('../../../graphql/customControllers/graphqlexpress.js'))

// URLs for which user can't be redirected on signin
let noReturnUrls = ['/authentication/signin', '/authentication/signup']


/**
 * Verify Auth
 */

exports.isAuthenticated = function (req, res, next) {
    let token = req.body.token || req.query.token || req.headers['token']

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, 'CHANGE_ME', (err, decoded) => {

            if (err && err.name === 'TokenExpiredError') {
                console.log('token expired')
                return res.status(401).json({expired: true})
                // res.json({ expired: true })
            } else if (err) {
                console.log('Error --->', err)
                res.status(401).json({err})
            } else {
                decoded.data.password = null;
                req.userData = decoded.data;
                console.log( req.userData)
                let expires = Math.floor(Date.now() / 1000) + (60 * 60);
                req.userData.expires = expires;
                let newToken = jwt.sign({
                    data: decoded.data,
                    exp: expires // 1-hour token
                }, 'CHANGE_ME')

                req.token = newToken;

                next()
            }

        })

    } else {
        // if there is no token
        return res.status(403).send({
            message: 'No token provided'
        })
    }
}

/**
 * Signup
 */
exports.signup = (req, res) => {
    // For security measurement we remove the roles from the req.body object
    delete req.body.role

    // Init user and add missing fields
    var user = new User(req.body)
    user.provider = 'local'
    user.displayName = user.firstName + ' ' + user.lastName

    // Then save the user
    user.save(err => {
        if (err) {
            return res.status(400).send({message: errorHandler.getErrorMessage(err)})
        } else {
            // Remove sensitive data before login
            user.password = undefined
            user.salt = undefined

            req.login(user, err => {
                if (err) {
                    res.status(400).send(err)
                } else {
                    res.json(user)
                }
            })
        }
    })
}

/**
 * Signin after passport authentication
 */
exports.signin = (req, res, next) => {

    passport.authenticate('local', (err, user, info) => {
        if (err || !user) {
            winston.log('Error --->', err)
            res.status(400).send(info)
        } else {
            // Remove sensitive data before login
            user.password = undefined
            user.salt = undefined

            req.login(user, err => {
                if (err) {
                    winston.log('Error --->', err)
                    res.status(400).send(err)
                } else {
                    User.findOne({'_id': user._id}, '-salt -password').exec((err, userWithRoles) => {
                        if (err) {
                            winston.log('Error --->', err)
                            res.status(400).send(err)
                        } else {
                            console.log(userWithRoles)
                            userWithRoles.expires = Math.floor(Date.now() / 1000) + (60*60);
                            // HACK: temporary hack, will be removed once the images are redone
                            delete user.imageUri

                            // create a token
                            let token = jwt.sign({
                                data: userWithRoles,
                                exp: userWithRoles.expires // 1-hour token
                            }, 'CHANGE_ME')


                            res.json({
                                userWithRoles,
                                token
                            })
                        }
                    })
                }
            })
        }
    })(req, res, next)
}

/**
 * Signout
 */
exports.signout = (req, res) => {
    req.logout()
    res.redirect('/')
}

/**
 * LDAP Sign-in after passport authentication
 */
exports.ldap = (req, res, next) => {
    passport.authenticate('ldapauth', {session: false}, (err, user, info) => {
        if (err || !user) {
            winston.log('passport.authenticate.ldapauth --> ERROR:', err)
            res.status(400).send(info)
        } else {
            // Remove sensitive data before login
            user.password = undefined
            user.salt = undefined

            req.login(user, err => {
                if (err) {
                    res.status(400).send(err)
                } else {
                    res.json(user)
                }
            })
        }
    })(req, res, next)
}

/**
 * OAuth provider call
 */
exports.oauthCall = (strategy, scope) => {
    return (req, res, next) => {
        // Authenticate
        passport.authenticate(strategy, scope)(req, res, next)
    }
}

/**
 * OAuth callback
 */
exports.oauthCallback = strategy => {
    return (req, res, next) => {
        passport.authenticate(strategy, {session: false}, (err, user, info) => {
            if (err || !user) {
                winston.log(`passport.authenticate.${strategy} --> ERROR:`, err)
                res.status(400).send(info)
            } else {
                // Remove sensitive data before login
                user.password = undefined
                user.salt = undefined

                req.login(user, err => {
                    if (err) {
                        res.status(400).send(err)
                    } else {
                        let redirectURL = `/login?user=${new Buffer(JSON.stringify(user)).toString('base64')}`
                        if (process.env.NODE_ENV !== 'production')
                            redirectURL = `http://${config.host}:3000/login?user=${new Buffer(JSON.stringify(user)).toString('base64')}`
                        res.redirect(redirectURL)
                    }
                })
            }
        })(req, res, next)
    }
}

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = (req, providerUserProfile, done) => {
    if (!req.user) {
        // Define a search query fields
        let searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField
        let searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField

        // Define main provider search query
        let mainProviderSearchQuery = {}
        mainProviderSearchQuery.provider = providerUserProfile.provider
        mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField]

        // Define additional provider search query
        let additionalProviderSearchQuery = {}
        additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField]

        // Define a search query to find existing user with current provider profile
        let searchQuery = {
            $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
        }

        // Setup info object
        let info = {}

        // Set redirection path on session.
        // Do not redirect to a signin or signup page
        if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
            info.redirect_to = req.query.redirect_to
        }

        User.findOne(searchQuery, (err, user) => {
            if (err) {
                return done(err)
            } else {
                if (!user) {
                    var possibleUsername = providerUserProfile.username || ((providerUserProfile.email)
                            ? providerUserProfile.email.split('@')[0]
                            : '')

                    User.findUniqueUsername(possibleUsername, null, availableUsername => {
                        user = new User({
                            firstName: providerUserProfile.firstName,
                            lastName: providerUserProfile.lastName,
                            username: availableUsername,
                            displayName: providerUserProfile.displayName,
                            profileImageURL: providerUserProfile.profileImageURL,
                            provider: providerUserProfile.provider,
                            providerData: providerUserProfile.providerData
                        })

                        // Email intentionally added later to allow defaults (sparse settings) to be applid.
                        // Handles case where no email is supplied.
                        // See comment: https://github.com/meanjs/mean/pull/1495#issuecomment-246090193
                        user.email = providerUserProfile.email

                        // And save the user
                        user.save(err => {
                            return done(err, user, info)
                        })
                    })
                } else {
                    return done(err, user, info)
                }
            }
        })
    } else {
        // User is already logged in, join the provider data to the existing user
        let user = req.user

        // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
        if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
            // Add the provider data to the additional provider data field
            if (!user.additionalProvidersData) {
                user.additionalProvidersData = {}
            }

            user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData

            // Then tell mongoose that we've updated the additionalProvidersData field
            user.markModified('additionalProvidersData')

            // And save the user
            user.save(err => {
                return done(err, user, '/settings/accounts')
            })
        } else {
            return done(new Error('User is already connected using this provider'), user)
        }
    }
}

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = (req, res, next) => {
    let user = req.user
    let provider = req.query.provider

    if (!user) {
        return res.status(401).json({message: 'User is not authenticated'})
    } else if (!provider) {
        return res.status(400).send()
    }

    // Delete the additional provider
    if (user.additionalProvidersData[provider]) {
        delete user.additionalProvidersData[provider]

        // Then tell mongoose that we've updated the additionalProvidersData field
        user.markModified('additionalProvidersData')
    }

    user.save(function (err) {
        if (err) {
            return res.status(400).send({message: errorHandler.getErrorMessage(err)})
        } else {
            req.login(user, function (err) {
                if (err) {
                    return res.status(400).send(err)
                } else {
                    return res.json(user)
                }
            })
        }
    })
}
