import gql from 'graphql-tag'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { graphql, compose } from 'react-apollo'

import { Login } from '../../views'
import * as viewsActions from '../../redux/modules/views'
import * as userAuthActions from '../../redux/modules/userAuth'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

// queries:
const ConfigurationQuery = gql `
    query getConfiguration {
        configuration {
            _id,
            isFirstUser
        }
    }
 `

const ConfigurationWithQuery = graphql(ConfigurationQuery, {
    props: ({ data: { loading, configuration } }) => ({
        configuration,
        loading
    })
})

const LdapGroupQuery = gql `
    query getLdapGroups {
        ldapGroups {
            cn,
            roleOccupant
        }
    }
`

const LdapGroupsWithQuery = graphql(LdapGroupQuery, {
    props: ({ data: { loading, ldapGroups } }) => ({
        ldapGroups,
        loading
    })
})

const MappingsQuery = gql `
    query getMappings {
        mappings {
            _id,
            mappedGroups,
            landscapeGroup,
            landscapeGroupId,

        }
    }
`

const MappingsWithQuery = graphql(MappingsQuery, {
    props: ({ data: { loading, mappings, refetch } }) => ({
        mappings,
        loading,
        refetchMappings: refetch
    })
})

const GroupQuery = gql `
    query getGroups {
        groups {
            _id,
            name,
            users {
              isAdmin,
              userId
            },
            accounts,
            imageUri,
            description,
            landscapes,
            permissions
        }
    }
 `

const GroupsWithQuery = graphql(GroupQuery, {
    props: ({ data: { loading, groups, refetch } }) => ({
        groups,
        loading,
        refetchGroups: refetch
    })
})

// mutations:
const logUser = gql `
    mutation LoginUser($user: LoginInput!) {
        loginUser(user: $user) {
            username
            password
        }
    }
`

const LoginWithMutation = graphql(logUser, {
    name: 'logUserMutation',
    props: ({ ownProps, logUserMutation }) => ({
        loginUser(token, user, groups) {
            // TODO: Add JWT capability
            ownProps.onUserLoggedIn(token, user, groups)
        }
    })
})

const AccountsQuery = gql `
    query getAccounts {
        accounts {
            _id,
            name,
            region,
            createdAt,
            endpoint,
            caBundlePath,
            rejectUnauthorizedSsl,
            signatureBlock,
            isOtherRegion,
            accessKeyId,
            secretAccessKey
        }
    }
 `

const AccountsWithQuery = graphql(AccountsQuery, {
    props: ({ data: { loading, accounts } }) => ({
        accounts,
        loading
    })
})

const ToggleFirstUserMutation = gql `
    mutation toggleFirstUser($configId: String!) {
        toggleFirstUser(configId: $configId) {
            isFirstUser
        }
    }
`

const composedRequest = compose(
    GroupsWithQuery,
    AccountsWithQuery,
    LoginWithMutation,
    MappingsWithQuery,
    LdapGroupsWithQuery,
    ConfigurationWithQuery,
    graphql(ToggleFirstUserMutation, { name: 'toggleFirstUser' })
)(Login)

/* -----------------------------------------
  Redux
 ------------------------------------------*/

const mapStateToProps = state => {
    return {
        // views props:
        currentView: state.views.currentView,
        // user Auth props:
        userIsAuthenticated: state.userAuth.isAuthenticated,
        loading: state.userAuth.loading,
        // errors:
        error: state.userAuth.error
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        // views actions:
        enterLogin: viewsActions.enterLogin,
        leaveLogin: viewsActions.leaveLogin,

        // userAuth actions:
        onUserLoggedIn: userAuthActions.receivedUserLoggedIn,
        onUserLogError: userAuthActions.errorUserLoggedIn,
        setloading: userAuthActions.setLoadingStateForUserLogin,
        unsetloading: userAuthActions.unsetLoadingStateForUserLogin,
        resetError: userAuthActions.resetLogError
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(composedRequest)
