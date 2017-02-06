import cx from 'classnames'
import axios from 'axios'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'react-flexbox-grid'
import { Paper, RaisedButton, Checkbox, TextField } from 'material-ui'

import './login.style.scss'
import { ErrorAlert } from '../../components'

class Login extends Component {

    state = {
        animated: true,
        viewEntersAnim: true
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
        const { animated, viewEntersAnim } = this.state
        const { loading } = this.props

        return (
            <Row center='xs' middle='xs' className={cx({ 'screen-height': true, 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                <Col xs={6} lg={4} className={cx( { 'login-page': true } )}>
                    <Paper zDepth={1} rounded={false}>

                        <TextField id='username' ref='username' floatingLabelText='Username' fullWidth={true}/>
                        <TextField id='password' ref='password' floatingLabelText='Password' fullWidth={true} type='password'/>

                        {/* <Checkbox label='Remember Me' onCheck={this.handlesPasswordCookie}
                            style={{ margin: '20px 0px' }} labelStyle={{ fontFamily: 'Nunito, sans-serif', width: 'none' }}/> */}

                        <RaisedButton label='Login' fullWidth={true} type='primary' onClick={this.handlesOnLogin}
                            labelStyle={{ fontFamily: 'Nunito, sans-serif', textTransform: 'none' }}/>
                    </Paper>
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

    handlesOnLogin = event => {
        event.preventDefault()
        const { loginUser } = this.props
        const { router } = this.context
        let { username, password } = this.refs

        username = username.getValue()
        password = password.getValue()

        axios({
            method: 'post',
            url: 'http://0.0.0.0:8080/api/auth/signin',
            data: {
                username: username,
                password: password
            }
        }).then(res => {
            loginUser(res.data)
            console.log('res data', res.data)
            // this.props.user = res.data
            router.push({ pathname: '/landscapes' })
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
    user: PropTypes.shape({username: PropTypes.string}),

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
