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

**Update the config file**
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
// development
MONGO_SEED=true npm start

// production
MONGO_SEED=true npm run prod
```

##License

Copyright 2014 OpenWhere, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
