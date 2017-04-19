import ApolloClient, { createNetworkInterface, addTypename } from 'apollo-client'
import {appConfig} from '../../config'
import { auth } from '../auth/'
// networkInterface:
// const networkInterface = createNetworkInterface(appConfig.apollo.networkInterface)
const networkInterface = createNetworkInterface({ uri: `${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/graphql`})

// when need token based authentication:
let user = auth.getToken()
console.log(user)
networkInterface.use([
    {
        applyMiddleware(req, next) {
            if (!req.options.headers) {
                req.options.headers = {}
            }
            console.log(user)
            if (user == null) {
                user = auth.getToken()

            }
            // get the authentication token from local storage if it exists
            req.options.headers.token = user

            next()
        }
    }
])

export var apolloClient = new ApolloClient({ networkInterface: networkInterface, queryTransformer: addTypename })
