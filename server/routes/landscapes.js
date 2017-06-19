'use strict'

/**
 * Module dependencies.
 */

import _ from 'lodash'
import AWS from 'aws-sdk'
import winston from 'winston'

const Landscape = require('../graphql/models/landscape')
const Deployment = require('../graphql/models/deployment')
const Group = require('../graphql/models/group')
const Account = require('../graphql/models/account')
const User = require('../auth/models/user.server.model')

// GET /api/landscapes/<landscapeId>/deployments
exports.deploymentsByLandscapeId = (req, res) => {
    let landscapeId = req.params.landscapeId
    return Deployment.find({ landscapeId }, (err, deployments) => {
        if (err) {
            winston.log('error', err)
            return res.json(400, err)
        } else {
            return res.json(deployments)
        }
    })
}
