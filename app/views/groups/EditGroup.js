import cx from 'classnames'
import React, {Component, PropTypes} from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import {Row, Col} from 'react-flexbox-grid'

import {Checkbox, RaisedButton, Dialog} from 'material-ui'
import {GridList, GridTile} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';
import IconButton from 'material-ui/IconButton';
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
        const {loading, groups, landscapes, users, params} = this.props
        let currentUser = {
          id: auth.getUserInfo()._id,
          role: auth.getUserInfo().role
        }
        let isAdmin = false;
        if(currentUser.role === 'admin'){
            isAdmin = true
        }

        let currentGroup = {};
        if (groups) {
            currentGroup = groups.find(ls => {
                return ls._id === params.id
            })
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
        if(users){
          usersSorted = sortBy(users, ['lastName']);
          this.setState({users: usersSorted})
        }
        if(landscapes){
          landscapesSorted = sortBy(landscapes, ['name']);
        }
        this.setState({currentGroup: currentGroup})
        this.setState({landscapes: landscapes})
        let selectedLandscapeRows = []
        let selectedUserRows = []
        let stateLandscapes = []
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
        if (currentGroup.users) {
            for (var i = 0; i < currentGroup.users.length; i++) {
                usersSorted.find((user, index) => {
                    if (currentGroup.users[i].userId === user._id) {
                        user.selected = true;
                        if(currentGroup.users[i].isAdmin){
                          console.log('user', user)
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
        console.log('GLOBAL TEST -----------------')
        this.setState({stateLandscapes: landscapesSorted, stateUsers})

    }

    componentWillReceiveProps(nextProps) {
        const {loading, groups, landscapes, users, params} = nextProps
        let currentUser = {
          id: auth.getUserInfo()._id,
          role: auth.getUserInfo().role
        }
        let isAdmin = false
        if(currentUser.role === 'admin'){
          isAdmin = true
        }
        let currentGroup = {};
        if (groups) {
            currentGroup = groups.find(ls => {
                return ls._id === params.id
            })
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
        if(users){
          usersSorted = sortBy(users, ['lastName']);
          this.setState({users: usersSorted})
        }
        if(landscapes){
          landscapesSorted = sortBy(landscapes, ['name']);
        }
        this.setState({currentGroup: currentGroup})
        this.setState({landscapes: landscapes})
        let selectedLandscapeRows = []
        let selectedUserRows = []
        let userImageUsers = []
        let stateLandscapes = []
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
        console.log('GLOBAL TEST -----------------')
        this.setState({stateLandscapes: landscapesSorted, stateUsers})
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
        const {animated, viewEntersAnim} = this.state
        const {loading, groups, landscapes, users, params} = this.props
        let stateCurrentGroup = this.state.currentGroup || {
            name: '',
            description: ''
        }
        let selectedLandscapeRows = []
        let selectedUserRows = []

        console.log('CURRENT GROUP', stateCurrentGroup)

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
                  <Row style={{width:200, justifyContent: 'space-between', }} >
                    <h4>Edit Group </h4>
                  </Row>

                      <Snackbar
                        open={this.state.successOpen}
                        message="Group successfully saved."
                        autoHideDuration={3000}
                        onRequestClose={this.handleRequestClose}
                      />
                      <Snackbar
                        open={this.state.failOpen}
                        message="Error saving group."
                        autoHideDuration={3000}
                        onRequestClose={this.handleRequestClose}
                      />
                    <Row style={{justifyContent: 'space-between', }}>
                      <RaisedButton primary={true} label="Save" onClick={this.handlesCreateClick}/>
                      {console.log('isAdmin', this.state.isAdmin)}
                      {
                        this.state.isAdmin
                          ?
                          <div>
                            <FlatButton onTouchTap={this.handlesDialogToggle}>
                                Delete
                            </FlatButton>
                            <Dialog title='Delete Group' modal={false} open={this.state.showDialog}
                                onRequestClose={this.handlesDialogToggle}
                                actions={[
                                    <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
                                    <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteAccountClick.bind(this, this.state.currentGroup)}/>
                                ]}>
                                Are you sure you want to delete {this.state.currentGroup.name}?
                            </Dialog>
                          </div>
                          :
                          <div style={{width:1}}></div>
                      }
                    </Row>
                </Row>
                <Row center='xs' middle='xs' className={cx({'animatedViews': animated, 'view-enter': viewEntersAnim})}>
                    {console.log('this.state.stateLandscapes', this.state.stateLandscapes)}
                    {console.log('this.state.stateUsers', this.state.stateUsers)}
                    <Snackbar open={this.state.successOpen} message="Group successfully updated." autoHideDuration={3000} onRequestClose={this.handleRequestClose}/>
                    <Snackbar open={this.state.failOpen} message="Error updating group" autoHideDuration={3000} onRequestClose={this.handleRequestClose}/>
                    <Tabs >
                        <Tab label="Group" key="1">
                            <div style={styles.root}>

                                <GridList cols={1} cellHeight='auto' style={styles.gridList}>
                                    <GridTile key='name'>

                                        <TextField style={{
                                            width: 450
                                        }} id="username" floatingLabelText="Name" value={this.state.name} onChange={this.handlesOnNameChange} placeholder='Username'/>
                                    </GridTile>
                                    <GridTile key='description'>
                                        <TextField id="description" style={{
                                            width: 450
                                        }} multiLine={true} rows={2} rowsMax={4} floatingLabelText="Description" onChange={this.handlesOnDescriptionChange} value={this.state.description} hintText='Description'/>
                                    </GridTile>
                                    <GridTile key='firstName'>
                                        <div style={{
                                            borderBottom: '1px solid #E9E9E9',
                                            width: 450
                                        }}>
                                            <Checkbox style={{
                                                margin: 5
                                            }} label="Check All Permissions" onCheck={this.handlesOnCheck} checked={this.state.checkAll}/>
                                        </div>
                                        <br/>
                                        <Checkbox label="Create" checked={this.state.permissionC} onCheck={this.handlesPermissionClickC}/>
                                        <Checkbox label="Read" disabled={true} checked={true}/>
                                        <Checkbox label="Update" checked={this.state.permissionU} onCheck={this.handlesPermissionClickU}/>
                                        <Checkbox label="Delete" checked={this.state.permissionD} onCheck={this.handlesPermissionClickD}/>
                                        <Checkbox label="Execute" checked={this.state.permissionX} onCheck={this.handlesPermissionClickX}/>
                                    </GridTile>
                                    <GridTile key='image'>
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
                                    </GridTile>
                                </GridList>
                            </div>
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
                                                <Toggle toggled={row.isAdmin} onToggle={() => (
                                                    this.state.stateUsers[index].isAdmin = !this.state.stateUsers[index].isAdmin,
                                                    this.setState({stateUsers: [...this.state.stateUsers]})
                                                  )} />
                                              </TableRowColumn>
                                          </TableRow>
                                      ))
                                    }
                                </TableBody>
                                <TableFooter adjustForCheckbox={this.state.showCheckboxes}></TableFooter>
                            </Table>

                        </Tab>
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
                    </Tabs>
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
            console.log('deleted', data)
            this.props.refetchGroups({}).then(({data}) => {
                router.push({pathname: '/groups'})
            }).catch((error) => {
                console.log('there was an error sending the SECOND query', error)
            })
        }).catch((error) => {
            console.log('there was an error sending the query', error)
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
      console.log('this.state.selectedUserRows before', this.state.selectedUserRows)
      console.log('this.state.selectedUserRows index', index)
      console.log('this.state.selectedUserRows index', row)
      var userSelected = this.state.selectedUserRows.splice(index, 1)
      console.log('this.state.selectedUserRows spliced', userSelected)
      this.state.stateUsers[userSelected[0]].selected = false;
      this.setState({stateUsers: [...this.state.stateUsers]})
      this.setState({selectedUserRows: [...this.state.selectedUserRows]})
      console.log('this.state.selectedUserRows after', this.state.selectedUserRows)
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
            console.log('Error: ', error)
        }
    }

    handlesGroupClick = event => {
        const {router} = this.context
        router.push({pathname: '/protected'})
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
        console.log(selectedRows)
        this.setState({selectedUserRows: selectedRows})
    }

    handleOnRowSelectionLandscapes = selectedRows => {
        console.log(selectedRows)
        this.setState({selectedLandscapeRows: selectedRows})
    }

    handlesOnCheck = event => {
        var isChecked = this.state.checkAll;
        console.log(isChecked)
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
        console.log('permissions', permissions)
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

        let groupToCreate = {
            name: this.state.name,
            description: this.state.description,
            _id: this.state.currentGroup._id,
            imageUri: this.state.croppedImg
        };

        groupToCreate.permissions = this.handlesCreatePermission()
        groupToCreate.users = []
        groupToCreate.landscapes = []
        if (this.state.selectedLandscapeRows) {
            console.log('theres landscapes');
            for (var i = 0; i < this.state.selectedLandscapeRows.length; i++) {
                groupToCreate.landscapes.push(this.state.stateLandscapes[this.state.selectedLandscapeRows[i]]._id)
            }
        }
        if (this.state.selectedUserRows) {
            console.log('theres landscapes');
            for (var i = 0; i < this.state.selectedUserRows.length; i++) {
                groupToCreate.users.push({
                    userId: this.state.users[this.state.selectedUserRows[i]]._id,
                    isAdmin: this.state.users[this.state.selectedUserRows[i]].isAdmin || false
                })
            }
        }

        console.log('creating group -', groupToCreate)
        console.log('this.props -', this.props)
        this.props.EditGroupWithMutation({
            variables: {
                group: groupToCreate
            }
        }).then(({data}) => {
            console.log('got data', data)
            this.props.refetchGroups({}).then(({data}) => {
                console.log('got MORE data', data);
                this.setState({successOpen: true})

                router.push({pathname: '/groups'})
            }).catch((error) => {
                this.setState({loading: false})
                console.log('there was an error sending the SECOND query', error)
            })
        }).catch((error) => {
            this.setState({failOpen: true})
            this.setState({loading: false})
            console.error('graphql error', error)
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
        console.log(this.state)
    }
    onCheckAllChange = (e) => {
        this.setState({
            checkedList: e.target.checked
                ? allChecked
                : ['r'],
            indeterminate: false,
            checkAll: e.target.checked
        });
        console.log(this.state)
    }

    callback = (key) => {
        console.log(key);
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
