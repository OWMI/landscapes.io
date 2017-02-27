import cx from 'classnames'
import axios from 'axios'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'react-flexbox-grid'
import { Checkbox, Paper, RaisedButton, Step, Stepper, StepLabel, TextField } from 'material-ui'

import './login.style.scss'
import { auth } from '../../services/auth'
import { ErrorAlert } from '../../components'

class Login extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showError: false,
        stepIndex: 0
    }

    componentWillMount() {
        const self = this
        // HACK: encode/decode oauth user until Chrome 57 is released with preflight issue fix
        setTimeout(function () {
            if (window.location.search.indexOf('oauth=') > -1) {
                self.handleOAuthLogin(
                    JSON.parse(decodeURIComponent(window.location.search.split('oauth=')[1]))
                )
            }
        }, 1000)
    }

    componentDidMount() {
        const { enterLogin } = this.props
        enterLogin()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveLogin } = this.props
        leaveLogin()
    }

    render() {
        const self = this
        const { animated, viewEntersAnim, showError, stepIndex } = this.state
        const { configuration, loading } = this.props


        function renderLoginPane() {
            return (
                <Paper zDepth={1} rounded={false}>
                    <TextField id='username' ref='username' floatingLabelText='Username' fullWidth={true}/>
                    <TextField id='password' ref='password' floatingLabelText='Password' fullWidth={true} type='password'/>

                    {/* <Checkbox label='Remember Me' onCheck={this.handlesPasswordCookie}
                        style={{ margin: '20px 0px' }} labelStyle={{ fontFamily: 'Nunito, sans-serif', width: 'none' }}/> */}

                    <RaisedButton label='Login' fullWidth={true} type='primary' onClick={ stepIndex === 1 ? self.handlesAdminToggle : self.handlesOnLogin }
                        labelStyle={{ fontFamily: 'Nunito, sans-serif', textTransform: 'none' }}/>
                </Paper>
            )
        }


        return (
            <Row center='xs' middle='xs' className={cx({ 'screen-height': true, 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                <Col xs={6} lg={4} className={cx( { 'login-page': true } )}>

                    {
                        AUTH_STRATEGY && AUTH_STRATEGY === 'google'
                        ?
                            configuration && configuration.length && configuration[0].isFirstUser
                            ?
                                <div>
                                    <Stepper activeStep={stepIndex}>
                                        <Step>
                                            <StepLabel>Link admin to OAuth Account</StepLabel>
                                        </Step>
                                        <Step>
                                            <StepLabel>Login with Admin Credentials</StepLabel>
                                        </Step>
                                    </Stepper>
                                    {
                                        stepIndex === 0
                                        ?
                                            // <RaisedButton label='Login with Google OAuth' fullWidth={false} type='primary'
                                            //     onClick={self.handleOAuthLogin} labelStyle={{ fontFamily: 'Nunito, sans-serif', textTransform: 'none' }}/>
                                            <a href="http://localhost:8080/api/auth/google">
                                                <RaisedButton label='Login with Google OAuth' fullWidth={false} type='primary'
                                                    labelStyle={{ fontFamily: 'Nunito, sans-serif', textTransform: 'none' }}/>
                                            </a>
                                        :
                                            renderLoginPane()
                                    }
                                </div>
                            :
                                <a href="http://localhost:8080/api/auth/google">
                                    <RaisedButton label='Login with Google OAuth' fullWidth={false} type='primary'
                                        labelStyle={{ fontFamily: 'Nunito, sans-serif', textTransform: 'none' }}/>
                                </a>
                        :
                            renderLoginPane()

                    }

                    {
                      showError
                      ?
                        <p style={{ color:'red', padding: '20px' }}>Incorrect Username/Password combination</p>
                      :
                        null
                    }

                </Col>
            </Row>
        )
    }

    // TODO: Add remember capability
    handlesPasswordCookie = event => {
        event.preventDefault()
        // should add some validator before setState in real use cases
        this.setState({ password: event.target.value })
    }

    handlesAdminToggle = () => {
        const { configuration, toggleFirstUser } = this.props
        const { router } = this.context

        toggleFirstUser({
            variables: { configId: configuration[0]._id }
        })

        router.push({ pathname: '/landscapes' })
    }

    handleOAuthLogin = authData => {

        const { accounts, configuration, groups, loginUser, refetchGroups, toggleFirstUser } = this.props
        const { router } = this.context

        // user login & auth token generation
        // this.setState({ showError: false })
        // axios({
        //     url: `${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/auth/google`,
        //     headers: { 'Access-Control-Allow-Origin': '*' }
        // }).then(res => {
        //     console.log('%c RESPONSE ', 'background: #1c1c1c; color: limegreen', res)
        // }).catch(err => console.log(err))

        let userWithPermissions = auth.setUserPermissions(authData, groups, accounts)

        axios({
            method: 'post',
            url: `${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/generateToken`,
            data: userWithPermissions
        }).then(res => {
            return refetchGroups({}).then(groups => {
              const { user, token } = res.data
              loginUser(token, user, this.props.groups)

              return axios({
                  method: 'get',
                  url: `${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/verifyToken`,
                  headers: { 'x-access-token': token }
              })
            })
        }).then(res => {

            console.log('%c configuration ', 'background: #1c1c1c; color: limegreen', configuration)

            // toggle admin user at first login
            if (configuration && configuration.length && configuration[0].isFirstUser) {
                this.setState({ stepIndex: 1 })
            } else {
                router.push({ pathname: '/landscapes' })
            }

        }).catch(err =>{
            this.setState({ showError: true })
        })
    }

    handlesOnLogin = event => {

        event.preventDefault()

        const { accounts, configuration, groups, loginUser, refetchGroups, toggleFirstUser } = this.props
        const { router } = this.context
        let { username, password } = this.refs

        username = username.getValue()
        password = password.getValue()
        this.setState({ showError: false })

        // user login & auth token generation
        axios({
            method: 'post',
            url: `${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/auth/signin`,
            data: {
                username,
                password
            }
        }).then(res => {
            let userWithPermissions = auth.setUserPermissions(res.data, groups, accounts)
            return axios({
                method: 'post',
                url: `${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/generateToken`,
                data: userWithPermissions
            })
        }).then(res => {
            return refetchGroups({}).then(groups => {
                const { user, token } = res.data
                loginUser(token, user, groups)

                return axios({
                    method: 'get',
                    url: `${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/verifyToken`,
                    headers: { 'x-access-token': token }
                })
            })
        }).then(res => {
            router.push({ pathname: '/landscapes' })
        }).catch(err =>{
            this.setState({ showError: true })
        })
    }

    closeError = event => {
        event.preventDefault()
        const { resetError } = this.props
        resetError()
    }
}

Login.propTypes = {
    // views props:
    currentView: PropTypes.string.isRequired,
    enterLogin: PropTypes.func.isRequired,
    leaveLogin: PropTypes.func.isRequired,
    // apollo props:
    user: PropTypes.shape({
        username: PropTypes.string
    }),

    // auth props:
    userIsAuthenticated: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.object,

    // apollo actions
    loginUser: PropTypes.func.isRequired,

    // redux actions
    onUserLoggedIn: PropTypes.func.isRequired,
    resetError: PropTypes.func.isRequired
}

Login.contextTypes = {
    router: PropTypes.object
}

export default Login
