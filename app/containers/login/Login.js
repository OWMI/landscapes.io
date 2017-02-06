import gql from 'graphql-tag'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'

import { Login } from '../../views'
import * as viewsActions from '../../redux/modules/views'
import * as userAuthActions from '../../redux/modules/userAuth'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

const logUser = gql `
    mutation LoginUser($user: LoginInput!) {
        loginUser(user: $user) {
            username
            password
        }
    }
`

// 1- add queries:

// 2- add mutation "logUser":
const LoginWithMutation = graphql(logUser, {
    name: 'logUserMutation',
    props: ({ ownProps, logUserMutation }) => ({
        loginUser(user) {

            // TODO: Add JWT capability
            ownProps.onUserLoggedIn('testToken', user)
        }
    })
})(Login)

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

export default connect(mapStateToProps, mapDispatchToProps)(LoginWithMutation)
