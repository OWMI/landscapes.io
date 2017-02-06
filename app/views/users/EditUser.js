import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import Dropzone from 'react-dropzone'

import { Checkbox, RaisedButton} from 'material-ui'
import {GridList, GridTile} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import IconButton from 'material-ui/IconButton';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
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

import { Loader } from '../../components'

const CheckboxGroup = Checkbox.Group;

const TabPane = Tabs.TabPane;

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
};

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
          height:'300'
    }

    componentDidMount() {
        const { enterUsers } = this.props
        enterUsers()
    }

    // Necessary for case: hard refresh or route from no other state
    componentWillReceiveProps(nextProps){
      const { loading, groups, landscapes, users, params } = nextProps

      let currentUser = {}
      if(users){
        let currentUser = users.find(ls => { return ls._id === params.id })
        this.setState({ _id:currentUser._id, password: currentUser.password, username: currentUser.username, role: currentUser.role, email: currentUser.email, firstName: currentUser.firstName, lastName: currentUser.lastName})
      }
      this.setState({currentUser})
    }

    // Necessary for case: routes from another state
    componentWillMount(){
      const { loading, groups, landscapes, users, params } = this.props

      let currentUser = {}
      if(users){
        currentUser = users.find(ls => { return ls._id === params.id })
        this.setState({ _id:currentUser._id, password: currentUser.password, username: currentUser.username, role: currentUser.role, email: currentUser.email, firstName: currentUser.firstName, lastName: currentUser.lastName})
      }
      this.setState({currentUser})
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
          <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
              <h4><strong>Edit User:</strong> {this.state.firstName} {this.state.lastName}</h4><br/>
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
            {
              console.log('this.state.username', this.state.username)
            }

                  <div style={styles.root}>
                  <Card style={{padding:20}}>
                  <GridList
                    cols={1}
                    cellHeight='auto'
                    style={styles.gridList}
                  >
                      <GridTile
                        key='username'
                      >

                      <TextField style={{width:450}} id="username" floatingLabelText="Username" value={this.state.username} onChange={this.handlesOnUsernameChange}  placeholder='Username' />
                      </GridTile>
                      <GridTile
                        key='email'
                      >
                      <TextField style={{width:450}} id="email" floatingLabelText="Email" value={this.state.email} onChange={this.handlesOnEmailChange}  placeholder='user@email.com' />
                      </GridTile>
                      <GridTile
                        key='firstName'
                      >
                      <TextField style={{width:450}} id="firstName" floatingLabelText="First Name" value={this.state.firstName} onChange={this.handlesOnFirstNameChange} placeholder='First Name' />
                      </GridTile>
                      <GridTile
                        key='lastName'
                      >
                      <TextField style={{width:450}} id="lastName" floatingLabelText="Last Name" value={this.state.lastName} onChange={this.handlesOnLastNameChange} placeholder='Last Name' />
                      </GridTile>
                      <GridTile
                        key='image'
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
                    </GridTile>
                      <GridTile
                        key='role'
                      >
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
                    <RaisedButton style={{width:450, margin: 5}} primary={true} disabled={loading} label="Save" onClick={this.handlesCreateClick} />
                    </GridTile>
                  </GridList>
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
            console.log('Error: ', error)
        }
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
        console.log('first name = ', event.target.value)
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

        event.preventDefault()
        this.setState({loading: true})

        // let userToCreate = this.props.form.getFieldsValue()
        console.log('this.state.role------', this.state.role)

        let userToEdit = {
          _id: this.state._id,
          username: this.state.username,
          email: this.state.email,
          role: this.state.role,
          imageUri: this.state.croppedImg,
          firstName: this.state.firstName,
          lastName: this.state.lastName
        };
        console.log('UPDATING user -', userToEdit)
        console.log('this.props -', this.props)

        this.props.EditUserWithMutation({
            variables: { user: userToEdit }
         }).then(({ data }) => {           const { router } = this.context

           this.props.refetchUsers({
           }).then(({ data }) =>{
             console.log('got MORE data', data);
             this.setState({
               successOpen: true
             })
             this.setState({loading: false})

             router.push({ pathname: '/users' })
           }).catch((error) => {
               this.setState({loading: false})
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

EditUser.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterUsers: PropTypes.func.isRequired,
    leaveUsers: PropTypes.func.isRequired,
    refetchUsers: PropTypes.func
}

EditUser.contextTypes = {
    router: PropTypes.object
}

export default (EditUser)
