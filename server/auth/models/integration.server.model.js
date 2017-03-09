'use strict'

/**
 * Module dependencies
 */
let mongoose = require('mongoose'),
    path = require('path'),
    config = require(path.resolve('./server/config/config')),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    validator = require('validator'),
    generatePassword = require('generate-password'),
    owasp = require('owasp-password-strength-test')

owasp.config(config.shared.owasp)


/**
 * User Schema
 */
let IntegrationSchema = new Schema({
    name: {
        type: String,
        trim: true,
        default: ''
    },
    imageUri: {
        type: String
    },
    type: {
        type: String,
        trim: true,
        default: ''
    },
    username: {
        type: String
    },
    password: {
        type: String,
        default: ''
    },
    salt: {
        type: String
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    }
})
/**
 * Hook a pre save method to hash the password
 */
IntegrationSchema.pre('save', function(next) {
    if (this.password && this.isModified('password')) {
        this.salt = crypto.randomBytes(16).toString('base64')
        this.password = this.hashPassword(this.password)
    }
    next()
})

// /**
//  * Hook a pre validate method to test the local password
//  */
// IntegrationSchema.pre('validate', function(next) {
//     if (this.provider === 'local' && this.password && this.isModified('password')) {
//         let result = owasp.test(this.password)
//         if (result.errors.length) {
//             let error = result.errors.join(' ')
//             this.invalidate('password', error)
//         }
//     }
//     next()
// })

/**
 * Create instance method for hashing a password
 */
IntegrationSchema.methods.hashPassword = function(password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'SHA1').toString('base64')
    } else {
        return password
    }
}

module.exports = mongoose.model('Integration', IntegrationSchema)
