'use strict'

let path            = require('path')
let mongoose        = require('mongoose')
let passport        = require('passport')
let winston         = require('winston')
let User            = mongoose.model('User')
let config          = require(path.resolve('./server/config/config'))
let errorHandler    = require(path.resolve('./server/auth/controllers/errors.server.controller'))
var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));

// URLs for which user can't be redirected on signin
let noReturnUrls = ['/authentication/signin', '/authentication/signup']
var Git = require("nodegit");
var YAML = require('yamljs');

exports.getGithubRepo = (req, res) => {
    /* Pulls repo and sends location of files on local system */

        var request = req.body;
        var username = 'wowcroudsvc';
        var password = "Mojo2013";
        // create tmp folder
        var nativeObject = {files:[], location:  path.join('./_github/', request.deployFolderName)};
        var remoteRepo = "https://github.com/" + request.repoOwner + "/" + request.repoName;
        console.log('Remote stash repo: %s', remoteRepo);
        console.log('Cloning into %s', path.join('./_github/', request.deployFolderName));
        var cloneOptions = {};
        console.log('Cloning snapshot repo');
        var getMostRecentCommit = function(repository) {
            return repository.getBranchCommit('master');
        };
        var getCommitMessage = function(commit) {
            nativeObject.commitMessage = commit.message();
            return commit.message();
        };
        var opts = {
          fetchOpts: {
            callbacks: {
              credentials: function() {
                return Git.Cred.userpassPlaintextNew(username, password);
              },
              certificateCheck: function() {
                return 1;
              }
            }
          }
        };

        fse.remove(path.join('./_github/', request.deployFolderName)).then(function() {
          Git.Clone(remoteRepo, path.join('./_github/', request.deployFolderName) , opts)
            .then(getMostRecentCommit, function() { console.log('error %o', arguments);})
            .then(function(commit) {
              return new Promise((resolve, reject) => {
                  fse.readdir( path.join('./_github/', request.deployFolderName), (err, files) => {
                      nativeObject['files'] = files
                      return resolve(nativeObject);
                  })
              })
            })
            .done(function(data) {
              console.log('Finished Cloning');
              return res.json(nativeObject)
            });
        });
}
exports.parseYAML = (req, res) => {
  console.log('parsing ------ ', req.body.locations)
  var total = req.body.locations.length;
  var nativeObject = {}
  let _promises = req.body.locations.map((location, index) => {
      return new Promise((resolve, reject) => {
        fse.readFile(location, 'utf8', function (err,data) {
          if (err) {
             return reject(err);
          }
          var object = YAML.parse(data);
          nativeObject={path: location, items: object}
          resolve(nativeObject)
        });
      })
  })
  Promise.all(_promises).then(_objects => {
    return res.json(_objects)
  })
}
exports.addAndCommitGithub = (req, res) => {
      /* TODO: Does not work yet */
        var repoOwner = "wowcroud";
        var repoName = "VPCPrivate";
        var username = 'wowcroudsvc';
        var password = "Mojo2013";
        // create tmp folder
        var deployFolderName = 'temp';
        var nativeObject = {};
        var json = {
          location: path.join('./_managedVPC/',deployFolderName)
        }
        var remoteRepo = "https://github.com/" + repoOwner + "/" + repoName;
        console.log('Remote stash repo: %s', remoteRepo);
        console.log('Cloning into %s', path.join('./_managedVPC/',deployFolderName));
        var cloneOptions = {};
        console.log('Cloning snapshot repo');

        var opts = {
          fetchOpts: {
            callbacks: {
              credentials: function() {
                return Git.Cred.userpassPlaintextNew(username, password);
              },
              certificateCheck: function() {
                return 1;
              }
            }
          }
        };

        var fileName = "newFile.txt";
        var fileContent = "hello world";

        var repository;
        var remote;

        var signature = Git.Signature.create("Foo bar",
          "foo@bar.com", 123456789, 60);

        // Create a new repository in a clean directory, and add our first file
        fse.remove(path.join('./_managedVPC/',deployFolderName))
        .then(function() {
          console.log('creating new')
          return fse.ensureDir(path.resolve( path.join('./_managedVPC/',deployFolderName)));
        })
        .then(function() {
          console.log('creating new in remoete')

          return Git.Repository.init(path.join('./_managedVPC/',deployFolderName), 0, {
        callbacks: {
          credentials: function(url, userName) {
            return Git.Cred.userpassPlaintextNew('wowcroudsvc', "Mojo2013");
          }
        }
      });
        })
        .then(function(repo) {
          repository = repo;
          console.log('creating repository')

          return fse.writeFile(path.join(repository.workdir(), fileName), fileContent);
        })

        // Load up the repository index and make our initial commit to HEAD
        .then(function() {
          console.log('refreshIndex refreshIndex')

          return repository.refreshIndex();
        })
        .then(function(index) {
          return index.addByPath(fileName)
            .then(function() {
              return index.write();
            })
            .then(function() {
              return index.writeTree();
            });
        })
        .then(function(oid) {
          return repository.createCommit("HEAD", signature, signature,
            "initial commit", oid, []);
        })

        // Add a new remote
        .then(function() {
          console.log('Made it to add route')
          return Git.Remote.create(repository, "origin",
          remoteRepo)
          .then(function(remoteResult) {
            remote = remoteResult;

            // Create the push object for this remote
            return remote.push(
              ["refs/heads/master:refs/heads/master"]
            );
          });
        }).done(function() {
          console.log("Done!");
        });
      }
