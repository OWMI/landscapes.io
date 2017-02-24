import cx from 'classnames'
import { Loader } from '../../components'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Dropzone from 'react-dropzone'
import { Row, Col } from 'react-flexbox-grid'

import { Checkbox, RaisedButton} from 'material-ui'
import {GridList, GridTile} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import Snackbar from 'material-ui/Snackbar';

import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';

import Slider from 'material-ui/Slider';
import {RadioButtonGroup, RadioButton} from 'material-ui/RadioButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import FlatButton from 'material-ui/FlatButton';
import AvatarCropper from "react-avatar-cropper";
import defaultUserImage from '../../style/empty.png'


const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 500,
    overflowY: 'auto'
  },
};

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
        height:'300',
        errorMessage: false,
        message: ''
    }

    componentDidMount() {
        const { enterUsers } = this.props
        enterUsers()
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
            const { animated, viewEntersAnim } = this.state
            const { loading, users, groups } = this.props

            const formItemLayout = {
                labelCol: { span: 8 },
                wrapperCol: { span: 12 }
            }


            if (loading) {
                return (
                    <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                        <Loader/>
                    </div>
                )
            }

            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Snackbar
                      open={this.state.successOpen}
                      message="User successfully created."
                      autoHideDuration={3000}
                      onRequestClose={this.handleRequestClose}
                    />
                    <Snackbar
                      open={this.state.failOpen}
                      message="Error updating created"
                      autoHideDuration={3000}
                      onRequestClose={this.handleRequestClose}
                    />
                    <Row middle='xs'>
                        <Col xs={4} style={{ textAlign: 'left' }}>
                            <h4>Create User</h4>
                        </Col>
                        <Col xs={4}>

                        </Col>
                        <Col xs={2}>
                            <RaisedButton label='Save' onClick={this.handlesCreateClick}
                                style={{ float: 'right', margin: '30px 0px' }}
                                labelStyle={{ fontSize: '11px' }}/>
                        </Col>
                        <Col xs={2}>
                            <RaisedButton label='Cancel' primary={true} onClick={() => {
                                const {router} = this.context
                                router.push(`/users`)
                            }}
                                style={{ float: 'right', margin: '30px 0px' }}
                                labelStyle={{ fontSize: '11px' }}/>
                        </Col>
                    </Row>
                          <div style={styles.root}>
                            <Card style={{padding:20, width:'100%'}}>
                              {
                                this.state.errorMessage
                                ?
                                <p style={{color: 'red'}}>{this.state.message}</p>
                                :
                                null
                              }
                                <Row style={{width:'100%'}}>
                                <Col style={{width:'50%'}}>
                                  <Row>
                                    <TextField style={{width:'100%'}} id="username" floatingLabelText="Username" value={this.state.username} onChange={this.handlesOnUsernameChange}  />
                                  </Row>
                                  <Row>
                                    <TextField style={{width:'100%'}} id="email" floatingLabelText="Email" value={this.state.email} onChange={this.handlesOnEmailChange} />
                                  </Row>
                                  <Row>
                                    <Col xs={6}>
                                      <TextField style={{width:'100%'}} id="firstName" floatingLabelText="First Name" value={this.state.firstName} onChange={this.handlesOnFirstNameChange}/>
                                    </Col>
                                    <Col xs={6}>
                                      <TextField style={{width:'100%'}} id="lastName" floatingLabelText="Last Name" value={this.state.lastName} onChange={this.handlesOnLastNameChange} />
                                    </Col>
                                  </Row>
                                  <Row>
                                    <TextField style={{width:'100%'}} id="newPassword" floatingLabelText="New Password" value={this.state.newPassword} onChange={this.handlesOnNewPasswordChange} />
                                  </Row>
                                  <Row>
                                    <TextField style={{width:'100%'}} id="verifyPassword" floatingLabelText="Verify Password" value={this.state.verifyPassword} onChange={this.handlesOnVerifyPasswordChange}/>
                                  </Row>
                                  <Row style={{marginTop: 5}}>
                                    <RadioButtonGroup style={{ maxWidth:250}} name="role" id="role" valueSelected={this.state.role} onChange={this.handleRoleChange}>
                                          <RadioButton
                                            value="admin"
                                            label="Global Admin"
                                            labelStyle={{textAlign: 'left', marginLeft:0, width:100}}
                                          />
                                          <RadioButton
                                            value="user"
                                            label="User"
                                            labelStyle={{textAlign: 'left', marginLeft:0}}
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
                                        <img src={this.state.croppedImg || this.state.imageUri || defaultUserImage} />
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
                    </div>
            )
        }

        getInitialState = () => {
            return {
              cropperOpen: false,
              img: null,
              croppedImg: defaultImage
            };
          }
          handleFileChange = (dataURI) => {
            this.setState({
              img: dataURI,
              croppedImg: this.state.croppedImg,
              cropperOpen: true
            });
          }
          handleCrop = (dataURI) => {
            this.setState({
              cropperOpen: false,
              img: null,
              croppedImg: dataURI
            });
          }
          handleRequestHide = () =>{
            this.setState({
              cropperOpen: false
            });
          }
        handleRequestDelete = () => {
          alert('You clicked the delete button.');
        }

        handleTouchTap = () => {
          alert('You clicked the Chip.');
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

        handlesCreateClick = event => {
          const { router } = this.context
          const { refetchUsers } = this.props

          this.setState({errorMessage: false})
          if(this.state.newPassword !== this.state.verifyPassword ){
            this.setState({errorMessage: true, message:'Password and Verify Password must match.'})
          }
          else if(!this.state.username){
            this.setState({errorMessage: true, message:'Must provide username.'})
          }
          else if(!this.state.email){
            this.setState({errorMessage: true, message:'Must provide email.'})
          }
          else if(!this.state.firstName || !this.state.lastName){
            this.setState({errorMessage: true, message:'Must provide first and last name.'})
          }
          else{
            event.preventDefault()
            let userToCreate = {
              username: this.state.username,
              email: this.state.email,
              role: this.state.role,
              password: this.state.newPassword,
              firstName: this.state.firstName,
              lastName: this.state.lastName,
              imageUri: this.state.croppedImg
            };
            this.props.CreateUserMutation({
                variables: { user: userToCreate }
             }).then(() =>{
                this.props.refetchUsers({}).then(({ data }) =>{
                  this.setState({
                    successOpen: true
                  })

                  router.push({ pathname: '/users' })
                }).catch((error) => {
                })
            }).catch((error) => {
              this.setState({
                failOpen: true
              })
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
