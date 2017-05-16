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
            return new Promise((resolve, reject) => {
                return Landscape.find().sort('-created').populate('user', 'displayName').exec((err, landscapes) => {
                    if (err) return reject(err)
                    return resolve(landscapes)
                })
            });
        },
        integrations(root, args, context) {
            return new Promise((resolve, reject) => {
                return Integration.find().exec((err, integrations) => {
                    if (err) return reject(err)
                    return resolve(integrations)
                })
            });
        },
        configuration(root, args, context) {
            return new Promise((resolve, reject) => {
                return Configuration.find().exec((err, config) => {
                    if (err) return reject(err)
                    return resolve(config)
                })
            });
        },
        landscapeById(root, args, context) {
            return new Promise((resolve, reject) => {
                return Landscape.findById(args.id).exec((err, landscape) => {
                    if (err) return reject(err)
                    return resolve(landscape)
                })
            });
        },
        accounts(root, args, context) {
            return new Promise((resolve, reject) => {
                return Account.find().sort('-created').exec((err, accounts) => {
                    if (err) return reject(err)

                    if (context.userData.role == "admin")
                        return resolve(accounts)
                    else
                        return resolve([{}])
                })
            });
        },
        tags(root, args, context) {
            return new Promise((resolve, reject) => {
                return Tag.find().sort('-created').populate('user', 'displayName').exec((err, tags) => {
                    if (err) return reject(err)
                    return resolve(tags)
                })
            });
        },
        groups(root, args, context) {
            return new Promise((resolve, reject) => {
                return Group.find().sort('-created').populate('user', 'displayName').exec((err, groups) => {
                    if (err) return reject(err)

                    if (context.userData.role == "admin")
                        return resolve(groups)
                    else
                        return resolve(context.userData.groups)
                })
            })
        },
        groupsByUser(root, args, context) {
            return new Promise((resolve, reject) => {
                return Group.find().sort('-created').populate('user', 'displayName').exec((err, groups) => {
                    if (err) return reject(err)
                    return User.findById(args.id).exec((err, user) => {
                        if (user && user.role === 'admin') {
                            return resolve(groups)
                        } else {
                            return resolve(lodash.filter(groups, lodash.flow(lodash.property('users'), lodash.partialRight(lodash.some, {userId: args.id}))));
                        }
                    })
                })
            })
        },
        groupById(root, args, context) {
            return new Promise((resolve, reject) => {
                return Group.findById(args.id).exec((err, group) => {
                    if (err) return reject(err)

                    var inGroup = false;
                    for (var i=0; i < context.userData.groups.length; i++) {
                        if (context.userData.groups[i]._id == group._id) {
                            inGroup = true;
                            break;
                        }
                    }

                    if (context.userData.role == "admin" || inGroup)
                        return resolve(group)
                    else return reject({})
                })
            });
        },
        ldapGroups(root, args, context) {

            // Instantiate the LDAP client
            const ldapClient = ldap.createClient({
                url: config.ldap.url
            })

            ldapClient.bind(config.ldap.bindDn, config.ldap.bindCredentials, err => {
                if (err) console.log(err)
            })

            let groupsArray = [],
                opts = {
                    filter: '(cn=*)',
                    scope: 'sub'
                }

            if (context.userData.role == "admin") {

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
            }
            else {
                return reject([{}])
            }
        },
        mappings(root, args, context) {
            return new Promise((resolve, reject) => {
                return Mappings.find().exec((err, mappings) => {
                    if (err) return reject(err)
                    return resolve(mappings)
                })
            });
        },
        documentTypes(root, args, context) {
            return new Promise((resolve, reject) => {
                    return TypeDocument.find().sort('-created').exec((err, documentTypes) => {
                        if (err) return reject(err)
                        return resolve(documentTypes)
                    });
            })
        },
        users(root, args, context) {
            return new Promise((resolve, reject) => {
                return User.find().sort('-created').populate('user', 'displayName').exec((err, groups) => {
                    if (err) return reject(err)

                    console.log(context.userData)
                    if (context.userData.role == "admin")
                    return resolve(groups)
                    else
                    return resolve([context.userData])
                })
            });
        },
        userById(root, args, context) {
            return new Promise((resolve, reject) => {
                return User.find().sort('-created').populate('user', 'displayName').exec((err, groups) => {
                    if (err) return reject(err)

                    var isUser = false;
                    console.log("HEY")
                    console.log(groups)

                    if (groups._id == context.userData._id)
                    isUser = true;
                    if (context.userData.role == "admin" || isUser)
                        return resolve(groups)
                    else
                        return reject([{}])
                })
            });
        }
    },
    Mutation: {
        loginUser(_, { user }) {
            console.log('login resolver')
        },
        toggleFirstUser(_, { configId }) {
            return new Promise((resolve, reject) => {
                return Configuration.findOneAndUpdate(
                    {_id: configId},
                    {$set: {isFirstUser: false}},
                    {new: true},
                    (err, config) => {
                        if (err) reject(err)
                        resolve(config)
                    }
                )
            })
        },
        createLandscape(_, { landscape }, context) {
            return new Promise((resolve, reject) => {

                console.log(' ---> creating Landscape')
                let newLandscape = new Landscape(landscape)
                if (context.userData.role == "admin" || context.userData.isGroupAdmin == true) {

                    newLandscape.save(err => {
                        if (err) {
                            console.log(err)
                            return reject(err)
                        } else {
                            console.log(' ---> created: ', newLandscape._id)
                            return resolve(newLandscape)
                        }
                    })
                }
                })

        },
        createUser(_, { user }, context) {
            return new Promise((resolve, reject) => {

                console.log(' ---> creating User', user)
                let newUser = new User(user)

                if (context.userData.role == "admin") {

                    newUser.save(err => {
                        if (err) {
                            console.log(err)
                            return reject(err)
                        } else {
                            console.log(' ---> created: ', newUser._id)
                            return resolve(newUser)
                        }
                    })
                } else {
                    return resolve("Not authorized")
                }
            })

        },
        updateUser(_, { user }, context) {
            return new Promise((resolve, reject) => {

                console.log(' ---> updating user')
                    if (context.userData.role == "admin") {

                User.findOneAndUpdate({_id: user._id}, user, {new: true}, (err, doc) => {
                    if (err) {
                        console.log(err)
                        return reject(err)
                    } else {
                        console.log(' ---> updated: ', doc)
                        return resolve(doc)
                    }
                })
                    } else {
                        return resolve("Not authorized")
                    }
            });
        },
        deleteUser(_, { user }, context) {
            return new Promise((resolve, reject) => {
                console.log(' ---> deleting User')
                    if (context.userData.role == "admin") {

                User.findByIdAndRemove(user._id, (err, doc) => {
                    if (err) {
                        console.log('error', err)
                        return reject(err)
                    } else {
                        console.log(' ---> Account deleted: ', doc)
                        return resolve(doc)
                    }
                })
                    } else {
                        return resolve("Not authorized")
                    }
            });
        },
        createIntegration(_, { integration }, context) {
            return new Promise((resolve, reject) => {

                console.log(' ---> creating integration', integration)
                let newIntegration = new Integration(integration)
                if (context.userData.role == "admin") {
                    newIntegration.save(err => {
                        if (err) {
                            console.log(err)
                            return reject(err)
                        } else {
                            console.log(' ---> created: ', newIntegration._id)
                            return resolve(newIntegration)
                        }
                    })
                } else {
                    return resolve("Not authorized")
                }

            });
        },
        updateIntegration(_, { integration }, context) {
            return new Promise((resolve, reject) => {
                    if (context.userData.role == "admin") {

                        console.log(' ---> updating integration')
                        Integration.findOneAndUpdate({_id: integration._id}, integration, {new: true}, (err, doc) => {
                            if (err) {
                                console.log(err)
                                return reject(err)
                            } else {
                                console.log(' ---> updated: ', doc)
                                return resolve(doc)
                            }
                        })
                    } else {
                        return("Not Authorized")
                    }
            });
        },
        deleteIntegration(_, { integration }, context) {
            return new Promise((resolve, reject) => {
                console.log(' ---> deleting integration')
                    if (context.userData.role == "admin") {

                        Integration.findByIdAndRemove(integration._id, (err, doc) => {
                            if (err) {
                                console.log('error', err)
                                return reject(err)
                            } else {
                                console.log(' ---> integration deleted: ', doc)
                                return resolve(doc)
                            }
                        })
                    } else {
                        return ("Not Authorized")
                    }
            });
        },
        createTag(_, { tag }, context) {
            return new Promise((resolve, reject) => {

                console.log(' ---> creating Tag', tag)
                let newTag = new Tag(tag)
                    if (context.userData.role == "admin" || context.userData.isGroupAdmin == true) {

                        newTag.save(err => {
                            if (err) {
                                console.log(err)
                                return reject(err)
                            } else {
                                console.log(' ---> created: ', newTag._id)
                                return resolve(newTag)
                            }
                        })
                    } else {
                        return reject("Not Authorized")
                    }
            })
        },
        updateTag(_, { tag }, context) {
                return new Promise((resolve, reject) => {
                    console.log(' ---> updating Tag')
                        if (context.userData.role == "admin" || context.userData.isGroupAdmin == true) {

                            Tag.findOneAndUpdate({_id: tag._id}, tag, {new: true}, (err, doc) => {
                                if (err) {
                                    console.log(err)
                                    return reject(err)
                                } else {
                                    console.log(' ---> updated: ', doc)
                                    return resolve(doc)
                                }
                            })
                        } return reject("Not Authorized")
                });
        },
        deleteTag(_, { tag }, context) {
            return new Promise((resolve, reject) => {
                console.log(' ---> deleting Tag')
                    if (context.userData.role == "admin" || context.userData.isGroupAdmin == true) {

                        Tag.findByIdAndRemove(tag._id, (err, doc) => {
                            if (err) {
                                console.log('error', err)
                                return reject(err)
                            } else {
                                console.log(' ---> Tag deleted: ', doc)
                                return resolve(doc)
                            }
                        })
                    } else {
                        return reject("Not Admin")
                    }
            });
        },
        createDocumentType(_, { documentType }, context) {
            return new Promise((resolve, reject) => {
                console.log(' ---> creating DocumentType', TypeDocument)
                let newDocumentType = new TypeDocument(documentType)
                    if (context.userData.role == "admin" || context.userData.isGroupAdmin == true) {

                        newDocumentType.save(err => {
                            if (err) {
                                console.log(err)
                                return reject(err)
                            } else {
                                console.log(' ---> created: ', newDocumentType._id)
                                return resolve(newDocumentType)
                            }
                        })
                    } else {
                        return reject("Not authorized")
                    }
            });
        },
        updateDocumentType(_, { documentType }, context) {
            return new Promise((resolve, reject) => {
                console.log(' ---> updating documentType')
                    if (context.userData.role == "admin" || context.userData.isGroupAdmin == true) {

                        TypeDocument.findOneAndUpdate({_id: documentType._id}, documentType, {new: true}, (err, doc) => {
                            if (err) {
                                console.log(err)
                                return reject(err)
                            } else {
                                console.log(' ---> updated: ', doc)
                                return resolve(doc)
                            }
                        })
                    } else {
                        return reject("Not authorized")
                    }
            });
        },
        deleteDocumentType(_, { documentType }, context) {
            return new Promise((resolve, reject) => {

                console.log(' ---> deleting Document Type')
                    if (context.userData.role == "admin" || context.userData.isGroupAdmin == true) {

                        TypeDocument.findByIdAndRemove({_id: documentType._id}, (err, doc) => {
                            if (err) {
                                console.log('error', err)
                                return reject(err)
                            } else {
                                console.log(' ---> Document Type deleted: ', doc)
                                return resolve(doc)
                            }
                        })
                    } else {
                        return reject("Not authorized")
                    }
            });
        },
        updateLandscape(_, { landscape }, context) {
            return new Promise((resolve, reject) => {

                console.log(' ---> updating Landscape', landscape)
                    if (context.userData.role == "admin" || context.userData.isGroupAdmin == true) {

                        Landscape.findOneAndUpdate({_id: landscape._id}, landscape, {new: true}, (err, doc) => {
                            if (err) {
                                console.log(err)
                                return reject(err)
                            } else {
                                console.log(' ---> updated: ', doc)
                                return resolve(doc)
                            }
                        })
                    } else {
                        return resolve("Not authorized")
                    }
            });
        },
        deleteLandscape(_, { landscape }, context) {
            return new Promise((resolve, reject) => {

                console.log(' ---> deleting Landscape')
                    if (context.userData.role == "admin" || context.userData.isGroupAdmin == true) {

                        Landscape.findByIdAndRemove(landscape._id, (err, doc) => {
                            if (err) {
                                console.log('error', err)
                                return reject(err)
                            } else {
                                console.log(' ---> Landscape deleted: ', doc)
                                return resolve(doc)
                            }
                        })
                    } else {
                        return resolve("Not authorized")
                    }
            });
        },
        updateMappings(_, { mapping }, context) {
            const { _id } = mapping
            return new Promise((resolve, reject) => {

                if (_id) {
                    console.log(' ---> updating mapping')
                    Mappings.update({_id}, mapping,
                        {upsert: true, setDefaultsOnInsert: true}, (err, doc) => {
                            if (err) return reject(err)
                            return resolve(doc)
                        }
                    )
                } else {
                    console.log(' ---> creating mapping')
                    let newMapping = new Mappings(mapping)
                    newMapping.save(err => {
                        if (err) return reject(err)
                        return resolve(newMapping)
                    })
                }
            });
        },
        createAccount(_, { account }, context) {
            return new Promise((resolve, reject) => {

                console.log(' ---> creating Account')
                let newAccount = new Account(account)
                    if (context.userData.role == "admin" || context.userData.isGroupAdmin == true) {

                        newAccount.save(err => {
                            if (err) {
                                console.log(err)
                                return reject(err)
                            } else {
                                console.log(' ---> created: ', newAccount._id)
                                return resolve(newAccount)
                            }
                        })
                    } else {
                        return reject("Not authorized")
                    }
            })
        },
        updateAccount(_, { account }, context) {
            return new Promise((resolve, reject) => {

                console.log(' ---> updating Account')
                    if (context.userData.role == "admin" || context.userData.isGroupAdmin == true) {

                        Account.findOneAndUpdate({_id: account._id}, account, {new: true}, (err, doc) => {
                            if (err) {
                                console.log(err)
                                return reject(err)
                            } else {
                                console.log(' ---> updated: ', doc)
                                return resolve(doc)
                            }
                        })
                    } else {
                        return resolve("Not admin")
                    }
            })
        },
        deleteAccount(_, { account }, context) {
            return new Promise((resolve, reject) => {

                console.log(' ---> deleting Account')
                    if (context.userData.role == "admin" || context.userData.isGroupAdmin == true) {

                        Account.findByIdAndRemove(account._id, (err, doc) => {
                            if (err) {
                                console.log('error', err)
                                return reject(err)
                            } else {
                                console.log(' ---> Account deleted: ', doc)
                                return resolve(doc)
                            }
                        })
                    } else {
                        return resolve("Not Authorized")
                    }
            });
        },
        createGroup(_, { group }, context) {
            return new Promise((resolve, reject) => {

                console.log(' ---> creating group')
                    if (context.userData.role == "admin") {

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
                    } else {
                        return resolve("Not authorized")
                    }
            })
        },
        updateGroup(_, { group }, context) {
            return new Promise((resolve, reject) => {
                console.log(' ---> updating group')
                    var inGroup = false;
                for (var i=0; i < context.userData.groups.length; i++) {
                    if (context.userData.groups[i]._id == group._id) {
                        inGroup = true;
                        break;
                    }
                }
                    if (context.userData.role == "admin" || inGroup) {

                        Group.findOneAndUpdate({_id: group._id}, group, {new: true}, (err, doc) => {
                            if (err) {
                                console.log(err)
                                return reject(err)
                            } else {
                                console.log(' ---> updated: ', doc)
                                return resolve(doc)
                            }
                        })
                    } else {
                        return resolve("Not authorized")
                    }
            });
        },
        deleteGroup(_, { group }, context) {
            return new Promise((resolve, reject) => {
                console.log(' ---> deleting Group')
                    var inGroup = false;
                    for (var i=0; i < context.userData.groups.length; i++) {
                        if (context.userData.groups[i]._id == group._id) {
                            inGroup = true;
                            break;
                        }
                    }
                    if (context.userData.role == "admin" || inGroup) {
                        Group.findByIdAndRemove(group._id, (err, doc) => {
                            if (err) {
                                console.log('error', err)
                                return reject(err)
                            } else {
                                console.log(' ---> Account deleted: ', doc)
                                return resolve(doc)
                            }
                        })
                    } else {
                        return resolve("Not Authorized")
                    }
            })
        },
        fetchAvailabilityZones(_, { region }, context) {

            console.log('---> Fetching AvailabilityZones')
            const ec2 = new AWS.EC2({apiVersion: '2016-11-15'})

            console.log('---> setting AWS region')
            AWS.config.region = region || 'us-east-1'

            return new Promise((resolve, reject) => {
                ec2.describeAvailabilityZones({}, (err, data) => {
                    if (err) reject(err)
                    resolve(data.AvailabilityZones)
                })
            })
        },
        fetchHostedZones(_, { region }, context) {
            console.log('---> Fetching Key Pairs')
            const route53 = new AWS.Route53({apiVersion: '2016-11-15'})

            console.log('---> setting AWS region')
            AWS.config.region = region || 'us-east-1'

            return new Promise((resolve, reject) => {
                route53.listHostedZones({}, (err, data) => {
                    if (err) reject(err)
                    resolve(data.HostedZones)
                })
            })
        },
        fetchImages(_, { region }, context) {
            console.log('---> Fetching Images')
            const ec2 = new AWS.EC2({apiVersion: '2016-11-15'})

            console.log('---> setting AWS region')
            AWS.config.region = region || 'us-east-1'

            return new Promise((resolve, reject) => {
                ec2.describeImages({}, (err, data) => {
                    if (err) reject(err)
                    resolve(data.Images)
                })
            })
        },
        fetchInstances(_, { region }, context) {
            console.log('---> Fetching Instances')
            const ec2 = new AWS.EC2({apiVersion: '2016-11-15'})

            console.log('---> setting AWS region')
            AWS.config.region = region || 'us-east-1'

            return new Promise((resolve, reject) => {
                ec2.describeInstances({}, (err, data) => {
                    if (err) reject(err)

                    let Instances = []
                    const { Reservations } = data

                    Reservations.forEach(res => {
                        res.Instances.map(instance => {
                            const { InstanceId, Tags } = instance
                            Instances.push({InstanceId, Tags})
                        })
                    })

                    resolve(Instances)
                })
            })
        },
        fetchKeyPairs(_, { region }, context) {
            console.log('---> Fetching KeyPairs')
            const ec2 = new AWS.EC2({apiVersion: '2016-11-15'})

            console.log('---> setting AWS region')
            AWS.config.region = region || 'us-east-1'

            return new Promise((resolve, reject) => {
                ec2.describeKeyPairs({}, (err, data) => {
                    if (err) reject(err)
                    resolve(data.KeyPairs)
                })
            })
        },
        fetchSecurityGroups(_, { region ,context}) {
            console.log('---> Fetching SecurityGroups')
            const ec2 = new AWS.EC2({apiVersion: '2016-11-15'})

            console.log('---> setting AWS region')
            AWS.config.region = region || 'us-east-1'

            return new Promise((resolve, reject) => {
                ec2.describeSecurityGroups({}, (err, data) => {
                    if (err) reject(err)
                    resolve(data.SecurityGroups)
                })
            })
        },
        fetchSubnets(_, { region }, context) {
            console.log('---> Fetching Subnets')
            const ec2 = new AWS.EC2({apiVersion: '2016-11-15'})

            console.log('---> setting AWS region')
            AWS.config.region = region || 'us-east-1'

            return new Promise((resolve, reject) => {
                ec2.describeSubnets({}, (err, data) => {
                    if (err) reject(err)
                    resolve(data.Subnets)
                })
            })
        },
        fetchVolumes(_, { region }, context) {
            console.log('---> Fetching Volumes')
            const ec2 = new AWS.EC2({apiVersion: '2016-11-15'})

            console.log('---> setting AWS region')
            AWS.config.region = region || 'us-east-1'

            return new Promise((resolve, reject) => {
                ec2.describeVolumes({}, (err, data) => {
                    if (err) reject(err)
                    resolve(data.Volumes)
                })
            })
        },
        fetchVpcs(_, { region }, context) {
            console.log('---> Fetching Vpcs')
            const ec2 = new AWS.EC2({apiVersion: '2016-11-15'})

            console.log('---> setting AWS region')
            AWS.config.region = region || 'us-east-1'

            return new Promise((resolve, reject) => {
                ec2.describeVpcs({}, (err, data) => {
                    if (err) reject(err)
                    resolve(data.Vpcs)
                })
            })
        },
        deploymentStatus(_, { deployment }, context) {

            console.log('---> Describing Deployment')

            let cloudformation = new AWS.CloudFormation({apiVersion: '2010-05-15'})

            return new Promise((resolve, reject) => {
                Account.findOne({name: deployment.accountName}, (err, account) => {
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
                                    let _status = find(data.StackEvents, {ResourceStatus: 'ROLLBACK_IN_PROGRESS'})
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
        deploymentsByLandscapeId(_, { landscapeId }, context) {
            return new Promise((resolve, reject) => {
                return Deployment.find({landscapeId: landscapeId}).exec((err, deployments) => {
                    if (err) return reject(err)
                    return resolve(deployments)
                })
            });
        },
        createDeployment(_, { deployment }, context) {

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

                cloudFormation = new AWS.CloudFormation({apiVersion: '2010-05-15'})
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
                                stackParams.Tags.push({Key: 'Description', Value: newDeployment.description})
                            }
                            if (newDeployment.billingCode) {
                                stackParams.Tags.push({Key: 'Billing Code', Value: newDeployment.billingCode})
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
        deleteDeployment(_, { deployment }, context) {

            console.log(deployment)

            if (deployment.isDeleted) {
                console.log(' ---> purging deployment')

                return Deployment.remove({stackName: deployment.stackName}, (err, result) => {
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
                    Account.findOne({name: deployment.accountName}, (err, account) => {
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
                        return Deployment.findOneAndUpdate({stackName: deployment.stackName},
                            {$set: {isDeleted: true}}, {new: true}, (err, doc) => {
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
