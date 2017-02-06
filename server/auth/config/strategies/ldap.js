'use strict';

var passport = require('passport'),
  LdapStrategy = require('passport-ldapauth'),
  User = require('mongoose').model('User'),
  path = require('path'),
  config = require(path.resolve('./server/config/config'));

var loginSuccess = function (userLdap, done) {
  User.findOne({
    username: userLdap.uid
  }, function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {

            // dn: uid=test_admin_user,ou=users,dc=landscapes,dc=io
            // uid: test_admin_user
            // sn: User
            // givenName: Test Admin
            // displayName: Test Admin User
            // mail: test.admin.user@test.com
            // cn: Test Admin User
            // objectClass: inetOrgPerson
            // objectClass: top
            // userpassword: {MD5}X03MO1qnZdYdgyfeuILPmQ==
            //
            // TO DO: Map User values via UI and save to DB

      console.log('userLdap -->', userLdap)

      user = new User({
        firstName: userLdap.givenName,
        lastName: userLdap.sn,
        username: userLdap.uid,
        displayName: userLdap.displayName,
        email: userLdap.mail,
        provider: 'ldap',
        role: 'admin'
      });
      user.save(function (err) {
        return done(err, user);
      });
    } else {
      return done(err, user);
    }
  });
};

module.exports = function () {
  passport.use(new LdapStrategy({
    server: {
      url: config.ldap.url,
      bindDn: config.ldap.bindDn,
      bindCredentials: config.ldap.bindCredentials,
      searchBase: config.ldap.searchBase,
      searchFilter: config.ldap.searchFilter,
            // searchAttributes: config.ldap.searchAttributes
    },
    usernameField: 'username',
    passwordField: 'password'
  }, loginSuccess
    ));

  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {

    User.findOne({
      _id: id
    }).exec(function (err, user) {
      console.log('passport.deserializeUser:', user)
      done(err, user);
    });
  });
};
