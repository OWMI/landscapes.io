import * as fs from 'fs'
import * as path from 'path'
import _ from 'lodash'
import passport from 'passport'
import ldap from 'ldapjs'
import async from 'async'
import https from 'https'
import AWS from 'aws-sdk'
import { find, filter } from 'lodash'
import { pubsub } from './subscriptions'
import lodash from 'lodash'

const config = require(path.resolve('./server/config/config'))
const Landscape = require('./models/landscape')
const Deployment = require('./models/deployment')
const Configuration = require('./models/configuration')
const Mappings = require('./models/mappings')
const Group = require('./models/group')
const Account = require('./models/account')
const User = require('../auth/models/user.server.model')
const Integration = require('../auth/models/integration.server.model')
const TypeDocument = require('./models/documentTypes')
const Tag = require('./models/tag')

// Instantiate the LDAP client
const ldapClient = ldap.createClient({
    url: config.ldap.url
})

ldapClient.bind(config.ldap.bindDn, config.ldap.bindCredentials, err => {
    if (err) console.log(err)
})

// FIX: Attempts to resolve 'UnknownEndpoint' error experienced on GovCloud
AWS.events.on('httpError', () => {
    if (this.response.error && this.response.error.code === 'UnknownEndpoint') {
        this.response.error.retryable = true;
    } else if (this.response.error && this.response.error.code === 'NetworkingError') {
        this.response.error.retryable = true;
    }
})

