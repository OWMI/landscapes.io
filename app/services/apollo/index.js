import ApolloClient, { createNetworkInterface, addTypename } from 'apollo-client'
import {appConfig} from '../../config'
import { auth } from '../auth/'
// networkInterface:
// const networkInterface = createNetworkInterface(appConfig.apollo.networkInterface)
const networkInterface = createNetworkInterface({ uri: `${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/graphql`})

// when need token based authentication:
let user = auth.getToken()
let userInfo = auth.getUserInfo()
networkInterface.use([
    {
        applyMiddleware(req, next) {
            if (!req.options.headers) {
                req.options.headers = {}
            }
            const time = Math.floor(Date.now() / 1000);

            if (userInfo == null) {
                 userInfo = auth.getUserInfo();
            }
            if (user == null) {
                user = auth.getToken();

            } else if (time >= userInfo.expires) {
                user = auth.getToken();

            }

            if (!user)
            return
            // get the authentication token from local storage if it exists
            req.options.headers.token = user

            next()
        }
    }
])
networkInterface.useAfter([{
    applyAfterware({ response },next ) {
       response.clone().json().then(function(dat) {
           auth.setUserInfo(dat.userData)
           auth.setToken(dat.token)
       })
        next()

        }
    }
])

export const apolloClient = new ApolloClient({ networkInterface: networkInterface, queryTransformer: addTypename })
