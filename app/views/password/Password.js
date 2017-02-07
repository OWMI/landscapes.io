import cx from 'classnames'
import { Loader } from '../../components'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Dropzone from 'react-dropzone'

import { Checkbox, RaisedButton} from 'material-ui'
import {GridList, GridTile} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import IconButton from 'material-ui/IconButton';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import Snackbar from 'material-ui/Snackbar';
import UploadIcon from 'material-ui/svg-icons/file/file-upload'

import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';

import Slider from 'material-ui/Slider';
import {RadioButtonGroup, RadioButton} from 'material-ui/RadioButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import FlatButton from 'material-ui/FlatButton';
import { auth } from '../../services/auth'

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 500,
    justifyContent: 'center',
    overflowY: 'auto'
  },
};

class Password extends Component {
    state = {
        animated: true,
        viewEntersAnim: true,

        newPassword: '',
        verifyPassword: ''
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

                <Card style={{padding:20}}>
                  <CardActions>
                    <GridList cols={1} cellHeight='auto' style={styles.gridList}>
                        <GridTile key='oldPassword' style={{width:300, marginLeft: 115}}>
                          <TextField onChange={this.handlesOldPasswordChange} id="oldPassword" type='password' placeholder='Old Password' />
                        </GridTile>
                        <GridTile key='newPassword' style={{width:300, marginLeft: 115}}>
                          <TextField onChange={this.handlesOnNewPasswordChange} id="newPassword" type='password' placeholder='New Password' />
                        </GridTile>
                        <GridTile key='verifyPassword' style={{width:300, marginLeft: 115}}>
                          <TextField onChange={this.handlesOnVerifyPasswordChange} id="verifyPassword"  type='password' placeholder='Verify Password' />
                        </GridTile>
                        <GridTile key='createPassword' style={{width:300, marginLeft: 150}}>
                          <RaisedButton primary={true} onClick={this.handlesOnPasswordChange} label="Change Password" />
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
        console.log('oldPassword changed', event.target.value)
        // should add some validator before setState in real use cases
        this.setState({ currentPassword: event.target.value })
    }

    handlesOnNewPasswordChange = event => {
        event.preventDefault()
        console.log('newPassword changed', event.target.value)
        // should add some validator before setState in real use cases
        this.setState({ newPassword: event.target.value })
    }

    handlesOnVerifyPasswordChange = event => {
        event.preventDefault()
        console.log('verifyPassword changed', event.target.value)
        // should add some validator before setState in real use cases
        this.setState({ verifyPassword: event.target.value })
    }

    handlesOnPasswordChange = event => {
        event.preventDefault()
        const { loginUser } = this.props
        const { currentPassword, newPassword, verifyPassword } = this.state
        const { router } = this.context
        const user = auth.getUserInfo()
            ? auth.getUserInfo()
            : null

        console.log('user ', user)

        axios({
            method: 'post',
            url: 'http://0.0.0.0:8080/api/users/password',
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

            console.log('res --->', res)
            this.setState({ oldPassword: '' })
            this.setState({ newPassword: '' })
            this.setState({ verifyPassword: '' })
            router.push({ pathname: '/landscapes' })
        }).catch(err => {
            console.log('ERROR: ', err )
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
