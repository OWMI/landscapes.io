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
  AppSettings = mongoose.model('AppSettings'),
  Group = mongoose.model('Group'),
  YAML = require('yamljs')


// GET /api/appSettings
exports.retrieve = function (req, res) {
  winston.info(' ---> retrieving AppSettings');

  var user = req.user || undefined;
  if(user === undefined) {
    return res.send(401);
  }

  AppSettings.find({})
        .populate('defaultAccount')
        .exec(function(err, data) {
          if (err) {
            winston.log('error', err);
            return res.send(500, err);
          } else {
            winston.info(' ---> AppSettings retrieved: ' + data.length);
            return res.json(data);
          }
        });
};


// POST /api/appSettings
exports.create = function (req, res, next) {
  winston.info(' ---> creating AppSettings');

  var user = req.user || undefined;
  if(user === undefined) {
    return res.send(401);
  }

  var data = req.body;
  console.log(data);

  var newAppSettings = new AppSettings(req.body);
  newAppSettings.createdBy = user._id;
  newAppSettings.save(function(err) {
    if (err) {
      winston.log('error', err);
      return res.json(400, err);
    } else {
      console.log(JSON.stringify(newAppSettings));
      return res.json(newAppSettings);
    }
  });
};

// POST /api/appSettings/convertToYAML
// Convert JSON to YAML
exports.convertToYAML = function(req, res) {
    winston.info('---> Converting JSON to YAML')
    res.send(YAML.stringify(JSON.parse(req.body.json), 4))
}

// PUT /api/groups/<id>
exports.update = function(req, res, next) {
  winston.info(' ---> updating Group');

  var user = req.user || undefined;
  if(user === undefined) {
    return res.send(401);
  }

  var groupId = req.params.id;
  var data = req.body;

  Group.findById(groupId, function (err, group) {
    if(err) {
      winston.log('error', err);
      return res.send(500, err);
    } else if (!group) {
      return res.send(404);
    } else {
      group.createdBy = user._id;
      group.name = data.name;
      group.description = data.description;
      group.users = data.users;
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

  var user = req.user || undefined;
  if(user === undefined) {
    return res.send(401);
  }

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
