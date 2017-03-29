import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import {Row, Col} from 'react-flexbox-grid'
import { IoEdit, IoPlus, IoAndroidClose, IoIosCloudUploadOutline } from 'react-icons/lib/io'

import { Chip, Tabs, Tab, Card, Checkbox, RaisedButton, GridList, Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui'

import defaultImage from '../../style/empty-group.png'
import defaultUserImage from '../../style/empty.png'
import materialTheme from '../../style/custom-theme.js';
import { auth } from '../../services/auth'
import {blue300, indigo900} from 'material-ui/styles/colors';
import { Loader } from '../../components'

const defaultCheckedList = ['r'];

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    // width: 500,
    // overflowY: 'auto'
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


class GroupDetails extends Component {

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
          currentGroup: {}
    }

    componentDidMount() {
        const { enterGroupDetails } = this.props
        enterGroupDetails()
    }

    componentWillMount(){
      const { enterGroupDetails, groupById, users, landscapes, accounts, params } = this.props
      let currentGroup = {};
      var userRole = 'user';
      var isGroupAdmin = false;
      if(auth.getUserInfo() && auth.getUserInfo().role === 'admin'){
        userRole = 'admin';
      }
      if(auth.getUserInfo() && auth.getUserInfo().groups){
        var group = auth.getUserInfo().groups.forEach(group =>{
          if(group.groupId === params.id && group.isAdmin){
            isGroupAdmin = 'Admin'
          }
        })
      }
      if(groupById && (groupById._id === params.id)){
        currentGroup = groupById
        var readablePermissions = []
        currentGroup.permissions.map(permission =>{
          if(permission === 'c'){
            readablePermissions.push(' Create')
          }
          if(permission === 'r'){
            readablePermissions.push(' Read')
          }
          if(permission === 'u'){
            readablePermissions.push(' Update')
          }
          if(permission === 'd'){
            readablePermissions.push(' Delete')
          }
          if(permission === 'x'){
            readablePermissions.push(' Deploy')
          }
        })
        currentGroup.readablePermissions = readablePermissions;
        if(!currentGroup.imageUri){
          currentGroup.imageUri = defaultImage
        }
        this.setState({currentGroup: currentGroup})
      }
      let groupLandscapes = []
      let groupUsers = []
      let groupAccounts = []
        if(currentGroup.landscapes && landscapes){
          for(var i = 0; i< currentGroup.landscapes.length; i++){
            landscapes.find(ls => {
              if(currentGroup.landscapes[i] === ls._id){
                ls.selected = true;
                groupLandscapes.push(ls)
              }
            })
          }
      }
        if(currentGroup.accounts && accounts){
          for(var i = 0; i< currentGroup.accounts.length; i++){
            accounts.find(ls => {
              if(currentGroup.accounts[i] === ls._id){
                ls.selected = true;
                groupAccounts.push(ls)
              }
            })
          }
      }
      this.setState({groupLandscapes: groupLandscapes, groupAccounts, userRole, isGroupAdmin})

        if(currentGroup.users && users){
          for(var i = 0; i< currentGroup.users.length; i++){
            users.find(user => {
              if(currentGroup.users[i].userId === user._id){
                user.selected = true;
                if(!user.imageUri){
                  user.imageUri = defaultUserImage
                }
                if(currentGroup.users[i].isAdmin){
                  user.isGroupAdmin = 'Admin'
                }
                else{
                  user.isGroupAdmin = ''
                }
                groupUsers.push(user)
              }
            })
          }
      }
      this.setState({groupUsers: groupUsers})
    }

    componentWillReceiveProps(nextProps) {
      // use the name from nextProps to get the profile
      const { enterGroupDetails, groups, groupById, users, landscapes, accounts, params } = nextProps
      let currentGroup = {};
      var userRole = 'user';
      var isGroupAdmin = false;
      if(auth.getUserInfo() && auth.getUserInfo().role === 'admin'){
        userRole = 'admin';
      }
      if(auth.getUserInfo() && auth.getUserInfo().groups){
        var group = auth.getUserInfo().groups.forEach(group =>{
          if(group.groupId === params.id && group.isAdmin){
            isGroupAdmin = 'Admin'
          }
        })
      }
      if(groupById && (groupById._id === params.id)){
        currentGroup = groupById
        var readablePermissions = []
        currentGroup.permissions.map(permission =>{
          if(permission === 'c'){
            readablePermissions.push(' Create')
          }
          if(permission === 'r'){
            readablePermissions.push(' Read')
          }
          if(permission === 'u'){
            readablePermissions.push(' Update')
          }
          if(permission === 'd'){
            readablePermissions.push(' Delete')
          }
          if(permission === 'x'){
            readablePermissions.push(' Deploy')
          }
        })
        currentGroup.readablePermissions = readablePermissions;
        if(!currentGroup.imageUri){
          currentGroup.imageUri = defaultImage
        }
        this.setState({currentGroup: currentGroup})
      }
      let groupLandscapes = []
      let groupUsers = []
      let groupAccounts = []
        if(currentGroup.landscapes && landscapes){
          for(var i = 0; i< currentGroup.landscapes.length; i++){
            landscapes.find(ls => {
              if(currentGroup.landscapes[i] === ls._id){
                ls.selected = true;
                groupLandscapes.push(ls)
              }
            })
          }
      }
        if(currentGroup.accounts && accounts){
          for(var i = 0; i< currentGroup.accounts.length; i++){
            accounts.find(ls => {
              if(currentGroup.accounts[i] === ls._id){
                ls.selected = true;
                groupAccounts.push(ls)
              }
            })
          }
      }
      this.setState({groupLandscapes: groupLandscapes, groupAccounts, userRole, isGroupAdmin})

        if(currentGroup.users && users){
          for(var i = 0; i< currentGroup.users.length; i++){
            users.find(user => {
              if(currentGroup.users[i].userId === user._id){
                user.selected = true;
                if(!user.imageUri){
                  user.imageUri = defaultUserImage
                }
                if(currentGroup.users[i].isAdmin){
                  user.isGroupAdmin = 'Admin'
                }
                else{
                  user.isGroupAdmin = ''
                }
                groupUsers.push(user)
              }
              else if(user.role === 'admin'){
                user.selected = true;
                if(!user.imageUri){
                  user.imageUri = defaultUserImage
                }
                user.isGroupAdmin = 'Admin'
                groupUsers.push(user)
              }
            })
          }
      }
      this.setState({groupUsers: groupUsers})
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveGroupDetails } = this.props
        leaveGroupDetails()
    }

    render() {

        let self = this
        const { animated, viewEntersAnim, userRole, isGroupAdmin } = this.state
        const { loading, groupById, landscapes, users, params } = this.props

        console.log(this.props)

        if (loading || !groupById) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                  <Row middle='xs'>
                      <Col xs={4} style={{ textAlign: 'left', marginBottom:30 }}>
                        <Row><h4><strong>Group</strong></h4></Row>
                      </Col>
                      <Col xs={8}>
                        <RaisedButton label='Cancel' onClick={
                            () => {const { router } = this.context
                            router.push({ pathname: '/groups' })
                          }}
                          backgroundColor={materialTheme.palette.primary3Color}
                          style={{ float: 'right', marginBottom: '30px', marginLeft: 5, marginRight:5 }}
                          labelStyle={{ fontSize: '11px', color: 'white'}}/>
                        {
                          userRole === 'admin' || isGroupAdmin === 'Admin'
                          ?
                          <RaisedButton label='Edit' onClick={this.handlesEditGroupClick}
                              style={{ float: 'right', marginBottom: '30px' }}
                              labelStyle={{ fontSize: '11px' }} icon={<IoEdit/>}/>
                          :
                          null
                        }
                      </Col>
                  </Row>
                  <div style={styles.root}>

                  <Card style={{padding:20}}>

                    <Row middle='xs'>
                        <Col style={{ width:'10%', textAlign: 'left', minWidth:85 }}>
                            <img src={this.state.currentGroup.imageUri} style={{width: 85}} />
                        </Col>
                        <Col style={{ width:'55%', textAlign: 'left', paddingLeft:20 }}>
                            <Row><h4>{this.state.currentGroup.name}</h4></Row>
                            <Row style={{minWidth:300}}>
                              {
                              this.state.currentGroup.readablePermissions.map((row, index) => (
                                <Chip style = {styles.chip} key={index} >
                                   {row}
                                </Chip>
                            ))
                          }</Row>

                        </Col>
                        <Col style={{width:'10%'}}></Col>
                        <Col style={{ width:'25%', paddingLeft:20, float:'right' }}>

                        {
                          userRole === 'admin' || isGroupAdmin === 'Admin'
                          ?
                              <RaisedButton label='Create New Account' onClick={() => {
                                  const {router} = this.context
                                  router.push('/accounts/create');
                                }}
                                  style={{ float: 'right', marginBottom: '30px', minWidth:200 }}
                                  labelStyle={{ fontSize: '11px' }} icon={<IoPlus/>}/>
                          :
                          null
                        }
                      </Col>
                    </Row>
                    <Row middle='xs' style={{flex: 1, marginLeft: 10, marginBottom:10}}>
                        <Col style={{ textAlign: 'left', flex: 1 }}>
                            <h5>{this.state.currentGroup.description}</h5>
                        </Col>
                    </Row>
                  <GridList
                    cols={1}
                    cellHeight='auto'
                    style={styles.gridList}
                  >
                </GridList>
                <Tabs tabItemContainerStyle={{backgroundColor: materialTheme.palette.primary3Color}}>
                  <Tab key="1" label="Landscapes">
                    <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}
                        selectable={false} multiSelectable={false}
                        onRowSelection={this.handleOnRowSelection}>
                          <TableHeader displaySelectAll={false} adjustForCheckbox={false}
                            enableSelectAll={false} >
                            <TableRow>
                              <TableHeaderColumn tooltip="Image"></TableHeaderColumn>
                              <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                              <TableHeaderColumn tooltip="Description">Description</TableHeaderColumn>
                            </TableRow>
                          </TableHeader>
                          <TableBody displayRowCheckbox={false}
                            showRowHover={this.state.showRowHover} stripedRows={false}>
                            {this.state.groupLandscapes.map( (row, index) => (
                              <TableRow key={row._id} >
                                <TableRowColumn><img src={row.imageUri} style={{width: 50}} /></TableRowColumn>
                                <TableRowColumn>{row.name}</TableRowColumn>
                                <TableRowColumn>{row.description}</TableRowColumn>
                              </TableRow>
                              ))}
                          </TableBody>
                          <TableFooter
                            adjustForCheckbox={false}
                          >
                          </TableFooter>
                        </Table>
                  </Tab>
                  <Tab key="2" label="Users">
                    <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}
                        selectable={false} multiSelectable={false}
                        onRowSelection={this.handleOnRowSelection}>
                          <TableHeader displaySelectAll={false} adjustForCheckbox={false}
                            enableSelectAll={false} >
                                <TableRow>
                                  <TableHeaderColumn tooltip="image"></TableHeaderColumn>
                                  <TableHeaderColumn tooltip="Email">Email</TableHeaderColumn>
                                  <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                  <TableHeaderColumn tooltip="isGroupAdmin">Admin</TableHeaderColumn>
                                </TableRow>
                              </TableHeader>
                              <TableBody displayRowCheckbox={false} deselectOnClickaway={this.state.deselectOnClickaway}
                                showRowHover={this.state.showRowHover} stripedRows={false}>
                                {this.state.groupUsers.map( (row, index) => (
                                  <TableRow key={row._id} >
                                  <TableRowColumn><img src={row.imageUri} style={{width: 40, borderRadius:50}} /></TableRowColumn>
                                    <TableRowColumn>{row.email}</TableRowColumn>
                                    <TableRowColumn>{row.firstName} {row.lastName}</TableRowColumn>
                                    {
                                      row.isGroupAdmin === 'Admin'
                                      ?
                                      <TableRowColumn><Chip
                                                  backgroundColor={blue300}
                                                  style={styles.chip}
                                                >Yes</Chip></TableRowColumn>
                                      :
                                      <TableRowColumn><Chip
                                                  style={styles.chip}
                                                >No</Chip></TableRowColumn>
                                    }
                                  </TableRow>
                                  ))}
                              </TableBody>
                              <TableFooter
                                adjustForCheckbox={false}
                              >
                              </TableFooter>
                            </Table>
                  </Tab>
                  <Tab label="Accounts" key="4">
                      <Table key="accountsTable" height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter} selectable={false} multiSelectable={false}>
                          <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                              <TableRow>
                                  <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                  <TableHeaderColumn tooltip="Region">Region</TableHeaderColumn>
                                  <TableHeaderColumn tooltip="Created At">Created At</TableHeaderColumn>
                              </TableRow>
                          </TableHeader>
                          <TableBody displayRowCheckbox={false} deselectOnClickaway={false} showRowHover={this.state.showRowHover} stripedRows={false}>
                              {this.state.groupAccounts.map((row, index) => (
                                  <TableRow key={row._id}>
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
                  </Card>
                  </div>
            </div>
        )
    }

    handlesEditGroupClick = (group, event) => {
        const { params } = this.props
        const { router } = this.context
        router.push({ pathname: '/groups/edit/' + params.id })
    }

    closeError = (event) => {
        event.preventDefault()
        const { resetError } = this.props
        resetError()
    }
    onCheckedChange = (checkedList) =>{
      this.setState({
        checkedList,
        indeterminate: !!checkedList.length && (checkedList.length < plainOptions.length),
        checkAll: checkedList.length === plainOptions.length,
      });
    }
    onCheckAllChange = (e) => {
      this.setState({
        checkedList: e.target.checked ? allChecked : ['r'],
        indeterminate: false,
        checkAll: e.target.checked,
      });
    }
}

GroupDetails.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterGroupDetails: PropTypes.func.isRequired,
    leaveGroupDetails: PropTypes.func.isRequired
}

GroupDetails.contextTypes = {
    router: PropTypes.object
}

export default GroupDetails
