'use strict'

/**
 * Module dependencies.
 */

 import _ from 'lodash'
 import AWS from 'aws-sdk'
 import winston from 'winston'

 const Landscape = require('../graphql/models/landscape')
 const Deployment = require('../graphql/models/deployment')
 const Account = require('../graphql/models/account')

 // FIX: Attempts to resolve 'UnknownEndpoint' error experienced on GovCloud
AWS.events.on('httpError', function() {
    if (this.response.error && this.response.error.code === 'UnknownEndpoint') {
        this.response.error.retryable = true;
    } else if (this.response.error && this.response.error.code === 'NetworkingError') {
        this.response.error.retryable = true;
    }
})

// GET /api/deployments/describe/<stackName>
// Describe deployment for a given stackName
exports.describe = (req, res) => {

    winston.info('---> Describing Deployment')

    let cloudformation = new AWS.CloudFormation()

    return new Promise((resolve, reject) => {
        Account.findOne({ name: req.params.accountName }, (err, account) => {
            if (err) {
                console.log(err)
                reject(err)
            }

            cloudformation.config.update({
                region: req.params.region
            })

            if (account && account.accessKeyId && account.secretAccessKey) {
                winston.info('---> setting AWS security credentials');

                cloudformation.config.update({
                    accessKeyId: account.accessKeyId,
                    secretAccessKey: account.secretAccessKey
                })

            } else {
                winston.info(' ---> No AWS security credentials set - assuming Server IAM Role');
            }

            resolve(req.params.accountName)
        })
    }).then(accountName => {

        let params = {
            StackName: req.params.stackName
        }

        return new Promise((resolve, reject) => {
            cloudformation.describeStacks(params, (err, data) => {
                if (err) {
                    console.log(err, err.stack)
                    reject(err)
                }
                res.send(data)
            })
        })
    }).catch(err => {
        console.log('ERROR:', err)
    })
}
