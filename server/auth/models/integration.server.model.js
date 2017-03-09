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

const secureRandom = require('secure-random')
const fs = require('fs')
const winston = require('winston')
const chalk = require('chalk')

owasp.config(config.shared.owasp)

const _algorithm = 'aes-128-cbc'
const _keyLengthInBytes = 16
const _ivLengthInBytes = 16

let _writeAccountKeyFile = filePath => {
    return new Promise((resolve, reject) => {
        try {
            let key = secureRandom.randomBuffer(_keyLengthInBytes)
            let iv = secureRandom.randomBuffer(_ivLengthInBytes)
            let data = `{ "key": "${key.toString('hex')}", "iv": "${iv.toString('hex')}", "createdAt": "${new Date().toISOString()}" }`
            fs.writeFileSync(filePath, data)
            console.log(chalk.blue('+ Crypto: Generated account key file at', filePath.toString(), '\n'))
            resolve()
        } catch (err) {
            reject(err)
        }
    })
}

let getAccountKeyFile = () => {
    return new Promise((resolve, reject) => {
        let filePath = path.resolve('./config/accountKeyFile.json')

        if (!fs.existsSync(filePath)) {
            console.log(chalk.blue('+ Crypto: Account key file not found.\n'))
            _writeAccountKeyFile(filePath).then(() => {
                fs.readFile(filePath, {
                    encoding: 'utf-8'
                }, (err, data) => {
                    if (err)
                        reject(err)
                    else
                        resolve(JSON.parse(data))
                })
            }).catch((err) => winston.log('error', err))
        } else {
            fs.readFile(filePath, {
                encoding: 'utf-8'
            }, (err, data) => {
                if (err)
                    reject(err)
                else
                    resolve(JSON.parse(data))
            })
        }
    })
}

let _iv
let _key

getAccountKeyFile().then(json => {
    _key = new Buffer(json.key, 'hex')
    _iv = new Buffer(json.iv, 'hex')
}).catch((err) => winston.log('error', err))

let encrypt = text => {
    console.log('## ENCRYPT SECRET ACCESS KEY ##')

    if (text === null || typeof text === 'undefined')
        return text

    try {
        let cipher = crypto.createCipheriv(_algorithm, _key, _iv)
        let encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
        return encrypted
    } catch (err) {
        winston.log('error', 'account.encrypt: ' + err)
    }
}

let decrypt = encryptedText => {
    console.log('## DECRYPT SECRET ACCESS KEY ##')

    if (encryptedText === null || typeof encryptedText === 'undefined')
        return encryptedText

    try {
        let decipher = crypto.createDecipheriv(_algorithm, _key, _iv)
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8')
        return decrypted
    } catch (err) {
        winston.log('error', 'account.decrypt: ' + err)
    }
}

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
    repoURL: {
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

IntegrationSchema.pre('save', function(next) {
    if (this.password && this.isModified('password')) {
        this.password = this.encrypt(this.password)
    }
    next()
})

IntegrationSchema.pre('findOneAndUpdate', function(next) {
    var self = this;
    if (this._update.password) {
        this._update.password = encrypt(this._update.password)
    }
    next()
})


module.exports = mongoose.model('Integration', IntegrationSchema)
