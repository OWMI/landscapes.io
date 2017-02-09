import axios from 'axios'
import moment from 'moment'
import React, { Component, PropTypes } from 'react'
import { NavigationBar, BackToTop } from '../../components'
import navigationModel from '../../models/navigation.json'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { auth } from '../../services/auth'
import * as viewsActions from '../../redux/modules/views'
import * as userAuthActions from '../../redux/modules/userAuth'

class App extends Component {

    state = {
        navModel: navigationModel
    }

    componentWillReceiveProps(nextProps) {

        const { user, userIsAuthenticated } = nextProps
        const { actions: { setUserLogout, receivedUserLoggedIn } } = this.props

        if (userIsAuthenticated && !user.permissions && !user.groups) {

            const token = auth.getToken()

            // extract expDate from token
            let expDate = JSON.parse(window.atob(token.split('.')[1])).exp

            if (moment().valueOf() > moment(expDate).valueOf()) {
                // valid token - fetch user
                // send token to backend and set user on state
                return axios({
                    method: 'get',
                    url: 'http://0.0.0.0:8080/api/verifyToken',
                    headers: { 'x-access-token': token }
                }).then(res => {
                    const user = res.data
                    receivedUserLoggedIn(token, user)
                }).catch(err => console.log(err))
                // return true
            } else {
                // expired token - log user out
                setUserLogout()
            }
        }
    }

    componentDidMount() {
        const { actions: { checkIfUserIsAuthenticated } } = this.props
        checkIfUserIsAuthenticated()
    }

    render() {
        const { navModel } = this.state
        const { children, user, userIsAuthenticated } = this.props

        return (
            <div id='appContainer'>
                <NavigationBar brand={navModel.brand} navModel={navModel} user={user} userIsAuthenticated={userIsAuthenticated}
                    handleLeftNavItemClick={this.handleLeftNavItemClick} handleRightNavItemClick={this.handleRightNavItemClick}/>
                <h1></h1>
                <div className='container-fluid'>
                    {children}
                </div>
                <BackToTop minScrollY={40} scrollTo={'appContainer'}/>
            </div>
        )
    }

    handleLeftNavItemClick = (event, viewName) => {
        if (viewName === 'logout') {
            const { actions: { setUserLogout } } = this.props
            setUserLogout()
        }
    }

    handleRightNavItemClick = (event, viewName) => {
        if (viewName === 'logout') {
            const { actions: { setUserLogout } } = this.props
            setUserLogout()
        }
    }
}

App.propTypes = {
    children: PropTypes.node,
    history: PropTypes.object,
    location: PropTypes.object,
    actions: PropTypes.object,

    user: PropTypes.object,
    userIsAuthenticated: PropTypes.bool.isRequired
}

const mapStateToProps = state => {
    return {
        user: state.userAuth,
        userIsAuthenticated: state.userAuth.isAuthenticated
    }
}

const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators({
            ...viewsActions,
            ...userAuthActions
        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
