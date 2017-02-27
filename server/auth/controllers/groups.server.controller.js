'use strict'
let winston = require('winston'),
    mongoose = require('mongoose'),
    async = require('async'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User')

// GET /api/groups
exports.retrieve = (req, res) => {
    winston.info('GET /api/groups ---> retrieving Groups')

    return Group.find((err, groups) => {
        if (err) {
            winston.log('error', err)
            return res.send(500, err)
        } else {
            winston.info(' ---> Groups retrieved: ' + groups.length)
            // async.eachSeries(groups, function(group, callback) {
            //   User.find({ groups: group._id },'-salt -password', function (err, users) {
            //     if (err) {
            //       callback(err)
            //     } else {
            //       let userList = []
            //       for(let count = 0 count < users.length count++) {
            //         userList.push(users[count].userInfo)
            //       }
            //       group.users = userList
            //     }
            //   })
            //   callback()
            //
            // }, function(err) {
            //   if (err) {
            //     winston.log('Error --->', err)
            //     return res.send(500, err)
            // } else {
            return res.json(groups)
            // }
            // })
        }
    })
}

// GET /api/groups/<id>
exports.retrieveOne = (req, res, next) => {
    let groupId = req.params.id

    Group.findById(groupId, (err, group, callback) => {
        if (err) {
            winston.log('error', err)
            return next(err)
        } else if (!group) {
            return res.send(404)
        } else {
            User.find({
                groups: group._id
            }, '-salt -password', (err, users) => {
                if (err) {
                    callback(err)
                    return
                }

                let userList = []
                for (let i = 0 i < users.length i++) {
                    // userList.push(users[i].userInfo._id)
                    userList.push(users[i])
                }
                group.users = userList
                res.json(group)
            })

        }
    })
}

// POST /api/groups
exports.create = (req, res, next) => {
    winston.info('POST /api/groups ---> creating Group')

    let data = req.body
    let newGroup = new Group(data)
    newGroup.createdBy = req.user._id
    newGroup.save(err => {
        if (err) {
            winston.log('error', err)
            return res.json(400, err)
        } else {
            return res.json(newGroup)
        }
    })
}

// PUT /api/groups/<id>
exports.update = (req, res, next) => {
    winston.info(' ---> updating Group')

    let groupId = req.params.id
    let data = req.body

    Group.findById(groupId, (err, group) => {
        if (err) {
            winston.log('error', err)
            return res.send(500, err)
        } else if (!group) {
            return res.send(404)
        } else {
            group.createdBy = req.user._id
            group.name = data.name
            group.description = data.description
            group.permissions = data.permissions
            group.landscapes = data.landscapes

            group.save(err => {
                if (err) {
                    winston.log('error', err)
                    return res.send(400)
                } else {
                    winston.info(' ---> Group updated: ' + groupId)
                    return res.json(group)
                }
            })
        }
    })
}

// DELETE /api/groups/<id>
exports.delete = (req, res, next) => {
    winston.info(' ---> deleting Group')

    Group.findByIdAndRemove(req.params.id, (err, docs) => {
        if (err) {
            winston.log('error', err)
            return res.json(400, err)
        } else {
            winston.info(' ---> Group deleted: ' + req.params.id)
            return res.send(200)
        }
    })
}
