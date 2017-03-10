'use strict'

let path            = require('path')
let mongoose        = require('mongoose')
let passport        = require('passport')
let winston         = require('winston')
let User            = mongoose.model('User')
let crypto          = require('crypto')
let config          = require(path.resolve('./server/config/config'))
let errorHandler    = require(path.resolve('./server/auth/controllers/errors.server.controller'))
var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));
var fsp = require("fs-plus");

// URLs for which user can't be redirected on signin
let noReturnUrls = ['/authentication/signin', '/authentication/signup']
var Git = require("nodegit");
var YAML = require('yamljs');
const secureRandom = require('secure-random')
const fs = require('fs')
const chalk = require('chalk')
const _algorithm = 'aes-128-cbc'
const _keyLengthInBytes = 16
const _ivLengthInBytes = 16

let _writeAccountKeyFile = filePath => {
    return new Promise((resolve, reject) => {
        try {
            let key = secureRandom.randomBuffer(_keyLengthInBytes)
            let iv = secureRandom.randomBuffer(_ivLengthInBytes)
            let data = `{ "key": "${key.toString('hex')}", "iv": "${iv.toString('hex')}", "createdAt": "${new Date().toISOString()}" }`
            fs.writeFileSync(filePath, data)
            console.log(chalk.blue('+ Crypto: Generated account key file at', filePath.toString(), '\n'))
            resolve()
        } catch (err) {
            reject(err)
        }
    })
}

let getAccountKeyFile = () => {
    return new Promise((resolve, reject) => {
        let filePath = path.resolve('./config/accountKeyFile.json')

        if (!fs.existsSync(filePath)) {
            console.log(chalk.blue('+ Crypto: Account key file not found.\n'))
            _writeAccountKeyFile(filePath).then(() => {
                fs.readFile(filePath, {
                    encoding: 'utf-8'
                }, (err, data) => {
                    if (err)
                        reject(err)
                    else
                        resolve(JSON.parse(data))
                })
            }).catch((err) => winston.log('error', err))
        } else {
            fs.readFile(filePath, {
                encoding: 'utf-8'
            }, (err, data) => {
                if (err)
                    reject(err)
                else
                    resolve(JSON.parse(data))
            })
        }
    })
}

let _iv
let _key

getAccountKeyFile().then(json => {
    _key = new Buffer(json.key, 'hex')
    _iv = new Buffer(json.iv, 'hex')
}).catch((err) => winston.log('error', err))

let encrypt = text => {
    console.log('## ENCRYPT SECRET ACCESS KEY ##')

    if (text === null || typeof text === 'undefined')
        return text

    try {
        let cipher = crypto.createCipheriv(_algorithm, _key, _iv)
        let encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
        return encrypted
    } catch (err) {
        winston.log('error', 'account.encrypt: ' + err)
    }
}

let decrypt = encryptedText => {
    console.log('## DECRYPT SECRET ACCESS KEY ##')

    if (encryptedText === null || typeof encryptedText === 'undefined')
        return encryptedText

    try {
        let decipher = crypto.createDecipheriv(_algorithm, _key, _iv)
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8')
        return decrypted
    } catch (err) {
        winston.log('error', 'account.decrypt: ' + err)
    }
}

exports.getPublicKey = (req, res) => {
  console.log('home === ', fsp.getHomeDirectory())
  var request = req;
  var fileDirectory = '.ssh'
  var fileName = 'id_rsa.pub'
  return new Promise((resolve, reject) => {
    fse.readFile(path.join(fsp.getHomeDirectory(), fileDirectory, fileName), 'utf8', function (err,data) {
      if (err) {
          return resolve(res.json({ message:  'Failed', location: path.join(fsp.getHomeDirectory(), fileDirectory, fileName) }))
      }
      return resolve(res.json(data))
    })
  })
}

