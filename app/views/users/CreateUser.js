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
        height:'300'
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
                    {
                      console.log('this.state.username', this.state.username)
                    }

                        <h4>Create User</h4><br/>
                          <div style={styles.root}>
                          <GridList
                            cols={1}
                            cellHeight='auto'
                            style={styles.gridList}
                          >
                              <GridTile
                                key='username'
                              >

                              <TextField style={{width:450}} id="username" floatingLabelText="Username" value={this.state.username} onChange={this.handlesOnUsernameChange}/>
                              </GridTile>
                              <GridTile
                                key='email'
                              >
                              <TextField style={{width:450}} id="email" floatingLabelText="Email" value={this.state.email} onChange={this.handlesOnEmailChange} />
                              </GridTile>
                              <GridTile
                                key='firstName'
                              >
                              <TextField style={{width:450}} id="firstName" floatingLabelText="First Name" value={this.state.firstName} onChange={this.handlesOnFirstNameChange}  />
                              </GridTile>
                              <GridTile
                                key='lastName'
                              >
                              <TextField style={{width:450}} id="lastName" floatingLabelText="Last Name" value={this.state.lastName} onChange={this.handlesOnLastNameChange}  />
                              </GridTile>
                              <GridTile
                                key='password'
                              >
                              <TextField style={{width:450}} id="password" type="password" floatingLabelText="Password" value={this.state.password} onChange={this.handlesOnPasswordChange}  />
                              </GridTile>
                              <GridTile
                                key='role'
                              >
                              <Dropzone id='imageUri' onDrop={this.handlesImageUpload} multiple={false} accept='image/*'
                                style={{ marginLeft: '10px', width: '180px', padding: '15px 0px' }}>
                                <div className="avatar-photo">
                                  <div className="avatar-edit">
                                    <span>Click to Choose Image</span>
                                    <i className="fa fa-camera"></i>
                                  </div>
                                  <img src={this.state.croppedImg || this.state.imageUri || defaultUserImage} style={{width: 200}} />
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
                              <RadioButtonGroup style={{width:450, margin: 5}} name="role" id="role" valueSelected={this.state.role} onChange={this.handleRoleChange}>
                                    <RadioButton
                                      value="admin"
                                      label="Global Admin"
                                    />
                                    <RadioButton
                                      value="user"
                                      label="User"
                                    />
                                  </RadioButtonGroup>
                            </GridTile>
                            <GridTile
                              key='SubmitButton'
                            >
                            <RaisedButton style={{width:450, margin: 5}} primary={true} disabled={loading} label="Submit" onClick={this.handlesCreateClick} />
                            </GridTile>
                          </GridList>
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
                console.log('Error: ', error)
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

        handlesOnPasswordChange = event => {
            event.preventDefault()
            // should add some validator before setState in real use cases
            this.setState({ password: event.target.value })
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
            event.preventDefault()
            console.log('this.state.role------', this.state.role)
            // let userToCreate = this.props.form.getFieldsValue()
            let userToCreate = {
              username: this.state.username,
              email: this.state.email,
              role: this.state.role,
              password: this.state.password,
              firstName: this.state.firstName,
              lastName: this.state.lastName,
              imageUri: this.state.croppedImg
            };
            console.log('creating user -', userToCreate)
            console.log('this.props -', this.props)
            this.props.CreateUserMutation({
                variables: { user: userToCreate }
             }).then(({ data }) => {
                console.log('got data', data)
            }).then(() =>{
                this.props.refetchUsers({}).then(({ data }) =>{
                  console.log('got MORE data', data);
                  this.setState({
                    successOpen: true
                  })

                  router.push({ pathname: '/users' })
                }).catch((error) => {
                    console.log('there was an error sending the SECOND query', error)
                })
            }).catch((error) => {
              this.setState({
                failOpen: true
              })
                console.log('there was an error sending the query', error)
            })

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
