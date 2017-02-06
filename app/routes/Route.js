import React from 'react'
import { auth } from '../services/auth'
import { PageNotFound } from '../views'
import { ApolloProvider } from 'react-apollo'
import { syncHistoryWithStore } from 'react-router-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import DevTools from '../redux/devTools/DevTools.jsx'
import configureStore, { client } from '../redux/store/configureStore'

import {
    // app
    App,

    // non protected views
    ConnectedHome,
    ConnectedLogin,
    ConnectedRegister,
    ConnectedPasswordChange,
    ConnectedProfile,

    // protected views
    ConnectedProtected,

    ConnectedDeployments,
    ConnectedCreateDeployment,

    ConnectedUsers,
    ConnectedCreateUser,
    ConnectedEditUser,
    ConnectedUserDetails,

    ConnectedGroups,
    ConnectedCreateGroup,
    ConnectedEditGroup,
    ConnectedGroupDetails,

    ConnectedAccounts,
    ConnectedCreateAccount,
    ConnectedUpdateAccount,

    ConnectedLandscapes,
    ConnectedCreateLandscape,
    ConnectedEditLandscape,
    ConnectedLandscapeDetails

} from '../containers'

const store = configureStore()
const syncedHistory = syncHistoryWithStore(browserHistory, store)

export const Routes = () => {
    return (
        <ApolloProvider store={store} client={client}>
            <div>
                <Router history={syncedHistory}>
                    <Route path="/" component={App}>
                        {/* non protected views */}
                        <IndexRoute component={ConnectedLandscapes} onEnter={requireAuth}/>
                        {/* account views */}
                        <Route path="/accounts" component={ConnectedAccounts} onEnter={requireAuth}/>
                        <Route path="/accounts/create" component={ConnectedCreateAccount} onEnter={requireAuth}/>
                        <Route path="/accounts/update/:id" component={ConnectedUpdateAccount} onEnter={requireAuth}/>
                        {/* landscape views */}
                        <Route path="/landscapes" component={ConnectedLandscapes} onEnter={requireAuth}/>
                        <Route path="/landscape/:id" component={ConnectedLandscapeDetails} onEnter={requireAuth}/>
                        <Route path="/landscapes/create" component={ConnectedCreateLandscape} onEnter={requireAuth}/>
                        <Route path="/landscapes/edit/:id" component={ConnectedEditLandscape} onEnter={requireAuth}/>
                        {/* deployment views */}
                        <Route path="/:landscapeId/deployments" component={ConnectedDeployments} onEnter={requireAuth}/>
                        <Route path="/:landscapeId/deployments/create" component={ConnectedCreateDeployment} onEnter={requireAuth}/>
                        <Route path="/landscape/:landscapeId/deployments/create" component={ConnectedCreateDeployment} onEnter={requireAuth}/>
                        {/* user views */}
                        <Route path="/users" component={ConnectedUsers} onEnter={requireAuth}/>
                        <Route path="/users/create" component={ConnectedCreateUser} onEnter={requireAuth}/>
                        <Route path="/users/:id" component={ConnectedUserDetails} onEnter={requireAuth}/>
                        <Route path="/users/edit/:id" component={ConnectedEditUser} onEnter={requireAuth}/>
                        {/* group views */}
                        <Route name="groups" path="groups">
                          <IndexRoute component={ConnectedGroups} onEnter={requireAuth}/>
                          <Route path="create" component={ConnectedCreateGroup} onEnter={requireAuth}/>
                          <Route path="edit/:id" component={ConnectedEditGroup} onEnter={requireAuth}/>
                          <Route path=":id" component={ConnectedGroupDetails} onEnter={requireAuth}/>
                        </Route>
                        {/* misc views */}
                        <Route path="/login" component={ConnectedLogin}/>
                        <Route path="/profile" component={ConnectedProfile}/>
                        <Route path="/register" component={ConnectedRegister}/> {/* logout: just redirects to home (App will take care of removing the token) */}
                        <Route path="/logout" onEnter={logOutUser}/> {/* protected views */}
                        <Route path="/protected" component={ConnectedProtected} onEnter={requireAuth}/> {/* page not found */}
                        <Route path="/changePassword" component={ConnectedPasswordChange} onEnter={requireAuth}/> {/* page not found */}
                        <Route path="*" component={PageNotFound}/>
                    </Route>
                </Router>
                {process.env.NODE_ENV !== 'production'
                    ? <DevTools/>
                    : null}
            </div>
        </ApolloProvider>
    )
}

// authentication check to access protected routes
function requireAuth(nextState, replace) {

    const user = auth.getUserInfo()
        ? auth.getUserInfo()
        : null

    const isAuthenticated = (auth.getToken() && checkUserHasId(user))
        ? true
        : false

    if (!isAuthenticated) {
        replace({
            pathname: '/login',
            state: {
                nextPathname: nextState.location.pathname
            }
        })
    }
}

function logOutUser(nextState, replace) {
    auth.clearAllAppStorage()
    replace({
        pathname: '/login',
        state: {
            nextPathname: nextState.location.pathname
        }
    })
}

function checkUserHasId(user) {
    return user && user._id && (user._id.length > 0)
}
