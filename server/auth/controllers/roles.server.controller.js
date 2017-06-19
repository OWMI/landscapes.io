'use strict'

let winston = require('winston'),
    mongoose = require('mongoose'),
    async = require('async'),
    Role = mongoose.model('Role'),
    User = mongoose.model('User')

// GET /api/roles
exports.retrieve = (req, res) => {
    winston.info('GET /api/roles ---> retrieving Roles')

    return Role.find((err, roles) => {
        if (err) {
            winston.log('error --->', err)
            return res.send(500, err)
        } else {
            winston.info(' ---> Roles retrieved: ' + roles.length)

            async.eachSeries(roles, (role, callback) => {
                User.find({
                    role: role._id
                }, '-salt -password', (err, users) => {
                    if (err) {
                        callback(err)
                    } else {
                        let userList = []
                        for (let count = 0; count < users.length; count++) {
                            userList.push(users[count].userInfo)
                        }
                        role.users = userList
                    }
                })
                callback()

            }, err => {
                if (err) {
                    winston.log('Error --->', err)
                    return res.send(500, err)
                } else {
                    return res.json(role)
                }
            })
        }
    })
}

// GET /api/roles/<id>
exports.retrieveOne = (req, res) => {
    winston.info(' ---> retrieving Role')

    let user = req.user || undefined
    if (user === undefined) {
        return res.send(401)
    }

    let roleId = req.params.id
    if (roleId === undefined) {
        winston.warn(' ---> Role.id in request params is undefined')
        return res.send(404)
    }

    // Why async here - AH ?
    async.series([callback => {
            Role.findById(roleId, (err, role) => {
                if (err) {
                    callback(err)
                    return
                }
                if (!role) {
                    winston.info(' ---> Role not found: ' + roleId)
                    return res.send(404)
                }
                winston.info(' ---> Role found: ' + role.name)

                User.find({
                    role: role._id
                }, '-salt -password', (err, users) => {
                    if (err) {
                        callback(err)
                        return
                    }

                    let userList = []
                    for (let i = 0; i < users.length; i++) {
                        // userList.push(users[i].userInfo._id)
                        userList.push(users[i])
                    }
                    role.users = userList
                    callback(null, role)
                })
            })
        }
    ], (err, asyncSeriesData) => {
        if (err) {
            winston.log('Error --->', err)
            return res.send(500, err)
        }
        let role = asyncSeriesData[0]

        return res.send(200, role)
    })
}

// GET /api/roles/<id>/users
exports.retrieveUsers = (req, res, next) => {
    winston.info(' ---> retrieving Users for Role')
    let roleId = req.params.id

    let user = req.user || undefined
    if (user === undefined) {
        return res.send(401)
    }

    Role.findById(roleId, (err, role) => {
        if (err) {
            winston.log('Error --->', err)
            return next(err)
        }
        if (!role) {
            return res.send(404)
        }

        User.find({
            role: role.name
        }, (err, users) => {
            if (err) {
                winston.log('error', err)
                return res.send(500, err)
            } else {
                winston.info(' ---> Users retrieved for Role "' + role.name + '": ' + users.length)

                let userList = []
                for (let i = 0; i < users.length; i++) {
                    userList.push(users[i].userInfo)
                }

                return res.json(userList)
            }
        })
    })
}

// POST /api/roles
exports.create = (req, res, next) => {
    winston.info(' ---> creating Role')

    let user = req.user || undefined
    if (user === undefined) {
        return res.send(401)
    }

    let data = req.body

    let newRole = new Role(req.body)
    newRole.createdBy = user._id
    newRole.save(err => {
        if (err) {
            winston.log('error', err)
            return res.json(400, err)
        } else {
            return res.json(newRole)
        }
    })
}

// PUT /api/roles/<id>
exports.update = (req, res, next) => {
    winston.info(' ---> updating Role')

    let user = req.user || undefined
    if (user === undefined) {
        return res.send(401)
    }

    let roleId = req.params.id
    let data = req.body

    Role.findById(roleId, (err, role) => {
        if (err) {
            winston.log('error', err)
            return res.send(500, err)
        } else if (!role) {
            return res.send(404)
        } else {
            role.name = data.name
            role.description = data.description
            role.permissions = data.permissions
            role.createdBy = user._id

            role.save(err => {
                if (err) {
                    winston.log('error', err)
                    return res.send(400)
                } else {
                    winston.info(' ---> Role updated: ' + roleId)
                    return res.json(role)
                }
            })
        }
    })
}

// DELETE /api/roles/<id>
exports.delete = (req, res, next) => {
    winston.info(' ---> deleting Role')

    let user = req.user || undefined
    if (user === undefined) {
        return res.send(401)
    }

    Role.findByIdAndRemove(req.params.id, (err, docs) => {
        if (err) {
            winston.log('error', err)
            return res.json(400, err)
        } else {
            winston.info(' ---> Role deleted: ' + req.params.id)
            return res.send(200)
        }
    })
}

exports.me = (req, res) => {
    res.json(req.user || null)
}
