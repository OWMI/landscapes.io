import ApolloClient, { createNetworkInterface, addTypename } from 'apollo-client'
import {appConfig} from '../../config'
import { auth } from '../auth/'
// networkInterface:
// const networkInterface = createNetworkInterface(appConfig.apollo.networkInterface)
const networkInterface = createNetworkInterface({ uri: `${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/graphql`})

// when need token based authentication:
let user = auth.getToken()
networkInterface.use([
    {
        applyMiddleware(req, next) {
            if (!req.options.headers) {
                req.options.headers = {}
            }
            // get the authentication token from local storage if it exists
            req.options.headers.token = user
            next()
        }
    }
])

export const apolloClient = new ApolloClient({ networkInterface: networkInterface, queryTransformer: addTypename })
