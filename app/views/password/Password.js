import cx from 'classnames'
import { Loader } from '../../components'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import axios from 'axios'

import { Checkbox, RaisedButton} from 'material-ui'
import {GridList, GridTile} from 'material-ui/GridList';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import Snackbar from 'material-ui/Snackbar';

import {debounce} from 'lodash';

import Slider from 'material-ui/Slider';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import FlatButton from 'material-ui/FlatButton';
import defaultImage from '../../style/empty.png'
import defaultGroupImage from '../../style/empty-group.png'

import { auth } from '../../services/auth'


const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 500
  },
};

class Password extends Component {
    state = {
        animated: true,
        viewEntersAnim: true,

        oldPassword: '',
        newPassword: '',
        verifyPassword: '',

        verfiyPasswordError: false,
        buttonDisabled: true,
        passwordErrors: [],
        passwordSubmitError: false,

        successOpen: false,
        failOpen:false
    }

    componentDidMount() {
        const { enterPasswordChange } = this.props
        enterPasswordChange()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leavePasswordChange } = this.props
        leavePasswordChange()
    }

    render() {
        const form = {}
        const { animated, viewEntersAnim } = this.state
        const { loading } = this.props

        return (
          <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
              <h4>Change Password</h4><br/>
                <div style={styles.root}>
                  <Snackbar
                    open={this.state.successOpen}
                    message="Password Changed"
                    autoHideDuration={3000}
                    onRequestClose={this.handleRequestClose}
                  />
                  <Snackbar
                    open={this.state.failOpen}
                    message="Invalid Password."
                    autoHideDuration={3000}
                    onRequestClose={this.handleRequestClose}
                  />
                <Card style={{padding:20}}>
                <CardActions>

                <GridList
                  cols={1}
                  cellHeight='auto'
                  style={styles.gridList}
                >
                  {
                    this.state.passwordSubmitError
                      ?
                      <GridTile key='passwordSubmitError' style={{width:400, marginLeft: 50, textAlign: 'center'}}>
                          <h6 style={{color:'red'}}>Old password entered was invalid.</h6>
                      </GridTile>
                      :
                      <div></div>
                  }

                  <GridTile key='description' style={{width:400, marginLeft: 50, textAlign: 'center'}}>
                    <h6>The password must be at least 10 characters long, contain at least one uppercase letter, contain at least one number, and contain at least one special character.</h6>
                  </GridTile>
                  <GridTile key='oldPassword' style={{width:300, marginLeft: 115}}>
                      <TextField onChange={this.handlesOldPasswordChange} id="oldPassword" type='password' floatingLabelText='Old Password' />
                  </GridTile>
                    <GridTile key='newPassword' style={{width:300, marginLeft: 115}}>
                      <TextField onChange={this.handlesOnNewPasswordChange} id="newPassword" type='password' floatingLabelText='New Password' />
                  </GridTile>

                        <GridTile key='passwordErrors' style={{width:300, marginLeft: 115}}>
                          {
                            this.state.passwordErrors.map((error, index) =>{
                              return <p  key={index} style={{color: 'red'}}>{error}</p>
                            })
                          }
                        </GridTile>
                  <GridTile key='verifyPassword' style={{width:300, marginLeft: 115}}>
                      <TextField onChange={this.handlesOnVerifyPasswordChange} id="verifyPassword" type='password' floatingLabelText='Verify Password' />
                </GridTile>
                {
                  this.state.verfiyPasswordError
                    ?
                      <GridTile key='verifyPasswordError' style={{width:300, marginLeft: 115}}>
                        <p style={{color: 'red'}}>ERROR: Passwords do not match</p>
                      </GridTile>
                    :
                    <div></div>
                }
                  <GridTile style={{width:300, marginLeft: 150}} key='login-form-button'>
                      <RaisedButton primary={true} className='login-form-button' disabled={loading || this.state.buttonDisabled} onClick={this.handlesOnPasswordChange} label="Change Password" />
                  </GridTile>
                </GridList>
                </CardActions>

                </Card>
                </div>
          </div>
        )
    }

    handlesOldPasswordChange = event => {
        event.preventDefault()
        this.setState({ currentPassword: event.target.value, passwordSubmitError: false })
    }

    handlesOnNewPasswordChange = debounce(((event, value) => {
        this.setState({newPassword: value});
        this.checkPasswordStrength(value);
      }), 1000)

    handlesOnVerifyPasswordChange = debounce(((event, value) => {
      this.setState({verifyPassword: value});
      if(!this.jsonEqual(value, this.state.newPassword)){
        this.setState({verfiyPasswordError: true, buttonDisabled: true})
      }
      else{
        if(this.state.passwordErrors.length){
          this.setState({verfiyPasswordError: false, buttonDisabled: true})
        }
        else{
          this.setState({verfiyPasswordError: false, buttonDisabled: false})
        }
      }
    }), 1000)

    jsonEqual = (a,b) => {
      return JSON.stringify(a) === JSON.stringify(b);
    }

    checkPasswordStrength = (password) => {
        let passwordErrors = [];
        if (!password.match(".*[A-Z].*")){
          passwordErrors.push('Password must contain an uppercase letter.')
        };
        if (!password.match(".*[a-z].*")){
          passwordErrors.push('Password must contain a lowercase letter.')
        };
        if (!password.match(".*\\d.*")){
          passwordErrors.push('Password must contain a number.')
        };
        if (!password.match(".*[~!.......].*")){
          passwordErrors.push('Password must contain a special character.')
        };
        if (password.split('').length < 10){
          passwordErrors.push('Password must contain atleast 10 characters.')
        };

        if(passwordErrors.length){
          this.setState({passwordErrors});
          return false;
        }
        else{
          this.setState({passwordErrors});
          if(this.state.verifyPasswordError && this.state.verifyPassword){
            this.setState({buttonDisabled: false})
          }
          else if(!this.state.verifyPasswordError && this.state.verifyPassword){
            this.setState({buttonDisabled: true})
          }
          return true;
        }
      }

    handlesOnPasswordChange = event => {
        event.preventDefault()
        const { loginUser } = this.props
        const { currentPassword, newPassword, verifyPassword } = this.state
        const { router } = this.context
        const user = auth.getUserInfo()
            ? auth.getUserInfo()
            : null

        axios({
            method: 'post',
            url: `http://${SERVER_IP}:${SERVER_PORT}/api/users/password`,
            data: {
                passwordDetails:{
                  currentPassword: currentPassword,
                  newPassword: newPassword,
                  verifyPassword: verifyPassword
                },
                user: user
            },

        }).then(res => {
          const { router } = this.context
            this.setState({ oldPassword: '' })
            this.setState({ newPassword: '' })
            this.setState({ verifyPassword: '' })
            router.push({ pathname: '/landscapes' })
        }).catch(err => {
            this.setState({ passwordSubmitError: true })
        })
    }
}


Password.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterPasswordChange: PropTypes.func.isRequired,
    leavePasswordChange: PropTypes.func.isRequired
}
Password.contextTypes = {
    router: PropTypes.object
}


export default Password
