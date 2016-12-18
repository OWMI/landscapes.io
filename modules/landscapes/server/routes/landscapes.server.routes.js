'use strict';

/**
 * Module dependencies
 */
var landscapesPolicy = require('../policies/landscapes.server.policy'),
  landscapes = require('../controllers/landscapes.server.controller'),
  deployments = require('../controllers/deployments.server.controller'),
  globalTags = require('../controllers/globaltags.server.contoller'),
  cloudaccounts = require('../controllers/cloudaccounts.server.controller'),
  appSettings = require('../controllers/appSettings.server.controller'),
  Upload = require('../controllers/upload.server.controller');

module.exports = function (app) {
  // landscapes collection routes
  app.route('/api/landscapes').all(landscapesPolicy.isLoggedIn)
    .get(landscapes.list);

  app.route('/api/landscapes').all(landscapesPolicy.isCreateAllowed)
    .post(landscapes.create);

  // Single landscapes routes
  app.route('/api/landscapes/:landscapesId').all(landscapesPolicy.isReadAllowed)
    .get(landscapes.read);

  app.route('/api/landscapes/:landscapesId').all(landscapesPolicy.isUpdateAllowed)
    .put(landscapes.update);

  app.route('/api/landscapes/:landscapesId').all(landscapesPolicy.isDeleteAllowed)
    .delete(landscapes.delete);


  app.route('/api/landscapes/:landscapesId/deployments').all(landscapesPolicy.isReadAllowed)
    .get(deployments.retrieveByLandscapes);


  // Finish by binding the landscapes middleware
  app.param('landscapesId', landscapes.landscapesByID);

  var multer = require('multer')
  var upload = multer({ dest: 'uploads/' })

  // Upload routes
  app.post('/api/upload/image', upload.single('file'), landscapesPolicy.isCreateAllowed, Upload.postImage);
  app.post('/api/upload/template', upload.single('file'), landscapesPolicy.isCreateAllowed, Upload.postCloudFormationTemplate);

  // app.route('/api/upload/image').all(landscapesPolicy.isCreateAllowed)
  //   .post(Upload.postImage);
  // app.route('/api/upload/template').all(landscapesPolicy.isCreateAllowed)
  //   .post(Upload.postCloudFormationTemplate);


  // Deployment Routes
  app.route('/api/deployments').all(landscapesPolicy.isReadAllowed)
    .get(deployments.retrieve);

  app.route('/api/deployments').all(landscapesPolicy.isDeployAllowed)
    .post(deployments.create);

  app.route('/api/deployments/:id').all(landscapesPolicy.isDeployAllowed)
    .get(deployments.retrieveOne)
    .put(deployments.update);

  app.route('/api/deployments/:id').all(landscapesPolicy.isDeployAllowed)
    .put(deployments.update);

  app.route('/api/deployments/:stackName').all(landscapesPolicy.isDeployAllowed)
    .delete(deployments.purge);

  app.route('/api/deployments/:stackName/:region/:account').all(landscapesPolicy.isDeployAllowed)
    .delete(deployments.delete);

  app.route('/api/deployments/describe/:stackName/:region/:account').all(landscapesPolicy.isDeployAllowed)
    .get(deployments.describe);



  /*
  * Admin Routes
  */
  //Global tags routes
  app.route('/api/globaltags').all(landscapesPolicy.isAdminAllowed)
    .get(globalTags.retrieve)
    .post(globalTags.create);

  app.route('/api/globaltags/:id').all(landscapesPolicy.isAdminAllowed)
    .get(globalTags.retrieveOne)
    .put(globalTags.update)
    .delete(globalTags.delete);


  //Cloud Accounts routes
  app.route('/api/accounts').all(landscapesPolicy.isAdminAllowed)
    .get(cloudaccounts.retrieve)
    .post(cloudaccounts.create);

  app.route('/api/accounts/:id').all(landscapesPolicy.isAdminAllowed)
    .get(cloudaccounts.retrieveOne)
    .put(cloudaccounts.update)
    .delete(cloudaccounts.delete);

  // App Settings
  app.route('/api/appSettings/convertToYAML').all(landscapesPolicy.isReadAllowed)
    .post(appSettings.convertToYAML);

  app.route('/api/appSettings').all(landscapesPolicy.isAdminAllowed)
    .get(appSettings.retrieve);

  app.route('/api/appSettings/:id').all(landscapesPolicy.isAdminAllowed)
    .put(appSettings.update);

};