const resolveFunctions = {
    Query: {
        landscapes(root, args, context) {
            return Landscape.find().sort('-created').populate('user', 'displayName').exec((err, landscapes) => {
                if (err) return err
                return landscapes
            })
        },
        integrations(root, args, context) {
            return Integration.find().exec((err, integrations) => {
                if (err) return err
                return integrations
            })
        },
        configuration(root, args, context) {
            return Configuration.find().exec((err, config) => {
                if (err) return err
                return config
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
        tags(root, args, context) {
            return Tag.find().sort('-created').populate('user', 'displayName').exec((err, tags) => {
                if (err) return err
                return tags
            })
        },
        groups(root, args, context) {
          return new Promise((resolve, reject) => {

            return Group.find().sort('-created').populate('user', 'displayName').exec((err, groups) => {

                if (err) return reject(err)
                return resolve(groups)
            })
          })
        },
        groupsByUser(root, args, context) {
            return new Promise((resolve, reject) => {
              return Group.find().sort('-created').populate('user', 'displayName').exec((err, groups) => {
                  if (err) return reject(err)
                  return User.findById(args.id).exec((err, user) =>{
                    if (user && user.role === 'admin') {
                      return resolve(groups)
                    }
                    else {
                     return resolve(lodash.filter(groups, lodash.flow(lodash.property('users'), lodash.partialRight(lodash.some, { userId: args.id }))));
                    }
                  })
              })
            })
        },
        groupById(root, args, context) {
            return Group.findById(args.id).exec((err, group) =>{
                if (err) return err
                return group
          })
        },
        ldapGroups(root, args, context) {

            let groupsArray = [],
                opts = {
                    filter: '(cn=*)',
                    scope: 'sub',

                }

            return new Promise((resolve, reject) => {
                ldapClient.search('ou=groups,dc=landscapes,dc=io', opts, (err, res) => {
                    res.on('searchEntry', entry => {
                        groupsArray.push(entry.object)
                    })

                    res.on('searchReference', referral => {
                        console.log('referral: ' + referral.uris.join())
                    })

                    res.on('error', err => {
                        console.error('error: ' + err.message)
                        reject(err)
                    })

                    res.on('end', result => {
                        resolve(groupsArray)
                    })
                })
            })

        },
        mappings(root, args, context) {
            return Mappings.find().exec((err, mappings) => {
                if (err) return err
                return mappings
            })
        },
        documentTypes(root, args, context) {
            return TypeDocument.find().sort('-created').exec((err, documentTypes) => {
                if (err) return err
                return documentTypes
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
        toggleFirstUser(_, { configId }) {
            return new Promise((resolve, reject) => {
                return Configuration.findOneAndUpdate(
                    { _id: configId },
                    { $set:{ isFirstUser: false } },
                    { new: true },
                    (err, config) => {
                        if (err) reject(err)
                        resolve(config)
                    }
                )
            })
        },
        createLandscape(_, { landscape }) {
            return new Promise((resolve, reject) => {

                console.log(' ---> creating Landscape')
                let newLandscape = new Landscape(landscape)

                newLandscape.save(err => {
                    if (err) {
                        console.log(err)
                        return reject(err)
                    } else {
                        console.log(' ---> created: ', newLandscape._id)
                        return resolve(newLandscape)
                    }
                })
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
            console.log(' ---> deleting User')

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
        createIntegration(_, { integration }) {

            console.log(' ---> creating integration', integration)
            let newIntegration = new Integration(integration)

            newIntegration.save(err => {
                if (err) {
                    console.log(err)
                    return err
                } else {
                    console.log(' ---> created: ', newIntegration._id)
                    return newIntegration
                }
            })
        },
        updateIntegration(_, { integration }) {

          console.log(' ---> updating integration')
          Integration.findOneAndUpdate({ _id: integration._id }, integration, { new: true }, (err, doc) => {
              if (err) {
                  console.log(err)
                  return err
              } else {
                  console.log(' ---> updated: ', doc)
                  return doc
              }
          })
        },
        deleteIntegration(_, { integration }) {
            console.log(' ---> deleting integration')

            Integration.findByIdAndRemove(integration._id, (err, doc) => {
                if (err) {
                    console.log('error', err)
                    return err
                } else {
                    console.log(' ---> integration deleted: ', doc)
                    return doc
                }
            })
        },
        createTag(_, { tag }) {

            console.log(' ---> creating Tag', tag)
            let newTag = new Tag(tag)

            newTag.save(err => {
                if (err) {
                    console.log(err)
                    return err
                } else {
                    console.log(' ---> created: ', newTag._id)
                    return newTag
                }
            })
        },
        updateTag(_, { tag }) {

          console.log(' ---> updating Tag')

          Tag.findOneAndUpdate({ _id: tag._id }, tag, { new: true }, (err, doc) => {
              if (err) {
                  console.log(err)
                  return err
              } else {
                  console.log(' ---> updated: ', doc)
                  return doc
              }
          })
        },
        deleteTag(_, { tag }) {
            console.log(' ---> deleting Tag')

            Tag.findByIdAndRemove(tag._id, (err, doc) => {
                if (err) {
                    console.log('error', err)
                    return err
                } else {
                    console.log(' ---> Tag deleted: ', doc)
                    return doc
                }
            })
        },
        createDocumentType(_, { documentType }) {

            console.log(' ---> creating DocumentType', TypeDocument)
            let newDocumentType = new TypeDocument(documentType)

            newDocumentType.save(err => {
                if (err) {
                    console.log(err)
                    return err
                } else {
                    console.log(' ---> created: ', newDocumentType._id)
                    return newDocumentType
                }
            })
        },
        updateDocumentType(_, { documentType }) {
          console.log(' ---> updating documentType')

          TypeDocument.findOneAndUpdate({ _id: documentType._id }, documentType, { new: true }, (err, doc) => {
              if (err) {
                  console.log(err)
                  return err
              } else {
                  console.log(' ---> updated: ', doc)
                  return doc
              }
          })
        },
        deleteDocumentType(_, { documentType }) {
            console.log(' ---> deleting Document Type')

            TypeDocument.findByIdAndRemove({ _id: documentType._id }, (err, doc) => {
                if (err) {
                    console.log('error', err)
                    return err
                } else {
                    console.log(' ---> Document Type deleted: ', doc)
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
                    console.log(' ---> Landscape deleted: ', doc)
                    return doc
                }
            })
        },
        updateMappings(_, { mapping }) {
            const { _id } = mapping

            if (_id) {
                console.log(' ---> updating mapping')
                Mappings.update({ _id }, mapping,
                    { upsert: true, setDefaultsOnInsert: true }, (err, doc) => {
                        if (err) return err
                        return doc
                    }
                )
            } else {
                console.log(' ---> creating mapping')
                let newMapping = new Mappings(mapping)
                newMapping.save(err => {
                    if (err) return err
                    return newMapping
                })
            }
        },
        createAccount(_, { account }) {
          return new Promise((resolve, reject) => {

            console.log(' ---> creating Account')
            let newAccount = new Account(account)

            newAccount.save(err => {
                if (err) {
                    console.log(err)
                    return reject(err)
                } else {
                    console.log(' ---> created: ', newAccount._id)
                    return resolve(newAccount)
                }
            })
          })
        },
        updateAccount(_, { account }) {
          return new Promise((resolve, reject) => {

            console.log(' ---> updating Account')

            Account.findOneAndUpdate({ _id: account._id }, account, { new: true }, (err, doc) => {
                if (err) {
                    console.log(err)
                    return reject(err)
                } else {
                    console.log(' ---> updated: ', doc)
                    return resolve(doc)
                }
            })
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
          return new Promise((resolve, reject) => {

            console.log(' ---> creating group')

            let newGroup = new Group(group)

            newGroup.save(err => {
                if (err) {
                    console.log(err)
                    return reject(err)
                } else {
                    console.log(' ---> created: ' + newGroup._id)
                    return Group.find(newGroup._id).sort('-created').populate('user', 'displayName').exec((err, groups) => {
                        if (err) return err
                        return resolve(newGroup)
                    })
                }
            })
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

            console.log('---> Describing Deployment')

            let cloudformation = new AWS.CloudFormation({ apiVersion: '2010-05-15' })

            return new Promise((resolve, reject) => {
                Account.findOne({ name: deployment.accountName }, (err, account) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    }

                    console.log('---> setting AWS region')
                    AWS.config.region = deployment.location

                    if (account && account.accessKeyId && account.secretAccessKey) {
                        console.log('---> setting AWS security credentials.')

                        cloudformation.config.update({
                            accessKeyId: account.accessKeyId,
                            secretAccessKey: account.secretAccessKey
                        })

                    } else {
                        console.log(' ---> No AWS security credentials set - assuming Server IAM Role')
                    }

                    resolve(deployment.accountName)
                })
            }).then(accountName => {

                let params = {
                    StackName: deployment.stackName
                }

                return new Promise((resolve, reject) => {

                    cloudformation.describeStacks(params, (err, data) => {
                        if (err) {
                            console.log(err, err.stack)
                            reject(err)
                        }

                        // fetch status reason if deployment rolls back
                        if (data.Stacks[0].StackStatus === 'ROLLBACK_COMPLETE') {
                            cloudformation.describeStackEvents(params, (err, data) => {
                                let _status = find(data.StackEvents, { ResourceStatus: 'ROLLBACK_IN_PROGRESS' })
                                deployment.awsErrors = _status.ResourceStatusReason
                                deployment.stackStatus = 'ROLLBACK_COMPLETE'
                                resolve(deployment)
                            })
                        } else {
                            deployment.stackStatus = data.Stacks[0].StackStatus
                            resolve(deployment)
                        }
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
            let _tags = JSON.parse(deployment.tags)

            function _setCABundle(pathToCertDotPemFile, rejectUnauthorized) {
                let filePath = path.join(process.cwd(), pathToCertDotPemFile)
                console.log('## rejectUnauthorizedSsl -->', deployment.rejectUnauthorizedSsl)
                console.log('##          caBundlePath -->', deployment.caBundlePath)

                let certs = [fs.readFileSync(filePath)]
                console.log('##        Read CA Bundle -->', filePath)

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
                console.log('## rejectUnauthorizedSsl -->', rejectUnauthorized)
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

                console.log('using OpenStack provider')
                cloudFormation = new OpenStack()
                cloudFormation.config(deployment.accessKeyId, deployment.secretAccessKey)

            } else {

                console.log('---> Default to AWS provider')
                if (deployment.accessKeyId && deployment.secretAccessKey) {
                    console.log('---> setting AWS security credentials')

                    AWS.config.update({
                        accessKeyId: deployment.accessKeyId,
                        secretAccessKey: deployment.secretAccessKey
                    })
                } else {
                    console.log(' ---> No AWS security credentials set - assuming Server Role')
                }

                if (deployment.caBundlePath) {
                    let rejectUnauthorized = deployment.rejectUnauthorizedSsl || true
                    _setCABundle(deployment.caBundlePath, rejectUnauthorized)

                } else if (deployment.rejectUnauthorizedSsl !== undefined) {
                    // no caBundlePath
                    _setRejectUnauthorizedSsl(deployment.rejectUnauthorizedSsl)
                }

                if (deployment.endpoint) {
                    console.log('##              endpoint -->', deployment.endpoint)
                    AWS.config.endpoint = deployment.endpoint
                }

                console.log('##            AWS Region -->', deployment.location)
                AWS.config.region = deployment.location

                cloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' })
            }

            async.series({
                saveDeploymentData: callback => {
                    console.log('---> async.series >> saving deployment deployment...')
                    try {
                        newDeployment = new Deployment(deployment)

                        let tags = Object.keys(_tags)
                        // let tags = Object.keys(deployment.tags)
                        newDeployment.tags = []
                        for (let i = 0; i < tags.length; i++) {
                            let tag = {
                                Key: _tags[tags[i]].Key,
                                Value: _tags[tags[i]].Value
                            }
                            newDeployment.tags.push(tag)
                        }
                        console.log('## Tags:', JSON.stringify(newDeployment.tags))

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

                        newDeployment.save((err, deployment) => {
                            if (err) {
                                callback(err)
                            } else {
                                console.log('---> async.series >> deployment deployment saved!')

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
                setStackParameters: callback => {
                    console.log('---> async.series >> setting stack parameters...')
                    Landscape.findOne({
                        _id: newDeployment.landscapeId
                    }, (err, landscape) => {
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

                            console.log('---> async.series >> stack parameters set!')
                            callback(null)
                        }
                    })
                },
                verifyStackNameAvailability: callback => {
                    console.log('---> async.series >> verifying availability of stack name...')
                    cloudFormation.describeStacks(params, (err, deployment) => {
                        if (err) {
                            if (err.message.indexOf('does not exist') !== -1) {
                                console.log('---> async.series >> stack name "' + stackName + '" available!')
                                callback(null)
                            } else {
                                // It's a real error...
                                callback(err)
                            }

                        } else {
                            let e = {
                                message: 'Stack with name \'' + stackName + '\' already exists.'
                            }
                            console.log('---> async.series >> stack name "' + stackName + '" already exists!')
                            callback(e)
                        }
                    })
                },
                createStack: callback => {
                    console.log('---> async.series >> creating stack...')

                    // fix single quote issue...
                    let cleanStackParams = JSON.parse(JSON.stringify(stackParams))
                    console.log('cleanStackParams', cleanStackParams)
                    let awsRequest = cloudFormation.createStack(cleanStackParams, (err, deployment) => {
                        if (err) {
                            callback(err)

                        } else {
                            console.log('---> async.series >> stack created!')

                            newDeployment.stackId = deployment.StackId
                            newDeployment.save(err => {
                                if (err) {
                                    callback(err)
                                }
                                callback(null, deployment) // awsRequest?
                            })
                        }
                    })
                }
            }, (err, results) => {
                if (err) {
                    console.log('---> async.series >> final callback: ERR')
                    console.log('Error --->', err)

                    newDeployment.awsErrors = err.message || err
                    newDeployment.save(err => {
                        if (err) {
                            console.log('Error --->', err)
                            return err
                        }
                    })
                } else {
                    console.log('---> async.series >> final callback: SUCCESS')
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
                            console.log('---> setting AWS security credentials')

                            cloudformation.config.update({
                                accessKeyId: account.accessKeyId,
                                secretAccessKey: account.secretAccessKey
                            })

                        } else {
                            console.log(' ---> No AWS security credentials set - assuming Server IAM Role')
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
