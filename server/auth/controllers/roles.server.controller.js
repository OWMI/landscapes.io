// Copyright 2014 OpenWhere, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
var winston = require('winston'),
  mongoose = require('mongoose'),
  async = require('async'),
  Role = mongoose.model('Role'),
  User = mongoose.model('User');

// GET /api/roles
exports.retrieve = function (req, res) {
  winston.info('GET /api/roles ---> retrieving Roles');

  return Role.find(function (err, roles) {
    if (err) {
      winston.error(err);
      return res.send(500, err);
    } else {
      winston.info(' ---> Roles retrieved: ' + roles.length);

      async.eachSeries(roles, function(role, callback) {
        console.log('> > retrieving Users for Role "' + role.name + '"');

        User.find({ role: role._id }, '-salt -password',function (err, users) {
          if (err) {
            callback(err);
          } else {
            console.log('> > > > Users retrieved for Role "' + role.name + '": ' + users.length);
            var userList = [];
            for(var count = 0; count < users.length; count++) {
              userList.push(users[count].userInfo);
            }
            role.users = userList;
          }
        });
        callback();

      }, function(err) {
        if (err) {
          winston.error(err);
          return res.send(500, err);
        } else {
          return res.json(role);
        }
      });
    }
  });
};


// GET /api/roles/<id>
exports.retrieveOne = function (req, res) {
  winston.info(' ---> retrieving Role');

  var user = req.user || undefined;
  if(user === undefined) {
    return res.send(401);
  }

  var roleId = req.params.id;
  if(roleId === undefined) {
    winston.warn(' ---> Role.id in request params is undefined');
    return res.send(404);
  }

    // Why async here - AH ?
  async.series([function (callback) {
    Role.findById(roleId, function (err, role) {
      if (err) {
        callback(err);
        return;
      }
      if (!role) {
        winston.info(' ---> Role not found: ' + roleId);
        return res.send(404);
      }
      winston.info(' ---> Role found: ' + role.name);

      User.find({ role: role._id }, '-salt -password', function (err, users) {
        if (err){
          callback(err);
          return;
        }

        var userList = [];
        for (var i = 0; i < users.length; i++) {
                       // userList.push(users[i].userInfo._id);
          userList.push(users[i]);
        }
        role.users = userList;
        callback(null, role);
      });
    });
  }],
        function (err, asyncSeriesData) {
          if (err) {
            winston.error(err);
            return res.send(500, err);
          }
          var role = asyncSeriesData[0];

          return res.send(200, role);
        }
    );
};


// GET /api/roles/<id>/users
exports.retrieveUsers = function (req, res, next) {
  winston.info(' ---> retrieving Users for Role');
  var roleId = req.params.id;

  var user = req.user || undefined;
  if(user === undefined) {
    return res.send(401);
  }

  Role.findById(roleId, function (err, role) {
    if (err) {
      winston.error(err);
      return next(err);
    }
    if (!role) {
      return res.send(404);
    }

    User.find({ role: role.name }, function (err, users) {
      if (err) {
        winston.log('error', err);
        return res.send(500, err);
      } else {
        winston.info(' ---> Users retrieved for Role "' + role.name + '": ' + users.length);

        var userList = [];
        for(var i = 0; i < users.length; i++) {
          userList.push(users[i].userInfo);
        }

        return res.json(userList);
      }
    });
  });
};


// POST /api/roles
exports.create = function (req, res, next) {
  winston.info(' ---> creating Role');

  var user = req.user || undefined;
  if(user === undefined) {
    return res.send(401);
  }

  var data = req.body;
  console.log(data);

  var newRole = new Role(req.body);
  newRole.createdBy = user._id;
  newRole.save(function(err) {
    if (err) {
      winston.log('error', err);
      return res.json(400, err);
    } else {
      console.log(JSON.stringify(newRole));
      return res.json(newRole);
    }
  });
};


// PUT /api/roles/<id>
exports.update = function(req, res, next) {
  winston.info(' ---> updating Role');

  var user = req.user || undefined;
  if(user === undefined) {
    return res.send(401);
  }

  var roleId = req.params.id;
  var data = req.body;

  Role.findById(roleId, function (err, role) {
    if(err) {
      winston.log('error', err);
      return res.send(500, err);
    } else if (!role) {
      return res.send(404);
    } else {
      role.name = data.name;
      role.description = data.description;
      role.permissions = data.permissions;
      role.createdBy = user._id;

      role.save(function(err) {
        if (err) {
          winston.log('error', err);
          return res.send(400);
        }
        else {
          winston.info(' ---> Role updated: ' + roleId);
          return res.json(role);
        }
      });
    }
  });
};


// DELETE /api/roles/<id>
exports.delete = function (req, res, next) {
  winston.info(' ---> deleting Role');

  var user = req.user || undefined;
  if(user === undefined) {
    return res.send(401);
  }

  Role.findByIdAndRemove(req.params.id, function(err, docs){
    if (err) {
      winston.log('error', err);
      return res.json(400, err);
    } else {
      winston.info(' ---> Role deleted: ' + req.params.id);
      return res.send(200);
    }
  });
};


exports.me = function(req, res) {
  res.json(req.user || null);
};
