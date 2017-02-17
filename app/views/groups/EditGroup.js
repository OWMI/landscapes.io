import cx from 'classnames'
import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import {Row, Col} from 'react-flexbox-grid'

import {Checkbox, RaisedButton, Dialog} from 'material-ui'
import {GridList, GridTile} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import Snackbar from 'material-ui/Snackbar';
import { Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import Slider from 'material-ui/Slider';
import {RadioButtonGroup, RadioButton} from 'material-ui/RadioButton';
import Toggle from 'material-ui/Toggle';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import FlatButton from 'material-ui/FlatButton';
import Dropzone from 'react-dropzone'
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import UploadIcon from 'material-ui/svg-icons/file/file-upload'
import { IoEdit, IoAndroidClose } from 'react-icons/lib/io'
import defaultUserImage from '../../style/empty.png'
import defaultImage from '../../style/empty-group.png'
import AvatarCropper from "react-avatar-cropper";
import ReactDom from "react-dom";
import {sortBy} from "lodash";
import { auth } from '../../services/auth'

import {Loader} from '../../components'
import materialTheme from '../../style/custom-theme.js';

const CheckboxGroup = Checkbox.Group;

const defaultCheckedList = ['r'];

import '../../style/avatar-cropper.style.scss'

const styles = {
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    },
    gridList: {
        width: 500,
        overflowY: 'auto'
    },
    chip: {
        margin: 4
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap'
    }
};

const TabPane = Tabs.TabPane;

