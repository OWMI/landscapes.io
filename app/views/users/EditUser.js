import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Dropzone from 'react-dropzone'
import { Row, Col } from 'react-flexbox-grid'
import axios from 'axios'
import AvatarCropper from "react-avatar-cropper"
import { Checkbox, RaisedButton, Dialog, Snackbar, Card, TextField, RadioButtonGroup, RadioButton, FlatButton} from 'material-ui'

import defaultUserImage from '../../style/empty.png'
import materialTheme from '../../style/custom-theme.js'
import { Loader } from '../../components'


const CheckboxGroup = Checkbox.Group

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 500,
    overflowY: 'auto'
  }
}

class EditUser extends Component {

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
          height:'300',
          showDeleteDialog: false
    }

    componentDidMount() {
        const { enterUsers } = this.props
        enterUsers()
    }

    // Necessary for case: hard refresh or route from no other state
    componentWillReceiveProps(nextProps){
      const { loading, groups, landscapes, integrations, users, params } = nextProps
      var integration = {};
      if(integrations){
        integration = integrations.find(integration => { return integration.type === 'managedVPC' })
      }
      this.setState({integration})

      let currentUser = {}
      this.setState({currentUser})
      if(users){
        let currentUser = users.find(ls => { return ls._id === params.id })
        this.setState({ _id:currentUser._id, password: currentUser.password, username: currentUser.username, role: currentUser.role, email: currentUser.email, firstName: currentUser.firstName, lastName: currentUser.lastName, publicKey: currentUser.publicKey || null, managedVPC: currentUser.managedVPC || false})
        this.setState({currentUser})
      }
    }

    // Necessary for case: routes from another state
    componentWillMount(){
      const { loading, groups, landscapes, integrations, users, params } = this.props
      var integration = {};
      if(integrations){
        integration = integrations.find(integration => { return integration.type === 'managedVPC' })
      }
      this.setState({integration})

      let currentUser = {}
      this.setState({currentUser})
      if(users){
        currentUser = users.find(ls => { return ls._id === params.id })
        this.setState({ _id: currentUser._id, password: currentUser.password, username: currentUser.username, role: currentUser.role, email: currentUser.email, firstName: currentUser.firstName, lastName: currentUser.lastName, publicKey: currentUser.publicKey || null, managedVPC: currentUser.managedVPC || false})
        this.setState({currentUser})
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveUsers } = this.props
        leaveUsers()
    }

    render() {

        let self = this
        const { animated, viewEntersAnim, showDeleteDialog, currentUser } = this.state
        const { loading, groups, landscapes, users, params } = this.props

        const formItemLayout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 12 }
        }

        if (loading || this.state.loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
          <Row center='xs' middle='xs' className={cx({'animatedViews': animated, 'view-enter': viewEntersAnim })}>
            <Snackbar
              open={this.state.successOpen}
              message="User successfully updated."
              autoHideDuration={3000}
              onRequestClose={this.handleRequestClose}
            />
            <Snackbar
              open={this.state.failOpen}
              message="Error updating user"
              autoHideDuration={3000}
              onRequestClose={this.handleRequestClose}
            />
          <Col xs={12} lg={12} className={cx( { 'create-landscape': false } )}>

            <Row middle='xs'>
                <Col xs={4} style={{ textAlign: 'left' }}>
                    <h4><strong>Edit User:</strong> {this.state.firstName} {this.state.lastName}</h4>
                </Col>
                <Col xs={8}>
                    <RaisedButton label='Cancel' backgroundColor={materialTheme.palette.primary2Color} onClick={() => {
                        const {router} = this.context
                        router.push(`/users/${params.id}`)
                    }}
                        style={{ float: 'right', margin: '30px 5px' }}
                        labelStyle={{ fontSize: '11px', color:'white' }}/>
                    <RaisedButton label='Delete' onTouchTap={() => { this.setState({ showDeleteDialog: !showDeleteDialog }) }}
                        style={{ float: 'right', margin: '30px 5px' }}
                        labelStyle={{ fontSize: '11px' }}/>
                      <Dialog title='Delete User'  modal={false} open={showDeleteDialog}
                            onRequestClose={() => { this.setState({ showDeleteDialog: !showDeleteDialog }) }}
                            actions={[
                                <FlatButton label='Cancel' primary={true} onTouchTap={() => { this.setState({ showDeleteDialog: !showDeleteDialog }) }}/>,
                                <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteUserClick.bind(this, currentUser)}/>
                            ]}>
                            Are you sure you want to delete {this.state.firstName} {this.state.lastName}?
                        </Dialog>
                    <RaisedButton label='Save' onClick={this.handlesCreateClick}
                        style={{ float: 'right', margin: '30px 5px' }}
                        labelStyle={{ fontSize: '11px' }}/>
                </Col>
            </Row>
            <div style={styles.root}>

              <Card style={{padding:20, width:'100%'}}>
                  <Row style={{width:'100%'}}>
                  <Col style={{width:'50%'}}>
                    <Row>
                      <TextField style={{width:'100%'}} id="username" floatingLabelText="Username" value={this.state.username} onChange={this.handlesOnUsernameChange}  placeholder='Username' />
                    </Row>
                    <Row>
                      <TextField style={{width:'100%'}} id="email" floatingLabelText="Email" value={this.state.email} onChange={this.handlesOnEmailChange}  placeholder='user@email.com' />
                    </Row>
                    <Row>
                      <Col xs={6}>
                        <TextField style={{width:'100%'}} id="firstName" floatingLabelText="First Name" value={this.state.firstName} onChange={this.handlesOnFirstNameChange} placeholder='First Name' />
                      </Col>
                      <Col xs={6}>
                        <TextField style={{width:'100%'}} id="lastName" floatingLabelText="Last Name" value={this.state.lastName} onChange={this.handlesOnLastNameChange} placeholder='Last Name' />
                      </Col>
                    </Row>
                    <Row>
                      <TextField style={{width:'100%'}} id="newPassword" floatingLabelText="New Password" value={this.state.newPassword} onChange={this.handlesOnNewPasswordChange} />
                    </Row>
                    <Row>
                      <TextField style={{width:'100%'}} id="verifyPassword" floatingLabelText="Verify Password" value={this.state.verifyPassword} onChange={this.handlesOnVerifyPasswordChange}/>
                    </Row>
                    <Row key='integration'>
                      <div style={{
                          borderBottom: '1px solid #E9E9E9',
                          width: '100%'
                      }}>
                        <Col style={{ marginTop:15, marginBottom: 15, marginLeft: 0, justifyContent: 'left' }}>
                          <Checkbox label="Managed VPC" onCheck={this.handlesOnManagedVPCChange} labelStyle={{textAlign: 'left', marginLeft:2, width:100}} checked={this.state.managedVPC} style={{ textAlign: 'left', marginLeft:10, width:135}}/>
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
                              <div style={{justifyContent: 'left'}}>
                                {
                                  this.state.publicKey
                                  ?
                                  <TextField style={{ display:'block', marginLeft:10}} id="publicKey" value={this.state.publicKey} rows={1} rowsMax={4} multiLine={true} />
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
                              <RaisedButton style={{ display:'block', width: 200}} label="Retrieve Public Key" onClick={this.handlesPublic} />
                            </div>
                            :
                            null
                          }
                        </Col>

                      </div>
                    </Row>
                    <Row style={{marginTop:5}}>
                      <RadioButtonGroup style={{ maxWidth:250}} name="role" id="role" valueSelected={this.state.role} onChange={this.handleRoleChange}>
                            <RadioButton
                              value="admin"
                              label="Global Admin"
                              labelStyle={{textAlign: 'left', marginLeft:2, width:100}}
                            />
                            <RadioButton
                              value="user"
                              label="User"
                              labelStyle={{textAlign: 'left', marginLeft:2}}
                            />
                          </RadioButtonGroup>
                    </Row>
                  </Col>
                  <Col style={{width:'50%'}}>
                    <Row style={{justifyContent:'space-around'}}>
                      <Dropzone id='imageUri' onDrop={this.handlesImageUpload} multiple={false} accept='image/*'
                        style={{ marginLeft: '10px', width: '180px', padding: '15px 0px' }}>
                        <div className="avatar-photo">
                          <div className="avatar-edit">
                            <span>Click to Choose Image</span>
                            <i className="fa fa-camera"></i>
                          </div>
                          <img src={this.state.croppedImg || currentUser.imageUri || defaultUserImage} />
                        </div>
                        {
                          this.state.cropperOpen &&
                          <AvatarCropper
                            onRequestHide={this.handleRequestHide}
                            cropperOpen={this.state.cropperOpen}
                            onCrop={this.handleCrop}
                            image={this.state.img}
                            width={400}
                            height={400}
                          />
                        }
                        </Dropzone>
                    </Row>
                  </Col>
                  </Row>
                  </Card>
                </div>
                </Col>
            </Row>
        )
    }
    getInitialState = () => {
        return {
          cropperOpen: false,
          img: null,
          croppedImg: defaultImage
        }
      }
      handleFileChange = (dataURI) => {
        this.setState({
          img: dataURI,
          croppedImg: this.state.croppedImg,
          cropperOpen: true
        })
      }
      handleCrop = (dataURI) => {
        this.setState({
          cropperOpen: false,
          img: null,
          croppedImg: dataURI
        })
      }
      handleRequestHide = () =>{
        this.setState({
          cropperOpen: false
        })
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
            this.setState({
                imageUri: reader.result,
                img: reader.result,
                croppedImg: this.state.croppedImg,
                cropperOpen: true,
                imageFileName: acceptedFiles[0].name
            })
        }

        reader.onerror = error => {
        }
    }
    handleRoleChange = event => {
        event.preventDefault()
        this.setState({ role: event.target.value })
    }
    handlesOnEmailChange = event => {
        event.preventDefault()
        this.setState({ email: event.target.value })
    }

    handlesOnPasswordChange = event => {
        event.preventDefault()
        this.setState({ password: event.target.value })
    }
    handlesOnUsernameChange = event => {
        event.preventDefault()
        this.setState({ username: event.target.value })
    }
    handlesOnFirstNameChange = event => {
        event.preventDefault()
        this.setState({ firstName: event.target.value })
    }
    handlesOnLastNameChange = event => {
        event.preventDefault()
        // should add some validator before setState in real use cases
        this.setState({ lastName: event.target.value })
    }
    handlesOnNewPasswordChange = event => {
        event.preventDefault()
        // should add some validator before setState in real use cases
        this.setState({ newPassword: event.target.value })
    }
    handlesOnVerifyPasswordChange = event => {
        event.preventDefault()
        // should add some validator before setState in real use cases
        this.setState({ verifyPassword: event.target.value })
    }
    handlesOnManagedVPCChange = event => {
        event.preventDefault()
        this.setState({managedVPC: !this.state.managedVPC})
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


    handlesCreateClick = event => {
        const { router } = this.context
        const { currentUser, newPassword, verifyPassword } = this.state

        event.preventDefault()
        this.setState({loading: true})
        let userToEdit = {
          _id: this.state._id,
          username: this.state.username,
          email: this.state.email,
          role: this.state.role,
          imageUri: this.state.croppedImg,
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          managedVPC: this.state.managedVPC || false
        }
        if(this.state.publicKey){
          userToEdit.publicKey = this.state.publicKey
        }
        if (newPassword && verifyPassword){
          axios({
              method: 'post',
              url: `${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/users/adminPassword`,
              data: {
                  passwordDetails:{
                    newPassword: newPassword,
                    verifyPassword: verifyPassword
                  },
                  user: currentUser
              },
        }).then(res => {
        }).catch(err => {
            this.setState({ passwordSubmitError: true })
        })
      }
        this.props.EditUserWithMutation({
            variables: { user: userToEdit }
         }).then(({ data }) => {
           const { router } = this.context

           this.props.refetchUsers({
           }).then(({ data }) =>{
             this.setState({
               successOpen: true
             })
             this.setState({loading: false})

             router.push({ pathname: '/users' })
           }).catch((error) => {
               this.setState({loading: false})
           })
        }).catch((error) => {
          this.setState({
            failOpen: true
          })
        })
    }
    handlesDeleteUserClick = (user, event) => {
        event.preventDefault()
        const { router } = this.context
        const { DeleteUserMutation, refetchUsers } = this.props
        const { showDeleteDialog, currentUser } = this.state

        this.setState({ showDeleteDialog: !showDeleteDialog })
        delete currentUser.__typename
        DeleteUserMutation({
            variables: { user: currentUser }
        }).then(({ data }) => {
            refetchUsers({}).then(()=>{
              router.push({ pathname: `/users` })

            })
        }).catch((error) => {
        })
    }

    closeError = (event) => {
        event.preventDefault()
        const { resetError } = this.props
        resetError()
    }
}

EditUser.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterUsers: PropTypes.func.isRequired,
    leaveUsers: PropTypes.func.isRequired,
    refetchUsers: PropTypes.func,
    DeleteUserMutation: PropTypes.func
}

EditUser.contextTypes = {
    router: PropTypes.object
}

export default (EditUser)
