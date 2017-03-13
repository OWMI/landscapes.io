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
import { IoEdit, IoAndroidClose, IoSearch, IoArrowDownC, IoArrowUpC } from 'react-icons/lib/io'
import defaultUserImage from '../../style/empty.png'
import defaultImage from '../../style/empty-group.png'
import AvatarCropper from "react-avatar-cropper";
import ReactDom from "react-dom";
import {sortBy, orderBy} from "lodash";
import { auth } from '../../services/auth'

import {Loader} from '../../components'
import materialTheme from '../../style/custom-theme.js';

const CheckboxGroup = Checkbox.Group;

const defaultCheckedList = ['r'];

import '../../style/avatar-cropper.style.scss'
import './groups.style.scss'

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
        height: '300',
        landscapeItems: [],
        accountItems: [],
        userItems: [],
        order: 'asc'
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
                        selectedLandscapeRows.push(ls)
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
                        selectedAccountRows.push(ls)
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
                        selectedUserRows.push(user)
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
        if( currentGroup.managedVPC){
          this.setState({managedVPC: true})
        }
        else{
          this.setState({managedVPC: false})
        }
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
        this.setState({landscapeItems: landscapesSorted, accountItems: accountsSorted, userItems: stateUsers, stateLandscapes: landscapesSorted, stateUsers, stateAccounts: accountsSorted, isGroupAdmin})

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
                        selectedLandscapeRows.push(ls)
                    }
                    stateLandscapes.push(ls)
                })
            }
        }
        if (currentGroup.accounts) {
            for (var i = 0; i < currentGroup.accounts.length; i++) {
                accountsSorted.find((ls, index) => {
                    if (currentGroup.accounts[i] === ls._id) {
                        selectedAccountRows.push(ls)
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
                        selectedUserRows.push(user)
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

        if( currentGroup.managedVPC){
          this.setState({managedVPC: true})
        }
        else{
          this.setState({managedVPC: false})
        }
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
        this.setState({landscapeItems: landscapesSorted, accountItems: accountsSorted, userItems: stateUsers, stateLandscapes: landscapesSorted, stateUsers, stateAccounts: accountsSorted, selectedAccountRows, isGroupAdmin})
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

        console.log(this.state.currentGroup)
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
                      <RaisedButton label="Save" labelStyle={{ fontSize: '11px' }} style={{ float: 'right', marginBottom: '30px' }} onClick={this.handlesCreateClick}/>
                    </Col>
                    <Col xs={1}>
                      <RaisedButton label="Cancel" primary={true} labelStyle={{ fontSize: '11px' }} style={{ float: 'right', marginBottom: '30px' }} onClick={() => {
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

                              <Row style={{width: '100%'}}>
                                <Col style={{paddingLeft: 10, paddingRight: 10,  width:'65%'}}>
                                  <Row key='name'>
                                      <TextField style={{
                                        width: '100%'
                                      }} id="username" floatingLabelText="Name" value={this.state.name} onChange={this.handlesOnNameChange} placeholder='Username'/>
                                  </Row>
                                  <Row key='description'>
                                      <TextField id="description" style={{
                                        width: '100%',
                                        textAlign: 'left'
                                      }} multiLine={true} rows={1} rowsMax={4} floatingLabelText="Description" onChange={this.handlesOnDescriptionChange} value={this.state.description} hintText='Description'/>
                                  </Row>
                                  <Row key='integration'>
                                    <div style={{
                                        borderBottom: '1px solid #E9E9E9',
                                        width: '100%'
                                    }}>
                                      <Checkbox label="Managed VPC" onCheck={this.handlesOnManagedVPCChange} checked={this.state.managedVPC} className={cx( { 'two-field-row': true } )} style={{marginTop:15, marginBottom: 15, marginLeft: 10, textAlign: 'left', width:150}}/>
                                    </div>
                                  </Row>
                                  <Row key='permissions' >
                                      <div style={{
                                          borderBottom: '1px solid #E9E9E9',
                                          width: '100%'
                                      }}>
                                          <Checkbox style={{
                                              marginBottom: 15,
                                              marginTop:15,
                                              width:200
                                          }} label="Check All Permissions" onCheck={this.handlesOnCheck} checked={this.state.checkAll}/>
                                      </div>
                                      <br/>
                                      </Row>

                                      <Row style={{paddingTop:15, paddingBottom:15}} >
                                        <Col>
                                          <Checkbox label="Create" checked={this.state.permissionC} onCheck={this.handlesPermissionClickC}/>
                                          <Checkbox label="Read" disabled={true} checked={true}/>
                                          <Checkbox label="Update" checked={this.state.permissionU} onCheck={this.handlesPermissionClickU}/>
                                          <Checkbox label="Delete" checked={this.state.permissionD} onCheck={this.handlesPermissionClickD}/>
                                          <Checkbox label="Execute" checked={this.state.permissionX} onCheck={this.handlesPermissionClickX}/>
                                        </Col>
                                      </Row>
                                </Col>
                                <Col style={{paddingLeft: 20, paddingRight: 140, width:'35%'}}>
                                  <Row key='image' style={{justifyContent:'space-around' }}>
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
                              </Row>
                    <Tabs tabItemContainerStyle={{backgroundColor: materialTheme.palette.primary3Color}}>
                        <Tab label="Landscapes" key="3">
                          <Row style={{justifyContent:'space-between'}}>
                            <Col>
                              <div style={styles.wrapper}>
                                {
                                  this.state.selectedLandscapeRows.map((row, index) => (
                                    <Chip style = {styles.chip} key={index} >
                                      <Avatar src={row.imageUri}/>
                                       {row.name}
                                    </Chip>
                                ))
                              }
                              </div>
                            </Col>
                            <Col style={{width:'300px'}}>
                              <div className="filter-list" style={{marginTop:-5, marginBottom:10}}>
                                <IoSearch style={{fontSize:20, color:'gray', marginRight:5}} /><TextField type="text" hintText="Search" onChange={this.filterLandscapeList}/>
                              </div>
                            </Col>
                          </Row>
                            <Table key="landscapeTable" height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter} selectable={false} multiSelectable={false}  onCellClick={this.handlesLandscapeRowClick}>
                                <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                                    <TableRow>
                                        <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                                          <TableHeaderColumn>
                                            <Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'name', array:'landscape'})}>Name
                                          {
                                            this.state.orderBy === 'name' && this.state.order === 'asc'
                                            ?
                                            <IoArrowUpC />
                                            :
                                            <Col>{
                                                this.state.orderBy === 'name'
                                                ?
                                                <IoArrowDownC />
                                                :
                                                null
                                              }</Col>}</Row>
                                          </TableHeaderColumn>
                                          <TableHeaderColumn><Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'description', array:'landscape'})}>Description
                                          {
                                            this.state.orderBy === 'description' && this.state.order === 'asc'
                                            ?
                                            <IoArrowUpC />
                                            :
                                            <Col>{
                                                this.state.orderBy === 'description'
                                                ?
                                                <IoArrowDownC />
                                                :
                                                null
                                              }</Col>}</Row>
                                          </TableHeaderColumn>
                                    </TableRow>
                                </TableHeader>
                                <TableBody displayRowCheckbox={false} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false}>
                                  {
                                    this.state.landscapeItems.map((row, index)  => (
                                      <TableRow key={row._id} className={cx({'showBackground': this.state.selectedLandscapeRows.indexOf(row) !== -1})}>
                                          <TableRowColumn data-my-row-identifier={row._id}><img src={row.imageUri} style={{
                                          width: 50
                                      }}/></TableRowColumn>
                                          <TableRowColumn data-my-row-identifier={row._id}>{row.name}</TableRowColumn>
                                          <TableRowColumn data-my-row-identifier={row._id}>{row.description}</TableRowColumn>
                                      </TableRow>
                                  ))}
                                  </TableBody>
                                <TableFooter adjustForCheckbox={this.state.showCheckboxes}></TableFooter>
                            </Table>
                        </Tab>
                        <Tab label="Users" key="2">
                          <Row style={{justifyContent:'space-between'}}>
                            <Col xs={8}>
                              <div style={styles.wrapper}>
                                {
                                  this.state.selectedUserRows.map((row, index) => (
                                    <Chip style = {styles.chip} key={index} >
                                      <Avatar src={row.imageUri}/>
                                       {row.firstName}
                                    </Chip>
                                ))
                              }
                              </div>
                            </Col>
                            <Col xs={4}>
                              <div className="filter-list" style={{marginTop:-5, marginBottom:10}}>
                                <IoSearch style={{fontSize:20, color:'gray', marginRight:5}} /><TextField type="text" hintText="Search" onChange={this.filterUserList}/>
                              </div>
                            </Col>
                          </Row>
                            <Table key="userTable" onCellClick={this.handlesUserRowClick} height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter} selectable={false} multiSelectable={false} >
                                <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                                    <TableRow>
                                        <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                                          <TableHeaderColumn><Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'lastName', array:'user'})}>Name
                                          {
                                            this.state.orderBy === 'lastName' && this.state.order === 'asc'
                                            ?
                                            <IoArrowUpC />
                                            :
                                            <Col>{
                                                this.state.orderBy === 'lastName'
                                                ?
                                                <IoArrowDownC />
                                                :
                                                null
                                              }</Col>}</Row>
                                          </TableHeaderColumn>
                                          <TableHeaderColumn><Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'email', array:'user'})}>Email
                                          {
                                            this.state.orderBy === 'email' && this.state.order === 'asc'
                                            ?
                                            <IoArrowUpC />
                                            :
                                            <Col>{
                                                this.state.orderBy === 'email'
                                                ?
                                                <IoArrowDownC />
                                                :
                                                null
                                              }</Col>}</Row>
                                          </TableHeaderColumn>
                                          <TableHeaderColumn>Admin
                                          </TableHeaderColumn>
                                    </TableRow>
                                </TableHeader>
                                <TableBody displayRowCheckbox={false} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false} >
                                    {
                                      this.state.userItems.map((row, index)  => (
                                        <TableRow key={row._id} className={cx({'showBackground': this.state.selectedUserRows.indexOf(row) !== -1})}>
                                          <TableRowColumn data-my-row-identifier={row._id}><img src={row.imageUri} style={{width: 40, borderRadius: 50}}/></TableRowColumn>
                                          <TableRowColumn data-my-row-identifier={row._id}>{row.lastName}, {row.firstName} </TableRowColumn>
                                          <TableRowColumn data-my-row-identifier={row._id}>{row.email}</TableRowColumn>
                                          <TableRowColumn data-my-row-identifier={row._id}>
                                            <Toggle toggled={row.isAdmin || (row.role === 'admin')} onToggle={() => (
                                                this.state.stateUsers[index].isAdmin = !this.state.stateUsers[index].isAdmin,
                                                this.setState({stateUsers: [...this.state.stateUsers]})
                                              )} disabled={row.role === 'admin'} />
                                          </TableRowColumn>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter adjustForCheckbox={false}></TableFooter>
                            </Table>

                        </Tab>
                        <Tab label="Accounts" key="4">
                          <Row style={{justifyContent:'space-between'}}>
                            <Col>
                              <div style={styles.wrapper}>
                                {
                                  this.state.selectedAccountRows.map((row, index) => (
                                    <Chip style = {styles.chip} key={index} >
                                       {row.name}
                                    </Chip>
                                ))
                              }
                              </div>
                            </Col>
                            <Col style={{width:'300px'}}>
                              <div className="filter-list" style={{marginTop:-5, marginBottom:10}}>
                                <IoSearch style={{fontSize:20, color:'gray', marginRight:5}} /><TextField type="text" hintText="Search" onChange={this.filterAccountList}/>
                              </div>
                            </Col>
                          </Row>
                            <Table key="accountsTable" height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}  onCellClick={this.handlesAccountRowClick} selectable={false} multiSelectable={false} >
                                <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                                    <TableRow>
                                      <TableHeaderColumn><Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'name', array:'account'})}>Name
                                      {
                                        this.state.orderBy === 'name' && this.state.order === 'asc'
                                        ?
                                        <IoArrowUpC />
                                        :
                                        <Col>{
                                            this.state.orderBy === 'name'
                                            ?
                                            <IoArrowDownC />
                                            :
                                            null
                                          }</Col>}</Row>
                                      </TableHeaderColumn>
                                      <TableHeaderColumn><Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'region', array:'account'})}>Region
                                      {
                                        this.state.orderBy === 'region' && this.state.order === 'asc'
                                        ?
                                        <IoArrowUpC />
                                        :
                                        <Col>{
                                            this.state.orderBy === 'region'
                                            ?
                                            <IoArrowDownC />
                                            :
                                            null
                                          }</Col>}</Row>
                                      </TableHeaderColumn>
                                      <TableHeaderColumn><Row onClick={this.handlesClickOrder.bind(this, {orderBy: 'createdAt', array:'account'})}>Created At
                                      {
                                        this.state.orderBy === 'createdAt' && this.state.order === 'asc'
                                        ?
                                        <IoArrowUpC />
                                        :
                                        <Col>{
                                            this.state.orderBy === 'createdAt'
                                            ?
                                            <IoArrowDownC />
                                            :
                                            null
                                          }</Col>}</Row>
                                      </TableHeaderColumn>
                                    </TableRow>
                                </TableHeader>
                                <TableBody displayRowCheckbox={false} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false}>
                                  {
                                    this.state.accountItems.map((row, index)  => (
                                      <TableRow key={row._id} className={cx({'showBackground': this.state.selectedAccountRows.indexOf(row) !== -1})}>
                                        <TableRowColumn data-my-row-identifier={row._id}>{row.name}</TableRowColumn>
                                        <TableRowColumn data-my-row-identifier={row._id}>{row.region}</TableRowColumn>
                                        <TableRowColumn data-my-row-identifier={row._id}>{row.createdAt}</TableRowColumn>
                                      </TableRow>
                                  ))}
                                </TableBody>
                                <TableFooter adjustForCheckbox={false}></TableFooter>
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
    filterLandscapeList = (event) => {
      var updatedList = this.state.stateLandscapes;
      updatedList = updatedList.filter(function(item){
        return (item.name.toLowerCase().search(
          event.target.value.toLowerCase()) !== -1);
      });
      this.setState({landscapeItems: [...updatedList]});
    }
    filterAccountList = (event) => {
      var updatedList = this.state.stateAccounts;
      updatedList = updatedList.filter(function(item){
        return (item.name.toLowerCase().search(
          event.target.value.toLowerCase()) !== -1) ||
          (item.region.toLowerCase().search(
            event.target.value.toLowerCase()) !== -1)
      });
      this.setState({accountItems: [...updatedList]});
    }
    filterUserList = (event) => {
      var updatedList = this.state.stateUsers;
      updatedList = updatedList.filter(function(item){
        return (item.lastName.toLowerCase().search(
          event.target.value.toLowerCase()) !== -1) ||
          (item.firstName.toLowerCase().search(
            event.target.value.toLowerCase()) !== -1) ||
            (item.email.toLowerCase().search(
              event.target.value.toLowerCase()) !== -1) ||
              (item.username.toLowerCase().search(
                event.target.value.toLowerCase()) !== -1)
      });
      if(this.state.managedVPC){
        updatedList = updatedList.filter(function(item){
          return (item.managedVPC.search(true) !== -1)
        });
      }
      this.setState({userItems: [...updatedList]});
    }

    handlesClickOrder = event => {
        this.setState({orderBy: event.orderBy});
        if(this.state.order === 'asc'){
          this.setState({order: 'desc'})
        }
        else{
          this.setState({order: 'asc'})
        }
        if(event.array === 'landscape'){
          var sorted = orderBy(this.state.landscapeItems, event.orderBy, this.state.order);
          this.setState({landscapeItems: sorted})
        }
        else if(event.array === 'account'){
          var sorted = orderBy(this.state.accountItems, event.orderBy, this.state.order);
          this.setState({accountItems: sorted})
        }
        else if(event.array === 'user'){
          var sorted = orderBy(this.state.userItems, event.orderBy, this.state.order);
          this.setState({userItems: sorted})
        }

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
    handlesOnManagedVPCChange = event => {
        event.preventDefault()
        var updatedList = this.state.stateUsers
        if(!this.state.managedVPC){
          updatedList = this.state.stateUsers.filter(function(item){
            if(item['managedVPC'] && item['managedVPC'] === true){
              return item
            }
          });
        }
        this.setState({userItems: [...updatedList]});
        this.setState({managedVPC: !this.state.managedVPC})
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
      if(selectedRows === 'all'){
        selectedRows = []
        this.state.stateUsers.forEach((account, index) => {
          selectedRows.push(index)
        })
      }
      else if(selectedRows === 'none'){
        selectedRows = []
      }
        this.setState({selectedUserRows: selectedRows})
    }

    handlesLandscapeRowClick = (rowNumber, columnNumber, evt) =>{
      var landscapeRows = this.state.selectedLandscapeRows || [];
      var selectedLandscape = this.state.stateLandscapes.find(landscape => {return landscape._id === evt.target.dataset.myRowIdentifier;})
      var index = this.state.selectedLandscapeRows.map(function(el) {
          return el._id;
        }).indexOf(evt.target.dataset.myRowIdentifier);
      if(index === -1){
        landscapeRows.push(selectedLandscape);
      }
      else{
        landscapeRows.splice(index, 1)
      }
      this.setState({selectedLandscapeRows: [...landscapeRows]})
    }
    handlesAccountRowClick = (rowNumber, columnNumber, evt) =>{
      var rows = this.state.selectedAccountRows || [];
      var selected = this.state.stateAccounts.find(account => {return account._id === evt.target.dataset.myRowIdentifier;})
      var index = this.state.selectedAccountRows.map(function(el) {
          return el._id;
        }).indexOf(evt.target.dataset.myRowIdentifier);
      if(index === -1){
        rows.push(selected);
      }
      else{
        rows.splice(index, 1)
      }
      this.setState({selectedAccountRows: [...rows]})
    }
    handlesUserRowClick = (rowNumber, columnNumber, evt) =>{
      var rows = this.state.selectedUserRows || [];
      var selected = this.state.stateUsers.find(user => {return user._id === evt.target.dataset.myRowIdentifier;})
      var index = this.state.selectedUserRows.map(function(el) {
          return el._id;
        }).indexOf(evt.target.dataset.myRowIdentifier);
      if(index === -1){
        rows.push(selected);
      }
      else{
        rows.splice(index, 1)
      }
      this.setState({selectedUserRows: [...rows]})
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
        groupToEdit.managedVPC = this.state.managedVPC || false
        groupToEdit.users = []
        groupToEdit.landscapes = []
        groupToEdit.accounts = []
        if (this.state.selectedLandscapeRows) {
            for (var i = 0; i < this.state.selectedLandscapeRows.length; i++) {
                groupToEdit.landscapes.push(this.state.selectedLandscapeRows[i]._id)
            }
        }
        if (this.state.selectedUserRows) {
            for (var i = 0; i < this.state.selectedUserRows.length; i++) {
                if(this.state.selectedUserRows[i].role === 'admin'){
                  this.state.selectedUserRows[i].isAdmin = true;
                }
                groupToEdit.users.push({
                    userId: this.state.selectedUserRows[i]._id,
                    isAdmin: this.state.selectedUserRows[i].isAdmin || false
                })
            }
        }
        if (this.state.selectedAccountRows) {
            for (var i = 0; i < this.state.selectedAccountRows.length; i++) {
              groupToEdit.accounts.push(this.state.selectedAccountRows[i]._id)

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
