import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Dropzone from 'react-dropzone'
import { Row, Col } from 'react-flexbox-grid'
import axios from 'axios'
import AvatarCropper from "react-avatar-cropper"
import { debounce } from 'lodash'

import { Checkbox, RaisedButton, Snackbar, Card, TextField, RadioButtonGroup, RadioButton } from 'material-ui'
import defaultUserImage from '../../style/empty.png'
import materialTheme from '../../style/custom-theme.js'
import { Loader } from '../../components'

const styles = {
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    },
    gridList: {
        width: 500,
        overflowY: 'auto'
    }
}

class CreateUser extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        indeterminate: true,
        successOpen: false,
        failOpen: false,

        checkAll: false,
        permissionC: false,
        permissionU: false,
        permissionD: false,
        permissionX: false,

        fixedHeader: true,
        fixedFooter: true,
        stripedRows: true,
        showRowHover: true,
        selectable: true,
        multiSelectable: true,
        enableSelectAll: true,
        deselectOnClickaway: true,
        showCheckboxes: true,
        height: '300px',
        errorMessage: false,
        message: '',
        passwordErrors: [],
        passwordSubmitError: false,
        managedVPC: false,
        repoData: false
    }

    componentDidMount() {
        const { enterUsers } = this.props
        enterUsers()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }
    componentWillMount(){
      const { integrations, params } = this.props;
      var integration = {};
      if(integrations){
        integration = integrations.find(integration => { return integration.type === 'managedVPC' })
      }
      this.setState({integration})
    }
    componentWillReceiveProps(nextProps){
      const { integrations, params } = nextProps;
      var integration = {};
      if(integrations){
        integration = integrations.find(integration => { return integration.type === 'managedVPC' })
      }
      this.setState({integration})
    }

    componentWillUnmount() {
        const { leaveUsers } = this.props
        leaveUsers()
    }

    render() {

        let self = this
        const { animated, viewEntersAnim } = this.state
        const { loading, users, groups } = this.props

        const formItemLayout = {
            labelCol: {
                span: 8
            },
            wrapperCol: {
                span: 12
            }
        }

        if (loading) {
            return (
                <div className={cx({'animatedViews': animated, 'view-enter': viewEntersAnim})}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({'animatedViews': animated, 'view-enter': viewEntersAnim})}>
                <Snackbar open={this.state.successOpen} message="User successfully created." autoHideDuration={3000} onRequestClose={this.handleRequestClose}/>
                <Snackbar id ="error" open={this.state.failOpen} message="Error updating created" autoHideDuration={3000} onRequestClose={this.handleRequestClose}/>
                <Row middle='xs'>
                    <Col xs={4} style={{ textAlign: 'left' }}>
                        <h4>Create User</h4>
                    </Col>
                    <Col xs={8}>
                      <RaisedButton label='Cancel' onClick={
                          () => {const { router } = this.context
                          router.push({ pathname: '/users' })
                        }}
                        backgroundColor={materialTheme.palette.primary2Color}
                        style={{ float: 'right', margin: '30px 5px' }}
                        labelStyle={{ fontSize: '11px', color: 'white'}}/>
                      <RaisedButton id="saveButton" label='Save' onClick={this.handlesCreateClick} style={{ float: 'right', margin: '30px 5px' }} labelStyle={{ fontSize: '11px' }}/>
                    </Col>
                </Row>
                <div style={styles.root}>
                    <Card style={{ padding: 20, width: '100%' }}>
                        {
                            this.state.errorMessage
                            ?
                                <p id="errMessage" style={{ color: 'red', textAlign: 'center' }}>
                                    {this.state.message}
                                </p>
                            : null
                        }
                        {
                            this.state.passwordErrors.map((error, index) => {
                                return
                                    <p id="errMessage" key={index} style={{ color: 'red', textAlign: 'center' }}>{error}</p>
                            })
                        }

                        <Row style={{ width: '100%' }}>
                            <Col style={{ width: '50%' }}>
                                <Row>
                                    <TextField style={{ width: '100%' }} id="username" floatingLabelText="Username" value={this.state.username} onChange={this.handlesOnUsernameChange}/>
                                </Row>
                                <Row>
                                    <TextField style={{ width: '100%' }} id="email" floatingLabelText="Email" value={this.state.email} onChange={this.handlesOnEmailChange}/>
                                </Row>
                                <Row>
                                    <Col xs={6}>
                                        <TextField style={{ width: '100%' }} id="firstName" floatingLabelText="First Name" value={this.state.firstName} onChange={this.handlesOnFirstNameChange}/>
                                    </Col>
                                    <Col xs={6}>
                                        <TextField style={{ width: '100%' }} id="lastName" floatingLabelText="Last Name" value={this.state.lastName} onChange={this.handlesOnLastNameChange}/>
                                    </Col>
                                </Row>
                                <Row>
                                    <TextField style={{ width: '100%' }} id="newPassword" floatingLabelText="New Password" type="password" onChange={this.handlesOnNewPasswordChange}/>
                                </Row>
                                <Row>
                                    <TextField style={{ width: '100%' }} id="verifyPassword" floatingLabelText="Verify Password" type="password" onChange={this.handlesOnVerifyPasswordChange}/>
                                </Row>
                                <Row key='integration'>
                                  <div style={{
                                      borderBottom: '1px solid #E9E9E9',
                                      width: '100%'
                                  }}>
                                    <Col style={{marginTop:15, marginBottom: 15, marginLeft: 0}}>
                                      <Checkbox label="Managed VPC" onCheck={this.handlesOnManagedVPCChange} checked={this.state.managedVPC} className={cx( { 'two-field-row': true } )} style={{ textAlign: 'left', width:150}}/>
                                      {
                                        this.state.managedVPC
                                        ?
                                        <div>
                                          {
                                            this.state.showGettingPublicKey
                                            ?
                                            <p>Attempting to automatically retrieve public key...</p>
                                            :
                                            null
                                          }
                                          <div>
                                            {
                                              this.state.publicKey
                                              ?
                                              <TextField id="publicKey" value={this.state.publicKey} rows={1} rowsMax={4} multiLine={true} />
                                              :
                                              null
                                            }
                                          </div>
                                          <div>
                                            {
                                              this.state.publicKeyError
                                              ?
                                              <p>{this.state.publicKeyError}</p>
                                              :
                                              null
                                            }
                                          </div>
                                          <RaisedButton label="Retrieve Public Key" onClick={this.handlesPublic} />
                                        </div>
                                        :
                                        null
                                      }
                                    </Col>

                                  </div>
                                </Row>
                                <Row style={{ marginTop: 5 }}>
                                    <RadioButtonGroup style={{ maxWidth: 250 }} name="role" id="role" valueSelected={this.state.role} onChange={this.handleRoleChange}>
                                        <RadioButton value="admin" label="Global Admin" labelStyle={{ textAlign: 'left', marginLeft: 0, width: 100 }}/>
                                        <RadioButton value="user" label="User" labelStyle={{ textAlign: 'left', marginLeft: 0 }}/>
                                    </RadioButtonGroup>
                                </Row>
                            </Col>
                            <Col style={{ width: '50%' }}>
                                <Row style={{ justifyContent: 'space-around' }}>
                                    <Dropzone id='imageUri' onDrop={this.handlesImageUpload} multiple={false} accept='image/*' style={{ marginLeft: '10px', width: '180px', padding: '15px 0px' }}>
                                        <div className="avatar-photo">
                                            <div className="avatar-edit">
                                                <span>Click to Choose Image</span>
                                                <i className="fa fa-camera"></i>
                                            </div>
                                            <img src={this.state.croppedImg || this.state.imageUri || defaultUserImage}/>
                                        </div>
                                        {
                                            this.state.cropperOpen && <AvatarCropper onRequestHide={this.handleRequestHide} cropperOpen={this.state.cropperOpen} onCrop={this.handleCrop} image={this.state.img} width={400} height={400}/>
                                        }
                                    </Dropzone>
                                </Row>
                            </Col>
                        </Row>
                    </Card>
                </div>
            </div>
        )
    }

    getInitialState = () => {
        return {
            cropperOpen: false,
            img: null,
            croppedImg: defaultImage
        }
    }
    handlesPublic = () => {
      const { integration } = this.state
      var data = {}
      this.setState({showGettingPublicKey: true})
      this.setState({publicKeyError: false})
        axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/github/publicKey`, data).then(res => {
          if(res.data.message){
            this.setState({showGettingPublicKey: false, publicKeyError: "Failed to find public key at location: " + res.data.location + '.'})
          }
          else{
            this.setState({showGettingPublicKey: false, publicKey: res.data})
          }
        })
    }

    handleFileChange = (dataURI) => {
        this.setState({ img: dataURI, croppedImg: this.state.croppedImg, cropperOpen: true })
    }

    handleCrop = (dataURI) => {
        this.setState({ cropperOpen: false, img: null, croppedImg: dataURI })
    }

    handleRequestHide = () => {
        this.setState({ cropperOpen: false })
    }

    handleRequestDelete = () => {
        alert('You clicked the delete button.')
    }

    handleTouchTap = () => {
        alert('You clicked the Chip.')
    }

    handlesImageUpload = (acceptedFiles, rejectedFiles) => {
        let reader = new FileReader()

        reader.readAsDataURL(acceptedFiles[0])
        reader.onload = () => {
            this.setState({ imageUri: reader.result, img: reader.result, croppedImg: this.state.croppedImg, cropperOpen: true, imageFileName: acceptedFiles[0].name })
        }

        reader.onerror = error => {}
    }

    handlesUserClick = event => {
        const { router } = this.context
        router.push({ pathname: '/protected' })
    }

    handleRoleChange = event => {
        event.preventDefault()
        // should add some validator before setState in real use cases
        this.setState({ role: event.target.value })
    }

    handlesOnEmailChange = event => {
        event.preventDefault()
        // should add some validator before setState in real use cases
        this.setState({ email: event.target.value })
    }

    handlesOnNewPasswordChange = debounce(((event, value) => {
        this.setState({ newPassword: value })
        this.checkPasswordStrength(value)
    }), 1000)

    handlesOnVerifyPasswordChange = event => {
        event.preventDefault()
        // should add some validator before setState in real use cases
        this.setState({ verifyPassword: event.target.value })
    }
    handlesOnUsernameChange = event => {
        event.preventDefault()
        // should add some validator before setState in real use cases
        this.setState({ username: event.target.value })
    }
    handlesOnFirstNameChange = event => {
        event.preventDefault()
        // should add some validator before setState in real use cases
        this.setState({ firstName: event.target.value })
    }
    handlesOnLastNameChange = event => {
        event.preventDefault()
        // should add some validator before setState in real use cases
        this.setState({ lastName: event.target.value })
    }

    jsonEqual = (a, b) => {
        return JSON.stringify(a) === JSON.stringify(b)
    }
    handlesOnManagedVPCChange = event => {
        event.preventDefault()
        this.setState({managedVPC: !this.state.managedVPC})
    }

    checkPasswordStrength = (password) => {
        let passwordErrors = []
        if (!password.match(".*[A-Z].*")) {
            passwordErrors.push('Password must contain an uppercase letter.')
        }
        if (!password.match(".*[a-z].*")) {
            passwordErrors.push('Password must contain a lowercase letter.')
        }
        if (!password.match(".*\\d.*")) {
            passwordErrors.push('Password must contain a number.')
        }
        if (!password.match(".*[~!.......].*")) {
            passwordErrors.push('Password must contain a special character.')
        }
        if (password.split('').length < 10) {
            passwordErrors.push('Password must contain atleast 10 characters.')
        }
        if (passwordErrors.length) {
            this.setState({ passwordErrors })
            return false
        } else {
            this.setState({ passwordErrors })
            if (this.state.verifyPasswordError && this.state.verifyPassword) {
                this.setState({ buttonDisabled: false })
            } else if (!this.state.verifyPasswordError && this.state.verifyPassword) {
                this.setState({ buttonDisabled: true })
            }
            return true
        }
    }

    handlesCreateClick = event => {
        console.log(this.state.newPassword)
        console.log(this.state.verifyPassword)
        const { router } = this.context
        const { refetchUsers, users } = this.props
        let usernameFound = false
        let emailFound = false
        this.setState({loading: true})

        if (users && this.state.username) {
            usernameFound = users.find(user => { return user.username === this.state.username })
            emailFound = users.find(user => { return user.email === this.state.email })
        }

        this.setState({ errorMessage: false })
        if (!this.state.username) {
            this.setState({ errorMessage: true, message: 'Must provide username.' })
        } else if (!this.state.email) {
            this.setState({ errorMessage: true, message: 'Must provide email.' })
        } else if (!this.state.firstName || !this.state.lastName) {
            this.setState({ errorMessage: true, message: 'Must provide first and last name.' })
        } else if (usernameFound) {
            this.setState({ errorMessage: true, message: 'Username is already taken.' })
        } else if (emailFound) {
            this.setState({ errorMessage: true, message: 'Email is already taken.' })
        } else if (!this.state.email.match("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$")) {
            this.setState({ errorMessage: true, message: 'Email must be in correct format.' })
        } else if (!this.jsonEqual(this.state.verifyPassword, this.state.newPassword)) {
            //this.setState({ errorMessage: true, message: 'New password and verify password fields do not match.' })
        } else if (!this.checkPasswordStrength(this.state.verifyPassword)) {
            this.setState({ errorMessage: true, message: this.state.passwordErrors[0]})
        }
        else if( this.state.managedVPC && !this.state.publicKey){
          this.setState({ errorMessage: true, message: 'Public Key is required when Managed VPC is checked.' })
        }
        else {
            const { croppedImg, email, firstName, lastName, newPassword, role, username } = this.state

            event.preventDefault()

            let userToCreate = {
                username: username,
                email: email,
                role: role,
                password: newPassword,
                displayName: `${firstName} ${lastName}`,
                firstName: firstName,
                lastName: lastName,
                imageUri: croppedImg
            }
            console.log(userToCreate)
            if(this.state.publicKey){
              userToCreate.publicKey = this.state.publicKey
            }
            userToCreate.managedVPC = this.state.managedVPC || false
            var found = false;
            this.props.CreateUserMutation({
                variables: {
                    user: userToCreate
                }
            }).then(() => {
                this.props.refetchUsers({}).then(({data}) => {
                    this.setState({ successOpen: true })
                    this.setState({loading: false})
                    router.push({ pathname: '/users' })
                }).catch((error) => {})
            }).catch((error) => {
                this.setState({failOpen: true})
                this.setState({loading: false})
            })
          }
    }

    closeError = (event) => {
        event.preventDefault()
        const { resetError } = this.props
        resetError()
    }
}

CreateUser.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterUsers: PropTypes.func.isRequired,
    leaveUsers: PropTypes.func.isRequired,
    refetchUsers: PropTypes.func
}

CreateUser.contextTypes = {
    router: PropTypes.object
}

export default CreateUser
