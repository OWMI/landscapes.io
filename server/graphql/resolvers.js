import * as fs from 'fs'
import * as path from 'path'
import _ from 'lodash'
import passport from 'passport'
import async from 'async'
import https from 'https'
import AWS from 'aws-sdk'
import winston from 'winston'
import { find, filter } from 'lodash'
import { pubsub } from './subscriptions'

const Landscape = require('./models/landscape')
const Deployment = require('./models/deployment')
const Group = require('./models/group')
const Account = require('./models/account')
const User = require('../auth/models/user.server.model')

// FIX: Attempts to resolve 'UnknownEndpoint' error experienced on GovCloud
// AWS.events.on('httpError', () => {
//     if (this.response.error && this.response.error.code === 'UnknownEndpoint') {
//         this.response.error.retryable = true;
//     } else if (this.response.error && this.response.error.code === 'NetworkingError') {
//         this.response.error.retryable = true;
//     }
// })

const resolveFunctions = {
    Query: {
        landscapes(root, args, context) {
            return Landscape.find().sort('-created').populate('user', 'displayName').exec((err, landscapes) => {
                if (err) return err
                return landscapes
            })
        },
        landscapeById(root, args, context) {
            return Landscape.findById(args.id).exec((err, landscape) => {
                if (err) return err
                return landscape
            })
        },
        accounts(root, args, context) {
            return Account.find().sort('-created').exec((err, accounts) => {
                if (err) return err
                return accounts
            })
        },
        groups(root, args, context) {
            return Group.find().sort('-created').populate('user', 'displayName').exec((err, groups) => {
                if (err) return err
                return groups
            })
        },
        users(root, args, context) {
            return User.find().sort('-created').populate('user', 'displayName').exec((err, groups) => {
                if (err) return err
                return groups
            })
        },
        userById(root, args, context) {
            return User.find().sort('-created').populate('user', 'displayName').exec((err, groups) => {
                if (err) return err
                return groups
            })
        }
    },
    Mutation: {
        loginUser(_, { user }) {
            console.log('login resolver')
        },
        createLandscape(_, { landscape }) {

            console.log(' ---> creating Landscape')
            let newLandscape = new Landscape(landscape)

            newLandscape.save(err => {
                if (err) {
                    console.log(err)
                    return err
                } else {
                    console.log(' ---> created: ', newLandscape._id)
                    return newLandscape
                }
            })
        },
        createUser(_, { user }) {

            console.log(' ---> creating User', user)
            let newUser = new User(user)

            newUser.save(err => {
                if (err) {
                    console.log(err)
                    return err
                } else {
                    console.log(' ---> created: ', newUser._id)
                    return newUser
                }
            })
        },
        updateUser(_, { user }) {

          console.log(' ---> updating user')

          User.findOneAndUpdate({ _id: user._id }, user, { new: true }, (err, doc) => {
              if (err) {
                  console.log(err)
                  return err
              } else {
                  console.log(' ---> updated: ', doc)
                  return doc
              }
          })
        },
        deleteUser(_, { user }) {
            console.log(' ---> deleting Group')

            User.findByIdAndRemove(user._id, (err, doc) => {
                if (err) {
                    console.log('error', err)
                    return err
                } else {
                    console.log(' ---> Account deleted: ', doc)
                    return doc
                }
            })
        },
        updateLandscape(_, { landscape }) {

            console.log(' ---> updating Landscape', landscape)

            Landscape.findOneAndUpdate({ _id: landscape._id }, landscape, { new: true }, (err, doc) => {
                if (err) {
                    console.log(err)
                    return err
                } else {
                    console.log(' ---> updated: ', doc)
                    return doc
                }
            })
        },
        deleteLandscape(_, { landscape }) {

            console.log(' ---> deleting Landscape')

            Landscape.findByIdAndRemove(landscape._id, (err, doc) => {
                if (err) {
                    console.log('error', err)
                    return err
                } else {
                    console.log(' ---> Account deleted: ', doc)
                    return doc
                }
            })
        },
        createAccount(_, { account }) {

            console.log(' ---> creating Account')
            let newAccount = new Account(account)

            newAccount.save(err => {
                if (err) {
                    console.log(err)
                    return err
                } else {
                    console.log(' ---> created: ', newAccount._id)
                    return newAccount
                }
            })
        },
        updateAccount(_, { account }) {

            console.log(' ---> updating Account')

            Account.findOneAndUpdate({ _id: account._id }, account, { new: true }, (err, doc) => {
                if (err) {
                    console.log(err)
                    return err
                } else {
                    console.log(' ---> updated: ', doc)
                    return doc
                }
            })
        },
        deleteAccount(_, { account }) {

            console.log(' ---> deleting Account')

            Account.findByIdAndRemove(account._id, (err, doc) => {
                if (err) {
                    console.log('error', err)
                    return err
                } else {
                    console.log(' ---> Account deleted: ', doc)
                    return doc
                }
            })
        },
        createGroup(_, { group }) {
            console.log('inside resolver to create group', group)

            console.log(' ---> creating group')

            let newGroup = new Group(group)

            newGroup.save(err => {
                if (err) {
                    console.log(err)
                    return err
                } else {
                    console.log(' ---> created: ' + newGroup._id)
                    return Group.find(newGroup._id).sort('-created').populate('user', 'displayName').exec((err, landscapes) => {
                        if (err) return err
                        return landscapes
                    })
                }
            })
        },
        updateGroup(_, { group }) {
          console.log(' ---> updating group')

          Group.findOneAndUpdate({ _id: group._id }, group, { new: true }, (err, doc) => {
              if (err) {
                  console.log(err)
                  return err
              } else {
                  console.log(' ---> updated: ', doc)
                  return doc
              }
          })
        },
        deleteGroup(_, { group }) {
            console.log(' ---> deleting Group')

            Group.findByIdAndRemove(group._id, (err, doc) => {
                if (err) {
                    console.log('error', err)
                    return err
                } else {
                    console.log(' ---> Account deleted: ', doc)
                    return doc
                }
            })
        },
        deploymentStatus(_, { deployment }) {

            winston.info('---> Describing Deployment')

            let cloudformation = new AWS.CloudFormation()

            return new Promise((resolve, reject) => {
                Account.findOne({ name: deployment.accountName }, (err, account) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    }

                    cloudformation.config.update({
                        region: deployment.location
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

                    resolve(deployment.accountName)
                })
            }).then(accountName => {

                let params = {
                    StackName: deployment.stackName
                }

                return new Promise((resolve, reject) => {
                    // console.log('cloudformation', cloudformation)
                    cloudformation.describeStacks(params, (err, data) => {
                        if (err) {
                            console.log(err, err.stack)
                            reject(err)
                        }
                        console.log(data)
                        deployment.stackStatus = data.Stacks[0].StackStatus
                        resolve(deployment)
                    })
                })
            }).catch(err => {
                console.log('ERROR:', err)
            })
        },
        deploymentsByLandscapeId(_, { landscapeId }) {
            return Deployment.find({ landscapeId: landscapeId }).exec((err, deployments) => {
                if (err) return err
                return deployments
            })
        },
        createDeployment(_, { deployment }) {

            console.log(' ---> creating Deployment')

            let _cloudFormationParameters = JSON.parse(deployment.cloudFormationParameters)

            function _setCABundle(pathToCertDotPemFile, rejectUnauthorized) {
                let filePath = path.join(process.cwd(), pathToCertDotPemFile)
                winston.info('## rejectUnauthorizedSsl -->', deployment.rejectUnauthorizedSsl)
                winston.info('##          caBundlePath -->', deployment.caBundlePath)

                let certs = [fs.readFileSync(filePath)]
                winston.info('##        Read CA Bundle -->', filePath)

                AWS.config.update({
                    httpOptions: {
                        agent: new https.Agent({
                            rejectUnauthorized: rejectUnauthorized,
                            ca: certs
                        })
                    }
                })
            }

            function _setRejectUnauthorizedSsl(rejectUnauthorized) {
                winston.info('## rejectUnauthorizedSsl -->', rejectUnauthorized)
                AWS.config.update({
                    httpOptions: {
                        agent: new https.Agent({
                            rejectUnauthorized: rejectUnauthorized
                        })
                    }
                })
            }

            let newDeployment = {}
            let parentLandscape = {}
            let stackParams = {}
            let stackName = {}
            let params = {}
            let cloudFormation

            if (deployment.location.substring(0, 'openstack'.length) === 'openstack') {

                winston.info('using OpenStack provider')
                cloudFormation = new OpenStack()
                cloudFormation.config(deployment.accessKeyId, deployment.secretAccessKey)

            } else {

                winston.info('---> Default to AWS provider')
                if (deployment.accessKeyId && deployment.secretAccessKey) {
                    winston.info('---> setting AWS security credentials')

                    AWS.config.update({
                        accessKeyId: deployment.accessKeyId,
                        secretAccessKey: deployment.secretAccessKey
                    })
                } else {
                    winston.info(' ---> No AWS security credentials set - assuming Server Role')
                }

                if (deployment.caBundlePath) {
                    let rejectUnauthorized = deployment.rejectUnauthorizedSsl || true
                    _setCABundle(deployment.caBundlePath, rejectUnauthorized)

                } else if (deployment.rejectUnauthorizedSsl !== undefined) {
                    // no caBundlePath
                    _setRejectUnauthorizedSsl(deployment.rejectUnauthorizedSsl)
                }

                if (deployment.endpoint) {
                    winston.info('##              endpoint -->', deployment.endpoint)
                    AWS.config.endpoint = deployment.endpoint
                }

                winston.info('##            AWS Region -->', deployment.location)
                AWS.config.region = deployment.location

                cloudFormation = new AWS.CloudFormation({apiVersion: '2010-05-15'})

                console.log(AWS.config)
            }

            async.series({
                saveDeploymentData: function(callback) {
                    winston.info('---> async.series >> saving deployment deployment...')
                    try {
                        newDeployment = new Deployment(deployment)
                        // TODO: update with username
                        newDeployment.createdBy = 'tempAdmin'

                        let tags = Object.keys({})
                        // let tags = Object.keys(deployment.tags)
                        newDeployment.tags = []
                        for (let i = 0; i < tags.length; i++) {
                            let tag = {
                                Key: tags[i],
                                Value: deployment.tags[tags[i]]
                            }
                            newDeployment.tags.push(tag)
                        }
                        // winston.info('## Tags:', JSON.stringify(newDeployment.tags))

                        newDeployment.cloudFormationParameters = [] //
                        let keys = Object.keys(_cloudFormationParameters)
                        for (let j = 0; j < keys.length; j++) {
                            let cloudFormationParameter = {
                                ParameterKey: keys[j],
                                ParameterValue: _cloudFormationParameters[keys[j]]
                            }
                            newDeployment.cloudFormationParameters.push(cloudFormationParameter)
                        }

                        console.log('newDeployment.cloudFormationParameters', newDeployment.cloudFormationParameters)

                        newDeployment.save(function(err, deployment) {
                            if (err) {
                                callback(err)
                            } else {
                                winston.info('---> async.series >> deployment deployment saved!')
                                //What are the next three lines for - AH ?
                                stackName = newDeployment.stackName
                                params = {
                                    StackName: stackName
                                }
                                callback(null)
                            }
                        })
                    } catch (err) {
                        callback(err)
                    }
                },
                setStackParameters: function(callback) {
                    winston.info('---> async.series >> setting stack parameters...')
                    Landscape.findOne({
                        _id: newDeployment.landscapeId
                    }, function(err, landscape) {
                        if (err) {
                            callback(err)
                        } else {
                            parentLandscape = landscape

                            stackParams = {
                                // RoleARN: 'arn:aws:iam::414519249282:role/aws-elasticbeanstalk-ec2-role',
                                StackName: stackName,
                                TemplateBody: landscape.cloudFormationTemplate,
                                Parameters: newDeployment.cloudFormationParameters,
                                Capabilities: ['CAPABILITY_IAM']
                            }

                            stackParams.Parameters = newDeployment.cloudFormationParameters

                            stackParams.Tags = newDeployment.tags

                            if (newDeployment.description) {
                                stackParams.Tags.push({ Key: 'Description', Value: newDeployment.description })
                            }
                            if (newDeployment.billingCode) {
                                stackParams.Tags.push({ Key: 'Billing Code', Value: newDeployment.billingCode })
                            }

                            winston.info('---> async.series >> stack parameters set!')
                            callback(null)
                        }
                    })
                },
                verifyStackNameAvailability: function(callback) {
                    winston.info('---> async.series >> verifying availability of stack name...')
                    cloudFormation.describeStacks(params, function(err, deployment) {
                        if (err) {
                            if (err.message.indexOf('does not exist') !== -1) {
                                winston.info('---> async.series >> stack name "' + stackName + '" available!')
                                callback(null)
                            } else {
                                // It's a real error...
                                callback(err)
                            }

                        } else {
                            let e = {
                                message: 'Stack with name \'' + stackName + '\' already exists.'
                            }
                            winston.info('---> async.series >> stack name "' + stackName + '" already exists!')
                            callback(e)
                        }
                    })
                },
                createStack: function(callback) {
                    winston.info('---> async.series >> creating stack...')

                    // fix single quote issue...
                    let cleanStackParams = JSON.parse(JSON.stringify(stackParams))
                    console.log('cleanStackParams', cleanStackParams)
                    let awsRequest = cloudFormation.createStack(cleanStackParams, function(err, deployment) {
                        if (err) {
                            callback(err)

                        } else {
                            winston.info('---> async.series >> stack created!')

                            newDeployment.stackId = deployment.StackId
                            newDeployment.save(function(err) {
                                if (err) {
                                    callback(err)
                                }
                                callback(null, deployment) // awsRequest?
                            })
                        }
                    })
                }
            }, function(err, results) {
                if (err) {
                    winston.info('---> async.series >> final callback: ERR')
                    winston.error(err)

                    newDeployment.awsErrors = err.message || err
                    newDeployment.save(function(err) {
                        if (err) {
                            winston.log('error', err)
                        }
                        return err
                    })
                } else {
                    winston.info('---> async.series >> final callback: SUCCESS')
                    return results
                }
            }) // end - async.series
        },
        deleteDeployment(_, { deployment }) {

            console.log(deployment)

            if (deployment.isDeleted) {
                console.log(' ---> purging deployment')

                return Deployment.remove({ stackName: deployment.stackName }, (err, result) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    }
                    console.log('result', result)
                    return result
                })
            } else {

                console.log(' ---> deleting deployment')

                let cloudformation = new AWS.CloudFormation()

                let params = {
                    StackName: deployment.stackName
                }

                return new Promise((resolve, reject) => {
                    Account.findOne({ name: deployment.accountName }, (err, account) => {
                        if (err) {
                            console.log(err)
                            return err
                        }

                        cloudformation.config.update({
                            region: deployment.location
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

                        resolve(deployment.accountName)
                    })
                }).then(accountName => {
                    return cloudformation.deleteStack(params, (err, data) => {
                        if (err) {
                            console.log(err, err.stack)
                            return err
                        }
                        return data
                    })
                }).then(response => {
                    return Deployment.findOneAndUpdate({ stackName: deployment.stackName },
                        { $set: { isDeleted: true } }, { new: true }, (err, doc) => {
                            if (err) {
                                console.log(err)
                                reject(err)
                            }
                        return doc
                    })
                }).catch(err => {
                    console.log('ERROR:', err)
                    return err
                })
            }
        }
    },
    Subscription: {
        postUpvoted(post) {
            return post
        }
    },
    User: {
        // posts(author) {
        //     return filter(posts, { authorId: author.id })
        // }
    },
    Landscape: {
        // author(post) {
        //     return find(authors, { id: post.authorId })
        // }
    }
}

export default resolveFunctions
