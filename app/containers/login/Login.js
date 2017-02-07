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
const GroupQuery = gql `
    query getGroups {
        groups {
            _id,
            name,
            users {
              isAdmin,
              userId
            },
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
        refetch
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
        loginUser(user, groups) {

            // TODO: Add JWT capability
            ownProps.onUserLoggedIn('testToken', user, groups)
        }
    })
})

const composedRequest = compose(
    GroupsWithQuery,
    LoginWithMutation
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