class EditGroup extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        checkedList: defaultCheckedList,
        indeterminate: true,
        successOpen: false,
        failOpen: false,
        checkAll: false,
        permissionC: false,
        permissionU: false,
        permissionD: false,
        permissionX: false,
        name: '',
        description: '',
        showDialog: false,

        fixedHeader: true,
        fixedFooter: true,
        successOpen: false,
        failOpen: false,
        stripedRows: true,
        showRowHover: true,
        selectable: true,
        multiSelectable: true,
        enableSelectAll: true,
        deselectOnClickaway: true,
        showCheckboxes: true,
        height: '300'
    }

    componentWillMount() {
        const {loading, groupById, landscapes, users, accounts, params} = this.props
        let currentUser = {
          id: auth.getUserInfo()._id,
          role: auth.getUserInfo().role
        }
        let isAdmin = false;
        if(currentUser.role === 'admin'){
            isAdmin = true
        }
        var isGroupAdmin = false;
        if(auth.getUserInfo() && auth.getUserInfo().groups){
          var group = auth.getUserInfo().groups.forEach(group =>{
            if(group.groupId === params.id && group.isAdmin){
              isGroupAdmin = true
            }
          })
        }

        let currentGroup = {};
        if (groupById && (groupById._id === params.id)) {
            currentGroup = groupById
            if (currentGroup) {
                this.setState({description: currentGroup.description})
                this.setState({name: currentGroup.name})
                if (currentGroup.imageUri) {
                    this.setState({imageUri: currentGroup.imageUri})
                } else {
                    this.setState({imageUri: defaultImage})
                }
            }
        }
        var usersSorted = [];
        var landscapesSorted = [];
        var accountsSorted = [];
        if(users){
          usersSorted = sortBy(users, ['lastName']);
          this.setState({users: usersSorted})
        }
        if(landscapes){
          landscapesSorted = sortBy(landscapes, ['name']);
        }
        if(accounts){
          accountsSorted = sortBy(accounts, ['name']);
        }
        this.setState({currentGroup: currentGroup})
        this.setState({landscapes: landscapes})
        let selectedLandscapeRows = []
        let selectedUserRows = []
        let selectedAccountRows = []
        let stateLandscapes = []
        let stateAccounts = []

        if (currentGroup.landscapes) {
            for (var i = 0; i < currentGroup.landscapes.length; i++) {
                landscapesSorted.find((ls, index) => {
                    if (currentGroup.landscapes[i] === ls._id) {
                        ls.selected = true;
                        selectedLandscapeRows.push(index)
                    }
                    stateLandscapes.push(ls)
                })
            }
        }
        if (currentGroup.accounts) {
            for (var i = 0; i < currentGroup.accounts.length; i++) {
                accountsSorted.find((ls, index) => {
                    if (currentGroup.accounts[i] === ls._id) {
                        ls.selected = true;
                        selectedAccountRows.push(index)
                    }
                    stateAccounts.push(ls)
                })
            }
        }
        if (currentGroup.users) {
            for (var i = 0; i < currentGroup.users.length; i++) {
                usersSorted.find((user, index) => {
                    if (currentGroup.users[i].userId === user._id) {
                        user.selected = true;
                        if(currentGroup.users[i].isAdmin){
                          user.isAdmin = true;
                          if(user._id === currentUser.id){
                            isAdmin = true
                          }
                        }
                        selectedUserRows.push(index)
                    }
                })
            }
        }
        let stateUsers = []

        if (users) {
            usersSorted.map(user => {
                if (!user.imageUri) {
                    user.imageUri = defaultUserImage
                }
                stateUsers.push(user)
            })
            this.setState({users: stateUsers})

        }
        this.setState({isAdmin: isAdmin})
        this.setState({selectedLandscapeRows: selectedLandscapeRows})
        this.setState({selectedUserRows: selectedUserRows})
        this.setState({selectedAccountRows: selectedAccountRows})

        if (currentGroup.permissions) {
            if (currentGroup.permissions.length === 5) {
                this.setState({checkAll: true})
            }
            currentGroup.permissions.map(value => {
                if (value === 'c') {
                    this.setState({permissionC: true})
                }
                if (value === 'u') {
                    this.setState({permissionU: true})
                }
                if (value === 'd') {
                    this.setState({permissionD: true})
                }
                if (value === 'x') {
                    this.setState({permissionX: true})
                }
            })
        }
        this.setState({stateLandscapes: landscapesSorted, stateUsers, stateAccounts: accountsSorted, isGroupAdmin})

    }

    componentWillReceiveProps(nextProps) {
        const {loading, groupById, landscapes, accounts, users, params} = nextProps
        let currentUser = {
          id: auth.getUserInfo()._id,
          role: auth.getUserInfo().role
        }
        let isAdmin = false
        if(currentUser.role === 'admin'){
          isAdmin = true
        }
        var isGroupAdmin = false;
        if(auth.getUserInfo() && auth.getUserInfo().groups){
          var group = auth.getUserInfo().groups.forEach(group =>{
            if(group.groupId === params.id && group.isAdmin){
              isGroupAdmin = true
            }
          })
        }
        let currentGroup = {};
        if (groupById && (groupById._id === params.id)) {
            currentGroup = groupById
            if (currentGroup) {
                this.setState({description: currentGroup.description})
                this.setState({name: currentGroup.name})
                if (currentGroup.imageUri) {
                    this.setState({imageUri: currentGroup.imageUri})
                } else {
                    this.setState({imageUri: defaultImage})
                }
            }
        }
        var usersSorted = [];
        var landscapesSorted = [];
        var accountsSorted = [];
        if(users){
          usersSorted = sortBy(users, ['lastName']);
          this.setState({users: usersSorted})
        }
        if(landscapes){
          landscapesSorted = sortBy(landscapes, ['name']);
        }
        if(accounts){
          accountsSorted = sortBy(accounts, ['name']);
        }
        this.setState({currentGroup: currentGroup})
        this.setState({landscapes: landscapes})
        let selectedLandscapeRows = []
        let selectedUserRows = []
        let selectedAccountRows = []
        let userImageUsers = []
        let stateLandscapes = []
        let stateAccounts = []
        if (currentGroup.landscapes) {
            for (var i = 0; i < currentGroup.landscapes.length; i++) {
                landscapesSorted.find((ls, index) => {
                    if (currentGroup.landscapes[i] === ls._id) {
                        ls.selected = true;
                        selectedLandscapeRows.push(index)
                    }
                    stateLandscapes.push(ls)
                })
            }
        }
        if (currentGroup.accounts) {
            for (var i = 0; i < currentGroup.accounts.length; i++) {
                accountsSorted.find((ls, index) => {
                    if (currentGroup.accounts[i] === ls._id) {
                        ls.selected = true;
                        selectedAccountRows.push(index)
                    }
                    stateAccounts.push(ls)
                })
            }
        }
        if (currentGroup.users) {
            for (var i = 0; i < currentGroup.users.length; i++) {
                usersSorted.find((user, index) => {
                    if (currentGroup.users[i].userId === user._id) {
                        user.selected = true;
                        if(currentGroup.users[i].isAdmin){
                          user.isAdmin = true;
                          if(currentGroup.users[i].userId === currentUser.id){
                            isAdmin = true
                          }
                        }
                        selectedUserRows.push(index)
                    }
                    if (!user.imageUri) {
                        user.imageUri = defaultUserImage
                    }
                })
            }
        }
        let stateUsers = []
        if (users) {
            usersSorted.map(user => {
                if (!user.imageUri) {
                    user.imageUri = defaultUserImage
                }
                stateUsers.push(user)
            })
            this.setState({users: stateUsers})

        }
        this.setState({isAdmin: isAdmin})
        this.setState({selectedLandscapeRows: selectedLandscapeRows})
        this.setState({selectedUserRows: selectedUserRows})

        if (currentGroup.permissions) {
            if (currentGroup.permissions.length === 5) {
                this.setState({checkAll: true})
            }
            currentGroup.permissions.map(value => {
                if (value === 'c') {
                    this.setState({permissionC: true})
                }
                if (value === 'u') {
                    this.setState({permissionU: true})
                }
                if (value === 'd') {
                    this.setState({permissionD: true})
                }
                if (value === 'x') {
                    this.setState({permissionX: true})
                }
            })
        }
        this.setState({stateLandscapes: landscapesSorted, stateUsers, stateAccounts: accountsSorted, selectedAccountRows, isGroupAdmin})
    }

    componentDidMount() {
        const {enterGroups} = this.props
        enterGroups()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const {leaveGroups} = this.props
        leaveGroups()
    }

    render() {

        let self = this
        const {animated, viewEntersAnim, isGroupAdmin} = this.state
        const {loading, groupById, landscapes, users, accounts, params} = this.props
        let stateCurrentGroup = this.state.currentGroup || {
            name: '',
            description: ''
        }

        if (loading || this.state.loading) {
            return (
                <div className={cx({'animatedViews': animated, 'view-enter': viewEntersAnim})}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div>
                <Row className={cx({'screen-width': true, 'animatedViews': animated, 'view-enter': viewEntersAnim})} style={{
                    justifyContent: 'space-between'
                }}>
                <Row style={{flex: 1}}>
                    <Col xs={2} style={{ textAlign: 'left', marginBottom:30 }}>
                      <Row><h4><strong>Edit Group</strong></h4></Row>
                    </Col>
                    <Col xs={8}>
                      <RaisedButton label="Save" labelStyle={{ fontSize: '11px' }} style={{ float: 'right', marginBottom: '30px' }} onClick={this.handlesCreateClick}/>
                    </Col>
                    <Col xs={1}>
                      {
                        this.state.isAdmin || isGroupAdmin
                          ?
                          <div>
                            <RaisedButton label="Delete" labelStyle={{ fontSize: '11px' }} style={{ float: 'right', marginBottom: '30px' }} onClick={this.handlesDialogToggle} />
                                                            <Dialog title='Delete Group' modal={false} labelStyle={{ fontSize: '11px' }}
                                open={this.state.showDialog} onRequestClose={this.handlesDialogToggle}
                                actions={[
                                    <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
                                    <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteAccountClick.bind(this, this.state.currentGroup)}/>
                                ]}>
                                Are you sure you want to delete {this.state.currentGroup.name}?
                            </Dialog>
                          </div>
                          :
                          <div style={{ float: 'right', marginBottom: '30px' }}></div>
                      }
                    </Col>
                    <Col xs={1}>
                      <RaisedButton label="Cancel" labelStyle={{ fontSize: '11px' }} style={{ float: 'right', marginBottom: '30px' }} onClick={() => {
                          const {router} = this.context
                          router.push(`/groups/${params.id}`)
                      }}/>
                    </Col>
                </Row>
                <div style={styles.root}>

                <Card style={{padding:20}}>
                    <Row center='xs' middle='xs' className={cx({'animatedViews': animated, 'view-enter': viewEntersAnim})}>
                    <Snackbar open={this.state.successOpen} message="Group successfully updated." autoHideDuration={3000} onRequestClose={this.handleRequestClose}/>
                    <Snackbar open={this.state.failOpen} message="Error updating group" autoHideDuration={3000} onRequestClose={this.handleRequestClose}/>
                          <div style={styles.root}>

                              <Col >
                                  <Row key='name'>

                                      <TextField style={{
                                          width: 450
                                      }} id="username" floatingLabelText="Name" value={this.state.name} onChange={this.handlesOnNameChange} placeholder='Username'/>
                                  </Row>
                                  <Row key='description'>
                                      <TextField id="description" style={{
                                          width: 450
                                      }} multiLine={true} rows={2} rowsMax={4} floatingLabelText="Description" onChange={this.handlesOnDescriptionChange} value={this.state.description} hintText='Description'/>
                                  </Row>
                                  <Row key='permissions'>
                                      <div style={{
                                          borderBottom: '1px solid #E9E9E9',
                                          width: 450
                                      }}>
                                          <Checkbox style={{
                                              margin: 5
                                          }} label="Check All Permissions" onCheck={this.handlesOnCheck} checked={this.state.checkAll}/>
                                      </div>
                                      <br/>
                                      </Row>

                                      <Row>
                                        <Col>
                                          <Checkbox label="Create" checked={this.state.permissionC} onCheck={this.handlesPermissionClickC}/>
                                          <Checkbox label="Read" disabled={true} checked={true}/>
                                          <Checkbox label="Update" checked={this.state.permissionU} onCheck={this.handlesPermissionClickU}/>
                                          <Checkbox label="Delete" checked={this.state.permissionD} onCheck={this.handlesPermissionClickD}/>
                                          <Checkbox label="Execute" checked={this.state.permissionX} onCheck={this.handlesPermissionClickX}/>
                                        </Col>
                                      </Row>
                                  <Row key='image'>
                                      <Dropzone id='imageUri' onDrop={this.handlesImageUpload} multiple={false} accept='image/*' style={{
                                          marginLeft: '10px',
                                          width: '180px',
                                          padding: '15px 0px'
                                      }}>
                                          <div className="avatar-photo">
                                              <div className="avatar-edit">
                                                  <span>Click to Choose Image</span>
                                                  <i className="fa fa-camera"></i>
                                              </div>
                                              <img src={this.state.croppedImg || this.state.imageUri} style={{
                                                  width: 200
                                              }}/>
                                          </div>
                                          {this.state.cropperOpen &&
                                            <AvatarCropper onRequestHide={this.handleRequestHide} cropperOpen={this.state.cropperOpen} onCrop={this.handleCrop} image={this.state.img} width={400} height={400}/>
                                          }
                                      </Dropzone>
                                  </Row>
                              </Col>
                          </div>
                    <Tabs tabItemContainerStyle={{backgroundColor: materialTheme.palette.primary3Color}}>
                        <Tab label="Landscapes" key="3">
                          <div style={styles.wrapper}>
                              {
                                this.state.selectedLandscapeRows.map((row, index) => (
                                  <Chip style = {styles.chip} key={index} >
                                    <Avatar src={this.state.stateLandscapes[row].imageUri}/>
                                     {this.state.stateLandscapes[row].name}
                                  </Chip>
                              ))
                            }
                          </div>
                            <Table key="landscapeTable" height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter} selectable={this.state.selectable} multiSelectable={this.state.multiSelectable} onRowSelection={this.handleOnRowSelectionLandscapes}>
                                <TableHeader displaySelectAll={this.state.showCheckboxes} adjustForCheckbox={this.state.showCheckboxes} enableSelectAll={this.state.enableSelectAll}>
                                    <TableRow>
                                        <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                                        <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                        <TableHeaderColumn tooltip="Description">Description</TableHeaderColumn>
                                    </TableRow>
                                </TableHeader>
                                <TableBody displayRowCheckbox={this.state.showCheckboxes} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false}>
                                    {this.state.stateLandscapes.map((row, index) => (
                                        <TableRow key={row._id} selected={this.state.selectedLandscapeRows.indexOf(index) !== -1}>
                                            <TableRowColumn><img src={row.imageUri} style={{
                                            width: 50
                                        }}/></TableRowColumn>
                                            <TableRowColumn>{row.name}</TableRowColumn>
                                            <TableRowColumn>{row.description}</TableRowColumn>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter adjustForCheckbox={this.state.showCheckboxes}></TableFooter>
                            </Table>
                        </Tab>
                        <Tab label="Users" key="2">
                            <div style={styles.wrapper}>
                                {
                                  this.state.selectedUserRows.map((row, index) => (
                                    <Chip style = {styles.chip} key={index} >
                                      <Avatar src={this.state.stateUsers[row].imageUri}/>
                                       {this.state.stateUsers[row].firstName} {this.state.stateUsers[row].lastName}
                                    </Chip>
                                ))
                              }
                            </div>
                            <Table key="userTable" height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter} selectable={this.state.selectable} multiSelectable={this.state.multiSelectable} onRowSelection={this.handleOnRowSelectionUsers}>
                                <TableHeader displaySelectAll={this.state.showCheckboxes} adjustForCheckbox={this.state.showCheckboxes} enableSelectAll={this.state.enableSelectAll}>
                                    <TableRow>
                                        <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                                          <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                        <TableHeaderColumn tooltip="Email">Email</TableHeaderColumn>
                                        <TableHeaderColumn tooltip="Role">Admin?</TableHeaderColumn>
                                    </TableRow>
                                </TableHeader>
                                <TableBody displayRowCheckbox={this.state.showCheckboxes} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false}>
                                    {
                                      this.state.stateUsers.map((row, index) => (
                                          <TableRow key={row._id} selected={this.state.selectedUserRows.indexOf(index) !== -1}>
                                              <TableRowColumn><img src={row.imageUri} style={{width: 40, borderRadius: 50}}/></TableRowColumn>
                                              <TableRowColumn>{row.lastName}, {row.firstName} </TableRowColumn>
                                              <TableRowColumn>{row.email}</TableRowColumn>
                                              <TableRowColumn>
                                                <Toggle toggled={row.isAdmin || (row.role === 'admin')} onToggle={() => (
                                                    this.state.stateUsers[index].isAdmin = !this.state.stateUsers[index].isAdmin,
                                                    this.setState({stateUsers: [...this.state.stateUsers]})
                                                  )} disabled={row.role === 'admin'} />
                                              </TableRowColumn>
                                          </TableRow>
                                      ))
                                    }
                                </TableBody>
                                <TableFooter adjustForCheckbox={this.state.showCheckboxes}></TableFooter>
                            </Table>

                        </Tab>
                        <Tab label="Accounts" key="4">
                            <Table key="accountsTable" height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter} selectable={this.state.selectable} multiSelectable={this.state.multiSelectable} onRowSelection={this.handleOnRowSelectionAccounts}>
                                <TableHeader displaySelectAll={this.state.showCheckboxes} adjustForCheckbox={this.state.showCheckboxes} enableSelectAll={this.state.enableSelectAll}>
                                    <TableRow>
                                        <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                        <TableHeaderColumn tooltip="Region">Region</TableHeaderColumn>
                                        <TableHeaderColumn tooltip="Created At">Created At</TableHeaderColumn>
                                    </TableRow>
                                </TableHeader>
                                <TableBody displayRowCheckbox={this.state.showCheckboxes} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false}>
                                    {this.state.stateAccounts.map((row, index) => (
                                        <TableRow key={row._id} selected={this.state.selectedAccountRows.indexOf(index) !== -1}>
                                            <TableRowColumn>{row.name}</TableRowColumn>
                                            <TableRowColumn>{row.region}</TableRowColumn>
                                            <TableRowColumn>{row.createdAt}</TableRowColumn>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter adjustForCheckbox={this.state.showCheckboxes}></TableFooter>
                            </Table>
                        </Tab>
                    </Tabs>
                </Row>


              </Card>
            </div>
            </Row>
            </div>

        )
    }
    handlesDialogToggle = event => {
        this.setState({
            showDialog: !this.state.showDialog
        })
    }

    handlesDeleteAccountClick = (groupToDelete, event) => {
        event.preventDefault()

        const { mutate } = this.props
        const { router } = this.context

        this.handlesDialogToggle()

        delete groupToDelete.users;
        delete groupToDelete.__typename;

        this.props.DeleteGroupMutation({
            variables: { group: groupToDelete }
         }).then(({ data }) => {
            this.props.refetchGroups({}).then(({data}) => {
                router.push({pathname: '/groups'})
            }).catch((error) => {
            })
        }).catch((error) => {
        })
    }

    getInitialState = () => {
        return {cropperOpen: false, img: null, croppedImg: defaultImage};
    }
    handleFileChange = (dataURI) => {
        this.setState({img: dataURI, croppedImg: this.state.croppedImg, cropperOpen: true});
    }
    handleCrop = (dataURI) => {
        this.setState({cropperOpen: false, img: null, croppedImg: dataURI});
    }
    handleRequestHide = () => {
        this.setState({cropperOpen: false});
    }

    handleRequestDelete = (row, index) => {
      var userSelected = this.state.selectedUserRows.splice(index, 1)
      this.state.stateUsers[userSelected[0]].selected = false;
      this.setState({stateUsers: [...this.state.stateUsers]})
      this.setState({selectedUserRows: [...this.state.selectedUserRows]})
      this.render()
    }

    handleTouchTap = () => {
        alert('You clicked the Chip.');
    }

    handlesImageUpload = (acceptedFiles, rejectedFiles) => {
        let reader = new FileReader()

        reader.readAsDataURL(acceptedFiles[0])
        reader.onload = () => {
            this.setState({imageUri: reader.result, img: reader.result, croppedImg: this.state.croppedImg, cropperOpen: true, imageFileName: acceptedFiles[0].name})
        }

        reader.onerror = error => {
        }
    }

    handlesPermissionClickC = event => {
        this.setState({
            permissionC: !this.state.permissionC
        })
    }
    handlesPermissionClickU = event => {
        this.setState({
            permissionU: !this.state.permissionU
        })
    }
    handlesPermissionClickD = event => {
        this.setState({
            permissionD: !this.state.permissionD
        })
    }
    handlesPermissionClickX = event => {
        this.setState({
            permissionX: !this.state.permissionX
        })
    }

    handleOnRowSelectionUsers = selectedRows => {
        this.setState({selectedUserRows: selectedRows})
    }

    handleOnRowSelectionLandscapes = selectedRows => {
        this.setState({selectedLandscapeRows: selectedRows})
    }

    handleOnRowSelectionAccounts = selectedRows => {
        this.setState({selectedAccountRows: selectedRows})
    }

    handlesOnCheck = event => {
        var isChecked = this.state.checkAll;
        if (isChecked) {
            this.setState({permissionC: false, permissionU: false, permissionD: false, permissionX: false, checkAll: false})
        } else {
            this.setState({permissionC: true, permissionU: true, permissionD: true, permissionX: true, checkAll: true})
        }
    }

    handlesCreatePermission = () => {
        var permissions = [];
        if (this.state.permissionC) {
            permissions.push('c')
        }

        permissions.push('r')

        if (this.state.permissionU) {
            permissions.push('u')
        }
        if (this.state.permissionD) {
            permissions.push('d')
        }
        if (this.state.permissionX) {
            permissions.push('x')
        }
        return permissions;
    }
    handlesOnNameChange = event => {
        // event.preventDefault()
        this.setState({name: event.target.value})
    }
    handlesOnDescriptionChange = event => {
        event.preventDefault()
        this.setState({description: event.target.value})
    }
    handlesCreateClick = event => {
        const {router} = this.context
        this.setState({loading: true})
        event.preventDefault()
        this.setState({loading: true})

        let groupToEdit = {
            name: this.state.name,
            description: this.state.description,
            _id: this.state.currentGroup._id,
            imageUri: this.state.croppedImg || this.state.currentGroup.imageUri
        };

        groupToEdit.permissions = this.handlesCreatePermission()
        groupToEdit.users = []
        groupToEdit.landscapes = []
        groupToEdit.accounts = []
        if (this.state.selectedLandscapeRows) {
            for (var i = 0; i < this.state.selectedLandscapeRows.length; i++) {
                groupToEdit.landscapes.push(this.state.stateLandscapes[this.state.selectedLandscapeRows[i]]._id)
            }
        }
        if (this.state.selectedUserRows) {
            for (var i = 0; i < this.state.selectedUserRows.length; i++) {
                if(this.state.users[this.state.selectedUserRows[i]].role === 'admin'){
                  this.state.users[this.state.selectedUserRows[i]].isAdmin = true;
                }
                groupToEdit.users.push({
                    userId: this.state.users[this.state.selectedUserRows[i]]._id,
                    isAdmin: this.state.users[this.state.selectedUserRows[i]].isAdmin || false
                })
            }
        }
        if (this.state.selectedAccountRows) {
            for (var i = 0; i < this.state.selectedAccountRows.length; i++) {
              groupToEdit.accounts.push(this.state.stateAccounts[this.state.selectedAccountRows[i]]._id)

            }
        }
        console.log('groupToEdit', groupToEdit)
        this.props.EditGroupWithMutation({
            variables: {
                group: groupToEdit
            }
        }).then(({data}) => {
          console.log('updated')
            this.props.refetchGroup({}).then(() => {
              console.log('refetched group')
              this.props.refetchGroups({}).then(({data}) => {
                  console.log('refetched groups')
                  this.setState({successOpen: true})
                  this.props.refetchLandscapes({}).then(({data}) => {
                    this.setState({loading: false})

                    router.push({pathname: '/groups'})
                  })
              }).catch((error) => {
                  this.setState({loading: false})
              })
            })

        }).catch((error) => {
            this.setState({failOpen: true})
            this.setState({loading: false})
        })

    }

    closeError = (event) => {
        event.preventDefault()
        const {resetError} = this.props
        resetError()
    }
    onCheckedChange = (checkedList) => {
        this.setState({
            checkedList,
            indeterminate: !!checkedList.length && (checkedList.length < plainOptions.length),
            checkAll: checkedList.length === plainOptions.length
        });
    }
    onCheckAllChange = (e) => {
        this.setState({
            checkedList: e.target.checked
                ? allChecked
                : ['r'],
            indeterminate: false,
            checkAll: e.target.checked
        });
    }
}

EditGroup.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterGroups: PropTypes.func.isRequired,
    leaveGroups: PropTypes.func.isRequired,
    refetchGroups: PropTypes.func
}

EditGroup.contextTypes = {
    router: PropTypes.object
}

export default EditGroup
