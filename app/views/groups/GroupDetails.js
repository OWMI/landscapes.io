import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'

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
import defaultImage from '../../style/empty-group.png'
import defaultUserImage from '../../style/empty.png'

import { Loader } from '../../components'

const CheckboxGroup = Checkbox.Group;

const defaultCheckedList = ['r'];

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
      const { enterGroupDetails, groups, users, landscapes, params } = this.props
      let currentGroup = {};
      if(groups){
        currentGroup = groups.find(ls => { return ls._id === params.id })
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
        if(currentGroup.landscapes){
          for(var i = 0; i< currentGroup.landscapes.length; i++){
            landscapes.find(ls => {
              console.log('ls', ls)
              console.log('currentGroup.landscapes[i]', currentGroup.landscapes[i])
              if(currentGroup.landscapes[i] === ls._id){
                ls.selected = true;
                groupLandscapes.push(ls)
              }
            })
          }
      }
      this.setState({groupLandscapes: groupLandscapes})

        if(currentGroup.users){
          for(var i = 0; i< currentGroup.users.length; i++){
            users.find(user => {
              console.log('user', user)
              console.log('currentGroup.users[i]', currentGroup.users[i])
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
      console.log('groups- ---- componentWillMount', groups)
    }

    componentWillReceiveProps(nextProps) {
      // use the name from nextProps to get the profile
      const { enterGroupDetails, groups, users, landscapes, params } = nextProps
      let currentGroup = {};
      if(groups){
        currentGroup = groups.find(ls => { return ls._id === params.id })
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
        if(currentGroup.landscapes){
          for(var i = 0; i< currentGroup.landscapes.length; i++){
            landscapes.find(ls => {
              console.log('ls', ls)
              console.log('currentGroup.landscapes[i]', currentGroup.landscapes[i])
              if(currentGroup.landscapes[i] === ls._id){
                ls.selected = true;
                groupLandscapes.push(ls)
              }
            })
          }
      }
      this.setState({groupLandscapes: groupLandscapes})

        if(currentGroup.users){
          for(var i = 0; i< currentGroup.users.length; i++){
            users.find(user => {
              console.log('user', user)
              console.log('currentGroup.users[i]', currentGroup.users[i])
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
      console.log('groups- ---- componentWillMount', groups)
    }

    shouldComponentUpdate(nextProps, nextState) {
        console.log('shouldComponentUpdate nextProps', nextProps)
        console.log('shouldComponentUpdate nextState', nextState)
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveGroupDetails } = this.props
        leaveGroupDetails()
    }

    render() {

        let self = this
        const { animated, viewEntersAnim } = this.state
        const { loading, groups, landscapes, users, params } = this.props

        console.log('GROUPS', groups)
        if (loading || !groups) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                <h4><strong>Group:</strong> {this.state.currentGroup.name}</h4><br/>
                  <div style={styles.root}>

                  <Card style={{padding:20}}>
                  <CardHeader
                    title={this.state.currentGroup.name}
                    subtitle={"Permissions: " + this.state.currentGroup.readablePermissions}
                    avatar={this.state.currentGroup.imageUri}
                  />
                  <GridList
                    cols={1}
                    cellHeight='auto'
                    style={styles.gridList}
                  >
                    <GridTile key='description' >
                        <p>Description: {this.state.currentGroup.description} </p>
                    </GridTile>
                    <GridTile>
                        <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}
                            selectable={false} multiSelectable={false}
                            onRowSelection={this.handleOnRowSelection}>
                              <TableHeader displaySelectAll={false} adjustForCheckbox={false}
                                enableSelectAll={false} >
                                <TableRow>
                                  <TableHeaderColumn colSpan="3" tooltip="Landscapes" style={{textAlign: 'center', fontSize:18}}>
                                    Landscapes
                                  </TableHeaderColumn>
                                </TableRow>
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
                    </GridTile>
                    <GridTile>
                    <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}
                        selectable={false} multiSelectable={false}
                        onRowSelection={this.handleOnRowSelection}>
                          <TableHeader displaySelectAll={false} adjustForCheckbox={false}
                            enableSelectAll={false} >
                                <TableRow>
                                  <TableHeaderColumn colSpan="4" tooltip="Users" style={{textAlign: 'center', fontSize:18}}>
                                    Users
                                  </TableHeaderColumn>
                                </TableRow>
                                <TableRow>
                                  <TableHeaderColumn tooltip="image"></TableHeaderColumn>
                                  <TableHeaderColumn tooltip="Email">Email</TableHeaderColumn>
                                  <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
                                  <TableHeaderColumn tooltip="isGroupAdmin">Admin?</TableHeaderColumn>
                                </TableRow>
                              </TableHeader>
                              <TableBody displayRowCheckbox={false} deselectOnClickaway={this.state.deselectOnClickaway}
                                showRowHover={this.state.showRowHover} stripedRows={false}>
                                {this.state.groupUsers.map( (row, index) => (
                                  <TableRow key={row._id} >
                                  <TableRowColumn><img src={row.imageUri} style={{width: 40, borderRadius:50}} /></TableRowColumn>
                                    <TableRowColumn>{row.email}</TableRowColumn>
                                    <TableRowColumn>{row.firstName} {row.lastName}</TableRowColumn>
                                    <TableRowColumn>{row.isGroupAdmin}</TableRowColumn>
                                  </TableRow>
                                  ))}
                              </TableBody>
                              <TableFooter
                                adjustForCheckbox={false}
                              >
                              </TableFooter>
                            </Table>
                    </GridTile>
                  </GridList>
                  </Card>
                  </div>
            </div>
        )
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
      console.log(this.state)
    }
    onCheckAllChange = (e) => {
      this.setState({
        checkedList: e.target.checked ? allChecked : ['r'],
        indeterminate: false,
        checkAll: e.target.checked,
      });
      console.log(this.state)
    }

    callback = (key) => {
      console.log(key);
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
