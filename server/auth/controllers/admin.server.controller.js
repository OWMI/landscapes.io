'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./server/auth/controllers/errors.server.controller'));

/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 *   Role Helpers
 */
exports.addRole = function (req, res) {
  var user = req.model;
  if (req.body.roleId) {
    //user.role =[]; // TODO fix null first
    user.role = req.body.roleId;
  }
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });

};

exports.removeRole = function (req, res) {
  var user = req.model;
  if (req.params.roleId) {
    //user.role =[]; // TODO fix null first
    user.role = 'user';
  }
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });

};


/**
 *   Group Helpers
 */
exports.addGroup = function (req, res) {
  var user = req.model;
  if (req.body.groupId) {
    user.groups.push(req.body.groupId);
  }
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

exports.removeGroup = function (req, res) {
  var user = req.model;
  if (req.params.groupId) {
    user.groups.pop(req.params.groupId);
  }
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;

  // For security purposes only merge these parameters
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.displayName = user.firstName + ' ' + user.lastName;
  user.role = req.body.role;
  // user.email = req.body.email;

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;

  user.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
  User.find({}, '-salt -password -providerData').sort('-created')
    .populate('user', 'displayName')
    // .populate('role', 'name description permissions')
    // .populate('groups', 'name description permissions landscapes')
    .exec(function (err, users) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      res.json(users);
    });
};

/**
 * User save
 */
exports.save = function (req, res) {

  // Init user and add missing fields
  var user = new User(req.body);

  //logic to save one role as convience - may move out
  if (req.body.role) {
    user.role = req.body.role;
  }
  user.provider = 'local';

  // Then save the user
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      res.json(user);
    }
  });
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findById(id, '-salt -password')
    .populate('user', 'displayName')
    // .populate('role', 'name description permissions')
    // .populate('groups', 'name description permissions landscapes')
    .exec(function (err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        return next(new Error('Failed to load user ' + id));
      }

      req.model = user;
      next();
    });
};
