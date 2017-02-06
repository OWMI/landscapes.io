'use strict';
var winston = require('winston'),
  mongoose = require('mongoose'),
  async = require('async'),
  Group = mongoose.model('Group'),
  User = mongoose.model('User');

// GET /api/groups
exports.retrieve = function (req, res) {
  winston.info('GET /api/groups ---> retrieving Groups');

  return Group.find(function (err, groups) {
    if (err) {
      winston.log('error', err);
      return res.send(500, err);
    } else {
      winston.info(' ---> Groups retrieved: ' + groups.length);
      // async.eachSeries(groups, function(group, callback) {
      //   console.log('\t\t retrieving Users for Group "' + group.name + '"');
      //
      //   User.find({ groups: group._id },'-salt -password', function (err, users) {
      //     if (err) {
      //       callback(err);
      //     } else {
      //       console.log('\t\t Users retrieved for Group "' + group.name + '": ' + users.length);
      //       var userList = [];
      //       for(var count = 0; count < users.length; count++) {
      //         userList.push(users[count].userInfo);
      //       }
      //       group.users = userList;
      //     }
      //   });
      //   callback();
      //
      // }, function(err) {
      //   if (err) {
      //     winston.error(err);
      //     return res.send(500, err);
      // } else {
          return res.json(groups);
        // }
      // });
    }
  });
};


// GET /api/groups/<id>
exports.retrieveOne = function (req, res, next) {
  var groupId = req.params.id;


  Group.findById(groupId, function (err, group, callback) {
    if (err) {
      winston.log('error', err);
      return next(err);
    } else if (!group) {
      return res.send(404);
    } else {
      User.find({ groups: group._id }, '-salt -password', function (err, users) {
        if (err){
          callback(err);
          return;
        }

        var userList = [];
        for (var i = 0; i < users.length; i++) {
                    // userList.push(users[i].userInfo._id);
          userList.push(users[i]);
        }
        group.users = userList;
        res.json(group);
      });




    }
  });
};


// POST /api/groups
exports.create = function (req, res, next) {
  winston.info('POST /api/groups ---> creating Group');

  var data = req.body;
  var newGroup = new Group(data);
  newGroup.createdBy = req.user._id;
  newGroup.save(function(err) {
    if (err) {
      winston.log('error', err);
      return res.json(400, err);
    } else {
      return res.json(newGroup);
    }
  });
};


// PUT /api/groups/<id>
exports.update = function(req, res, next) {
  winston.info(' ---> updating Group');

  var groupId = req.params.id;
  var data = req.body;

  Group.findById(groupId, function (err, group) {
    if(err) {
      winston.log('error', err);
      return res.send(500, err);
    } else if (!group) {
      return res.send(404);
    } else {
      group.createdBy = req.user._id;
      group.name = data.name;
      group.description = data.description;
      group.permissions = data.permissions;
      group.landscapes = data.landscapes;

      group.save(function(err) {
        if (err) {
          winston.log('error', err);
          return res.send(400);
        }
        else {
          winston.info(' ---> Group updated: ' + groupId);
          return res.json(group);
        }
      });
    }
  });
};

// DELETE /api/groups/<id>
exports.delete = function (req, res, next) {
  winston.info(' ---> deleting Group');


  Group.findByIdAndRemove(req.params.id, function(err, docs){
    if (err) {
      winston.log('error', err);
      return res.json(400, err);
    } else {
      winston.info(' ---> Group deleted: ' + req.params.id);
      return res.send(200);
    }
  });
};
