**Tech Stack:**

- ReactJS
- Redux
- MongoDB / Mongoose
- Apollo Stack / Apollo-React
- GraphQL
- React-Redux
- Redux-devtools
- React-Router-Redux
- React-Router
- Font-Awesome
- animate.css
- Classnames (scss lib)
- React-Motion
- Webpack
- Babel 6+
- React-Shallow-Compare
- Whatwg-Fetch


## Usage

### Prerequisites

##### Node.js >= 6.5.1
##### Configure ports and database URL for mongoDB in ```/server/config/env/{ENVIRONMENT}.js```
##### (optional) [Redux DevTools Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)


### Install dependencies

```bash
$ npm install
```

### Run Development Mode

```bash
$ npm start
```

##### Note : redux-devtools shortcuts
- `ctrl+h`: to toggle devtools panel
- `ctrl+q`: to change devtools panel position


### Bundle Production Build

```bash
$ npm run build
$ npm run prod
```


## OAuth

landscapes.io can be configured to work with OAuth through the [passport-oauth2](https://github.com/jaredhanson/passport-oauth2) authentication strategy for [Passport](http://passportjs.org/).

### Google

[Google API Manager](https://console.developers.google.com/apis/credentials): Obtain Client ID and Client Secret and then set the authorized redirect URIs.

![](http://1.1m.yt/P81UFvm.png)

#### Set environment variables OR update config file

**Environment Variables Approach**
```
$ AUTH_STRATEGY=google GOOGLE_CLIENT_ID=id GOOGLE_CLIENT_SECRET=secret npm start

```

**Config File Approach**

Update the config file located at ```/server/config/env/default.js``` with **authStrategy** and **oauthCreds**
```javascript
authStrategy: 'google',
oauthCreds: {
    google: {
        clientID: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET'
    }
}
```

#### Seed Google OAuth with development data...
To seed OAuth with development data, add `MONGO_SEED=true` as environment variable
```
// development
$ MONGO_SEED=true npm start

// production
$ MONGO_SEED=true npm run prod
```

### GeoAxis

Obtain Client ID and Client Secret and redirect URIs from your GEOAxIS administrator

#### Set environment variables OR update config file

**Environment Variables Approach**
```
$ AUTH_STRATEGY=geoaxis GEOAXIS_CLIENT_ID=id GEOAXIS_CLIENT_SECRET=secret npm start

```

**Config File Approach**

Update the config file located at ```/server/config/env/default.js``` with **authStrategy** and **oauthCreds**
```javascript
authStrategy: 'geoaxis',
oauthCreds: {
    geoaxis: {
        clientID: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET'
    }
}
```

#### Seed GEOAxIS OAuth with development data...
To seed OAuth with development data, add `MONGO_SEED=true` as environment variable
```
// development
$ MONGO_SEED=true npm start

// production
$ MONGO_SEED=true npm run prod
```

## LDAP

**Launch development OpenLDAP and phpLDAPadmin servers...**
```
$ docker-compose -f docker-compose-ldap.yaml up
```

**Test connection to OpenLDAP...**
```
$ curl "ldap://localhost/dc=landscapes,dc=io" -u "cn=admin,dc=landscapes,dc=io"
Enter host password for user 'cn=admin,dc=landscapes,dc=io': password
```

**Seed OpenLDAP with development data...**
```
$ ldapmodify -a -f development.ldif -x -H ldap://localhost:389 -w password -D cn=admin,dc=landscapes,dc=io
$ ldapmodify -f development-set-roles.ldif -x -H ldap://localhost:389 -w password -D cn=admin,dc=landscapes,dc=io
```

**Change OpenLDAP password...**
```
$ ldappasswd -s n3wP@ssw0rd -W -D cn=admin,dc=landscapes,dc=io" -x "uid=test_admin_user,ou=people,dc=landscapes,dc=io"
```

**Launch landscapes.io**
```
$ AUTH_STRATEGY=ldap npm start
```
