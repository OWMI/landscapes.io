'use strict';

var winston = require('winston'),
  async = require('async'),
  fs = require('fs'),
  gm = require('gm'),
  YAML = require('yamljs'),
  imageMagick = gm.subClass({ imageMagick: true });


function readFileSync(path) {
  if (typeof window !== 'undefined') return null;
  return require('fs').readFileSync(path, 'utf-8');
}


function deleteFile(filePath, callback) {
  winston.info(' ---> deleting file');

  fs.unlink(filePath, function(err) {
    if (err) {
      callback(err);
    } else {
      winston.info('file deleted --> ' + filePath);
      callback(null);
    }
  });
}


function tryParseJSON(jsonString) {
  winston.info(' ---> validating JSON');
  try {
    var o = JSON.parse(jsonString);
    if (o && typeof o === 'object' && o !== null) {
      return o;
    }
  }
  catch (e) { }

  return false;
}

function tryParseYAML(yamlString) {
  winston.info(' ---> validating YAML');
  try {
    var o = YAML.parse(yamlString)
    if (o && typeof o === 'object' && o !== null) {
        console.log('YAML', o)
      return o;
    }
  }
  catch (e) { }

  return false;
}


exports.postCloudFormationTemplate = function (req, res) {
  winston.info('Uploading posted cloudFormationTemplate');

  var user = req.user || { name: 'anonymous' };

  if(!req.file) {
    return res.status(500).send('No Files Uploaded')
  }
  var f = req.file;

    // validate template
    // http://docs.aws.amazon.com/cli/latest/reference/cloudformation/validate-template.html

  var template = readFileSync(f.path);

  if (tryParseJSON(template)) {
    winston.info('JSON is valid: ' + f.path);
    deleteFile(f.path, function (err) {
      if (err) {
        winston.log('error', 'deleteFile Error: ' + err);
      }
      res.send(template);
    });
} else if (tryParseYAML(template)) {
  winston.info('YAML is valid: ' + f.path);
  deleteFile(f.path, function (err) {
    if (err) {
      winston.log('error', 'deleteFile Error: ' + err);
    }
    res.send(YAML.parse(template));
  });
} else {
    winston.log('error', 'invalid JSON: ' + f.path);
    deleteFile(f.path, function (err) {
      if (err) {
        winston.log('error', 'deleteFile Error: ' + err);
      }
      res.send(400, { msg: 'File \"' + f.name + '\"' + ' does not contain a valid AWS CloudFormation Template.' });
    });
  }
};


exports.postImage = function (req, res) {
  winston.info('Uploading image');

    //Move this to Policy
  var user = req.user;
  if(user === undefined) {
    return res.sendStatus(401);
  }
  if(!req.file){
    return res.status(500).send('No Files Uploaded');
  }
  var f = req.file;

  var mimetype = ['image/png','image/jpg','image/jpeg'];
  if(mimetype.indexOf(f.mimetype) === -1) {
    deleteFile(f.path, function(err) {
      if(err) { winston.log('error', err); }
      res.send(400, { msg: 'Images of type \"' + f.mimetype + '\"' + ' are not supported; use \"png\" or \"jpg\".' });
    });
  } else {
    var exec = require('child_process').exec;
    exec('convert -version', function (err) {
      if (err) {
        winston.log('error', err);
        deleteFile(f.path, function (err) {
          if (err) {
            winston.log('error', err);
          }
          var msg = 'Image processing error; ImageMagick was not found.';
          winston.log('error', msg);
          return res.send(500, msg);
        });
      } else {
        winston.info('---> ImageMagick found');
        imageMagick(f.path)
                    .resize(null, 128)
                    .write(f.path, function (err) {
                      if (err) {
                        winston.log('error', 'imageMagick Error: ' + err);

                        deleteFile(f.path, function (err) {
                          if (err) {
                            winston.log('error', 'deleteFile Error: ' + err);
                          }
                          res.send(400, err);
                        });
                      } else {
                        winston.info(' ---> image posted: ' + f.path);
                        res.json({ imageUri: f.path });
                      }
                    }
                );
      }
    });
  }
};