exports.getGithubRepo = (req, res) => {
    /* Pulls repo and sends location of files on local system */
    var request = req.body;
    console.log('request ------- ', request)
    request.password = decrypt(request.password)
    var username = request['username'];
    var password = request['password']
    var nativeObject = {files:[], location:  path.join('./_github/', request.deployFolderName)};
    var remoteRepo = request.repoURL;
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
    if(!password || !username){
      console.log('refresh')
      fse.readdir( path.join('./_github/', request.deployFolderName), (err, files) => {
          nativeObject['files'] = files
          return res.json(nativeObject)
      })
    }
    else{
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
          nativeObject={ path: location, items: object, rawData: data }
          resolve(nativeObject)
        });
      })
  })
  Promise.all(_promises).then(_objects => {
    return res.json(_objects)
  })
}
exports.stringifyYAML = (req, res) => {
  var request = req.body
  var nativeObject = {}
  var yamlString = ''
  let _promises = request.map((file, index) => {
      return new Promise((resolve, reject) => {
        yamlString = YAML.stringify(file.items, 4);
        return resolve({
          yaml:yamlString,
          path: file.path
        })
      })
  })
  Promise.all(_promises).then(_objects => {
    return res.json(_objects)
  })
}

exports.addAndCommitGithub = (req, res) => {
      /* TODO: Does not work yet */
      var request = req.body.repoData;
      var githubData = req.body.githubData;
      // var signature = Git.Signature.create("wowcroudsvc", "", Date.now(), 60);
      var signature;
      var filepath;
      var repoPath = '_github/managedVPC'

      var opts = {
        remoteCallbacks: {
          callbacks: {
            certificateCheck: function() {
                return 1;
            },
            credentials: function () {
              return Git.Cred.userpassPlaintextNew(githubData.username, githubData.password);
            }
          }
        },
        fetchOpts: {
          callbacks: {
            credentials: function() {
              return Git.Cred.userpassPlaintextNew(githubData.username, githubData.password);
            },
            certificateCheck: function() {
              return 1;
            }
          }
        }
      }
      /* WRITE TO FILE */
      let _promises = request.map((file, index) => {
          return new Promise((resolve, reject) => {
                filepath = file.path
                fse.writeFile(file.path, file.yaml, function(err) {
                  if(err) {
                      return reject(err);
                  }
                  console.log('file written!')
                  return resolve(file);
                })
          })
      })
      Promise.all(_promises).then(_objects => {
        var repo;
        var remote;
        var signature;
        var parent_count;
        var parents;
        var headCommit;
        var index;
        var oid;
        var directoryName = "./";
        console.log('PATH -----', repoPath)
        Git.Repository.open(path.join('./', repoPath))
          .then(function(repoResult) {
            repo = repoResult;
            return fse.ensureDir(path.join(repo.workdir(), directoryName));
          })
          .then(function() {
            return repo.refreshIndex();
          })
          .then(function(indexResult) {
            index = indexResult;
          })
          .then(function() {
            // this file is in a subdirectory and can use a relative path
            return index.addAll();
          })
          .then(function() {
            // this will write both files to the index
            return index.write();
          })
          .then(function() {
            return index.writeTree();
          })
          .then(function(oidResult) {
            oid = oidResult;
            return Git.Reference.nameToId(repo, "HEAD");
          })
          .then(function(head) {
            return repo.getCommit(head);
          })
          .then(function(parent) {
            var author = Git.Signature.create("wowcroudsvc",
              "matthew.fincher@gmail.com", Date.now(), 60);
            return repo.createCommit("HEAD", author, author, "automation: add users", oid, [parent]);
          })
          .then(function() {
            Git.Remote.setPushurl(repo, "origin", githubData.repoURL);
            Git.Remote.setUrl(repo, "origin", githubData.repoURL);
            return repo.getRemote("origin")
            .then(function(remoteResult) {
              remote = remoteResult;

              // Create the push object for this remote
              return remote.push(
                ["refs/heads/master:refs/heads/master"],
                {
                  callbacks: {
                    certificateCheck: function() {
                      return 1;
                    },
                    credentials: function() {
                      return Git.Cred.userpassPlaintextNew(githubData.username, decrypt(githubData.password));
                    }
                  }
                },
                {
                  callbacks: {
                    certificateCheck: function() {
                      return 1;
                    },
                    credentials: function() {
                      return Git.Cred.userpassPlaintextNew(githubData.username, githubData.password);
                    }
                  }
                }
              ).then(function(number) {
                console.log('number', number)
              })
              .catch(function(error) {
                console.log('error', error)
              });
            });
          })
          .done(function() {
              console.log("Done! Pushing!!");
              return res.json(_objects)
          });
        })
      }
