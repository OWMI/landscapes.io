**Tech Stack:**

- ReactJS
- Redux
- MongoDB
- Mongoose
- Apollo
- Apollo-React
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


**Test Tools:**

- Mocha
- Chai (*+ dirty-chai*)
- enzyme
- Sinon
- nyc


## Usage

### Prerequisites

##### Node JS version required is `>=6.5.1`
##### Configure ports and database URL for mongoDB in `.env`
##### (optional) [Redux DevTools Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)


### Install dependencies

```bash
npm install
```

### Run Development Mode

```bash
npm start
```

##### Note : redux-devtools shortcuts
- `ctrl+h`: to toggle devtools panel
- `ctrl+q`: to change devtools panel position


### Bundle Development Build

```bash
npm run dev
```

### Bundle Production Build

```bash
npm run prod
```

### Run Tests

```bash
npm run test
```

### OAuth Integration

By default, landscapes.io is designed to work with OAuth through the [passport-oauth2](https://github.com/jaredhanson/passport-oauth2) authentication strategy for [Passport](http://passportjs.org/).

**Obtain Client ID/Secret from OAuth Provider & Update redirect URIs**

For Google, you can obtain Client ID/Secret and set the authorized redirect URIs from [Google API Manager](https://console.developers.google.com/apis/credentials):

![](http://1.1m.yt/P81UFvm.png)

**Set environment variables OR update the server config**

*** Approach #1 -
AUTH_STRATEGY=google GOOGLE_CLIENT_ID=CLIENT_ID_HERE.apps.googleusercontent.com GOOGLE_CLIENT_SECRET=CLIENT_SECRET_HERE npm start

AUTH_STRATEGY=geoaxis GEOAXIS_CLIENT_ID=CLIENT_ID_HERE GEOAXIS_CLIENT_SECRET=CLIENT_SECRET_HERE npm start

AUTH_STRATEGY=ldap npm start
docker-compose -f docker-compose-ldap-only.yml up

Updated the server configuration file located at ```/server/config/env/default.js``` with **authStrategy** and **oauthCreds**
```javascript
authStrategy: 'OAUTH_PROVIDER_NAME', // 'google', 'geoaxis'
oauthCreds: {
    google: {
        clientID: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET'
    },
    geoaxis: {
        clientID: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET'
    }
}
```

**Seed OAuth admin user**
```
// ldap
...todo

// development
MONGO_SEED=true npm start

// production
MONGO_SEED=true npm run prod
```
