'use strict'

let _ = require('lodash'),
    config = require('../config'),
    mongoose = require('mongoose'),
    chalk = require('chalk'),
    winston = require('winston'),
    crypto = require('crypto')

let seedOptions = {}

function removeUser(user) {
    return new Promise((resolve, reject) => {
        let User = mongoose.model('User')
        User.find({username: user.username}).remove(err => {
            if (err) {
                reject(new Error('Failed to remove local ' + user.username))
            }
            resolve()
        })
    })
}

function saveUser(user) {
    return () => {
        return new Promise((resolve, reject) => {
            // Then save the user
            user.save((err, theuser) => {
                if (err) {
                    winston.log('Error --->', err)
                    reject(new Error('Failed to add local ' + user.username))
                } else {
                    resolve(theuser)
                }
            })
        })
    }
}

function checkUserNotExists(user) {
    return new Promise((resolve, reject) => {
        let User = mongoose.model('User')
        User.find({
            username: user.username
        }, (err, users) => {
            if (err) {
                reject(new Error('Failed to find local account ' + user.username))
            }

            if (users.length === 0) {
                resolve()
            } else {
                // reject(new Error('Failed due to local account already exists: ' + user.username))
                reject('Seeding halted because local account already exists: ' + user.username)
            }
        })
    })
}

function reportSuccess(password) {
    return user => {
        return new Promise((resolve, reject) => {
            if (seedOptions.logResults) {
                console.log('Database seeding:\t\t\tLocal ' + user.username + ' added with password set to ' + password)
            }
            resolve()
        })
    }
}

// save the specified user with the password provided from the resolved promise
function seedTheUser(user) {
    return password => {
        return new Promise((resolve, reject) => {
            let User = mongoose.model('User')
            // set the new password
            user.password = password

            if (user.username === seedOptions.seedAdmin.username && process.env.NODE_ENV === 'production') {
                checkUserNotExists(user)
                .then(saveUser(user))
                .then(reportSuccess(password))
                .then(setFirstUser())
                .then(() => {
                    resolve()
                }).catch(err => reject(err))
            } else {
                // removeUser(user)
                checkUserNotExists(user)
                .then(saveUser(user))
                .then(reportSuccess(password))
                .then(setFirstUser())
                .then(() => {
                    resolve()
                }).catch(err => reject(err))
            }
        })
    }
}

// report the error
function reportError(reject) {
    return err => {
        if (seedOptions.logResults) {
            winston.log('Database seeding:\t\t\t' + err + '\n')
        }
        reject(err)
    }
}

function seedGroup(group) {
    return new Promise((resolve, reject) => {
        let Group = mongoose.model('Group')

        if (group.name === seedOptions.seedGroup.name && process.env.NODE_ENV === 'production') {
            checkGroupNotExists(group).then(saveGroup(group)).then(reportSuccess(group.name)).then(() => {
                winston.info('GROUP MADE: ', group.name)
                resolve()
            }).catch(err => {
                winston.info('GROUP REJECTED: ', group.name)
                reject(err)
            })
        } else {
            // removeUser(user)
            checkGroupNotExists(group).then(saveGroup(group)).then(reportSuccess(group.name)).then(() => {
                winston.info('GROUP MADE: ', group.name)
                resolve()
            }).catch(err => {
                winston.info('GROUP REJECTED: ', group.name)
                reject(err)
            })
        }
    })
}

function saveGroup(group) {
    return () => {
        return new Promise((resolve, reject) => {
            // Then save the group
            group.save((err, thegroup) => {
                if (err) {
                    winston.log(err)
                    reject(new Error('Failed to add local ' + group.name))
                } else {
                    resolve(thegroup)
                }
            })
        })
    }
}

function checkGroupNotExists(group) {
    return new Promise((resolve, reject) => {
        let Group = mongoose.model('Group')
        Group.find((err, data) => {

            if (data.length === 0) {
                resolve()
            } else {
                // reject(new Error('Failed due to local account already exists: ' + user.username))
                reject('Groups seeding halted because groups already exist')
            }
        })
    })
}

function setFirstUser() {
    return () => {
        return new Promise((resolve, reject) => {
            if (config.authStrategy !== 'local') {
                let Configuration = mongoose.model('Configuration')
                Configuration.create({ isFirstUser: true }, (err, configuration) => {
                    if (err) {
                        reject(new Error('Failed to set first user', err))
                    }
                    resolve({ success: true })
                })
            }
            resolve()
        })
    }
}

module.exports.start = function start(options) {
    winston.log('Database seeding: CREATING EVERYTHING')
    // Initialize the default seed options
    seedOptions = _.clone(config.seedDB.options, true)

    // Check for provided options

    if (_.has(options, 'logResults')) {
        seedOptions.logResults = options.logResults
    }

    if (_.has(options, 'seedUser')) {
        seedOptions.seedUser = options.seedUser
    }

    if (_.has(options, 'seedAdmin')) {
        seedOptions.seedAdmin = options.seedAdmin
    }

    let User = mongoose.model('User')
    let Group = mongoose.model('Group')
    return new Promise((resolve, reject) => {

        let userAccount = new User(seedOptions.seedUser)
        let adminAccount = new User(seedOptions.seedAdmin)
        let testGroup = new Group(seedOptions.seedGroup)

        // If production only seed admin if it does not exist
        if (process.env.NODE_ENV === 'production') {
            User.generateRandomPassphrase()
            .then(seedTheUser(adminAccount))
            .then(seedGroup(testGroup))
            .then(() => {
                resolve()
            }).catch(reportError(reject))
        } else {
            // Add both Admin and User account

            User.generateRandomPassphrase()
            .then(seedTheUser(userAccount))
            .then(User.generateRandomPassphrase)
            .then(seedTheUser(adminAccount))
            .then(seedGroup(testGroup))
            .then(() => {
                resolve()
            }).catch(reportError(reject))
        }
    })
}
